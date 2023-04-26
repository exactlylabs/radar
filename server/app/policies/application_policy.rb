# frozen_string_literal: true

class ApplicationPolicy
  attr_reader :auth_holder, :record

  def initialize(auth_holder, record)
    @auth_holder = auth_holder
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
    def initialize(auth_holder, scope)
      @auth_holder = auth_holder
      @scope = scope
    end

    def resolve
      if @auth_holder&.account
        scope.where(account_id: @auth_holder.account.id)
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

    attr_reader :auth_holder, :scope
  end
end
