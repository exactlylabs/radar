package clickhousestorages

import (
	"context"
	"database/sql"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/ClickHouse/clickhouse-go/v2/lib/proto"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
	"github.com/google/uuid"
)

type asnOrgStorage struct {
	conn  driver.Conn
	cache map[string]storages.ASNOrg
}

const asnOrgQuery = `SELECT id, name from asn_orgs`
const asnOrderedListQuery = `SELECT id, name, count(*) OVER() as total_rows FROM (
	SELECT DISTINCT ON (id) id , name, SUM(total) as total FROM us_asns GROUP BY id, name ORDER BY total DESC
)`

func (*asnOrgStorage) Close() error {
	return nil // noop
}

// Create implements storages.ASNOrgStorage
func (as *asnOrgStorage) Create(a *storages.ASNOrg) error {
	query := `INSERT INTO asn_orgs(id, name) VALUES ($1, $2)`
	id := uuid.New()
	err := as.conn.Exec(context.Background(), query, id, a.Organization)
	if err != nil {
		return errors.Wrap(err, "asnOrgStorage#Create Exec")
	}
	a.Id = id.String()
	as.cache[id.String()] = *a
	return nil
}

func (as *asnOrgStorage) Get(id string) (*storages.ASNOrg, error) {
	query := asnOrgQuery + " WHERE id=?"
	row := as.conn.QueryRow(context.Background(), query, id)
	if row.Err() != nil {
		return nil, errors.Wrap(row.Err(), "asnOrgStorage#Get QueryRow")
	}
	a, err := scanASNOrg(row)
	if err == sql.ErrNoRows {
		return nil, storages.ErrASNOrgNotFound
	} else if err != nil {
		return nil, errors.Wrap(err, "asnOrgStorage#Get scanASNOrg")
	}
	return a, nil
}

func (as *asnOrgStorage) GetByOrgName(id string) (*storages.ASNOrg, error) {
	// Cache this request, since it's called by the ingestor billions of times... literally
	if a, exists := as.cache[id]; exists {
		return &a, nil
	}
	query := asnOrgQuery + " WHERE name=?"
	row := as.conn.QueryRow(context.Background(), query, id)
	if row.Err() != nil {
		return nil, errors.Wrap(row.Err(), "asnOrgStorage#GetByOrgName QueryRow")
	}
	a, err := scanASNOrg(row)
	if err == sql.ErrNoRows {
		return nil, storages.ErrASNOrgNotFound
	} else if err != nil {
		return nil, errors.Wrap(err, "asnOrgStorage#GetByOrgName scanASNOrg")
	}
	as.cache[a.Id] = *a
	return a, nil
}

func (as *asnOrgStorage) queryASNs(query string, limit, offset *int, args ...any) (storages.Iterator[*storages.ASNOrg], error) {
	query, args = addLimitOffset(query, args, limit, offset)
	rows, err := as.conn.Query(context.Background(), query, args...)
	if err != nil {
		return nil, errors.Wrap(err, "asnOrgStorage#queryASNs Query")
	}
	return &asnIterator{rows: rows}, nil
}

func (as *asnOrgStorage) All(limit *int, offset *int) (storages.Iterator[*storages.ASNOrg], error) {
	query := asnOrderedListQuery
	it, err := as.queryASNs(query, limit, offset)
	protoExc := &proto.Exception{}
	if errors.As(err, &protoExc) && protoExc.Code == 60 { // UNKNOWN TABLE
		// us_asns view doesn't exists yet, default to asn_orgs (unordered)
		query = `SELECT id, name, count(*) OVER() as total_rows FROM asn_orgs`
		it, err = as.queryASNs(query, limit, offset)
	}
	return it, err
}

func (as *asnOrgStorage) AllFromGeospace(geospaceId string, limit *int, offset *int) (storages.Iterator[*storages.ASNOrg], error) {
	query := `SELECT id, name, count(*) OVER() as total_rows FROM (SELECT * FROM us_asns WHERE geospace_id = ? ORDER BY total DESC)`
	return as.queryASNs(query, limit, offset, geospaceId)
}

func (*asnOrgStorage) Open() error {
	return nil // noop
}

func (as *asnOrgStorage) Search(query string, limit *int, offset *int) (storages.Iterator[*storages.ASNOrg], error) {
	q := asnOrderedListQuery + " WHERE name ILIKE ?"
	return as.queryASNs(q, limit, offset, "%"+query+"%")
}

func (as *asnOrgStorage) SearchFromGeospace(query, geospaceId string, limit *int, offset *int) (storages.Iterator[*storages.ASNOrg], error) {
	q := `SELECT id, name, count(*) OVER() as total_rows FROM (SELECT * FROM us_asns WHERE geospace_id = ? AND name ILIKE ? ORDER BY total DESC)`
	return as.queryASNs(q, limit, offset, geospaceId, "%"+query+"%")
}

func NewASNOrgStorage(conn driver.Conn) storages.ASNOrgStorage {
	return &asnOrgStorage{
		conn:  conn,
		cache: make(map[string]storages.ASNOrg),
	}
}

func scanASNOrg(scanner Scanner, extraFields ...any) (*storages.ASNOrg, error) {
	a := &storages.ASNOrg{}
	args := []any{&a.Id, &a.Organization}
	if len(extraFields) > 0 {
		args = append(args, extraFields...)
	}
	if err := scanner.Scan(args...); err == sql.ErrNoRows {
		return nil, err
	} else if err != nil {
		return nil, errors.Wrap(err, "clickhousestorages.scanASNOrg Scan")
	}
	return a, nil
}
