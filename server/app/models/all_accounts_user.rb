class AllAccountsUser
  attr_reader :user_id

  def initialize(user_id)
    @user_id = user_id
  end

  def is_shared?
    false
  end

  def account
    Account.none
  end

  def is_all_accounts?
    true
  end
end