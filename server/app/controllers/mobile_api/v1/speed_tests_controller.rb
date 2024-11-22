module MobileApi::V1
  class SpeedTestsController < ApiController
    before_action :validate_explore_params, only: [:isps, :tiles]

    def create
      @speed_test = ClientSpeedTest.new(create_params)
      @speed_test.tested_by = 1 # Exactly Labs
      @speed_test.ip = request.remote_ip
      @speed_test.mobile_user_device = @current_user_device
      @speed_test.lonlat = "POINT(#{create_params[:longitude]} #{create_params[:latitude]})"

      filename = "speed-test-#{create_params[:tested_at]}.json"
      # Compress the result file before attaching it to the measurement
      result_file = StringIO.new(ActiveSupport::Gzip.compress(create_params[:result].to_json))
      @speed_test.result.attach(io: result_file, filename: filename, content_type: 'application/json')
      @speed_test.gzip = true
      @speed_test.autonomous_system = AutonomousSystem.find_by_ip(@speed_test.ip) unless @speed_test.ip.nil?

      if @speed_test.save
        # Call process to parse JSON and seed measurement
        ProcessSpeedTestJob.perform_later(@speed_test, true)
        render json: serialize_speed_test(@speed_test), status: 201
      else
        return render_error_for(@speed_test)
      end
    end

    def show
      speed_test = ClientSpeedTest.find(params[:id])

      render json: serialize_speed_test(speed_test), status: 200
    end

    def isps
      bbox = params[:bbox]
      sql_params = {}

      if bbox.present? && bbox.length != 4
        return render json: {
          error: "bbox argument must be an array of size 4 [x_0, y_0, x_1, y_1]",
          error_code: "invalid"
        }, status: :unprocessable_entity
      end

      speed_tests = self.explore_speed_tests
      if bbox.present?
        speed_tests = speed_tests.within_box(*bbox)
      end

      isps = speed_tests
        .joins(:autonomous_system => [:autonomous_system_org])
        .group("autonomous_system_orgs.id")
        .order("autonomous_system_orgs.id")
        .pluck("autonomous_system_orgs.id, autonomous_system_orgs.name")
        .map { |id, name| {id: id, name: name} }

      render json: {items: isps}, status: 200
    end

    def tiles
      x = params[:x].to_i
      y = params[:y].to_i
      z = params[:z].to_i

      @tiles = self.explore_speed_tests
        .left_joins(:autonomous_system => [:autonomous_system_org])
        .select(%{
          client_speed_tests.id,
          network_type,
          autonomous_system_orgs.name,
          autonomous_system_orgs.id,
          download_avg,
          upload_avg,
          COALESCE(loss, 0) as "loss",
          latency
        })
        .to_vector_tile(z, x, y)

      response.headers['Content-Type'] = 'application/vnd.mapbox-vector-tile'
      response.headers['Content-Length'] = @tiles&.length&.to_s || '0'
      send_data @tiles, type: 'application/vnd.mapbox-vector-tile', disposition: 'inline'
    end

    private

    def create_params()
      params.permit(
        :tested_at, :network_type, :connection_data, :version_number, :build_number, :background_mode, :permssions,
        :latitude, :latitude_before, :latitude_after,
        :longitude, :longitude_before, :longitude_after,
        :altitude, :altitude_before, :altitude_after,
        :accuracy, :accuracy_before, :accuracy_after,
        :alt_accuracy, :alt_accuracy_before, :alt_accuracy_after,
        :floor, :floor_before, :floor_after,
        :heading, :heading_before, :heading_after,
        :speed, :speed_before, :speed_after,
        :speed_accuracy, :speed_accuracy_before, :speed_accuracy_after,
        :mobile_scan_session_id
      )
    end

    def serialize_speed_test(s)
      s.as_json(except: [:lonlat])
    end

    def explore_speed_tests
      speed_tests = ClientSpeedTest.all

      unless explore_filters[:global]
        speed_tests = speed_tests.from_user(@current_user)
      end

      if explore_filters[:speed_ranges].present?
        range_filters = []
        speed_type = "#{explore_filters[:speed_type]}_avg"
        explore_filters[:speed_ranges].each do |r|
          case r
          when "no_internet"
            range_filters << ClientSpeedTest.where("#{explore_filters[:speed_type]}_avg": nil)
          when "0-25"
            range_filters << ClientSpeedTest.where("#{explore_filters[:speed_type]}_avg": 0...25)
          when "25-100"
            range_filters << ClientSpeedTest.where("#{explore_filters[:speed_type]}_avg": 25...100)
          when "100+"
            range_filters << ClientSpeedTest.where("#{explore_filters[:speed_type]}_avg": 100..)
          end
        end
        speed_tests = speed_tests.where(range_filters.reduce(:or))
      end

      if explore_filters[:connection_types].present?
        speed_tests = speed_tests.where("lower(network_type) IN (?)", explore_filters[:connection_types])
      end

      if explore_filters[:isp].present?
        speed_tests = speed_tests.where(autonomous_system: {autonomous_system_org_id: explore_filter[:isp]})
      end

      return speed_tests
    end

    def tiles_parameters
      explore_filters(:z, :x, :y)
    end

    def explore_filters(*extra_filters)
      params.with_defaults(
        global: true,
        speed_type: "download",
        speed_ranges: [],
        connection_types: [],
      )
    end

    def validate_explore_params
      # perform simple enum validations
      errors = {}
      unless ["download", "upload"].include?(explore_filters[:speed_type])
        errors["speed_type"] = "Can only be 'download' or 'upload'"
      end
      unless (explore_filters[:speed_ranges] - ["no_internet", "0-25", "25-100", "100+"]).length == 0
        errors["speed_ranges"] = "Must be either empty or an array with values: 'no_internet' or '0-25', '25-100', '100+'"
      end

      unless (explore_filters[:connection_types] - ["wifi", "wired", "cellular"]).length == 0
        errors["connection_types"] = "Must be either empty or an array with values: 'wifi', 'wired', 'cellular'"
      end

      if errors.present?
        render json: {errors: errors, error_code: "invalid"}, status: 422
        return
      end
    end
  end
end
