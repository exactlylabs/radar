module MobileApi::V1
  class ScanSessionsController < ApiController
    before_action :set_scan_session, except: [:index, :create]
    
    def index
      return render_paginated_response(scan_sessions) { |item| serialize_scan_session(item) }
    end

    def create
      item = MobileScanSession.create(mobile_user_device: @current_user_device)
      if item.errors.present?
        return render_error_for(item)
      end
      render json: serialize_scan_session(item, details: true), status: 201
    end

    def show
      render json: serialize_scan_session(@scan_session, details: true), stauts: 200
    end

    def new_post
      post_item = @scan_session.mobile_scan_session_posts.create(blob: params[:package])
      if post_item.errors.present?
        return render_error_for(post_item)
      end
      ProcessScanSessionPostJob.perform_later(post_item)
      render json: post_item.as_json(only: [:id, :mobile_scan_session_id, :processed_at, :created_at, :updated_at]), status: 201
    end

    def history
      networks = @scan_session.mobile_scan_session_networks
      if params[:network_type] == 'cell'
        networks = networks.cell
      elsif params[:network_type] == 'wifi'
        networks = networks.wifi
      end
      
      return render_paginated_response(networks) do |item|
        is_new = item.is_new
        last_seen_at = item.last_seen_at
        item.mobile_scan_network.as_json(only: [:id, :network_type, :name]).merge({is_new: is_new, last_seen_at: last_seen_at})
      end
    end

    private

    def serialize_scan_session(item, details: false)
      item.as_json(only: [:id, :created_at, :updated_at]).merge(
        details ? { 
          wifi_count: item.wifi_networks.count,
          cell_count: item.cell_networks.count,
          speed_test_count: item.speed_tests.count,
        } : {}
      )
    end

    def set_scan_session
      id = params[:mobile_scan_session_id] || params[:id]
      begin
        @scan_session = scan_sessions.find(id)
      rescue ActiveRecord::RecordNotFound
        return render_not_found
      end
    end

    def scan_sessions
      MobileScanSession.where(mobile_user_device: @current_user_device).order(created_at: :desc)
    end
  end
end