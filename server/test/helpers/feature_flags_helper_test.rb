require "test_helper"

class LocationTest < ActiveSupport::TestCase
  
  test 'When_is_available_is_called_with_a_flag_and_enabled_super_user_Expect_to_return_true' do
    user = users(:superuser1)
    flag = feature_flags(:private_ff)
    flag.users << user
    assert FeatureFlagHelper.is_available(flag.name, user)
  end

  test 'When_is_available_is_called_with_a_flag_and_not_enabled_user_Expect_to_return_false' do
    user = users(:superuser1)
    flag = feature_flags(:private_ff)
    assert_equal FeatureFlagHelper.is_available(flag.name, user), false
  end

  test 'When_is_available_is_called_with_a_public_flag_Expect_to_return_true' do
    user = users(:superuser1)
    another_user = users(:user1)
    flag = feature_flags(:public_ff)
    assert FeatureFlagHelper.is_available(flag.name, user)
    assert FeatureFlagHelper.is_available(flag.name, another_user)
  end

  test 'When_is_available_is_called_with_a_private_flag_but_a_non_super_user_Expect_to_return_false' do
    user = users(:user1)
    flag = feature_flags(:private_ff)
    assert_equal FeatureFlagHelper.is_available(flag.name, user), false
  end

  test 'When_is_available_is_called_with_a_non_existing_flag_Expect_to_return_false' do
    user = users(:user1)
    assert_equal FeatureFlagHelper.is_available('Random flag name', user), false
  end
  
end
