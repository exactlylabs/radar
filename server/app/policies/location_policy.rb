class LocationPolicy < ApplicationPolicy

  class Scope < ApplicationPolicy::Scope

    def resolve
      scope = super
      scope.not_deleted
    end
  end
end