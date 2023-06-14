class ClientPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @auth_holder&.is_all_accounts?
        user = @auth_holder.user
        if user.super_user
          scope.all
        else
          all_pods = []
          user.accounts.not_deleted.each do |account|
            all_pods.append(*account.clients.pluck(:id))
          end
          user.shared_accounts.not_deleted.each do |account|
            all_pods.append(*account.clients.pluck(:id))
          end
          scope.where(id: all_pods)
        end
      else
        super
      end
    end
  end

  def superaccount_or_in_scope?
    scope = Scope.new(@auth_holder, Client)
    @auth_holder&.account.superaccount? || scope.resolve.find(@record.id).exists?
  end

end
