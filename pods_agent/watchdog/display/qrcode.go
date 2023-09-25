package display

import (
	"fmt"

	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/rivo/tview"
)

type QrCodeContainer struct {
	*tview.TextView
}

func NewQrCodeContainer() *QrCodeContainer {
	view := tview.NewTextView().SetDynamicColors(true).SetTextAlign(tview.AlignLeft)
	return &QrCodeContainer{
		view,
	}
}

func (qc *QrCodeContainer) Primitive() tview.Primitive {
	return qc.TextView
}

func (qc *QrCodeContainer) Update() {
	qc.Clear()
	c := config.Reload()
	generateQrCode(fmt.Sprintf("%s/check/%s", c.ServerURL, c.ClientId), qc)
}
