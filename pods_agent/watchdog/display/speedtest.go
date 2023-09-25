package display

import (
	_ "embed"
	"text/template"

	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/rivo/tview"
)

//go:embed templates/speedtest.txt
var speedtestTemplateStr string
var speedtestTemplate = template.Must(template.New("speedtest").Funcs(funcMap).Parse(speedtestTemplateStr))

type speedtestContainer struct {
	*tview.TextView
}

func newSpeedtestContainer() *speedtestContainer {
	view := tview.NewTextView().SetDynamicColors(true)
	view.SetBorder(true).SetTitle("Last Speed test Measurement")
	return &speedtestContainer{
		view,
	}
}

func (nc *speedtestContainer) Primitive() tview.Primitive {
	return nc.TextView
}

func (nc *speedtestContainer) Update() {
	nc.Clear()
	c := config.Reload()
	lastTestedAt := c.LastTestedAt()
	lastTestedStr := ""
	if lastTestedAt != nil {
		// Format set to mm/dd/yyyy HH:MM TZ
		lastTestedStr = lastTestedAt.Format("01/02/2006 15:04 MST")
	}
	args := map[string]interface{}{
		"lastMeasurementTime":     lastTestedStr,
		"lastMeasurementDownload": c.LastDownloadSpeed,
		"lastMeasurementUpload":   c.LastUploadSpeed,
	}
	if err := speedtestTemplate.Execute(nc, args); err != nil {
		panic(err)
	}
}
