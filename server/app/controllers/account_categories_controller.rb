# frozen_string_literal: true

class AccountCategoriesController < ApplicationController
  before_action :authenticate_user!

  def search
    @account_id = params[:account_id]
    @query = params[:query]
    @categories = Category.where(account_id: @account_id)
    @categories = @categories.where("name LIKE ?", "%#{@query}%")
    respond_to do |format|
      format.turbo_stream
    end
  end

  def change_selected_categories
    ids = params[:categories].split(',')
    @categories = Category.where(id: ids)
    puts "Categories: #{@categories.count}"
    respond_to do |format|
      format.turbo_stream
    end
  end

  def open_dropdown
    @notice = nil
    begin
      @categories = Category.where(account_id: params[:account_id])
      @account_id = params[:account_id]
    rescue ActiveRecord::RecordNotFound => e
      @notice = "There is no account with given ID."
    end
    respond_to do |format|
      format.turbo_stream
    end
  end

  def close_dropdown
    @account_id = params[:account_id]
    puts "Account ID: #{@account_id}"
    respond_to do |format|
      format.turbo_stream
    end
  end
end
