package info

import (
	"testing"
	"time"
)

func TestInfoGetMajor(t *testing.T) {
	i := &Info{
		Version: "1.0.0",
	}
	if i.Major() != 1 {
		t.Fatalf("expected 1, got %v", i.Major())
	}
}

func TestInfoGetMajorMultipleDigits(t *testing.T) {
	i := &Info{
		Version: "12.0.0",
	}
	if i.Major() != 12 {
		t.Fatalf("expected 12, got %v", i.Major())
	}
}

func TestInfoGetMinor(t *testing.T) {
	i := Info{
		Version: "1.4.2",
	}
	if i.Minor() != 4 {
		t.Fatalf("expected 4, got %v", i.Minor())
	}
}

func TestInfoGetPatch(t *testing.T) {
	i := Info{
		Version: "1.4.2",
	}
	if i.Patch() != 2 {
		t.Fatalf("expected 2, got %v", i.Patch())
	}
}

func TestBuildTime(t *testing.T) {
	expected := time.Date(2022, 2, 10, 0, 0, 0, 0, time.UTC)
	var bt buildTime = buildTime(expected.Format("200601021504"))
	if bt.Time() != expected {
		t.Fatalf("expected %v, got %v", expected, bt.Time())
	}
}
