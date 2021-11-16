package geo

import (
	"fmt"

	"github.com/tidwall/rtree"
)

type Index struct {
	tree                rtree.RTree
	indexIdToPoly       map[int]*Polygon
	indexIdToExternalId map[int]string
	indexIdtoNamespace  map[int]string
	nextIndexId         int
}

func NewIndex() *Index {
	return &Index{
		tree:                rtree.RTree{},
		indexIdToPoly:       map[int]*Polygon{},
		indexIdToExternalId: map[int]string{},
		indexIdtoNamespace:  map[int]string{},
		nextIndexId:         0,
	}
}

func (i *Index) Add(namespace, externalId string, p *Polygon) {
	id := i.nextId()

	i.indexIdtoNamespace[id] = namespace
	i.indexIdToExternalId[id] = externalId
	i.indexIdToPoly[id] = p

	points := p.BoundingBox()

	if externalId == "36047" {
		fmt.Println(points)
	}

	i.tree.Insert([2]float64{points[0].Lat, points[0].Lng}, [2]float64{points[1].Lat, points[1].Lng}, id)
}

type NamespaceAndExternalId struct {
	Namespace  string
	ExternalId string
}

func (i *Index) ContainingShapeID(p *Point) []*NamespaceAndExternalId {
	foundIds := map[int]bool{}

	i.tree.Search([2]float64{p.Lat, p.Lng}, [2]float64{p.Lat, p.Lng}, func(min, max [2]float64, value interface{}) bool {
		id := value.(int)
		poly := i.indexIdToPoly[id]

		if poly.Contains(p) {
			foundIds[id] = true
		}

		return true
	})

	results := []*NamespaceAndExternalId{}
	recorded := map[string]bool{}
	for id := range foundIds {
		if !recorded[i.indexIdtoNamespace[id]+":"+i.indexIdToExternalId[id]] {
			results = append(results, &NamespaceAndExternalId{
				Namespace:  i.indexIdtoNamespace[id],
				ExternalId: i.indexIdToExternalId[id],
			})

			recorded[i.indexIdtoNamespace[id]+":"+i.indexIdToExternalId[id]] = true
		}
	}

	return results
}

func (i *Index) nextId() int {
	id := i.nextIndexId
	i.nextIndexId++

	return id
}
