package display

import (
	_ "embed"
	"log"
	"text/template"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network"
	"github.com/rivo/tview"
)

//go:embed templates/network.txt
var networkTemplateStr string
var networkTemplate = template.Must(template.New("network").Funcs(funcMap).Parse(networkTemplateStr))

type networkContainer struct {
	prober PodInfoProvider
	*tview.TextView
}

func newNetworkContainer(prober PodInfoProvider) *networkContainer {
	view := tview.NewTextView().SetDynamicColors(true)
	view.SetBorder(true).SetTitle("Network Interfaces")
	return &networkContainer{
		prober, view,
	}
}

func (nc *networkContainer) Primitive() tview.Primitive {
	return nc.TextView
}

func (nc *networkContainer) Update() {
	nc.Clear()
	ifaces, err := nc.prober.Interfaces()
	if err != nil {
		log.Println(errors.W(err))
		ifaces = make(network.NetInterfaces, 0)
	}
	args := map[string]interface{}{
		"netInterfaces": ifaces,
	}
	if err := networkTemplate.Execute(nc, args); err != nil {
		panic(err)
	}
}
