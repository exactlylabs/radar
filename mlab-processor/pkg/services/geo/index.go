package geo

import (
	"github.com/tidwall/rtree"
)

type entry struct {
	poly       *Polygon
	namespace  string
	externalId string
}

// Index finds the shapes containing a point: an R-tree over the rings' bounding boxes,
// then an exact point-in-polygon test. It is safe for concurrent queries once built.
type Index struct {
	tree    rtree.RTreeGN[float64, int32]
	entries []entry
}

func NewIndex() *Index {
	return &Index{}
}

// Len returns the number of polygons (rings) indexed.
func (i *Index) Len() int { return len(i.entries) }

func (i *Index) Add(namespace, externalId string, p *Polygon) {
	id := int32(len(i.entries))
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
	var out []*NamespaceAndExternalId
	for _, r := range i.AppendContaining(nil, p) {
		r := r
		out = append(out, &r)
	}
	return out
}

// AppendContaining appends the distinct (namespace, id) pairs of the polygons containing
// p to dst, in index order, and returns it. It allocates nothing when dst has room.
func (i *Index) AppendContaining(dst []NamespaceAndExternalId, p *Point) []NamespaceAndExternalId {
	start := len(dst)
	i.tree.Search([2]float64{p.Lat, p.Lng}, [2]float64{p.Lat, p.Lng}, func(min, max [2]float64, id int32) bool {
		e := &i.entries[id]
		if !e.poly.Contains(p) {
			return true
		}
		for _, r := range dst[start:] {
			if r.Namespace == e.namespace && r.ExternalId == e.externalId {
				return true
			}
		}
		dst = append(dst, NamespaceAndExternalId{Namespace: e.namespace, ExternalId: e.externalId})
		return true
	})
	return dst
}
