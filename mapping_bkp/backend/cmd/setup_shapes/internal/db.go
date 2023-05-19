package internal

import (
	"log"
	"reflect"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/paulmach/orb/geojson"
	"github.com/paulmach/orb/planar"
)

var codesMap = map[namespaces.Namespace][]string{
	namespaces.US_STATE:  {"GEOID", "NAME"},
	namespaces.US_COUNTY: {"GEOID", "NAME"},
	namespaces.US_TTRACT: {"ORG_CODE", "IND_NAME"},
}

var geospaces = map[string]*storages.DetailedGeospace{}

type DBGeospaceFeature struct {
	Geospace *storages.DetailedGeospace
	Feature  *geojson.Feature
}

func PopulateDB(s storages.GeospaceStorage, ns namespaces.Namespace, fc geojson.FeatureCollection) ([]DBGeospaceFeature, error) {
	populated := make([]DBGeospaceFeature, 0)
	if len(geospaces) == 0 {
		it, err := s.All(nil, nil)
		if err != nil {
			return nil, errors.Wrap(err, "internal.PopulateDB All")
		}
		for it.HasNext() {
			g, err := it.GetRow()
			if err != nil {
				return nil, errors.Wrap(err, "internal.PopulateDB GetRow")
			}
			geospaces[string(g.Namespace)+g.GeoId] = g
		}
	}
	for _, feature := range fc.Features {
		codeMap := codesMap[ns]
		rawCode := feature.Properties[codeMap[0]]
		if rawCode == nil {
			log.Println(ns, "shape with no data... skipping it")
			continue
		}
		code := rawCode.(string)
		rawName := feature.Properties[codeMap[1]]
		if rawName == nil {
			log.Println(ns, "shape with no data... skipping it")
			continue
		}
		name := rawName.(string)
		centroid, _ := planar.CentroidArea(feature.Geometry)
		var g *storages.DetailedGeospace
		var err error
		switch ns {
		case namespaces.US_STATE:
			g, err = saveGeospace(s, &storages.Geospace{
				Name:      &name,
				GeoId:     code,
				Namespace: namespaces.US_STATE,
				Centroid:  [2]float64{centroid.Lat(), centroid.Lon()},
			})
			if err != nil {
				panic(err)
			}
		case namespaces.US_COUNTY:
			stateFips := code[:2]
			parent, err := getGeospace(s, namespaces.US_STATE, stateFips)
			if err != nil {
				panic(err)
			}
			countyG := &storages.Geospace{
				Namespace: namespaces.US_COUNTY,
				Name:      &name,
				GeoId:     code,
				Centroid:  [2]float64{centroid.Lat(), centroid.Lon()},
			}
			if parent != nil {
				countyG.ParentId = &parent.Id
			}
			g, err = saveGeospace(s, countyG)
			if err != nil {
				panic(err)
			}
		case namespaces.US_TTRACT:
			g, err = saveGeospace(s, &storages.Geospace{
				Name:      &name,
				GeoId:     code,
				Namespace: namespaces.US_TTRACT,
				Centroid:  [2]float64{centroid.Lat(), centroid.Lon()},
			})
			if err != nil {
				panic(err)
			}
		}
		if g != nil {
			populated = append(populated, DBGeospaceFeature{
				Geospace: g,
				Feature:  feature,
			})
		}
	}
	return populated, nil
}

func saveGeospace(storage storages.GeospaceStorage, g *storages.Geospace) (dg *storages.DetailedGeospace, err error) {
	if dg, err = getGeospace(storage, g.Namespace, g.GeoId); err == storages.ErrGeospaceNotFound {
		if err := storage.Create(g); err != nil {
			return nil, errors.Wrap(err, "internal.saveGeospace Create")
		}
		dg, err = storage.Get(g.Id)
		if err != nil {
			return nil, errors.Wrap(err, "internal.saveGeospace Get")
		}
	} else {
		g.Id = dg.Id
		if !reflect.DeepEqual(g, dg.AsGeospace()) {
			if err := storage.Update(g); err != nil {
				return nil, errors.Wrap(err, "internal.saveGeospace Update")
			}
			dg.Name = g.Name
			dg.Namespace = g.Namespace
			dg.Centroid = g.Centroid
			dg.GeoId = g.GeoId
		}
	}
	geospaces[string(g.Namespace)+g.GeoId] = dg
	return dg, nil
}

func getGeospace(storage storages.GeospaceStorage, ns namespaces.Namespace, geoId string) (*storages.DetailedGeospace, error) {
	if cached, exists := geospaces[string(ns)+geoId]; exists {
		return cached, nil
	}
	dg, err := storage.GetByGeoId(ns, geoId)
	if err == storages.ErrGeospaceNotFound {
		return nil, err
	} else if err != nil {
		return nil, errors.Wrap(err, "internal.getGeospace GetByGeoId")
	}
	return dg, nil
}
