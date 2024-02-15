# frozen_string_literal: true

class AccountCategoriesController < ApplicationController
  before_action :authenticate_user!

  def search
    @account = policy_scope(Account).find(params[:account_id]) if params[:account_id]
    @query = params[:query]
    if @query.present?
      @categories = policy_scope(Category).where("name ILIKE ?", "%#{@query}%")
    else
      @categories = policy_scope(Category)
    end
    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to "/accounts" }
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
      @categories = Category.where(account_id: params[:account_id])
    rescue ActiveRecord::RecordNotFound => e
      @notice = "There is no account with given ID."
    end
    respond_to do |format|
      format.turbo_stream
    end
  end

  def close_dropdown
    respond_to do |format|
      format.turbo_stream
    end
  end
end
