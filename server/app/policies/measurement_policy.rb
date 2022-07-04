class MeasurementPolicy < ApplicationPolicy
  class Scope < Scope
    def initialize
      super
    end

    def resolve
      if user.superuser || user.exportuser
        scope.all
      end
    end
  end

  def index?
    true
  end

  def full_index?
    user.superuser || user.exportuser
  end

  def full_ndt7_index?
    user.superuser || user.exportuser
  end
end