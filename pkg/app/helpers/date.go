package helpers

import "time"

// Takes a start and end date and returns a list of dates between them
func DateRange(start, end time.Time) (dates []time.Time) {
	dates = []time.Time{}
	for t := start; t.Before(end); t = t.AddDate(0, 0, 1) {
		dates = append(dates, t)
	}
	return dates
}
