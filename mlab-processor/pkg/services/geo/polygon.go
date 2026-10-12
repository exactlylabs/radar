// This is adapted from https://github.com/kellydunn/golang-geo/blob/5aa34a503654ec7b801de25601c1e00bb5a85480/polygon.go

// Also added other functions and some tests related to geo based polygons.

package geo

import (
	"math"
)

// Represents a Physical Point in geographic notation [lat, lng].
type Point struct {
	Lat float64
	Lng float64
}

// A Polygon is carved out of a 2D plane by a set of (possibly disjoint) contours.
// It can thus contain holes, and can be self-intersecting.
//
// Contains casts a ray along the latitude axis, so only the edges whose longitude span
// covers the point can intersect it. The polygon keeps its edges bucketed by longitude
// (built by NewPolygon, or on the first Contains after Add) so that a query evaluates a
// handful of edges instead of all of them; the per-edge test is unchanged, so the answer
// is exactly the one of the full scan.
type Polygon struct {
	points []Point

	minLng, maxLng float64
	invBinWidth    float64
	// binStart[b]:binStart[b+1] indexes binEdges; edge e is points[e-1]→points[e],
	// edge 0 being points[n-1]→points[0].
	binStart []int32
	binEdges []int32
}

const maxBins = 1 << 15

// NewPolygon: Creates and returns a new pointer to a Polygon
// composed of the passed in points.  Points are
// considered to be in order such that the last point
// forms an edge with the first point.
func NewPolygon(points []Point) *Polygon {
	p := &Polygon{points: points}
	p.buildIndex()
	return p
}

// Points returns the points of the current Polygon.
func (p *Polygon) Points() []Point {
	return p.points
}

// Add: Appends the passed in contour to the current Polygon.
func (p *Polygon) Add(point Point) {
	p.points = append(p.points, point)
	p.binStart = nil // rebuilt by the next Contains
}

// IsClosed returns whether or not the polygon is closed.
// TODO:  This can obviously be improved, but for now,
//
//	this should be sufficient for detecting if points
//	are contained using the raycast algorithm.
func (p *Polygon) IsClosed() bool {
	if len(p.points) < 3 {
		return false
	}

	return true
}

func (p *Polygon) bin(lng float64) int {
	b := int((lng - p.minLng) * p.invBinWidth)
	if b < 0 {
		return 0
	}
	if n := len(p.binStart) - 1; b >= n {
		return n - 1
	}
	return b
}

// buildIndex buckets the edges by longitude. bin() is monotonic in lng, so an edge
// spanning [a, c] in longitude is in every bin of a point with lng in [a, c].
func (p *Polygon) buildIndex() {
	n := len(p.points)
	if n < 3 {
		p.binStart = nil
		return
	}
	p.minLng, p.maxLng = math.Inf(1), math.Inf(-1)
	for i := range p.points {
		p.minLng = math.Min(p.minLng, p.points[i].Lng)
		p.maxLng = math.Max(p.maxLng, p.points[i].Lng)
	}
	nbins := n / 4
	if nbins < 1 {
		nbins = 1
	}
	if nbins > maxBins {
		nbins = maxBins
	}
	if p.maxLng > p.minLng {
		p.invBinWidth = float64(nbins) / (p.maxLng - p.minLng)
	} else {
		nbins, p.invBinWidth = 1, 0
	}
	p.binStart = make([]int32, nbins+1)
	edgeBins := func(e int, f func(b int)) {
		s, t := p.points[(e+n-1)%n].Lng, p.points[e].Lng
		if s > t {
			s, t = t, s
		}
		for b, last := p.bin(s), p.bin(t); b <= last; b++ {
			f(b)
		}
	}
	// counting sort of the edges into bins
	for e := 0; e < n; e++ {
		edgeBins(e, func(b int) { p.binStart[b+1]++ })
	}
	for b := 0; b < nbins; b++ {
		p.binStart[b+1] += p.binStart[b]
	}
	p.binEdges = make([]int32, p.binStart[nbins])
	fill := make([]int32, nbins)
	copy(fill, p.binStart[:nbins])
	for e := 0; e < n; e++ {
		edgeBins(e, func(b int) {
			p.binEdges[fill[b]] = int32(e)
			fill[b]++
		})
	}
}

// Contains returns whether or not the current Polygon contains the passed in Point.
func (p *Polygon) Contains(point *Point) bool {
	if !p.IsClosed() {
		return false
	}
	if p.binStart == nil {
		p.buildIndex()
	}
	// No edge spans the point's longitude: every edge test is false.
	if point.Lng < p.minLng || point.Lng > p.maxLng {
		return false
	}

	n := len(p.points)
	contains := false
	b := p.bin(point.Lng)
	for _, e := range p.binEdges[p.binStart[b]:p.binStart[b+1]] {
		start := &p.points[(int(e)+n-1)%n]
		end := &p.points[e]
		if p.intersectsWithRaycast(point, start, end) {
			contains = !contains
		}
	}

	return contains
}

func (p *Polygon) BoundingBox() []Point {
	var (
		minLat float64
		minLng float64
		maxLat float64
		maxLng float64
	)

	minLat = 91
	maxLat = -91
	minLng = 181
	maxLng = -181

	for i := 0; i < len(p.points); i++ {
		if p.points[i].Lat < minLat {
			minLat = p.points[i].Lat
		}

		if p.points[i].Lat > maxLat {
			maxLat = p.points[i].Lat
		}

		if p.points[i].Lng < minLng {
			minLng = p.points[i].Lng
		}

		if p.points[i].Lng > maxLng {
			maxLng = p.points[i].Lng
		}
	}

	return []Point{
		{
			Lat: minLat,
			Lng: minLng,
		},
		{
			Lat: maxLat,
			Lng: maxLng,
		},
	}
}

// Using the raycast algorithm, this returns whether or not the passed in point
// Intersects with the edge drawn by the passed in start and end points.
// Original implementation: http://rosettacode.org/wiki/Ray-casting_algorithm#Go
func (p *Polygon) intersectsWithRaycast(point *Point, start *Point, end *Point) bool {
	// Always ensure that the the first point
	// has a y coordinate that is less than the second point
	if start.Lng > end.Lng {

		// Switch the points if otherwise.
		start, end = end, start

	}

	// Move the point's y coordinate
	// outside of the bounds of the testing region
	// so we can start drawing a ray
	for point.Lng == start.Lng || point.Lng == end.Lng {
		newLng := math.Nextafter(point.Lng, math.Inf(1))
		point = &Point{
			Lat: point.Lat,
			Lng: newLng,
		}
	}

	// If we are outside of the polygon, indicate so.
	if point.Lng < start.Lng || point.Lng > end.Lng {
		return false
	}

	if start.Lat > end.Lat {
		if point.Lat > start.Lat {
			return false
		}
		if point.Lat < end.Lat {
			return true
		}

	} else {
		if point.Lat > end.Lat {
			return false
		}
		if point.Lat < start.Lat {
			return true
		}
	}

	raySlope := (point.Lng - start.Lng) / (point.Lat - start.Lat)
	diagSlope := (end.Lng - start.Lng) / (end.Lat - start.Lat)

	return raySlope >= diagSlope
}
