# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  prepend_before_action :authenticate_scope!, only: [:edit, :edit_email, :update, :update_email, :destroy]
  prepend_before_action :set_minimum_password_length, only: [:new, :edit, :edit_email]
  before_action :set_invite, only: [:render_invite_sign_up, :render_invite_sign_in, :sign_from_invite, :create_from_invite]
  # before_action :configure_sign_up_params, only: [:create]
  # before_action :configure_account_update_params, only: [:update]

  # GET /resource/sign_up
  # def new
  #   super
  # end

  # POST /register
  def create
    User.transaction do
      @user = User.create user_params
      @account = Account.create account_params
      # Nit: no need to actually call @user.avatar.attach
      # because it actually already does it in the create statement.
      # What's more, it actually creates a PurgeJob if you do both
      # create() with avatar + attach(), so it ends up deleting the attachment.
      @user.save
      @account.save
    end
    # Link account and new user together
    now = Time.now
    @user_account = UsersAccount.create(user_id: @user.id, account_id: @account.id, joined_at: now, invited_at: now)
    respond_to do |format|
      if @user_account.save
        sign_in @user
        format.html { redirect_to dashboard_path, notice: "Registered successfully" }
      else
        format.html { render :create, status: :unprocessable_entity }
      end
    end
  end

  # POST /register_from_invite
  def create_from_invite
    error = false
    begin
      User.transaction do
        @user = User.create! user_params
        @user.save
        # Link account and new user together
        @user_account = UsersAccount.create!(user_id: @user.id, account_id: @invite[:account_id], joined_at: Time.now, invited_at: @invite[:sent_at])
        @user_account.save!
        @invite.destroy!
      end
    rescue ActiveRecord::RecordInvalid => invalid
      error = invalid.record.errors
    rescue ActiveRecord::RecordNotDestroyed => invalid
      error = invalid.record.errors
    end
    respond_to do |format|
      if !error
        sign_in @user
        format.html { redirect_to dashboard_path(invite: true), notice: "Registered successfully" }
      else
        format.html { redirect_back fallback_location: root_path, status: :unprocessable_entity }
      end
    end
  end

  # POST /sign_in_from_invite
  def sign_from_invite
    error = false
    begin
      User.transaction do
        @user = User.find_by_email(params[:user][:email])
        if @user.valid_password?(params[:user][:password])
          @user_account = UsersAccount.create!(user_id: @user.id, account_id: @invite[:account_id], joined_at: Time.now, invited_at: @invite[:sent_at])
        else
          error = "Invalid email or password."
        end

        unless error
          @user_account.save!
          @invite.destroy!
        end
      end
    rescue ActiveRecord::RecordInvalid => invalid
      error = invalid.record.errors
    rescue ActiveRecord::RecordNotDestroyed => invalid
      error = invalid.record.errors
    end
    respond_to do |format|
      if !error
        sign_in @user
        format.html { redirect_to dashboard_path(invite: true), notice: "Registered successfully" }
      else
        format.html { redirect_back fallback_location: root_path, status: :unprocessable_entity, error: error }
      end
    end
  end

  # GET /resource/edit
  #def edit
  #  super
  #end

  def update_name
    user_params = params.require(:user).permit(:first_name, :last_name)

    respond_to do |format|
      if current_user.update(user_params)
        format.html { redirect_to edit_user_registration_path, notice: "Name was successfully updated." }
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

      respond_with resource, location: edit_user_registration_path
    else
      clean_up_passwords resource
      set_minimum_password_length
      render action: 'edit_password'
    end
  end

  def edit_email
    @resource = resource_class.to_adapter.get!(send(:"current_#{resource_name}").to_key)
    edit
  end

  def update_email
    self.resource = resource_class.to_adapter.get!(send(:"current_#{resource_name}").to_key)
    @resource = resource
    prev_unconfirmed_email = resource.unconfirmed_email if resource.respond_to?(:unconfirmed_email)

    resource_updated = update_resource(resource, account_update_params)
    yield resource if block_given?
    if resource_updated
      set_flash_message_for_update(resource, prev_unconfirmed_email)
      bypass_sign_in resource, scope: resource_name if sign_in_after_change_password?

      respond_with resource, location: edit_user_registration_path
    else
      clean_up_passwords resource
      set_minimum_password_length
      render action: 'edit_email'
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
    render template: "devise/registrations/invite/new", locals: { account: account, first_name: first_name, last_name: last_name, email: email }
  end

  def render_invite_sign_in
    account = Account.find(@invite.account_id)
    first_name = @invite.first_name
    last_name = @invite.last_name
    email = @invite.email
    render template: "devise/sessions/invite/new", locals: { account: account, first_name: first_name, last_name: last_name, email: email }
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
    invite_id = token[0..-17]
    invite_secret = token[-16..-1]
    @invite = Invite.find(invite_id).authenticate_token(invite_secret)
    if !@invite
      raise ActiveRecord::RecordNotFound.new("Couldn't find Invite", Invite.name)
    end
  end

  # DELETE /resource
  # def destroy
  #   super
  # end

  # GET /resource/cancel
  # Forces the session data which is usually expired after sign
  # in to be expired now. This is useful if the user wants to
  # cancel oauth signing in/up in the middle of the process,
  # removing all OAuth session data.
  # def cancel
  #   super
  # end

  # protected

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_up_params
  #   devise_parameter_sanitizer.permit(:sign_up, keys: [:attribute])
  # end

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_account_update_params
  #   devise_parameter_sanitizer.permit(:account_update, keys: [:attribute])
  # end

  # The path used after sign up.
  # def after_sign_up_path_for(resource)
  #   super(resource)
  # end

  # The path used after sign up for inactive accounts.
  # def after_inactive_sign_up_path_for(resource)
  #   super(resource)
  # end
end
