module ErrorsHelper
  module PodClaimErrors
    PodNotFound = 'Pod not found'
    PodAlreadyClaimedBySomeoneElse = 'Pod already claimed by someone else'
    PodIsAlreadyInYourAccount = 'Pod is already in your account'
    PodBelongsToOneOfYourOtherAccounts = 'Pod belongs to one of your other accounts'
  end

  def there_has_been_an_error(action)
    msg = action.present? ? "There has been an error #{action}" : 'Something went wrong'
    "Oops! #{msg}. Please try again later!"
  end
end