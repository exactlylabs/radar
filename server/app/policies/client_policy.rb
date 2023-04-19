class ClientPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @user_account&.is_all_accounts?
        user = User.find(@user_account.user_id)
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
