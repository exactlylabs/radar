package wifi

import (
	"strconv"
	"strings"

	"github.com/exactlylabs/go-errors/pkg/errors"
)

func wifiStatusFromSignalPollResponse(res string, status *WifiStatus) error {
	rows := strings.Split(res, "\n")
	for _, row := range rows {
		data := strings.Split(row, "=")
		if len(data) != 2 {
			continue
		}
		switch data[0] {
		case "RSSI":
			value, err := strconv.Atoi(data[1])
			if err != nil {
				return errors.W(err)
			}
			status.Signal = value
		case "LINKSPEED":
			value, err := strconv.Atoi(data[1])
			if err != nil {
				return errors.W(err)
			}
			status.TxSpeed = value
		case "FREQUENCY":
			value, err := strconv.Atoi(data[1])
			if err != nil {
				return errors.W(err)
			}
			status.Frequency = value
			status.Channel = freqStr2Chan[data[1]]
		case "NOISE":
			value, err := strconv.Atoi(data[1])
			if err != nil {
				return errors.W(err)
			}
			status.Noise = value
		case "WIDTH":
			status.Width = data[1]
		}
	}
	return nil
}
