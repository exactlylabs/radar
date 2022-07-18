class AccountPolicy

  def initialize(user, record)
    @user = user
    @record = record
  end

  class Scope

    attr_reader :user, :scope, :account_id

    def initialize(user, scope, account_id)
      @user = user
      @scope = scope
      @account_id = account_id
    end

    def resolve
      user.accounts.where(id: account_id).not_deleted.first
    end

    def get_default_account
      user.accounts.not_deleted.first
    end

  end
end