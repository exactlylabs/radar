class WatchdogVersionsController < ApplicationController
    def download
        if params[:id] == "stable"
            v = WatchdogVersion.stable
        else
            v = WatchdogVersion.find_by_version(params[:id])
        end
        if !v
            head(404)
        else
            response.headers["Content-Type"] = v.binary.content_type
            response.headers["Content-Disposition"] = "attachment; filename=#{v.binary.filename}"
            
            v.binary.download do |chunk|
                response.stream.write(chunk)
            end
        end
    ensure
        response.stream.close
    end
end
