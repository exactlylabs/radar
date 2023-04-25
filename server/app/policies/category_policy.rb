class CategoryPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @user_account.present?
        acc = Account.find(@user_account.account_id)
        c_ids = CategoriesLocation.where(location_id: acc.locations).pluck(:category_id)
        scope.where(id: c_ids)
      else
        scope.none
      end
    end
  end
end