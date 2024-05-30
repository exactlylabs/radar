class CategoryPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @auth_holder.present?
        user = @auth_holder.user
        if user.super_user? && !@auth_holder.is_super_user_disabled?
          scope.all
        else
          all_categories = []
          user.accounts.not_deleted.each do |account|
            all_categories.append(*account.categories.pluck(:id))
          end
          user.shared_accounts.each do |account|
            all_categories.append(*account.categories.pluck(:id))
          end
          scope.where(id: all_categories)
        end
      else
        scope.none
      end
    end
  end
end
