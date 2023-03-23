package clickhousestorages

import (
	"context"
	"database/sql"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/google/uuid"
)

const detailedGeoQuery = `SELECT 
	g.id, g.name, g.geo_id, g.namespace, g.centroid_lat, g.centroid_long, 
	p.id, p.name, p.geo_id, p.namespace, p.centroid_lat, p.centroid_long, p.parent_id 
FROM geospaces g 
LEFT JOIN geospaces p ON g.parent_id = p.id `

const iteratorDetailedGeoQuery = `SELECT 
	g.id, g.name, g.geo_id, g.namespace, g.centroid_lat, g.centroid_long, 
	p.id, p.name, p.geo_id, p.namespace, p.centroid_lat, p.centroid_long, p.parent_id,
	count(*) OVER() as total_rows
FROM geospaces g 
LEFT JOIN geospaces p ON g.parent_id = p.id `

type geospaceStorage struct {
	conn driver.Conn
}

func (*geospaceStorage) Close() error {
	return nil // noop
}

func (gs *geospaceStorage) Create(g *storages.Geospace) error {
	id := uuid.New()
	var parent *string = g.ParentId
	var name *string = g.Name
	if parent == nil {
		p := ""
		parent = &p
	}
	if name == nil {
		n := ""
		name = &n
	}

	err := gs.conn.Exec(
		context.Background(),
		`INSERT INTO geospaces (id, name, namespace, geo_id, parent_id, centroid_lat, centroid_long) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		id, *name, g.Namespace, g.GeoId, *parent, g.Centroid[0], g.Centroid[1],
	)
	if err != nil {
		return errors.Wrap(err, "geospaceStorage#Create Exec")
	}
	g.Id = id.String()
	return nil
}

func (gs *geospaceStorage) Get(id string) (*storages.DetailedGeospace, error) {
	query := detailedGeoQuery + " WHERE id=?"
	row := gs.conn.QueryRow(context.Background(), query, id)
	if row.Err() != nil {
		return nil, errors.Wrap(row.Err(), "geospaceStorage#Get QueryRow")
	}
	g, err := scanDetailedGeospace(row)
	if err == sql.ErrNoRows {
		return nil, storages.ErrGeospaceNotFound
	} else if err != nil {
		return nil, errors.Wrap(err, "geospaceStorage#Get scanDetailedGeospace")
	}
	return g, nil
}

// GetByGeoId implements storages.GeospaceStorage
func (gs *geospaceStorage) GetByGeoId(namespace namespaces.Namespace, geoId string) (*storages.DetailedGeospace, error) {
	query := detailedGeoQuery + " WHERE namespace = ? AND geo_id = ?"
	row := gs.conn.QueryRow(context.Background(), query, string(namespace), geoId)
	if row.Err() != nil {
		return nil, errors.Wrap(row.Err(), "geospaceStorage#GetByGeoId QueryRow")
	}
	g, err := scanDetailedGeospace(row)
	if err == sql.ErrNoRows {
		return nil, storages.ErrGeospaceNotFound
	} else if err != nil {
		return nil, errors.Wrap(err, "geospaceStorage#GetByGeoId scanDetailedGeospace")
	}
	return g, nil
}

func (gs *geospaceStorage) All(limit *int, offset *int) (storages.Iterator[*storages.DetailedGeospace], error) {
	query := iteratorDetailedGeoQuery
	args := []any{}
	if limit != nil {
		query += " LIMIT ?"
		args = append(args, *limit)
	}
	if offset != nil {
		query += " OFFSET ?"
		args = append(args, *offset)
	}
	rows, err := gs.conn.Query(context.Background(), query, args...)
	if err != nil {
		return nil, errors.Wrap(err, "geospaceStorage#All Query")
	}
	return &iterator[*storages.DetailedGeospace]{rows: rows, scannRow: scanDetailedGeospace}, nil
}

func (gs *geospaceStorage) AllFromNamespace(namespace namespaces.Namespace, limit *int, offset *int) (storages.Iterator[*storages.DetailedGeospace], error) {
	query := iteratorDetailedGeoQuery + " WHERE g.namespace = ?"
	args := []any{namespace}
	if limit != nil {
		query += " LIMIT ?"
		args = append(args, *limit)
	}
	if offset != nil {
		query += " OFFSET ?"
		args = append(args, *offset)
	}
	rows, err := gs.conn.Query(context.Background(), query, args...)
	if err != nil {
		return nil, errors.Wrap(err, "geospaceStorage#AllFromNamespace Query")
	}
	return &iterator[*storages.DetailedGeospace]{rows: rows, scannRow: scanDetailedGeospace}, nil
}

func (*geospaceStorage) Open() error {
	return nil // noop
}

func (gs *geospaceStorage) Search(query string, limit *int, offset *int) (storages.Iterator[*storages.DetailedGeospace], error) {
	q := iteratorDetailedGeoQuery + " WHERE g.name ILIKE ?"
	args := []any{"%" + query + "%"}
	if limit != nil {
		q += " LIMIT ?"
		args = append(args, *limit)
	}
	if offset != nil {
		q += " OFFSET ?"
		args = append(args, *offset)
	}
	rows, err := gs.conn.Query(context.Background(), q, args...)
	if err != nil {
		return nil, errors.Wrap(err, "geospaceStorage#Search Query")
	}
	return &iterator[*storages.DetailedGeospace]{rows: rows, scannRow: scanDetailedGeospace}, nil
}

func (gs *geospaceStorage) SearchFromNamespace(query string, namespace namespaces.Namespace, limit *int, offset *int) (storages.Iterator[*storages.DetailedGeospace], error) {
	q := iteratorDetailedGeoQuery + " WHERE g.name ILIKE ? AND namespace = ?"
	args := []any{"%" + query + "%", string(namespace)}
	if limit != nil {
		q += " LIMIT ?"
		args = append(args, *limit)
	}
	if offset != nil {
		q += " OFFSET ?"
		args = append(args, *offset)
	}
	rows, err := gs.conn.Query(context.Background(), q, args...)
	if err != nil {
		return nil, errors.Wrap(err, "geospaceStorage#SearchFromNamespace Query")
	}
	return &iterator[*storages.DetailedGeospace]{rows: rows, scannRow: scanDetailedGeospace}, nil
}

// Update implements storages.GeospaceStorage
func (gs *geospaceStorage) Update(g *storages.Geospace) error {
	query := `ALTER TABLE geospaces
	UPDATE name=?, parent_id=?, centroid_lat=?, centroid_long=? WHERE id = ?`
	var parent *string = g.ParentId
	var name *string = g.Name
	if parent == nil {
		p := ""
		parent = &p
	}
	if name == nil {
		n := ""
		name = &n
	}
	err := gs.conn.Exec(context.Background(), query, *name, *parent, g.Centroid[0], g.Centroid[1], g.Id)
	if err != nil {
		return errors.Wrap(err, "geospaceStorage#Update Exec")
	}
	return nil
}

func NewGeospaceStorage(conn driver.Conn) storages.GeospaceStorage {
	return &geospaceStorage{conn}
}

type Scanner interface {
	Scan(dest ...any) error
}

func scanDetailedGeospace(scanner Scanner, extraFields ...any) (*storages.DetailedGeospace, error) {
	g := &storages.DetailedGeospace{}
	var ns string
	var pId, pGeoId, pName, pNs, pParentId *string
	var pCentroid [2]float64
	args := []any{
		&g.Id, &g.Name, &g.GeoId, &ns, &g.Centroid[0], &g.Centroid[1],
		&pId, &pName, &pGeoId, &pNs, &pCentroid[0], &pCentroid[1], &pParentId,
	}
	if len(extraFields) > 0 {
		args = append(args, extraFields...)
	}

	if err := scanner.Scan(args...); err == sql.ErrNoRows {
		return nil, err
	} else if err != nil {
		return nil, errors.Wrap(err, "clickhousestorages.scanDetailedGeospace Scan")
	}
	g.Namespace = namespaces.Namespace(ns)
	if pId != nil && uuid.MustParse(*pId) != uuid.Nil {
		g.Parent = &storages.Geospace{
			Id:        *pId,
			GeoId:     *pGeoId,
			Namespace: namespaces.Namespace(*pNs),
			Name:      pName,
			ParentId:  pParentId,
			Centroid:  pCentroid,
		}
	}
	return g, nil
}
