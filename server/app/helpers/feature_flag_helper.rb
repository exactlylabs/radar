module FeatureFlagHelper

  def self.is_available(flag_name, user)
    flag = FeatureFlag.find_by_name(flag_name)
    return false if !flag
    return true if flag.generally_available
    return false if user.nil? || !user.super_user
    flag.users.where(id: user.id).present? # Do not want to throw with find()
  end
end