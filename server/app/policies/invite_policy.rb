class InvitePolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @auth_holder.present?
        user = @auth_holder.user
        if user.super_user? && !@auth_holder.is_super_user_disabled?
          scope.all
        elsif @auth_holder.is_all_accounts?
          all_invites = []
          user.accounts.not_deleted.each do |account|
            all_invites.append(*account.invites.map{|l| l.id})
          end
          user.shared_accounts.each do |account|
            all_invites.append(*account.invites.map{|l| l.id})
          end
          scope.where(id: all_invites)
        else
          super
        end
      else
        scope.none
      end
    end
  end
end
