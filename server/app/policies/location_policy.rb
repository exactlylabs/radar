class LocationPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.where(created_by_id: user)
    end

    private

    attr_reader :user, :location
  end
end