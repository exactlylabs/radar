class ApplicationController < ActionController::Base
  include Pundit

  def after_sign_in_path_for(resource)
    locations_path
  end 
end
