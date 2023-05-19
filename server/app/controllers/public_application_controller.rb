# Inheriting from ActionController::Base as this entire controller
# lives outside the regular authentication flow as it is meant for
# public access
class PublicApplicationController < ActionController::Base
  layout "public"
end