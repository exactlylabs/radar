package watchdog

import (
	"bufio"
	"bytes"
	"fmt"
	"log"
	"regexp"
	"strings"
	"time"

	"github.com/exactlylabs/radar/agent/config"
	"github.com/exactlylabs/radar/agent/services/tracing"
)

var connectionRegexp = regexp.MustCompile(`^(?P<month>\w+)\s+(?P<day>\d+)\s+(?P<time>[\d:]+).*?systemd-logind.*?user\s+(?P<user>\w+)`)
var datesRegexp = regexp.MustCompile(`^(?P<month>\w+)\s+(?P<day>\d+)\s+(?P<time>[\d:]+)`)

func parseDateFromAuthLog(month, day, t string) (time.Time, error) {
	d := fmt.Sprintf("%d %s %s %s", time.Now().Year(), month, day, t)
	matchTime, err := time.Parse(
		"2006 Jan 2 15:04:05",
		d,
	)
	if err != nil {
		return time.Time{}, fmt.Errorf("watchdog.parseDateFromAuthLog Parse: %w", err)
	}
	return matchTime, nil
}

func scanAuthLog(c *config.Config, authLog []byte, lastTime *time.Time) (time.Time, error) {
	scanner := bufio.NewScanner(bytes.NewBuffer(authLog))
	var t time.Time
	var err error
	for scanner.Scan() {
		line := scanner.Bytes()
		text := strings.Replace(string(line), "\x00", "", -1)
		match := connectionRegexp.FindStringSubmatch(text)
		if len(match) == 5 {
			t, err = parseDateFromAuthLog(match[1], match[2], match[3])
			if err != nil {
				return t, err
			}

			if lastTime == nil || t.Equal(*lastTime) || t.Before(*lastTime) {
				continue
			}
			log.Printf("New Login Detected at %v, notifying through tracing\n", t)
			tracing.NotifyError(
				fmt.Errorf("new Login Detected in the Pod"),
				map[string]interface{}{
					"User":      match[4],
					"Time":      t,
					"Unix User": c.ClientId,
				},
			)
		} else {
			match = datesRegexp.FindStringSubmatch(text)
			if len(match) == 4 {
				t, err = parseDateFromAuthLog(match[1], match[2], match[3])
				if err != nil {
					return t, err
				}
				if lastTime == nil || t.Equal(*lastTime) || t.Before(*lastTime) {
					continue
				}
			} else {
				return t, fmt.Errorf("watchdog.scanAuthLog no matches for '%v'. Found %v", text, match)
			}
		}
	}
	return t, nil
}
