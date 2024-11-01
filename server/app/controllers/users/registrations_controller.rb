# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  prepend_before_action :authenticate_scope!, only: [:edit, :edit_email, :update, :update_email, :destroy]
  prepend_before_action :set_minimum_password_length, only: [:new, :edit, :edit_email]
  before_action :set_invite, only: [:render_invite_sign_up, :render_invite_sign_in, :sign_from_invite, :create_from_invite]
  before_action :set_auth_holder, only: [:edit]

  # POST /register
  def create
    error = false
    begin
      User.transaction do
        @user = User.find_by(pods_access: false, email: user_params[:email])
        if @user.present?
          _params = {pods_access: true}.merge(user_params)
          @user.update!(_params)
        else
          @user = User.create! user_params
        end
        # Nit: no need to actually call @user.avatar.attach
        # because it actually already does it in the create statement.
        # What's more, it actually creates a PurgeJob if you do both
        # create() with avatar + attach(), so it ends up deleting the attachment.
      end
    rescue ActiveRecord::RecordInvalid => invalid
      error = invalid.record.errors
    end
    respond_to do |format|
      if !error
        sign_in @user
        set_cookie(:ftue_onboarding_modal, true)
        format.html { redirect_to dashboard_path, notice: "Registered successfully" }
      else
        format.json { render json: { error: error, status: :unprocessable_entity } }
      end
    end
  end

  # POST /register_from_invite
  def create_from_invite
    error = false
    begin
      User.transaction do
        @user = User.find_by(pods_access: false, email: user_params[:email])
        if @user.present?
          _params = {pods_access: true}.merge(user_params)
          @user.update!(_params)
        else
          @user = User.create! user_params
        end
        # Link account and new user together
        @user_account = UsersAccount.create!(user_id: @user.id, account_id: @invite[:account_id], joined_at: Time.now, invited_at: @invite[:sent_at])
        @invite.destroy!
      end
    rescue ActiveRecord::RecordInvalid => invalid
      error = invalid
    rescue ActiveRecord::RecordNotDestroyed => invalid
      error = invalid
    end
    if !error
      AccountNotificationJobs::InviteAcceptedNotification.perform_later(@user_account.account, @user)
    end
    respond_to do |format|
      if !error
        sign_in @user
        format.html { redirect_to dashboard_path(invite: true), notice: "Registered successfully" }
      else
        format.json { render json: { error: error }, status: :unprocessable_entity }
      end
    end
  end

  # POST /sign_in_from_invite
  def sign_from_invite
    error = false
    already_joined = false
    @user = User.find_by_email(params[:user][:email])
    if @user.valid_password?(params[:user][:password])
      @user_account = UsersAccount.find_by(user_id: @user.id, account_id: @invite[:account_id])
      if @user_account.nil?
        begin
          UsersAccount.transaction do
            @user_account = UsersAccount.create!(user_id: @user.id, account_id: @invite[:account_id], joined_at: Time.now, invited_at: @invite[:sent_at])
            @invite.destroy!
          end
        rescue ActiveRecord::RecordInvalid => invalid
          error = invalid.record.errors
        rescue ActiveRecord::RecordNotDestroyed => invalid
          error = invalid.record.errors
        end
      else
        already_joined = true
        @invite.destroy!
      end
    else
      error = "Invalid email or password."
    end

    respond_to do |format|
      if !error
        sign_in @user
        get_or_set_account_from_cookie
        assign_account(@user_account.account_id)
        @notice = already_joined ? "You have already joined this account." : "Successfully joined account."
        format.html { redirect_to dashboard_path, notice: @notice }
      else
        format.json { render json: { msg: error }, status: :unprocessable_entity }
        format.html { redirect_back fallback_location: root_path, status: :unprocessable_entity, error: error }
      end
    end
  end

  # GET /resource/edit
  #def edit
  #  super
  #end

  # DELETE /custom_sign_out
  def custom_sign_out
    clear_account_and_cookie
    clear_ftue_cookie
    sign_out
    respond_to do |format|
      format.html { redirect_to root_path }
    end
  end

  def update_name_and_avatar
    user_params = params.require(:user).permit(:first_name, :last_name, :avatar)
    # If avatar is not present in request params, it's because the user deleted it,
    # then default to nil so db removes it
    user_params[:avatar] ||= nil

    respond_to do |format|
      if current_user.update(user_params)
        format.html { redirect_to edit_user_registration_path, notice: "Profile successfully updated." }
        format.json { render :edit, status: :ok }
      else
        notice = "There was an error updating your profile. Please, try again."
        format.html { redirect_back fallback_location: edit_user_registration_path, status: :unprocessable_entity, notice: notice }
        format.json { render json: current_user.errors, status: :unprocessable_entity }
      end
    end
  end

  def update_name
    user_params = params.require(:user).permit(:first_name, :last_name)

    respond_to do |format|
      if current_user.update(user_params)
        format.html { redirect_to edit_user_registration_path, notice: "Name was successfully updated." }
        format.json { render :edit, status: :ok }
      else
        notice = "There was an error updating your profile. Please, try again."
        format.html { redirect_back fallback_location: edit_user_registration_path, status: :unprocessable_entity, notice: notice }
        format.json { render json: current_user.errors, status: :unprocessable_entity }
      end
    end
  end

  def update_avatar
    # Request might have either:
    # 1. { authenticity_token => XXX, user => { avatar: XXX } }
    # 2. { authenticity_token => XXX }
    # So checking if user is present in params, will allow us
    # to retrieve the avatar from it. This should be safe as this
    # endpoint is only called in an environment of avatar update.
    if params[:user]
      avatar = params[:user][:avatar]
    else
      avatar = nil
    end
    respond_to do |format|
      if current_user.update(avatar: avatar)
        format.html { redirect_back fallback_location: root_path, notice: "User avatar was successfully updated." }
        format.json { render :edit, status: :ok }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: current_user.errors, status: :unprocessable_entity }
      end
    end
  end

  def edit_password
    @resource = resource_class.to_adapter.get!(send(:"current_#{resource_name}").to_key)
    edit
  end

  def update_password
    self.resource = resource_class.to_adapter.get!(send(:"current_#{resource_name}").to_key)
    @resource = resource
    prev_unconfirmed_email = resource.unconfirmed_email if resource.respond_to?(:unconfirmed_email)

    resource_updated = update_resource(resource, account_update_params)
    yield resource if block_given?
    if resource_updated
      set_flash_message_for_update(resource, prev_unconfirmed_email)
      bypass_sign_in resource, scope: resource_name if sign_in_after_change_password?
      @notice = "Password was successfully updated."
      respond_to do |format|
        format.turbo_stream
        format.html { redirect_to edit_user_registration_path, notice: @notice }
      end
    else
      clean_up_passwords resource
      set_minimum_password_length
      @error = "There was an error updating your password. Please, try again."
      render action: 'edit_password'
    end
  end

  def edit_email
    @resource = resource_class.to_adapter.get!(send(:"current_#{resource_name}").to_key)
  end

  def update_email
    self.resource = resource_class.to_adapter.get!(send(:"current_#{resource_name}").to_key)
    @resource = resource
    prev_unconfirmed_email = resource.unconfirmed_email if resource.respond_to?(:unconfirmed_email)

    resource_updated = resource.update(account_update_params)
    yield resource if block_given?
    if resource_updated
      set_flash_message_for_update(resource, prev_unconfirmed_email)
      bypass_sign_in resource, scope: resource_name if sign_in_after_change_password?

      respond_with resource, location: edit_user_registration_path
    else
      @notice = "Oops! The email is invalid."
      respond_to do |format|
        format.turbo_stream
      end
    end
  end

  # PUT /resource
  def update
    super
  end

  # GET /users/invite_sign_up
  def render_invite_sign_up
    account = Account.find(@invite.account_id)
    first_name = @invite.first_name
    last_name = @invite.last_name
    email = @invite.email

    # In case the user is already signed in, and the emails match, there is no need to sign-in again.
    authenticate_user! rescue nil
    get_or_set_account_from_cookie unless @auth_holder.present?
    if current_user.present? && current_user.email == email
      UsersAccount.transaction do
        if !UsersAccount.where(user: current_user, account: account).exists?
          UsersAccount.create!(user: current_user, account: account, joined_at: Time.now, invited_at: @invite.sent_at)
        end
        @invite.destroy!
        assign_account(account.id)
      end
      redirect_to dashboard_path
      return
    end

    render template: "devise/registrations/invite/new", locals: { account: account, first_name: first_name, last_name: last_name, email: email }
  end

  def render_invite_sign_in
    account = Account.find(@invite.account_id)
    first_name = @invite.first_name
    last_name = @invite.last_name
    email = @invite.email
    render template: "devise/sessions/invite/new", locals: { account: account, first_name: first_name, last_name: last_name, email: email }
  end

  def check_email_uniqueness
    email = params[:user][:email]
    possible_user = User.find_by_email(email)
    respond_to do |format|
      if email.blank?
        format.json { render json: { status: 400, msg: 'The email is required.' } }
      elsif possible_user.nil? || !possible_user.pods_access?
        format.json { render json: { status: 200 } }
      else
        format.json { render json: { status: 422, msg: 'A user with the given email already exists.' } }
      end
    end
  end

  private

  def user_params
    params.require(:user).permit(:first_name, :last_name, :email, :password, :terms, :avatar)
  end

  def account_params
    params.require(:account).permit(:name, :account_type)
  end

  def set_invite
    token = params[:token]
    if token
      begin
        invite_id = token[0..-17]
        invite_secret = token[-16..-1]
        @invite = Invite.find(invite_id).authenticate_token(invite_secret)
      rescue ActiveRecord::RecordNotFound
        @notice = "Error: Invite token not found."
      end
    else
      @notice = "Error: Invalid invite token."
    end
    @notice = "Error: Invite token missing." if !@invite
    if @notice.present?
      redirect_path = user_signed_in? ? dashboard_path : root_path
      flash[:alert] = @notice
      redirect_to redirect_path
    end
  end

  def set_auth_holder
    is_account_accessible_through_share = !current_account.nil? && current_user.shared_accounts.where(id: current_account.id).exists?
    is_all_accounts = current_account&.is_all_accounts? || false
    @auth_holder = AuthenticationHolder.new(current_user, is_all_accounts, is_account_accessible_through_share, is_super_user_disabled?) unless @auth_holder
    @auth_holder.set_account(current_account)
  end
end
