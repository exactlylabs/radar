package geo

import (
	"math"
	"math/rand"
	"testing"
)

// refContains is the original full scan; Contains must give the same answer.
func refContains(p *Polygon, point *Point) bool {
	if !p.IsClosed() {
		return false
	}
	start := len(p.points) - 1
	contains := p.intersectsWithRaycast(point, &p.points[start], &p.points[0])
	for i := 1; i < len(p.points); i++ {
		if p.intersectsWithRaycast(point, &p.points[i-1], &p.points[i]) {
			contains = !contains
		}
	}
	return contains
}

// jaggedRing is a star-shaped ring with n vertices around (lat, lng), with a few
// vertices repeated or on identical longitudes (nudge cases).
func jaggedRing(r *rand.Rand, lat, lng float64, n int) []Point {
	pts := make([]Point, 0, n)
	for i := 0; i < n; i++ {
		a := 2 * math.Pi * float64(i) / float64(n)
		rad := 0.5 + r.Float64()
		pt := Point{Lat: lat + rad*math.Sin(a), Lng: lng + rad*math.Cos(a)}
		if i%7 == 3 && len(pts) > 0 {
			pt.Lng = pts[len(pts)-1].Lng // vertical edge
		}
		if i%11 == 5 {
			pt.Lat = math.Round(pt.Lat*10) / 10
			pt.Lng = math.Round(pt.Lng*10) / 10
		}
		pts = append(pts, pt)
	}
	return pts
}

func TestContainsMatchesFullScan(t *testing.T) {
	r := rand.New(rand.NewSource(7))
	checked := 0
	for _, n := range []int{3, 4, 5, 8, 17, 100, 1000, 20000} {
		for rep := 0; rep < 3; rep++ {
			ring := jaggedRing(r, 40, -100, n)
			p := NewPolygon(ring)
			bb := p.BoundingBox()
			for i := 0; i < 2000; i++ {
				var pt Point
				switch i % 4 {
				case 0: // anywhere in the box
					pt = Point{Lat: bb[0].Lat + r.Float64()*(bb[1].Lat-bb[0].Lat), Lng: bb[0].Lng + r.Float64()*(bb[1].Lng-bb[0].Lng)}
				case 1: // exactly on a vertex's longitude
					v := ring[r.Intn(len(ring))]
					pt = Point{Lat: bb[0].Lat + r.Float64()*(bb[1].Lat-bb[0].Lat), Lng: v.Lng}
				case 2: // a vertex itself
					pt = ring[r.Intn(len(ring))]
				case 3: // on the box edges / outside
					pt = Point{Lat: bb[r.Intn(2)].Lat, Lng: bb[r.Intn(2)].Lng + float64(r.Intn(3)-1)}
				}
				checked++
				if got, want := p.Contains(&pt), refContains(p, &pt); got != want {
					t.Fatalf("n=%d point %+v: Contains=%v, full scan=%v", n, pt, got, want)
				}
			}
		}
	}
	t.Logf("%d points checked", checked)
}

func TestContainsDegenerate(t *testing.T) {
	// fewer than 3 points: never contains
	if NewPolygon([]Point{{0, 0}, {1, 1}}).Contains(&Point{0.5, 0.5}) {
		t.Fatal("2-point polygon contains")
	}
	// all points on one longitude
	p := NewPolygon([]Point{{0, 5}, {1, 5}, {2, 5}})
	for _, pt := range []Point{{1, 5}, {1, 4}, {1, 6}} {
		if got, want := p.Contains(&pt), refContains(p, &pt); got != want {
			t.Fatalf("%+v: %v != %v", pt, got, want)
		}
	}
	// Add after NewPolygon rebuilds the index
	sq := NewPolygon([]Point{{0, 0}, {0, 1}, {1, 1}})
	if sq.Contains(&Point{0.9, 0.1}) {
		t.Fatal("triangle contains the other corner")
	}
	sq.Add(Point{1, 0})
	if !sq.Contains(&Point{0.9, 0.1}) {
		t.Fatal("square must contain it after Add")
	}
}

func BenchmarkContains(b *testing.B) {
	r := rand.New(rand.NewSource(1))
	p := NewPolygon(jaggedRing(r, 40, -100, 50000))
	pts := make([]Point, 1024)
	for i := range pts {
		pts[i] = Point{Lat: 38.5 + 3*r.Float64(), Lng: -101.5 + 3*r.Float64()}
	}
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		p.Contains(&pts[i%len(pts)])
	}
}
