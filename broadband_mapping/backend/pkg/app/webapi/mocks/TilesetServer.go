// Code generated by mockery v2.50.1. DO NOT EDIT.

package mocks

import (
	geo "github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/geo"
	mock "github.com/stretchr/testify/mock"
)

// TilesetServer is an autogenerated mock type for the TilesetServer type
type TilesetServer struct {
	mock.Mock
}

// Get provides a mock function with given fields: x, y, z
func (_m *TilesetServer) Get(x uint64, y uint64, z uint64) (geo.VectorTile, error) {
	ret := _m.Called(x, y, z)

	if len(ret) == 0 {
		panic("no return value specified for Get")
	}

	var r0 geo.VectorTile
	var r1 error
	if rf, ok := ret.Get(0).(func(uint64, uint64, uint64) (geo.VectorTile, error)); ok {
		return rf(x, y, z)
	}
	if rf, ok := ret.Get(0).(func(uint64, uint64, uint64) geo.VectorTile); ok {
		r0 = rf(x, y, z)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(geo.VectorTile)
		}
	}

	if rf, ok := ret.Get(1).(func(uint64, uint64, uint64) error); ok {
		r1 = rf(x, y, z)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Load provides a mock function with no fields
func (_m *TilesetServer) Load() error {
	ret := _m.Called()

	if len(ret) == 0 {
		panic("no return value specified for Load")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func() error); ok {
		r0 = rf()
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// NewTilesetServer creates a new instance of TilesetServer. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewTilesetServer(t interface {
	mock.TestingT
	Cleanup(func())
}) *TilesetServer {
	mock := &TilesetServer{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
