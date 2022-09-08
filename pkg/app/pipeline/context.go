package pipeline

import "context"

type PipelineContext struct {
	context.Context
	values map[string]any
}

func NewContext(ctx context.Context) *PipelineContext {
	return &PipelineContext{
		Context: ctx,
		values:  make(map[string]any),
	}
}

func (c *PipelineContext) SetValue(key string, v any) {
	c.values[key] = v
}

func (c *PipelineContext) GetValue(key string) any {
	return c.values[key]
}
