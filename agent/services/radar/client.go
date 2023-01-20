package radar

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"net/url"
	"runtime"
	"strings"

	"github.com/exactlylabs/radar/agent/agent"
	"github.com/exactlylabs/radar/agent/services/sysinfo"
	"github.com/exactlylabs/radar/agent/watchdog"
)

type radarClient struct {
	serverUrl string
}

// NewClient has all methods expected by the agent to communicate
// with the server
func NewClient(serverUrl string) RadarRequester {
	return &radarClient{
		serverUrl: serverUrl,
	}
}

func (c *radarClient) NewRequest(method, url string, body io.Reader) (*http.Request, error) {
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return nil, fmt.Errorf("radarClient#Register error creating request: %w", err)
	}
	req.Header.Add("Accept", "application/json")
	return req, nil
}

func (c *radarClient) Ping(clientId, secret string, meta *sysinfo.ClientMeta) (*agent.PingResponse, error) {
	apiUrl := fmt.Sprintf("%s/clients/%s/status", c.serverUrl, clientId)
	form := url.Values{}
	form.Add("secret", secret)
	form.Add("version", meta.Version)
	form.Add("distribution", meta.Distribution)
	form.Add("watchdog_version", meta.WatchdogVersion)
	form.Add("os_version", runtime.GOOS)
	form.Add("hardware_platform", runtime.GOARCH)
	ifaces, err := json.Marshal(meta.NetInterfaces)
	if err != nil {
		return nil, fmt.Errorf("radarClient#Ping error marshalling NetInterfaces: %w", err)
	}
	form.Add("network_interfaces", string(ifaces))
	req, err := c.NewRequest("POST", apiUrl, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Add("Accept", "application/json")
	if meta.RegistrationToken != nil {
		req.Header.Add("Authorization", fmt.Sprintf("Token %s", *meta.RegistrationToken))
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("radarClient#Ping request error: %w", err)
	}
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("radarClient#Ping wrong status code %d", resp.StatusCode)
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("radarClient#Ping error reading response: %w", err)
	}
	podConfig := &PodConfigs{}
	if err := json.Unmarshal(body, podConfig); err != nil {
		return nil, fmt.Errorf("radarClient#Ping error unmarshalling: %w", err)
	}
	res := &agent.PingResponse{
		TestRequested: podConfig.TestRequested,
	}
	if podConfig.Update != nil {
		res.Update = &agent.BinaryUpdate{
			Version:   podConfig.Update.Version,
			BinaryUrl: fmt.Sprintf("%s/%s", c.serverUrl, podConfig.Update.Url),
		}
	}
	if podConfig.WatchdogUpdate != nil {
		res.WatchdogUpdate = &agent.BinaryUpdate{
			Version:   podConfig.WatchdogUpdate.Version,
			BinaryUrl: fmt.Sprintf("%s/%s", c.serverUrl, podConfig.WatchdogUpdate.Url),
		}
	}
	return res, nil
}

func (c *radarClient) Register(registrationToken *string) (*agent.RegisteredPod, error) {
	apiUrl := fmt.Sprintf("%s/clients", c.serverUrl)
	req, err := http.NewRequest("POST", apiUrl, nil)
	if err != nil {
		return nil, fmt.Errorf("radarCLient#Register error creating request: %w", err)
	}
	req.Header.Add("Accept", "application/json")
	if registrationToken != nil {
		req.Header.Add("Authorization", fmt.Sprintf("Token %s", *registrationToken))
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("radarClient#Register request error: %w", err)
	}
	if resp.StatusCode != 201 {
		return nil, fmt.Errorf("radarClient#Register wrong status code %d", resp.StatusCode)
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("radarClient#Register error reading response: %w", err)
	}
	p := &Pod{}
	if err := json.Unmarshal(body, p); err != nil {
		return nil, fmt.Errorf("radarClient#Register error unmarshalling: %w", err)
	}
	return &agent.RegisteredPod{
		ClientId: p.ClientId,
		Secret:   p.Secret,
	}, nil
}

func (c *radarClient) ReportMeasurement(clientId, secret, style string, measurement []byte) error {
	apiUrl := fmt.Sprintf("%s/clients/%s/measurements", c.serverUrl, clientId)

	// Create Form Data
	var b bytes.Buffer
	w := multipart.NewWriter(&b)
	// Style Field
	styleW, _ := w.CreateFormField("measurement[style]")
	styleW.Write([]byte(style))

	// Secret Field
	secretWriter, _ := w.CreateFormField("client_secret")
	secretWriter.Write([]byte(secret))

	// File Field
	fW, _ := w.CreateFormFile("measurement[result]", "result.json")
	fW.Write(measurement)
	w.Close()

	req, err := c.NewRequest("POST", apiUrl, &b)
	if err != nil {
		return err
	}
	req.Header.Add("Content-Type", w.FormDataContentType())
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("radar.radarClient#ReportMeasurement request error: %w", err)
	}
	if resp.StatusCode != 201 {
		return fmt.Errorf("radar.radarClient#ReportMeasurement wrong status code: %d", resp.StatusCode)
	}
	return nil
}

func (c *radarClient) WatchdogPing(clientId, secret string, meta *sysinfo.ClientMeta) (*watchdog.PingResponse, error) {
	apiUrl := fmt.Sprintf("%s/clients/%s/watchdog_status", c.serverUrl, clientId)
	form := url.Values{}
	form.Add("secret", secret)
	form.Add("version", meta.Version)
	req, err := c.NewRequest("POST", apiUrl, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Add("Accept", "application/json")
	if meta.RegistrationToken != nil {
		req.Header.Add("Authorization", fmt.Sprintf("Token %s", *meta.RegistrationToken))
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("radarClient#WatchdogPing request error: %w", err)
	}
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("radarClient#WatchdogPing wrong status code %d", resp.StatusCode)
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("radarClient#WatchdogPing error reading response: %w", err)
	}
	podConfig := &WatchdogStatusResponse{}
	if err := json.Unmarshal(body, podConfig); err != nil {
		return nil, fmt.Errorf("radarClient#WatchdogPing error unmarshalling: %w", err)
	}
	res := &watchdog.PingResponse{}
	if podConfig.Update != nil {
		res.Update = &watchdog.BinaryUpdate{
			Version:   podConfig.Update.Version,
			BinaryUrl: fmt.Sprintf("%s/%s", c.serverUrl, podConfig.Update.Url),
		}
	}
	return res, nil
}
