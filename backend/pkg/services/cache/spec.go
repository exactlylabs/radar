package cache

import "time"

type Cache interface {
	Get(key any) (any, bool)
	Set(key, value any, expiration time.Duration)
}

func New() Cache {
	return newMemoryCache()
}
