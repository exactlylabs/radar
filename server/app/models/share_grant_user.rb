class ShareGrantUser
  attr_reader :account_id, :user_id

  def initialize(account_id, user_id)
    @account_id, @user_id = account_id, user_id
  end

  def is_shared?
    true
  end

  def account
    Account.where(id: @account_id).first
  end

  def is_all_accounts?
    false
  end
end