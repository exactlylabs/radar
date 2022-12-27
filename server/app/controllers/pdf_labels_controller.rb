require "rqrcode"

class PdfLabelsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_client

  # GET /pdf_labels/:unix_user
  def get_client_label
    client_path = request.base_url + "/clients/#{@client.unix_user}"
    qr = RQRCode::QRCode.new(client_path)

    qr_svg = qr.as_svg(
      color: "000",
      shape_rendering: "crispEdges",
      module_size: 11,
      standalone: true,
      use_path: true,
      viewbox: true
    )

    respond_to do |format|
      format.pdf do
        render pdf: "#{@client.unix_user}",
               page_size: "A4",
               template: "client_labels/show.html.erb",
               layout: "client_label.html",
               orientation: "Landscape",
               locals: { qr: qr_svg }
      end
    end
  end

  private
  def set_client
    @client = policy_scope(Client).find_by_unix_user(params[:unix_user])
    if @client.nil?
      raise ActiveRecord::RecordNotFound.new("Couldn't find Client with 'id'=#{params[:unix_user]}", Client.name, params[:unix_user])
    end
  end

end