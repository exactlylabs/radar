package radar

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

func getToken(serverURL, clientID, secret string) (token string, err error) {
	formData := url.Values{}
	formData.Add("unix_user", clientID)
	formData.Add("secret", secret)
	resp, err := http.PostForm(serverURL+"/api/v1/clients/get_token", formData)
	if err != nil {
		err = fmt.Errorf("radar.getToken PostForm: %w", err)
		return
	}
	defer resp.Body.Close()
	tokenResp := make(map[string]interface{})
	if err = json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		err = fmt.Errorf("radar.getToken Decode: %w", err)
		return
	}
	return tokenResp["token"].(string), nil
}
