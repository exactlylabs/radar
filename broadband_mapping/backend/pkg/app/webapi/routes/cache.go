package routes

import (
	"sync"
	"time"

	"github.com/exactlylabs/go-rest/pkg/restapi/webcontext"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
)

// Summary data changes at most once a day, so clients and proxies may reuse responses briefly.
const publicCacheControl = "public, max-age=300"

// setPublicCache marks a successful response as cacheable. Call it only right before writing a
// successful body: the headers go straight to the ResponseWriter and would otherwise also be
// sent with an error response.
func setPublicCache(ctx *webcontext.Context, varyEncoding bool) {
	h := ctx.ResponseHeader()
	h.Set("Cache-Control", publicCacheControl)
	if varyEncoding {
		h.Add("Vary", "Accept-Encoding")
	}
}

type summaryMap = map[string]storages.GeospaceSummaryResult

type summaryEntry struct {
	value   summaryMap
	expires time.Time
}

type summaryCall struct {
	wg    sync.WaitGroup
	value summaryMap
	err   error
}

// summaryMemo keeps decoded namespace summaries in memory for a TTL, so a tile request doesn't
// decode the whole namespace summary again, and collapses concurrent loads of the same key into
// one database query (a map load requests many tiles of the same namespace at once).
// Cached maps are shared between requests and must be treated as read-only.
type summaryMemo struct {
	mu         sync.Mutex
	ttl        time.Duration
	maxEntries int
	entries    map[string]summaryEntry
	calls      map[string]*summaryCall
	now        func() time.Time
}

func newSummaryMemo(ttl time.Duration, maxEntries int) *summaryMemo {
	return &summaryMemo{
		ttl:        ttl,
		maxEntries: maxEntries,
		entries:    map[string]summaryEntry{},
		calls:      map[string]*summaryCall{},
		now:        time.Now,
	}
}

// get returns the cached value for key, or loads it. With useCache false it always loads and
// leaves the cache untouched.
func (m *summaryMemo) get(key string, useCache bool, load func() (summaryMap, error)) (summaryMap, error) {
	if !useCache {
		return load()
	}
	m.mu.Lock()
	if e, ok := m.entries[key]; ok && m.now().Before(e.expires) {
		m.mu.Unlock()
		return e.value, nil
	}
	if c, ok := m.calls[key]; ok {
		m.mu.Unlock()
		c.wg.Wait()
		return c.value, c.err
	}
	c := &summaryCall{}
	c.wg.Add(1)
	m.calls[key] = c
	m.mu.Unlock()

	func() {
		defer func() {
			if r := recover(); r != nil {
				c.err = panicError{r}
			}
		}()
		c.value, c.err = load()
	}()

	m.mu.Lock()
	delete(m.calls, key)
	if c.err == nil {
		m.store(key, c.value)
	}
	m.mu.Unlock()
	c.wg.Done()
	if pe, ok := c.err.(panicError); ok {
		panic(pe.v)
	}
	return c.value, c.err
}

// store must be called with m.mu held.
func (m *summaryMemo) store(key string, v summaryMap) {
	now := m.now()
	if _, exists := m.entries[key]; !exists && len(m.entries) >= m.maxEntries {
		var oldestKey string
		var oldest time.Time
		for k, e := range m.entries {
			if !now.Before(e.expires) {
				delete(m.entries, k)
				continue
			}
			if oldestKey == "" || e.expires.Before(oldest) {
				oldestKey, oldest = k, e.expires
			}
		}
		if len(m.entries) >= m.maxEntries && oldestKey != "" {
			delete(m.entries, oldestKey)
		}
	}
	m.entries[key] = summaryEntry{value: v, expires: now.Add(m.ttl)}
}

type panicError struct{ v any }

func (p panicError) Error() string { return "panic while loading summary" }
