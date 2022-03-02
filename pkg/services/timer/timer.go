package timer

import (
	"fmt"
	"sync"
	"time"
)

type TimerData struct {
	sum   *int64
	count *int64
}

// AvgDuration returns the average duration of the timer
func (td *TimerData) AvgDuration() time.Duration {
	avg := *td.sum / *td.count
	return time.Nanosecond * time.Duration(avg)
}

// TotalDuration returns the duration that this timer has been triggered
func (td *TimerData) TotalDuration() time.Duration {
	return time.Nanosecond * time.Duration(*td.sum)
}

var timers map[string]*TimerData
var lock = sync.Mutex{}

func init() {
	timers = make(map[string]*TimerData)
}

// TimeIt will register the duration for a specific function name. It should be called as
// defer TimeIt(time.Now(), "My Function")
func TimeIt(start time.Time, name string) {
	lock.Lock()

	if _, exists := timers[name]; !exists {
		sum := int64(0)
		count := int64(0)
		timers[name] = &TimerData{sum: &sum, count: &count}
	}
	*timers[name].sum = *timers[name].sum + time.Since(start).Nanoseconds()
	*timers[name].count = *timers[name].count + 1
	lock.Unlock()
}

// GetTimer will return a TimerData instance registered for the given name
// Returns nil in case nothing is found
func GetTimer(name string) *TimerData {
	if t, exists := timers[name]; exists {
		return t
	}
	return nil
}

func PrintTimer(name string, data *TimerData) {
	fmt.Printf("%s :\n\t Avg: %v \n\tCount: %v\n\tSum: %v\n", name, data.AvgDuration(), *data.count, time.Duration(*data.sum))
}

func PrintAll() {
	fmt.Println("--------- Timer Data ------------")
	for name, data := range timers {
		PrintTimer(name, data)
	}
	fmt.Println("---------------------------------")
}
