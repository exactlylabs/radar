module Exceptions
  module Handler
    extend ActiveSupport::Concern

    def handle_exception(e, current_user)
      if current_user.present?
        # Setting the user as this might be thrown from an async job, or from some context outside the controller layer
        Sentry.set_user(id: current_user.id, email: current_user.email)
        Sentry.configure_scope do |scope|
        user_ffs = {}
        current_ffs_ids = current_user.feature_flags.pluck(:id)
        FeatureFlag.all.each do |ff|
          user_ffs.merge!({ff.name => current_ffs_ids.include?(ff.id)})
        end
        scope.set_context('Feature Flags', user_ffs)
        scope.set_context('User Metadata', { 'Super User' => current_user.super_user })
        end
      end
      Sentry.capture_exception(e)
      raise e
    end
  end
end