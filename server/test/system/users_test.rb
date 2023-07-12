require "application_system_test_case"
require 'selenium-webdriver'

class UsersTest < ApplicationSystemTestCase
  # Useful links:
  # https://www.rubydoc.info/gems/capybara/Capybara/Minitest/Assertions < assertions on the elements in the browser
  # https://guides.rubyonrails.org/v6.1/testing.html#system-testing

  wait = Selenium::WebDriver::Wait.new(timeout: 10)

  setup do
  end

  test "anonymous user redirected to log in" do
    visit root_path

    assert_selector "h1", text: "Log in"
  end

  test "user log in" do
    visit new_user_session_path

    fill_in "user[email]", with: users(:user1).email
    fill_in "user[password]", with: "user1test1234"

    previous_path = page.current_path

    click_on "Log in"

    wait.until { page.current_path != previous_path }

    assert_current_path dashboard_path
  end

  test "wrong user credentials" do
    visit new_user_session_path

    fill_in "user[email]", with: "notexistingemail@e.com"
    fill_in "user[password]", with: "something"

    click_on "Log in"

    assert_selector "div", text: "Invalid Email or password."
  end

  test "user log out" do
    sign_in users(:user1)

    visit dashboard_path

    assert_current_path dashboard_path

    previous_path = page.current_path
    wait.until { page.has_selector?(id: "sidebar--profile-popover-regular") }
    page.find(id: "sidebar--profile-popover-regular").click
    wait.until { page.has_selector?(id: "sign-out-link") }
    click_link("sign-out-link")
    wait.until { page.current_path != previous_path }

    assert_current_path new_user_session_path
  end
end
