require "test_helper"

class FeatureFlagsControllerTest < ActionDispatch::IntegrationTest
  
  setup do
    sign_in_as users(:superuser1)
  end

  test "When_index_url_is_called_Expect_to_receive_2XX" do
    get feature_flags_url
    assert_response :success
  end

  test "When_new_feature_flag_get_url_is_called_Expect_to_receive_2XX" do
    get new_feature_flag_url
    assert_response :success
  end

  test "When_create_gets_called_Expect_to_receive_2XX_and_new_ff_to_be_created" do
    post feature_flags_url, params: { feature_flag: { name: "test" }, format: :turbo_stream }
    ffs = FeatureFlag.all
    assert_response :success
    assert_equal ffs.count, 3
  end

  test "When_get_new_gets_called_Expect_to_receive_2XX" do
    get new_feature_flag_url
    assert_response :success
  end

  test "When_get_delete_gets_called_Expect_to_receive_2XX" do
    get delete_feature_flag_url(feature_flags(:private_ff))
    assert_response :success
  end

  test "When_destroy_gets_called_Expect_to_receive_2XX_and_ff_to_be_deleted" do
    delete feature_flag_url(feature_flags(:private_ff)), params: { format: :turbo_stream }
    ffs = FeatureFlag.all
    assert_response :success
    assert_equal ffs.count, 1
  end

  test "When_update_gets_called_Expect_to_receive_2XX_and_ff_to_be_updated" do
    put feature_flag_url(feature_flags(:private_ff)), params: { generally_available: 'on', format: :turbo_stream }
    ff = FeatureFlag.find(feature_flags(:private_ff).id)
    assert_response :success
    assert_equal ff.generally_available, true
  end

  test 'When_id_dependent_method_gets_called_with_non_existing_ff_Expect_to_throw' do
    assert_raises ActiveRecord::RecordNotFound do
      put feature_flag_url(999)
    end
  end

  test 'When_method_gets_called_with_non_super_user_Expect_to_receive_forbidden_status_code' do
    sign_in_as users(:user1)
    get feature_flags_url
    assert_response :forbidden
  end
end
