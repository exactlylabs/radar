// Code generated by mockery v2.50.1. DO NOT EDIT.

package mocks

import (
	namespaces "github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	storages "github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	mock "github.com/stretchr/testify/mock"
)

// SummariesStorage is an autogenerated mock type for the SummariesStorage type
type SummariesStorage struct {
	mock.Mock
}

// Close provides a mock function with no fields
func (_m *SummariesStorage) Close() error {
	ret := _m.Called()

	if len(ret) == 0 {
		panic("no return value specified for Close")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func() error); ok {
		r0 = rf()
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// Connected provides a mock function with no fields
func (_m *SummariesStorage) Connected() error {
	ret := _m.Called()

	if len(ret) == 0 {
		panic("no return value specified for Connected")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func() error); ok {
		r0 = rf()
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// Open provides a mock function with no fields
func (_m *SummariesStorage) Open() error {
	ret := _m.Called()

	if len(ret) == 0 {
		panic("no return value specified for Open")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func() error); ok {
		r0 = rf()
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// Summarize provides a mock function with given fields: from
func (_m *SummariesStorage) Summarize(from int) error {
	ret := _m.Called(from)

	if len(ret) == 0 {
		panic("no return value specified for Summarize")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func(int) error); ok {
		r0 = rf(from)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// SummaryForGeoAndASN provides a mock function with given fields: geospaceId, asnId, filter
func (_m *SummariesStorage) SummaryForGeoAndASN(geospaceId string, asnId string, filter storages.SummaryFilter) (*storages.GeospaceSummaryResult, error) {
	ret := _m.Called(geospaceId, asnId, filter)

	if len(ret) == 0 {
		panic("no return value specified for SummaryForGeoAndASN")
	}

	var r0 *storages.GeospaceSummaryResult
	var r1 error
	if rf, ok := ret.Get(0).(func(string, string, storages.SummaryFilter) (*storages.GeospaceSummaryResult, error)); ok {
		return rf(geospaceId, asnId, filter)
	}
	if rf, ok := ret.Get(0).(func(string, string, storages.SummaryFilter) *storages.GeospaceSummaryResult); ok {
		r0 = rf(geospaceId, asnId, filter)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*storages.GeospaceSummaryResult)
		}
	}

	if rf, ok := ret.Get(1).(func(string, string, storages.SummaryFilter) error); ok {
		r1 = rf(geospaceId, asnId, filter)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SummaryForGeospace provides a mock function with given fields: geospaceId, filter
func (_m *SummariesStorage) SummaryForGeospace(geospaceId string, filter storages.SummaryFilter) (*storages.GeospaceSummaryResult, error) {
	ret := _m.Called(geospaceId, filter)

	if len(ret) == 0 {
		panic("no return value specified for SummaryForGeospace")
	}

	var r0 *storages.GeospaceSummaryResult
	var r1 error
	if rf, ok := ret.Get(0).(func(string, storages.SummaryFilter) (*storages.GeospaceSummaryResult, error)); ok {
		return rf(geospaceId, filter)
	}
	if rf, ok := ret.Get(0).(func(string, storages.SummaryFilter) *storages.GeospaceSummaryResult); ok {
		r0 = rf(geospaceId, filter)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*storages.GeospaceSummaryResult)
		}
	}

	if rf, ok := ret.Get(1).(func(string, storages.SummaryFilter) error); ok {
		r1 = rf(geospaceId, filter)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SummaryForNamespace provides a mock function with given fields: namespace, filter
func (_m *SummariesStorage) SummaryForNamespace(namespace namespaces.Namespace, filter storages.SummaryFilter) ([]storages.GeospaceSummaryResult, error) {
	ret := _m.Called(namespace, filter)

	if len(ret) == 0 {
		panic("no return value specified for SummaryForNamespace")
	}

	var r0 []storages.GeospaceSummaryResult
	var r1 error
	if rf, ok := ret.Get(0).(func(namespaces.Namespace, storages.SummaryFilter) ([]storages.GeospaceSummaryResult, error)); ok {
		return rf(namespace, filter)
	}
	if rf, ok := ret.Get(0).(func(namespaces.Namespace, storages.SummaryFilter) []storages.GeospaceSummaryResult); ok {
		r0 = rf(namespace, filter)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]storages.GeospaceSummaryResult)
		}
	}

	if rf, ok := ret.Get(1).(func(namespaces.Namespace, storages.SummaryFilter) error); ok {
		r1 = rf(namespace, filter)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SummaryForNamespaceAndASN provides a mock function with given fields: namespace, asnId, filter
func (_m *SummariesStorage) SummaryForNamespaceAndASN(namespace namespaces.Namespace, asnId string, filter storages.SummaryFilter) ([]storages.GeospaceSummaryResult, error) {
	ret := _m.Called(namespace, asnId, filter)

	if len(ret) == 0 {
		panic("no return value specified for SummaryForNamespaceAndASN")
	}

	var r0 []storages.GeospaceSummaryResult
	var r1 error
	if rf, ok := ret.Get(0).(func(namespaces.Namespace, string, storages.SummaryFilter) ([]storages.GeospaceSummaryResult, error)); ok {
		return rf(namespace, asnId, filter)
	}
	if rf, ok := ret.Get(0).(func(namespaces.Namespace, string, storages.SummaryFilter) []storages.GeospaceSummaryResult); ok {
		r0 = rf(namespace, asnId, filter)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]storages.GeospaceSummaryResult)
		}
	}

	if rf, ok := ret.Get(1).(func(namespaces.Namespace, string, storages.SummaryFilter) error); ok {
		r1 = rf(namespace, asnId, filter)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// NewSummariesStorage creates a new instance of SummariesStorage. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewSummariesStorage(t interface {
	mock.TestingT
	Cleanup(func())
}) *SummariesStorage {
	mock := &SummariesStorage{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
