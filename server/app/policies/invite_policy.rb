class InvitePolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @auth_holder.present?
        if @auth_holder.is_all_accounts?
          user = @auth_holder.user
          all_invites = []
          user.accounts.not_deleted.each do |account|
            all_invites.append(*account.invites.map{|l| l.id})
          end
          user.shared_accounts.not_deleted.each do |account|
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