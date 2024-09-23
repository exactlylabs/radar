class WatchdogVersionsController < ApplicationController
    def download
        if params[:id] == "stable"
            v = WatchdogVersion.stable
        else
            v = WatchdogVersion.find_by_version(params[:id])
        end
        if !v
            head(404)
            return
        end
        signed = (params[:signed] || "false") == "true"
        blob = signed ? v.signed_binary : v.binary
        response.headers["Content-Type"] = blob.content_type
        response.headers["Content-Disposition"] = "attachment; filename=#{blob.filename}"
        blob.download do |chunk|
            response.stream.write(chunk)
        end
    ensure
        response.stream.close
    end
end
