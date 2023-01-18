class UpdateGroupsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_update_group, only: %i[ edit update destroy ]

  # GET /update_groups
  def index
    @update_groups = policy_scope(UpdateGroup)
  end

  # GET /update_groups/:id/edit
  def edit
  end

  # GET /update_groups/new
  def new
    @update_group = UpdateGroup.new
  end

  # POST /update_groups
  def create
    @update_group = UpdateGroup.new(update_group_params)
    if @update_group.save
      notice = 'Release Group was successfully created.'
    else
      notice = 'Error creating Release Group.'
    end
    respond_to do |format|
      format.html { redirect_back fallback_location: root_path, notice: notice }
    end
  end

  # PUT /update_groups/:id
  def update
    new_name = params[:update_group][:name]
    new_client_version = policy_scope(ClientVersion).find(params[:update_group][:client_version_id])
    new_watchdog_version = policy_scope(WatchdogVersion).find(params[:update_group][:watchdog_version_id])
    if @update_group.update(name: new_name, client_version: new_client_version, watchdog_version: new_watchdog_version)
      notice = 'Release Group was successfully updated.'
    else
      notice = 'Error updating Release Group.'
    end
    respond_to do |format|
      format.html { redirect_back fallback_location: root_path, notice: notice }
    end
  end

  # POST /update_groups/:id/default
  def set_as_default
    new_default_update_group = policy_scope(UpdateGroup).find(params[:id])
    previous_default_update_group = policy_scope(UpdateGroup).default_group
    error = false
    begin
      UpdateGroup.transaction do
        new_default_update_group.update(default: true)
        previous_default_update_group.update(default: false) if previous_default_update_group.present? # could be deleted
      end
    rescue Exception => e
      error = true
    end
    if error
      notice = 'Error setting Release Group as default.'
    else
      notice = 'Release Group was successfully set as default.'
    end
    respond_to do |format|
      format.html { redirect_back fallback_location: root_path, notice: notice }
    end
  end

  # DELETE /update_groups/:id
  def destroy
    if policy_scope(UpdateGroup).default_group == @update_group
      notice = 'Error deleting Release Group. Cannot delete default Release Group.'
    elsif @update_group.destroy
      notice = 'Release Group was successfully deleted.'
    else
      notice = 'Error deleting Release Group.'
    end
    respond_to do |format|
      format.html { redirect_back fallback_location: root_path, notice: notice }
    end
  end

  private
  def update_group_params
    params.require(:update_group).permit(:name, :client_version_id)
  end

  def set_update_group
    @update_group = policy_scope(UpdateGroup).find(params[:id])
  end

end