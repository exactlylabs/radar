class ClientPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @auth_holder&.is_all_accounts?
        user = @auth_holder.user
        all_pods = []
        user.accounts.not_deleted.each do |account|
          all_pods.append(*account.clients.map{|l| l.id})
        end
        user.shared_accounts.not_deleted.each do |account|
          all_pods.append(*account.clients.map{|l| l.id})
        end
        scope.where(id: all_pods)
      else
        super
      end
    end
  end
end
