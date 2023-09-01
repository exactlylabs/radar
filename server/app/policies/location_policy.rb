class LocationPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @auth_holder&.is_all_accounts?
        if @auth_holder.user.super_user && !@auth_holder.is_super_user_disabled?
          scope.all
        else
          user = @auth_holder.user
          all_locations = []
          user.accounts.not_deleted.each do |account|
            all_locations.append(*account.locations.pluck(:id))
          end
          user.shared_accounts.not_deleted.each do |account|
            all_locations.append(*account.locations.pluck(:id))
          end
          scope.where(id: all_locations)
        end
      else
        super
      end
    end
  end
end
