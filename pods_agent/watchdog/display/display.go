package display

import (
	"context"
	_ "embed"
	"io"
	"time"

	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
	"github.com/mdp/qrterminal/v3"
	"github.com/rivo/tview"
)

type AgentClient interface {
	GetVersion() (string, error)
	IsRunning() (bool, error)
}

type PodInfoProvider interface {
	Interfaces() ([]sysinfo.NetInterface, error)
}

type containers interface {
	Update()
	Primitive() tview.Primitive
}

func generateQrCode(podUrl string, w io.Writer) {
	config := qrterminal.Config{
		Level:          qrterminal.H,
		Writer:         w,
		HalfBlocks:     true,
		BlackChar:      qrterminal.BLACK_BLACK,
		WhiteBlackChar: qrterminal.WHITE_BLACK,
		WhiteChar:      qrterminal.WHITE_WHITE,
		BlackWhiteChar: qrterminal.BLACK_WHITE,
		QuietZone:      4,
	}
	qrterminal.GenerateWithConfig(podUrl, config)
}

// StartDisplayLoop is a blocking function, that keeps sending the current display info to a Writer interface
func StartDisplayLoop(ctx context.Context, w io.Writer, agentCli AgentClient, podProber PodInfoProvider) {
	drawUI(ctx, w, agentCli, podProber)
}

func drawUI(ctx context.Context, w io.Writer, agentCli AgentClient, podProber PodInfoProvider) {
	infoContainer := newInfoContainer(agentCli)
	networkContainer := newNetworkContainer(podProber)
	speedtestContainer := newSpeedtestContainer()
	qrcodeContainer := NewQrCodeContainer()

	containers := []containers{
		infoContainer,
		networkContainer,
		speedtestContainer,
		qrcodeContainer,
	}

	infoGrid := tview.NewGrid().
		SetRows(0, 0, 0).
		AddItem(infoContainer, 0, 0, 1, 1, 0, 0, false).
		AddItem(networkContainer, 1, 0, 1, 1, 0, 0, false).
		AddItem(speedtestContainer, 2, 0, 1, 1, 0, 0, false)

	app := tview.NewApplication()
	grid := tview.NewGrid().
		SetColumns(-50, -50).
		SetRows(-10, -90).
		AddItem(infoGrid, 1, 0, 1, 1, 0, 0, true).
		AddItem(qrcodeContainer, 1, 1, 1, 1, 0, 0, false)
	grid.SetBorder(true).SetTitle("Radar POD")
	go func() {
		if err := app.SetRoot(grid, true).Run(); err != nil {
			panic(err)
		}
	}()
	timer := time.NewTimer(time.Second)
LOOP:
	for {
		select {
		case <-timer.C:
			app.QueueUpdateDraw(func() {
				for _, c := range containers {
					c.Update()
				}
			})
			timer.Reset(time.Minute)
		case <-ctx.Done():
			app.Stop()
			break LOOP
		}
	}
}
