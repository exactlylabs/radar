class SharedUsersAccountController < ApplicationController
  before_action :authenticate_user!

  def delegate_access
    error = false
    new_selected_ids = params[:share_to].present? ? [*params[:share_to]] : []
    
    current_shared_accounts_ids = policy_scope(SharedAccount).where(original_account_id: current_account.id).map {|a| a.id}
    
    # find new ids to add (prevent adding dups)
    account_ids_to_add = new_selected_ids - current_shared_accounts_ids
    
    # find ids which are no longer present (deleted)
    account_ids_to_delete = current_shared_accounts_ids - new_selected_ids
  
    # Add all new ones
    account_ids_to_add.each do |id|
      SharedAccount.transaction do
        new_shared_account = SharedAccount.new
        new_shared_account.original_account_id = current_account.id
        new_shared_account.shared_to_account_id = id
        new_shared_account.shared_at = Time.now
        new_shared_account.save!
      end
    end

    SharedAccount.delete(account_ids_to_delete)

    respond_to do |format|
      format.html { redirect_back fallback_location: root_path, notice: "Account sharing correctly saved!" }
    end
  end

  private
  def set_origin_account
    @origin_account = current_account if current_account.present?
  end
end