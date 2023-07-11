class CategoriesLocationPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @auth_holder.present?
        if @auth_holder.is_all_accounts?
          user = @auth_holder.user
          all_categories = []
          user.accounts.not_deleted.each do |account|
            all_categories.append(*account.categories.pluck(:id))
          end
          user.shared_accounts.not_deleted.each do |account|
            all_categories.append(*account.categories.pluck(:id))
          end
          scope.where(category_id: all_categories)
        else
          scope.where(category_id: @auth_holder.account.categories)
        end
      else
        scope.none
      end
    end
  end
end