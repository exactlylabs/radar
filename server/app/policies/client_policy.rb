class ClientPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.where(account_id: account)
    end

    private

    attr_reader :account, :client
  end
end