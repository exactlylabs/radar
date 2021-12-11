package storage

import "sync"

func Close() {
	channelWriters.Range(func(key, value interface{}) bool {
		ch := value.(chan interface{})
		close(ch)
		return true
	})

	wg.Wait()
	persistJobs()

	channelWriters = sync.Map{}
}
