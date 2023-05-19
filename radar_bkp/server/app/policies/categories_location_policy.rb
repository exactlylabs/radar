class CategoriesLocationPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @auth_holder.present?
        scope.where(category_id: @auth_holder.account.categories)
      else
        scope.none
      end
    end
  end
end