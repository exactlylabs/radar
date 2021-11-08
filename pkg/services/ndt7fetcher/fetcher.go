package ndt7fetcher

import (
	"context"
	"fmt"
	"io"
	"log"
	"sync"
	"time"

	"cloud.google.com/go/storage"
	"google.golang.org/api/option"
)

const (
	preSwitchFormat  = "2006/01/20060102"
	postSwitchFormat = "2006/01/02/20060102"
	searchSwitchDate = "2020-02-18"
	ndt7Bucket       = "archive-measurement-lab"
)

type FetchedData struct {
	Path          string
	R             io.ReadCloser
	Day           time.Time
	DayFilesCount int
}

func searchPrefixes(day time.Time) []string {
	switchDate, err := time.Parse("2006-01-02", searchSwitchDate)
	if err != nil {
		panic(fmt.Errorf("failed to parse static switch date: %w", err))
	}

	if day == switchDate {
		return []string{day.Format(postSwitchFormat), day.Format(preSwitchFormat)}
	} else if day.Before(switchDate) {
		return []string{day.Format(preSwitchFormat)}
	} else {
		return []string{day.Format(postSwitchFormat)}
	}
}

// Fetch the GCP object names for all NDT7 files for the given day
func fetchDayNames(ctx context.Context, day time.Time) ([]string, error) {
	names := []string{}

	client, err := storage.NewClient(ctx, option.WithoutAuthentication())
	if err != nil {
		return nil, fmt.Errorf("ndt7fetcher.fetchDayNames err: %w", err)
	}

	for _, prefix := range searchPrefixes(day) {
		iter := client.Bucket(ndt7Bucket).Objects(ctx, &storage.Query{Prefix: prefix})

		item, iErr := iter.Next()
		if iErr != nil {
			return nil, fmt.Errorf("ndt7fetcher.fetchDayNames iErr: %w", iErr)
		}
		for item != nil {
			names = append(names, item.Name)

			item, iErr = iter.Next()
			if iErr != nil {
				return nil, fmt.Errorf("ndt7fetcher.fetchDayNames iErr: %w", iErr)
			}
		}
	}

	return names, nil
}

func fetchDay(ctx context.Context, day time.Time, searchPaths []string, ch chan *FetchedData) {
	fmt.Println(searchPaths)
	client, err := storage.NewClient(ctx, option.WithoutAuthentication())
	if err != nil {
		panic(fmt.Errorf("ndt7fetcher.fetchDay err: %w", err))
	}

	allItems := []*storage.ObjectAttrs{}
	for _, searchPath := range searchPaths {
		fmt.Println("first")
		objIter := client.Bucket(ndt7Bucket).Objects(ctx, &storage.Query{
			Prefix: "ndt/ndt7/" + searchPath,
		})
		fmt.Println("second")

		item, _ := objIter.Next()
		fmt.Println("third")
		for item != nil {
			allItems = append(allItems, item)
			fmt.Println("New item", item.Name)
			item, _ = objIter.Next()
		}

		fmt.Println("fourth")
	}

	count := len(allItems)
	for _, item := range allItems {
		fmt.Println("fifth")
		log.Println(item.Name, count)
		rc, err := client.Bucket(ndt7Bucket).Object(item.Name).NewReader(ctx)
		if err != nil {
			panic(fmt.Errorf("ndt7fetcher.fetchDay err: %w", err))
		}

		// ch <- &FetchedData{Path: item.Name, R: rc, Day: day, DayFilesCount: count}
	}
}

func worker(ctx context.Context, ch chan *FetchedData, workItems chan *workItem, wg *sync.WaitGroup) {
	defer wg.Done()

	client, err := storage.NewClient(ctx, option.WithoutAuthentication())
	if err != nil {
		panic(fmt.Errorf("ndt7fetcher.worker err: %w", err))
	}

	for item := range workItems {
		rc, err := client.Bucket(ndt7Bucket).Object(item.Path).NewReader(ctx)
		if err != nil {
			panic(fmt.Errorf("ndt7fetcher.worker err: %w", err))
		}

		ch <- &FetchedData{Path: item.Path, R: rc, Day: item.Day, DayFilesCount: item.DayFilesCount}
	}
}

interface workItem struct {
	day time.Time
	dayCount int
	path string
}

func runFetcher(days []time.Time, parallelization int, ch chan *FetchedData) {
	wg := &sync.WaitGroup{}
	wg.Add(parallelization)

	workItems := make(chan workItem, parallelization * 3)

	for i := 0; i < parallelization; i++ {

	}

	wg.Wait()
	close(ch)
}

// Fetch the NDT7 raw files from the public GCP Bucket by day and
// return a channel of read-closers.
func Fetch(days []time.Time, parallelization int) (chan *FetchedData, error) {
	// Create a channel to return the temp file paths
	ch := make(chan *FetchedData, parallelization)

	ctx := context.Background()

	dayToSearchPaths := searchPaths(days)
	for day, searchPaths := range dayToSearchPaths {
		go fetchDay(ctx, day, searchPaths, ch)
	}

	return ch, nil
}
