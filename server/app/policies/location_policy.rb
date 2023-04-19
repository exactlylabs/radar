class LocationPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @user_account&.is_all_accounts?
        user = User.find(@user_account.user_id)
        all_locations = []
        user.accounts.not_deleted.each do |account|
          all_locations.append(*account.locations.map{|l| l.id})
        end
        user.shared_accounts.not_deleted.each do |account|
          all_locations.append(*account.locations.map{|l| l.id})
        end
        scope.where(id: all_locations)
      else
        super
      end
    end
  end
end