require "zip"

class ExportsController < ApplicationController
  before_action :authenticate_user!
  before_action :authenticate_token!
  before_action :authenticate_account_type!

  # GET /exports/all
  def all
    a = AllExportsJob.perform_later current_user
    puts "job -> #{a}"
    respond_to do |format|
      format.json { render json: { msg: 'File is being prepared' } }
    end
  end

  private

  def authenticate_token!
    if request.headers["Authorization"].present?
      token = request.headers["Authorization"].split(" ")
      if token.size == 2
        @user = User.where({"token": token[1]}).first
      end
    end
  end

  def authenticate_account_type!
    head(403) unless current_account.exportaccount
  end
end