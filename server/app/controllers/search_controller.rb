class SearchController < ApplicationController
  before_action :authenticate_user!

  def index
    @query = params[:q]
    @account_id = params[:account_id].to_i || -1
    @results = Hash.new
    if @query.present?
      current_user_accounts_ids = @account_id > -1 ?  [@account_id] : current_user.accounts.pluck(:id)
      @results[:pods] = Client.where("(name ILIKE ? OR unix_user ILIKE ?) AND account_id IN (?)", "%#{@query}%", "%#{@query}%", current_user_accounts_ids)
      @results[:locations] = Location.where("name ILIKE ? AND account_id IN (?)", "%#{@query}%", current_user_accounts_ids)
    end
    respond_to do |format|
      format.turbo_stream
      format.html { redirect_back fallback_location: root_path }
    end
  end

end