class AllAccountsAccount
  attr_reader :id

  def initialize
    @id = -1
  end

  def name
    "All accounts"
  end

  def superaccount
    false
  end

  def is_all_accounts?
    return true
  end
end