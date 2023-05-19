require "application_system_test_case"

class ClientsTest < ApplicationSystemTestCase
  setup do
    @client = clients(:one)
  end

  test "visiting the index" do
    visit clients_url
    assert_selector "h1", text: "Clients"
  end

  test "creating a Client" do
    visit clients_url
    click_on "New Client"

    fill_in "Address", with: @client.address
    fill_in "Client", with: @client.client_id
    fill_in "Endpoint host", with: @client.endpoint_host
    fill_in "Endpoint port", with: @client.endpoint_port
    fill_in "Name", with: @client.name
    fill_in "Public key", with: @client.public_key
    fill_in "Remote gateway port", with: @client.remote_gateway_port
    fill_in "Secret hash", with: @client.secret_hash
    fill_in "User", with: @client.user_id
    click_on "Create Client"

    assert_text "Client was successfully created"
    click_on "Back"
  end

  test "updating a Client" do
    visit clients_url
    click_on "Edit", match: :first

    fill_in "Address", with: @client.address
    fill_in "Client", with: @client.client_id
    fill_in "Endpoint host", with: @client.endpoint_host
    fill_in "Endpoint port", with: @client.endpoint_port
    fill_in "Name", with: @client.name
    fill_in "Public key", with: @client.public_key
    fill_in "Remote gateway port", with: @client.remote_gateway_port
    fill_in "Secret hash", with: @client.secret_hash
    fill_in "User", with: @client.user_id
    click_on "Update Client"

    assert_text "Client was successfully updated"
    click_on "Back"
  end

  test "destroying a Client" do
    visit clients_url
    page.accept_confirm do
      click_on "Destroy", match: :first
    end

    assert_text "Client was successfully destroyed"
  end
end
