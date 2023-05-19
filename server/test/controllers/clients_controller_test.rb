require "test_helper"

class ClientsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @client = clients(:one)
  end

  test "should get index" do
    get clients_url
    assert_response :success
  end

  test "should get new" do
    get new_client_url
    assert_response :success
  end

  test "should create client" do
    assert_difference('Client.count') do
      post clients_url, params: { client: { address: @client.address, client_id: @client.client_id, endpoint_host: @client.endpoint_host, endpoint_port: @client.endpoint_port, name: @client.name, public_key: @client.public_key, remote_gateway_port: @client.remote_gateway_port, secret_hash: @client.secret_hash, user_id: @client.user_id } }
    end

    assert_redirected_to client_url(Client.last)
  end

  test "should show client" do
    get client_url(@client)
    assert_response :success
  end

  test "should get edit" do
    get edit_client_url(@client)
    assert_response :success
  end

  test "should update client" do
    patch client_url(@client), params: { client: { address: @client.address, client_id: @client.client_id, endpoint_host: @client.endpoint_host, endpoint_port: @client.endpoint_port, name: @client.name, public_key: @client.public_key, remote_gateway_port: @client.remote_gateway_port, secret_hash: @client.secret_hash, user_id: @client.user_id } }
    assert_redirected_to client_url(@client)
  end

  test "should destroy client" do
    assert_difference('Client.count', -1) do
      delete client_url(@client)
    end

    assert_redirected_to clients_url
  end
end
