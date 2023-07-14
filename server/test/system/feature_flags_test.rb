require "application_system_test_case"
require 'selenium-webdriver'

class UsersTest < ApplicationSystemTestCase

  test 'When_ff_is_turned_on_Expect_wrapped_element_to_be_visible' do
    sign_in(users(:superuser1))
    user = users(:superuser1)
    flag = feature_flags(:private_ff)
    flag.users << user
    flag.save!
    visit dashboard_path
    assert_selector "#ff-test-element"
  end

  test 'When_ff_is_turned_off_Expect_wrapped_element_to_not_be_visible' do
    sign_in(users(:superuser1))
    visit dashboard_path
    assert_no_selector "#ff-test-element"
  end

  test 'When_ff_is_turned_off_and_regular_user_Expect_wrapped_element_to_not_be_visible' do
    sign_in(users(:user1))
    visit dashboard_path
    assert_no_selector "#ff-test-element"
  end

  test 'When_ff_is_public_and_regular_user_Expect_wrapped_element_to_be_visible' do
    sign_in(users(:user1))
    visit dashboard_path
    assert_selector "#ff-public-test-element"
  end
end