class AccountPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.where()
    end
  end
end