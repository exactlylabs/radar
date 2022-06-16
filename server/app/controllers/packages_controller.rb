class PackagesController < ApplicationController
  before_action :set_version!, only: %i[ download ]
  
  # GET /client-versions/:client_version_id/packages/:id/download
  def download
    @package = @version.packages.find_by_name(params[:id])
    if !@package
      head(404)
    else
      response.headers["Content-Type"] = @package.file.content_type
      response.headers["Content-Disposition"] = "attachment; filename=#{@package.file.filename}"
      
      @package.file.download do |chunk|
        response.stream.write(chunk)
      end
    end
  ensure
    response.stream.close
  end
  
  
  private
  
  def set_version!
    if params[:client_version_id] == "stable"
      @version = ClientVersion.stable
    else
      @version = ClientVersion.find_by_version(params[:client_version_id])
    end
  end
end
