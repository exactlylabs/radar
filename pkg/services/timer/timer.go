package timer

import (
	"fmt"
	"sync"
	"time"
)

type TimerData struct {
	sum   int64
	count int64
}

// AvgDuration returns the average duration of the timer
func (td *TimerData) AvgDuration() time.Duration {
	avg := td.sum / td.count
	return time.Nanosecond * time.Duration(avg)
}

// TotalDuration returns the duration that this timer has been triggered
func (td *TimerData) TotalDuration() time.Duration {
	return time.Nanosecond * time.Duration(td.sum)
}

var timers sync.Map

func init() {
	timers = sync.Map{}
}

// TimeIt will register the duration for a specific function name. It should be called as
// defer TimeIt(time.Now(), "My Function")
func TimeIt(start time.Time, name string) {
	dataInterface, _ := timers.LoadOrStore(name, &TimerData{sum: 0, count: 0})
	data := dataInterface.(*TimerData)
	data.sum += time.Since(start).Nanoseconds()
	data.count++
}

// GetTimer will return a TimerData instance registered for the given name
// Returns nil in case nothing is found
func GetTimer(name string) *TimerData {
	if t, exists := timers.Load(name); exists {
		return t.(*TimerData)
	}
	return nil
}

func PrintTimer(name string, data *TimerData) {
	fmt.Printf("%s :\n\t Avg: %v \n\tCount: %v\n\tSum: %v\n", name, data.AvgDuration(), data.count, time.Duration(data.sum))
}

func PrintAll() {
	fmt.Println("--------- Timer Data ------------")
	timers.Range(func(key, value interface{}) bool {
		PrintTimer(key.(string), value.(*TimerData))
		return true
	})
	fmt.Println("---------------------------------")
}
