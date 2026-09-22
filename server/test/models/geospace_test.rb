require 'test_helper'

class GeospaceTest < ActiveSupport::TestCase
  # A triangle: (8 8) is inside its bounding box but outside the shape.
  TRIANGLE = "POLYGON((0 0, 10 0, 0 10, 0 0))"

  setup do
    set_up_geocoder
    @inside = location_at("POINT(2 2)")
    @in_bbox_only = location_at("POINT(8 8)")
    @outside = location_at("POINT(20 20)")
  end

  # Creating a location geocodes its address and overwrites lonlat, so the point is set afterwards.
  def location_at(point)
    location = Location.create!(name: "Loc #{point}", address: "New Address", account: accounts(:root), created_by_id: 1)
    location.update_column(:lonlat, point)
    location
  end

  test "creating a shape links only the locations it contains" do
    shape = Geospace.create!(name: "Triangle", namespace: "zip", geoid: "tri1", geom: TRIANGLE)

    assert_equal [@inside], shape.locations.to_a
  end

  test "link_all_locations adds missing links by containment and is idempotent" do
    shape = Geospace.create!(name: "Triangle", namespace: "zip", geoid: "tri2", geom: TRIANGLE)
    shape.locations.delete(@inside)
    assert_empty shape.locations.reload

    Geospace.link_all_locations(Geospace.zips)
    assert_equal [@inside], shape.locations.reload.to_a

    assert_no_difference -> { shape.locations.reload.count } do
      Geospace.link_all_locations(Geospace.zips)
    end
  end

  test "creating a shape does not link soft-deleted locations" do
    deleted = location_at("POINT(3 3)")
    deleted.soft_delete

    shape = Geospace.create!(name: "Triangle", namespace: "zip", geoid: "tri3", geom: TRIANGLE)

    # Bypass the locations default scope so a link row to the deleted location isn't hidden by it.
    assert_equal [@inside], shape.locations.with_deleted.to_a
  end
end
