require "zip"

class ExportsController < ApplicationController
  before_action :authenticate_user!
  before_action :authenticate_token!
  before_action :authenticate_account_type!
  before_action :check_pending_downloads_type!

  # GET /exports/all
  def all
    filename = "all-data-#{Time.now.to_i}.zip"
    current_pending_downloads = current_user.pending_downloads
    current_user.update(pending_downloads: [*current_pending_downloads, filename])
    AllExportsJob.perform_later current_user, filename
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
    head(:forbidden) unless current_account.exportaccount
  end

  def check_pending_downloads_type!
    if current_user.has_all_data_pending_download
      notice = 'Already queued a download of this type!'
      respond_to do |format|
        format.json { render json: { msg: notice }, status: :conflict }
      end
    end
  end
end