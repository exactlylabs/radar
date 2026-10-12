package s3storage

import (
	"context"
	"io"
	"os"
	"strings"
	"testing"
)

// TestAgainstRealS3 runs Store/Exists/Get/List/Delete against an S3-compatible server,
// e.g. a local MinIO:
//
//	docker run -d --rm --name s3test -p 127.0.0.1:19900:9000 quay.io/minio/minio server /data
//	S3_TEST_ENDPOINT=http://127.0.0.1:19900 S3_TEST_BUCKET=test go test -run RealS3 ./pkg/services/datastore/s3storage/
//
// (create the bucket first; credentials default to minioadmin/minioadmin).
func TestAgainstRealS3(t *testing.T) {
	ep := os.Getenv("S3_TEST_ENDPOINT")
	if ep == "" {
		t.Skip("S3_TEST_ENDPOINT not set")
	}
	key := func(k, def string) string {
		if v := os.Getenv(k); v != "" {
			return v
		}
		return def
	}
	st, err := New(S3StorageOptions{BucketName: key("S3_TEST_BUCKET", "test"), AccessKey: key("S3_TEST_ACCESS_KEY", "minioadmin"),
		SecretKey: key("S3_TEST_SECRET_KEY", "minioadmin"), Endpoint: ep, Region: key("S3_TEST_REGION", "us-east-1")})
	if err != nil {
		t.Fatal(err)
	}
	ctx := context.Background()
	const k = "itest/2026-07-31.avro"
	content := strings.Repeat("abcdefghij", 300000) // 3 MB
	if ok, err := st.Exists(ctx, k); ok || err != nil {
		t.Fatalf("before: %v %v", ok, err)
	}
	r := strings.NewReader(content)
	io.Copy(io.Discard, r)
	if err := st.Store(ctx, r, k); err != nil {
		t.Fatal(err)
	}
	if ok, err := st.Exists(ctx, k); !ok || err != nil {
		t.Fatalf("after: %v %v", ok, err)
	}
	rc, err := st.Get(ctx, k)
	if err != nil {
		t.Fatal(err)
	}
	b, _ := io.ReadAll(rc)
	rc.Close()
	if string(b) != content {
		t.Fatalf("got %d bytes", len(b))
	}
	if l, err := st.List(ctx, "itest/"); err != nil || len(l) != 1 || l[0] != k {
		t.Fatalf("list %v %v", l, err)
	}
	if _, err := st.Get(ctx, "itest/missing"); !os.IsNotExist(err) {
		t.Fatalf("missing: %v", err)
	}
	if err := st.Delete(ctx, k); err != nil {
		t.Fatal(err)
	}
	if ok, err := st.Exists(ctx, k); ok || err != nil {
		t.Fatalf("deleted: %v %v", ok, err)
	}
}
