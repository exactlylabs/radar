class CategoriesLocationPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @user_account.present?
        scope.where(category_id: @user_account.account.categories)
      else
        scope.none
      end
    end
  end
end