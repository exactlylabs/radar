# frozen_string_literal: true

class ApplicationPolicy
  attr_reader :account, :record

  def initialize(_user, record)
    @account = current_account
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
    def initialize(account, scope)
      @account = account
      @scope = scope
    end

    def resolve
      scope.all
    end

    private

    attr_reader :account, :scope
  end
end
