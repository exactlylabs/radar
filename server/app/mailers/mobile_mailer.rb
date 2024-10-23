class MobileMailer < ApplicationMailer
  def verification_code_email
    @code = params[:verification_code]    
    mail(to: @code.email, subject: 'Radar Speed Test Verification Code')
  end
end
