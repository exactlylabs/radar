class RecentSearchesController < ApplicationController
  before_action :authenticate_user!

  def create
    @recent_search = RecentSearch.new(user: current_user)
    if params[:type] == 'client'
      @recent_search.client_id = params[:id]
    else
      @recent_search.location_id = params[:id]
    end
    @recent_search.save!
    head(:no_content)
  end
end