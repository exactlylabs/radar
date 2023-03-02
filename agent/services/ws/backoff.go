package ws

import (
	"log"
	"math/rand"
	"time"
)

type BackOff interface {
	Next() <-chan time.Time
	Reset()
}

type ExponentialBackOff struct {
	initial    time.Duration
	maximum    time.Duration
	current    time.Duration
	multiplier float32
	Rand       *rand.Rand
}

func NewExponentialBackOff(initial time.Duration, maximum time.Duration, multiplier float32) *ExponentialBackOff {

	return &ExponentialBackOff{
		initial:    initial,
		maximum:    maximum,
		current:    0,
		multiplier: multiplier,
		Rand:       rand.New(rand.NewSource(time.Now().Unix())),
	}
}

func (b *ExponentialBackOff) Next() <-chan time.Time {
	next := b.current
	if next == 0 {
		next = b.initial
	} else {
		next = time.Duration(float32(b.current) * b.multiplier)
	}
	if next > b.maximum {
		next = b.maximum
	}
	b.current = next
	// now add a randomness +-10%
	next = time.Duration(float32(next) * (0.9 + b.Rand.Float32()*0.2))
	log.Println(next)
	return time.After(next)
}

func (b *ExponentialBackOff) Reset() {
	b.current = 0
}
