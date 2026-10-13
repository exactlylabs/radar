package clickhousestorages

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/google/uuid"
)

type sliceIterator struct{ tests []*storages.Measurement }

func (it *sliceIterator) Next() (*storages.Measurement, error) {
	if len(it.tests) == 0 {
		return nil, nil
	}
	m := it.tests[0]
	it.tests = it.tests[1:]
	return m, nil
}

func TestMeasurementStorageReplaceRefusesConcurrentWrites(t *testing.T) {
	t.Parallel()
	conn := testConn(t)
	ms := NewMeasurementStorage(conn, &MeasurementStorageOpts{NWorkers: 1})
	if last, err := ms.LastDate(); err != nil || last != nil {
		t.Fatalf("LastDate of an empty table = %v, %v", last, err)
	}
	test := func(id, at string) *storages.Measurement {
		ts, _ := time.Parse("2006-01-02 15:04:05", at)
		// No loss rate or RTT and an unparsable IP: stored as 0, 0 and ::.
		return &storages.Measurement{Id: id, IP: "not an ip", StartedAt: ts.Unix(), ASNId: uuid.NewString(), StateId: uuid.NewString()}
	}
	insert := func(tests ...*storages.Measurement) {
		if err := ms.Open(); err != nil {
			t.Fatal(err)
		}
		if err := ms.Insert(&sliceIterator{tests}); err != nil {
			t.Fatal(err)
		}
		if err := ms.Close(); err != nil {
			t.Fatal(err)
		}
	}
	insert(test("a", "2026-08-01 10:00:00"), test("b", "2026-08-02 10:00:00"))
	if last, err := ms.LastDate(); err != nil || last == nil || last.Format("2006-01-02 15:04:05") != "2026-08-02 10:00:00" {
		t.Fatalf("LastDate = %v, %v", last, err)
	}
	var ip string
	var rtt float64
	if err := conn.QueryRow(context.Background(), "SELECT toString(ip), min_rtt FROM tests WHERE id = 'a'").Scan(&ip, &rtt); err != nil || ip != "::" || rtt != 0 {
		t.Fatalf("ip %q, min_rtt %v, %v", ip, rtt, err)
	}

	day := time.Date(2026, 8, 1, 0, 0, 0, 0, time.UTC)
	if err := ms.StartReplace([]time.Time{day}); err != nil {
		t.Fatal(err)
	}
	// Another ingest writes to the month in the meantime.
	mustExec(t, conn, "INSERT INTO tests (time, id, asn_org_id) VALUES ('2026-08-03 00:00:00', 'c', generateUUIDv4())")
	insert(test("a2", "2026-08-01 11:00:00"))
	if err := ms.CommitReplace(); err == nil || !strings.Contains(err.Error(), "changed during the repair") {
		t.Fatalf("CommitReplace must refuse: %v", err)
	}
	var ids string
	if err := conn.QueryRow(context.Background(), "SELECT arrayStringConcat(arraySort(groupArray(id)), ',') FROM tests").Scan(&ids); err != nil || ids != "a,b,c" {
		t.Fatalf("tests must be untouched: %q, %v", ids, err)
	}

	// Without interference the day is replaced and the rest of the month kept.
	if err := ms.StartReplace([]time.Time{day}); err != nil {
		t.Fatal(err)
	}
	insert(test("a2", "2026-08-01 11:00:00"))
	if err := ms.CommitReplace(); err != nil {
		t.Fatal(err)
	}
	if err := conn.QueryRow(context.Background(), "SELECT arrayStringConcat(arraySort(groupArray(id)), ',') FROM tests").Scan(&ids); err != nil || ids != "a2,b,c" {
		t.Fatalf("after the replace: %q, %v", ids, err)
	}
	if got, err := ms.IDsOn(day); err != nil || len(got) != 1 {
		t.Fatalf("IDsOn = %v, %v", got, err)
	}
	if ms.Inserted() != 4 {
		t.Fatalf("Inserted = %d, want 4", ms.Inserted())
	}
}

// failingIterator fails on its first Next and keeps returning that error, as the ingestor's
// measurementReader does once its file is broken.
type failingIterator struct{ err error }

func (it *failingIterator) Next() (*storages.Measurement, error) { return nil, it.err }

func TestMeasurementStorageReportsAFailedIterator(t *testing.T) {
	t.Parallel()
	conn := testConn(t)
	ms := NewMeasurementStorage(conn, &MeasurementStorageOpts{NWorkers: 2})
	if err := ms.Open(); err != nil {
		t.Fatal(err)
	}
	if err := ms.Insert(&failingIterator{err: errors.New("avro: truncated block")}); err != nil {
		t.Fatal(err)
	}
	done := make(chan error, 1)
	go func() { done <- ms.Close() }()
	select {
	case err := <-done:
		if err == nil || !strings.Contains(err.Error(), "truncated block") {
			t.Fatalf("Close should return the iterator's error, got %v", err)
		}
	case <-time.After(20 * time.Second):
		t.Fatal("Close did not return: a worker is spinning on the failed iterator")
	}
}
