package geo

import (
	"github.com/tidwall/rtree"
)

type entry struct {
	poly       *Polygon
	namespace  string
	externalId string
}

type Index struct {
	tree    rtree.RTree
	entries []entry
}

func NewIndex() *Index {
	return &Index{}
}

// Len returns the number of polygons (rings) indexed.
func (i *Index) Len() int { return len(i.entries) }

func (i *Index) Add(namespace, externalId string, p *Polygon) {
	id := len(i.entries)
	i.entries = append(i.entries, entry{poly: p, namespace: namespace, externalId: externalId})

	points := p.BoundingBox()

	i.tree.Insert([2]float64{points[0].Lat, points[0].Lng}, [2]float64{points[1].Lat, points[1].Lng}, id)
}

type NamespaceAndExternalId struct {
	Namespace  string
	ExternalId string
}

// ContainingShapeID returns the distinct (namespace, id) pairs of the polygons containing p.
func (i *Index) ContainingShapeID(p *Point) []*NamespaceAndExternalId {
	var results []*NamespaceAndExternalId

	i.tree.Search([2]float64{p.Lat, p.Lng}, [2]float64{p.Lat, p.Lng}, func(min, max [2]float64, value interface{}) bool {
		e := &i.entries[value.(int)]
		if !e.poly.Contains(p) {
			return true
		}
		for _, r := range results {
			if r.Namespace == e.namespace && r.ExternalId == e.externalId {
				return true
			}
		}
		results = append(results, &NamespaceAndExternalId{Namespace: e.namespace, ExternalId: e.externalId})
		return true
	})

	return results
}
