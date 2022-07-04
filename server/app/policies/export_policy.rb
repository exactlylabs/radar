class ExportPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if user.exportuser
        scope.all
      end
    end
  end

  def all?
    user.exportuser
  end
end