package display

import (
	_ "embed"
	"log"
	"text/template"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/internal/info"
	"github.com/rivo/tview"
)

//go:embed templates/podinfo.txt
var infoTemplateStr string
var infoTemplate = template.Must(template.New("info").Funcs(funcMap).Parse(infoTemplateStr))

type infoContainer struct {
	agentCli AgentClient
	*tview.TextView
}

func newInfoContainer(agentCli AgentClient) *infoContainer {
	view := tview.NewTextView().SetDynamicColors(true)
	view.SetBorder(true).SetTitle("General Information")
	return &infoContainer{
		agentCli, view,
	}
}

func (ic *infoContainer) Primitive() tview.Primitive {
	return ic.TextView
}

func (ic *infoContainer) Update() {
	ic.Clear()
	c := config.Reload()
	info := info.BuildInfo()
	v, err := ic.agentCli.GetVersion()
	if err != nil {
		log.Println(errors.W(err))
		v = "N/A"
	}
	isRunning, runningErr := ic.agentCli.IsRunning()
	args := map[string]interface{}{
		"podId":             c.ClientId,
		"podOsVersion":      info.Version,
		"podAgentVersion":   v,
		"isRunning":         isRunning,
		"runningErr":        runningErr,
		"lastDisplayUpdate": time.Now().Format("01/02/2006 15:04 MST"),
	}
	if err := infoTemplate.Execute(ic, args); err != nil {
		panic(err)
	}
}
