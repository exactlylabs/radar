package watchdog

import (
	"context"
	"time"
)

const baseDuration = time.Millisecond * 250

type LEDPattern struct {
	on       bool
	duration time.Duration
}

var (
	// The LED manager will infinitely loop through one of these pattern slices
	Off = []LEDPattern{{false, baseDuration}}
	On  = []LEDPattern{{true, baseDuration}}

	Slow = []LEDPattern{{true, baseDuration * 4}, {false, baseDuration * 4}}
	Fast = []LEDPattern{{true, baseDuration}, {false, baseDuration}}

	Dot  = []LEDPattern{{true, baseDuration}, {false, baseDuration}}
	Dash = []LEDPattern{{true, baseDuration * 4}, {false, baseDuration}}
)

type actLEDManager struct {
	sysManager     SystemManager
	currentPattern []LEDPattern
	patternCh      chan []LEDPattern
}

func newActLEDManager(sysManager SystemManager) *actLEDManager {
	return &actLEDManager{
		sysManager:     sysManager,
		patternCh:      make(chan []LEDPattern),
		currentPattern: Off,
	}
}

func (l *actLEDManager) SetPattern(pattern []LEDPattern) {
	l.patternCh <- pattern
}

func (l *actLEDManager) Start(ctx context.Context) {
	go func() {
		for {
			select {
			case p := <-l.patternCh:
				l.currentPattern = p
			case <-ctx.Done():
				return
			default:
				for _, pattern := range l.currentPattern {
					l.sysManager.SetACTLED(pattern.on)
					select {
					case <-ctx.Done():
						return
					case <-time.NewTimer(pattern.duration).C:
					}
				}
			}
		}
	}()
}
