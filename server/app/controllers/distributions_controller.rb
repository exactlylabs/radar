class DistributionsController < ApplicationController
  before_action :set_version!, only: %i[ download ]

  # GET /client-versions/:client_version_id/distributions/:id/download
  def download
    @dist = @version.distribution_by_name(params[:id])
    if !@dist
      head(404)
    else
      signed = params[:signed] == "true"
      blob = signed ? @dist.signed_binary : @dist.binary
      response.headers["Content-Type"] = blob.content_type
      response.headers["Content-Disposition"] = "attachment; filename=#{blob.filename}"
      blob.download do |chunk|
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
