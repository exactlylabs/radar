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
	LEDOff = []LEDPattern{{false, baseDuration}}
	LEDOn  = []LEDPattern{{true, baseDuration}}

	LEDBlinkSlow = []LEDPattern{{true, baseDuration * 4}, {false, baseDuration * 4}}
	LEDBlinkFas  = []LEDPattern{{true, baseDuration}, {false, baseDuration}}

	LEDBlinkDot  = []LEDPattern{{true, baseDuration}, {false, baseDuration}}
	LEDBlinkDash = []LEDPattern{{true, baseDuration * 4}, {false, baseDuration}}
)

type ACTLEDManager struct {
	sysManager     SystemManager
	currentPattern []LEDPattern
	patternCh      chan []LEDPattern
}

func NewActLEDManager(sysManager SystemManager) *ACTLEDManager {
	return &ACTLEDManager{
		sysManager:     sysManager,
		patternCh:      make(chan []LEDPattern),
		currentPattern: LEDOff,
	}
}

func (l *ACTLEDManager) SetPattern(pattern []LEDPattern) {
	l.patternCh <- pattern
}

func (l *ACTLEDManager) Start(ctx context.Context) {
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
