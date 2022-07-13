class ClientPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.where(claimed_by_id: user)
    end

    private

    attr_reader :user, :client
  end
end