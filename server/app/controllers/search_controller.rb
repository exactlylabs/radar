class SearchController < ApplicationController
  before_action :authenticate_user!

  def index
    @query = params[:q]
    @account_id = params[:account_id].to_i || -1
    @results = Hash.new
    current_user_accounts_ids = @account_id > -1 ?  [@account_id] : policy_scope(Account).pluck(:id)
    if @query.present?
      @results[:accounts] = policy_scope(Account).where("name ILIKE ?", "%#{@query}%")
      if current_user_accounts_ids.count == 1
        @results[:pods] = Client.where("unix_user ILIKE ? AND account_id = ?", "%#{@query}%", current_user_accounts_ids[0])
        @results[:locations] = Location.where("name ILIKE ? AND account_id = ?", "%#{@query}%", current_user_accounts_ids[0])
      else 
        @results[:pods] = Client.where("unix_user ILIKE ? AND account_id IN (?)", "%#{@query}%", current_user_accounts_ids)
        @results[:locations] = Location.where("name ILIKE ? AND account_id IN (?)", "%#{@query}%", current_user_accounts_ids)
      end
    end
    respond_to do |format|
      format.turbo_stream
      format.html { redirect_back fallback_location: root_path }
    end
  end

end