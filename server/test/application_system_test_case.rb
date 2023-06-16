require "test_helper"

class ApplicationSystemTestCase < ActionDispatch::SystemTestCase
  DRIVER = ENV["CI"] ? :headless_chrome : :chrome
  driven_by :selenium, using: DRIVER, screen_size: [1400, 1400]
end
