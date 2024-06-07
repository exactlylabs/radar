class AccountPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @auth_holder.present?
        user = @auth_holder.user
        if user.super_user? && !@auth_holder.is_super_user_disabled?
          scope.all.not_deleted
        else
          sql = %{
            WITH user_accounts AS (
              SELECT
  	            accounts.id
 	            FROM accounts
              JOIN users_accounts ua ON ua.account_id = accounts.id
              WHERE ua.user_id = :user_id
            )

            SELECT id FROM user_accounts

            UNION

            SELECT accounts.id
            FROM accounts
            JOIN shared_accounts sa ON sa.original_account_id = accounts.id
            WHERE
              sa.shared_to_account_id IN (SELECT id FROM user_accounts)
              AND accounts.id NOT IN (SELECT id FROM user_accounts)
          }

          scope.where("id IN (#{sql})", user_id: user.id).not_deleted
        end
      else
        scope.none
      end
    end
  end

  class ScopeWithoutShared < Scope
    def resolve
      if @auth_holder.present?
        user = @auth_holder.user
        if user.super_user? && !@auth_holder.is_super_user_disabled?
          scope.all.not_deleted
        else
          scope.joins(:users).where(users: { id: user.id }).not_deleted
        end
      else
        scope.none
      end
    end
  end
end
