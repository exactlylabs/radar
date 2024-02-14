class CategoryPolicy < ApplicationPolicy
  class Scope < Scope
    # def resolve
    #   if @auth_holder.present?
    #     scope.where(account_id: @auth_holder.account.id)
    #   else
    #     scope.none
    #   end
    # end
    def resolve
      if @auth_holder&.is_all_accounts?
        user = @auth_holder.user
        all_categories = []
        user.accounts.not_deleted.each do |account|
          all_categories.append(*account.categories.pluck(:id))
        end
        user.shared_accounts.not_deleted.each do |account|
          all_categories.append(*account.categories.pluck(:id))
        end
        scope.where(id: all_categories)
      else
        scope.where(account_id: @auth_holder.account.id)
      end
    end
  end
end
