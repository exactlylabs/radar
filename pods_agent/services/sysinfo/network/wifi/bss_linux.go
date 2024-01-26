package wifi

import (
	"regexp"
	"strconv"
	"strings"

	"github.com/exactlylabs/go-errors/pkg/errors"
)

func parseWPASupplicantBssResponse(result string) (*BSSInfo, error) {
	rows := strings.Split(result, "\n")
	bss := new(BSSInfo)
	for _, row := range rows {
		data := strings.Split(row, "=")
		if len(data) != 2 {
			continue
		}

		switch data[0] {
		case "id":
			value, err := strconv.Atoi(data[1])
			if err != nil {
				return nil, errors.W(err)
			}
			bss.ID = uint8(value)
		case "bssid":
			bss.BSSID = data[1]
		case "freq":
			value, err := strconv.Atoi(data[1])
			if err != nil {
				return nil, errors.W(err)
			}
			bss.Freq = value
		case "beacon_int":
			value, err := strconv.Atoi(data[1])
			if err != nil {
				return nil, errors.W(err)
			}
			bss.BeaconInt = uint16(value)
		case "capabilities":
			value, err := strconv.ParseInt(data[1], 0, 16)
			if err != nil {
				return nil, errors.W(err)
			}
			bss.Caps = uint16(value)
		case "qual":
			value, err := strconv.Atoi(data[1])
			if err != nil {
				return nil, errors.W(err)
			}
			bss.Qual = value
		case "noise":
			value, err := strconv.Atoi(data[1])
			if err != nil {
				return nil, errors.W(err)
			}
			bss.Noise = value
		case "level":
			value, err := strconv.Atoi(data[1])
			if err != nil {
				return nil, errors.W(err)
			}
			bss.Level = value
		case "tsf":
			value, err := strconv.Atoi(data[1])
			if err != nil {
				return nil, errors.W(err)
			}
			bss.TSF = uint64(value)
		case "age":
			value, err := strconv.Atoi(data[1])
			if err != nil {
				return nil, errors.W(err)
			}
			bss.Age = uint(value)

		case "flags":
			re := regexp.MustCompile(`\[(.*?)\]`)
			flags_match := re.FindAllStringSubmatch(data[1], -1)
			bss.Flags = make([]string, len(flags_match))
			for i := range flags_match {
				bss.Flags[i] = flags_match[i][1]
			}
		case "ssid":
			bss.SSID = data[1]
		case "snr":
			value, err := strconv.Atoi(data[1])
			if err != nil {
				return nil, errors.W(err)
			}
			bss.SNR = value
		case "est_throughput":
			value, err := strconv.Atoi(data[1])
			if err != nil {
				return nil, errors.W(err)
			}
			bss.EstThroughput = uint(value)
		}
	}
	return bss, nil
}
