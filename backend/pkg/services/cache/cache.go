package cache

import (
	"sync"
	"time"
)

type cacheItem struct {
	value     any
	expiresAt time.Time
}

type memoryCache struct {
	cache *sync.Map
}

func newMemoryCache() Cache {
	mc := &memoryCache{
		cache: &sync.Map{},
	}
	go mc.cleanExpired()
	return mc
}

func (mc *memoryCache) loadOrExpire(key any) (any, bool) {
	if v, exists := mc.cache.Load(key); exists && v.(*cacheItem).expiresAt.Before(time.Now()) {
		mc.cache.Delete(key)
		return nil, false
	} else if exists {
		return v.(*cacheItem).value, true
	}
	return nil, false
}

func (mc *memoryCache) Get(key any) (any, bool) {
	return mc.loadOrExpire(key)
}

func (mc *memoryCache) Set(key, value any, d time.Duration) {
	mc.cache.Store(key, &cacheItem{value: value, expiresAt: time.Now().Add(d)})
}

func (mc *memoryCache) cleanExpired() {
	for range time.NewTimer(time.Millisecond * 200).C {
		mc.cache.Range(func(key, value any) bool {
			if value.(*cacheItem).expiresAt.Before(time.Now()) {
				mc.cache.Delete(key)
			}
			return true
		})
	}
}
