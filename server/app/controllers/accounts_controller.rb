class AccountsController < Devise::RegistrationsController

  prepend_before_action :set_minimum_password_length, only: [:new, :edit]

  def new

  end
end