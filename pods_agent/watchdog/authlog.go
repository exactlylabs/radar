package watchdog

import (
	"bufio"
	"bytes"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/radar/pods_agent/config"
)

var connectionRegexp = regexp.MustCompile(`^(?P<month>\w+)\s+(?P<day>\d+)\s+(?P<time>[\d:]+).*?systemd-logind.*?user\s+(?P<user>\w+)`)
var datesRegexp = regexp.MustCompile(`^(?P<month>\w+)\s+(?P<day>\d+)\s+(?P<time>[\d:]+)`)

type LoginEvent struct {
	Time time.Time
	User string
}

func parseDateFromAuthLog(month, day, t string) (time.Time, error) {
	d := fmt.Sprintf("%d %s %s %s", time.Now().Year(), month, day, t)
	matchTime, err := time.Parse(
		"2006 Jan 2 15:04:05",
		d,
	)
	if err != nil {
		return time.Time{}, errors.Wrap(err, "failed to parse date from auth.log").WithMetadata(errors.Metadata{
			"date": d, "format": "2006 Jan 2 15:04:05",
		})
	}
	return matchTime, nil
}

func scanAuthLog(c *config.Config, authLog []byte, lastTime time.Time) ([]LoginEvent, error) {
	scanner := bufio.NewScanner(bytes.NewBuffer(authLog))
	var t time.Time
	var err error

	loginEvents := make([]LoginEvent, 0)
	for scanner.Scan() {
		line := scanner.Bytes()
		text := strings.Replace(string(line), "\x00", "", -1)
		if strings.HasPrefix(text, "--") {
			continue
		}
		match := connectionRegexp.FindStringSubmatch(text)
		if len(match) == 5 {
			t, err = parseDateFromAuthLog(match[1], match[2], match[3])
			if err != nil {
				return nil, errors.W(err)
			}

			if t.Equal(lastTime) || t.Before(lastTime) {
				continue
			}
			loginEvents = append(loginEvents, LoginEvent{
				User: match[4], Time: t,
			})
		} else {
			match = datesRegexp.FindStringSubmatch(text)
			if len(match) == 4 {
				t, err = parseDateFromAuthLog(match[1], match[2], match[3])
				if err != nil {
					return nil, errors.W(err)
				}
				if t.Equal(lastTime) || t.Before(lastTime) {
					continue
				}
			} else {
				return nil, errors.Wrap(err, "no matches for '%v'. Found %v", text, match)
			}
		}
	}
	return loginEvents, nil
}
