# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  prepend_before_action :authenticate_scope!, only: [:edit, :edit_email, :update, :update_email, :destroy]
  prepend_before_action :set_minimum_password_length, only: [:new, :edit, :edit_email]
  # before_action :configure_sign_up_params, only: [:create]
  # before_action :configure_account_update_params, only: [:update]

  # GET /resource/sign_up
  # def new
  #   super
  # end

  # POST /resource
  # def create
  #   super
  # end

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
