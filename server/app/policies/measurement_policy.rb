# Headless policy
# https://www.rubydoc.info/gems/pundit#:~:text=edit_post_path(%40post)%20%25%3E%0A%3C%25%20end%20%25%3E-,Headless%20policies,-Given%20there%20is
class MeasurementPolicy

  # TODO: move ALL current roles such as exportuser
  # into account level. Opening a ticket for it. For
  # now, will leave at user level for everything to
  # work as before.
  def initialize(user_account, _record)
    @user = User.find(user_account.user_id)
  end

  def index?
    true
  end

  def full_index?
    @user.superuser || @user.exportuser
  end

  def full_ndt7_index?
    @user.superuser || @user.exportuser
  end
end