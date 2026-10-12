package helpers

import (
	"time"
)

// Takes a start and end date and returns a list of dates between them
func DateRange(start, end time.Time) (dates []time.Time) {
	dates = []time.Time{}
	for t := start; t.Before(end.AddDate(0, 0, 1)); t = t.AddDate(0, 0, 1) {
		dates = append(dates, t)
	}
	return dates
}

// DaysAgo returns the UTC date (midnight) n days before now.
func DaysAgo(now time.Time, n int) time.Time {
	return now.UTC().Truncate(24*time.Hour).AddDate(0, 0, -n)
}
