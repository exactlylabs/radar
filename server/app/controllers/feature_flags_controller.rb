class FeatureFlagsController < ApplicationController
  before_action :authenticate_user!
  before_action :check_super_user!
  before_action :set_feature_flag, only: %i[ update delete destroy ]

  def index
  end

  def new
    @ff = FeatureFlag.new
    respond_to do |format|
      format.html
      format.turbo_stream { render turbo_stream: turbo_stream.update('create_feature_flag_modal', partial: "feature_flags/create/create_modal", locals: { ff: @ff }) }
    end
  end

  def create
    @ff = FeatureFlag.new(feature_flags_params)
    users = params[:users]

    @ff.users = User.where(id: users, super_user: true) if users.present?

    respond_to do |format|
      if @ff.save!
        @notice = "Feature flag created successfully."
        format.html
        format.turbo_stream
      else
        format.html { redirect_to :index, notice: "Oops! There has been an error creating the feature flag. Please try again later!" }
      end
    end
  end

  def update
    generally_available = params[:generally_available] == "on"
    if generally_available
      users = []
    else
      users = User.where(id: params[:users], super_user: true)
    end
    @ff.generally_available = generally_available
    @ff.users = users
    respond_to do |format|
      if @ff.save!
        @notice = "Feature flag updated successfully. Refresh to see the changes."
        format.html
        format.turbo_stream
      else
        format.html { redirect_to :index, notice: "Oops! There has been an error updating the feature flag. Please try again later!" }
      end
    end
  end

  def delete
    respond_to do |format|
      format.html
      format.turbo_stream { 
        render turbo_stream: turbo_stream.update('delete_feature_flag_modal', 
        partial: "feature_flags/modals/delete/delete_modal", 
        locals: { ff: @ff }) 
      }
    end
  end

  def destroy
    @ff_id = @ff.id
    respond_to do |format|
      if @ff.destroy
        @notice = "Feature flag deleted successfully."
        format.html
        format.turbo_stream
      else
        format.html { redirect_to :index, notice: "Oops! There has been an error deleting the feature flag. Please try again later!" }
      end
    end
  end

  private
  def feature_flags_params
    params.require(:feature_flag).permit(:name)
  end

  def check_super_user!
    head(:forbidden) unless current_user.super_user?
  end

  def set_feature_flag
    @ff = FeatureFlag.find(params[:id])
  end
end