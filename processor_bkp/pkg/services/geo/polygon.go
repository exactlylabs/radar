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
type Polygon struct {
	points []*Point
}

// NewPolygon: Creates and returns a new pointer to a Polygon
// composed of the passed in points.  Points are
// considered to be in order such that the last point
// forms an edge with the first point.
func NewPolygon(points []*Point) *Polygon {
	return &Polygon{points: points}
}

// Points returns the points of the current Polygon.
func (p *Polygon) Points() []*Point {
	return p.points
}

// Add: Appends the passed in contour to the current Polygon.
func (p *Polygon) Add(point *Point) {
	p.points = append(p.points, point)
}

// IsClosed returns whether or not the polygon is closed.
// TODO:  This can obviously be improved, but for now,
//        this should be sufficient for detecting if points
//        are contained using the raycast algorithm.
func (p *Polygon) IsClosed() bool {
	if len(p.points) < 3 {
		return false
	}

	return true
}

// Contains returns whether or not the current Polygon contains the passed in Point.
func (p *Polygon) Contains(point *Point) bool {
	if !p.IsClosed() {
		return false
	}

	start := len(p.points) - 1
	end := 0

	contains := p.intersectsWithRaycast(point, p.points[start], p.points[end])

	for i := 1; i < len(p.points); i++ {
		if p.intersectsWithRaycast(point, p.points[i-1], p.points[i]) {
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
