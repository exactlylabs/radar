# frozen_string_literal: true

class AccountCategoriesController < ApplicationController
  before_action :authenticate_user!

  def search
    notice = params[:account_id].nil? ? "Please select an account before searching for categories." : nil

    respond_to do |format|
      if notice.nil?
        @account_id = params[:account_id] || current_account.id
        @query = params[:query]
        @categories = policy_scope(Category).where(account_id: @account_id)
        @categories = @categories.where("name LIKE ?", "%#{@query}%")
        format.turbo_stream
      else
        format.html { redirect_to "/locations", notice: notice }
      end
    end
  end

  def change_selected_categories
    ids = params[:categories].split(',')
    @categories = policy_scope(Category).where(id: ids)
    respond_to do |format|
      format.turbo_stream
    end
  end

  def open_dropdown
    @notice = nil
    begin
      @account_id = params[:account_id]
      @categories = policy_scope(Category).where(account_id: @account_id)
      all_categories = Category.new(id: -1, name: "All categories")
      @categories = @categories.order(:name)
      @categories = [all_categories] + @categories

    rescue ActiveRecord::RecordNotFound => e
      @notice = "There is no account with given ID."
    end
    respond_to do |format|
      format.turbo_stream
    end
  end

  def close_dropdown
    @account_id = params[:account_id]
    respond_to do |format|
      format.turbo_stream
    end
  end
end
