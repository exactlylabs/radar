package webapi_test

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/exactlylabs/go-rest/pkg/restapi/webcontext"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/webapi/mocks"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/webapi/routes"
	"github.com/go-playground/assert/v2"
	"github.com/stretchr/testify/suite"
)

//go:generate docker run -v "$PWD/../../..:/src" -w /src vektra/mockery -r --all --dir=./pkg/app/ports --output ./pkg/app/webapi/mocks

type TestSuite struct {
	suite.Suite
	context  *webcontext.Context
	response *httptest.ResponseRecorder
}

func (s *TestSuite) SetupTest() {
	s.response = httptest.NewRecorder()
	s.context = webcontext.NewTestContext(s.response, &http.Request{})
}

func (s *TestSuite) TestHealth() {
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	q := url.Values{}
	req.URL.RawQuery = q.Encode()

	s.context.Request = req
	geoStorage := mocks.NewGeospaceStorage(s.T())
	geoStorage.On("Connected").Return(true)
	asOrgStorage := mocks.NewASNOrgStorage(s.T())
	asOrgStorage.On("Connected").Return(true)
	summaryStorage := mocks.NewSummariesStorage(s.T())
	summaryStorage.On("Connected").Return(true)
	appStorages := &storages.MappingAppStorages{
		GeospacesStorage: geoStorage,
		ASNOrgsStorage:   asOrgStorage,
		SummariesStorage: summaryStorage,
	}

	routes.HealthCheck(s.context, appStorages)
	s.context.Commit()

	res := s.response.Result()
	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		s.FailNow("failed to read response body: %w", err)
	}
	resObj := routes.HealthCheckResponse{}
	if err := json.Unmarshal(body, &resObj); err != nil {
		s.FailNow("failed to unmarshal response: %w", err)
	}
	assert.Equal(s.T(), res.StatusCode, 200)
	assert.Equal(s.T(), resObj, routes.HealthCheckResponse{Status: "OK"})
}

func TestAPI(t *testing.T) {
	suite.Run(t, &TestSuite{})
}
