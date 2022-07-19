# frozen_string_literal: true

class ApplicationPolicy
  attr_reader :user_account, :record

  def initialize(user_account, record)
    @user_account = user_account
    @record = record
  end

  def index?
    false
  end

  def show?
    false
  end

  def create?
    false
  end

  def new?
    create?
  end

  def update?
    false
  end

  def edit?
    update?
  end

  def destroy?
    false
  end

  class Scope
    def initialize(user_account, scope)
      @user_account = user_account
      @scope = scope
    end

    def resolve
      if user_account
        scope.where(account_id: user_account.account_id)
      else
        # The only time we could hit this condition is if
        # the current_user has no account associated to it
        # so by returning scope.none this would return an
        # ActiveRecord<scope>[] which makes sense because
        # the user would have no access to any records as
        # it has no account.
        scope.none
      end
    end

    private

    attr_reader :user_account, :scope
  end
end
