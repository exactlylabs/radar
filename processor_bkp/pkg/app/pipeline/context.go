package pipeline

import (
	"context"
	"sync"
)

type PipelineContext struct {
	context.Context
	values map[string]any
	ipMap  *sync.Map
}

func NewContext(ctx context.Context) *PipelineContext {
	return &PipelineContext{
		Context: ctx,
		values:  make(map[string]any),
	}
}

func (c *PipelineContext) SetIPMap(m *sync.Map) {
	c.ipMap = m
}

func (c *PipelineContext) GetIPMap() *sync.Map {
	if c.ipMap == nil {
		c.SetIPMap(&sync.Map{})
	}
	return c.ipMap
}
