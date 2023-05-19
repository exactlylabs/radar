class DistributionsController < ApplicationController
  before_action :set_version!, only: %i[ download ]
  
  # GET /client-versions/:client_version_id/distributions/:id/download
  def download
    @dist = @version.distribution_by_name(params[:id])
    if !@dist
      head(404)
    else
      response.headers["Content-Type"] = @dist.binary.content_type
      response.headers["Content-Disposition"] = "attachment; filename=#{@dist.binary.filename}"
      
      @dist.binary.download do |chunk|
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
    if @version.nil?
      head(404)
    end
  end
end
