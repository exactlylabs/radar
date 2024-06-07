require "test_helper"

class InvitesControllersTest < ActionDispatch::IntegrationTest
  setup do
    @invite = invites(:one)
    @user = users(:superuser1)
    @joined_account = accounts(:root)
    UsersAccount.create(user: @user, account: @joined_account, joined_at: Time.now)

    sign_in @user

  end

  test "should not create invite with blank fields" do
    assert_no_difference('Invite.count') do
      post invites_url, params: { invite: { first_name: '', last_name: '', email: '' } }
    end
    assert_response :unprocessable_entity
  end

  test "should not create invite if already exists" do
    assert_no_difference('Invite.count') do
      post invites_url, params: { invite: { first_name: 'Test', last_name: 'User', email: @invite.email, account_id: @joined_account.id } }
    end
    assert_response :unprocessable_entity
  end

  test "should not create invite if user already added to account" do
    UsersAccount.create(user: @user, account: @invite.account, joined_at: Time.now) # Assuming you have a relationship between User and Account
    assert_no_difference('Invite.count') do
      post invites_url, params: { invite: { first_name: 'Test', last_name: 'User', email: @user.email, account_id: @joined_account.id } }
    end
    assert_response :unprocessable_entity
  end

  test "should create invite" do
    assert_difference('Invite.count') do
      post invites_url, params: { invite: { first_name: 'Test', last_name: 'User', email: 'test@example.com', account_id: accounts(:root).id } }
    end
    assert_response :redirect
  end
end
