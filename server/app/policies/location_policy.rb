class LocationPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.where(account_id: account)
    end

    private

    attr_reader :account, :location
  end
end