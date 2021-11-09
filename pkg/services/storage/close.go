package storage

func Close() {
	for _, ch := range channelWriters {
		close(ch)
	}
	wg.Wait()
	persistJobs()
}
