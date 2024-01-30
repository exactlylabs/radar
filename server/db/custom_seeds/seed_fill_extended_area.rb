require 'csv'

STUDY_STATES = ["AK", "WV", "MI", "TX"]

CSV.foreach(Rails.root.join("db", "custom_seeds", "files", "hrsa_rural_list.csv"), headers: true, col_sep: ";") do |row|
  expanded_study_area = STUDY_STATES.include? row["ST"]
  if row["CT"].blank? # Whole county is designated as a rural area
    begin
      county = Geospace.find_by!(namespace: "county", geoid: row["CTY FIPS"])
    rescue ActiveRecord::RecordNotFound
      Rails.logger.info "County #{row["CTY FIPS"]} not found"
      next
    end
    county.update!(
      hrsa_designated_rural_area: true,
      expanded_study_area: expanded_study_area
    )
    geospaces = Geospace.arel_table
    Geospace.where(namespace: "census_tract").where(geospaces[:geom].st_within(county.geom)).update(
      hrsa_designated_rural_area: true,
      expanded_study_area: expanded_study_area
    )
  else
    Geospace.where(namespace: "census_tract", geoid: row["CT"]).update(
      hrsa_designated_rural_area: true,
      expanded_study_area: expanded_study_area
    )
  end
end
