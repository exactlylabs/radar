class UnifiedMember
  attr_reader :user, :accounts, :email, :type

  def initialize(email, user, accounts)
    @email, @user, @accounts = email, user, accounts
  end
end