require 'zip'

# Imports shapes from TIGER shapes dataset into geospaces table
# `rails runner db/custom_seeds/seed_fill_geospaces.rb` inside the
# /server directory.

Zip.unicode_names = true

def import_from_url(filename, ns, url)
  puts "Importing #{filename} from #{url}"

  res = HTTP.get(url, encoding: Encoding::UTF_8)
  return if res.code != 200

  Dir.mktmpdir do |dir|
    zip_path = File.join(dir, "#{filename}.zip")
    File.open(zip_path, 'w', encoding: Encoding::UTF_8) do |f|
      f.write(res.body)
    end

    # Extracts each file from the zip
    Zip::File.open(zip_path) do |zip_file|
      zip_file.each do |f|
        next if File.exist?(File.join(dir, f.name))

        zip_file.extract(f, f.name, destination_directory: dir)
      end
    end
    RGeo::Shapefile::Reader.open(File.join(dir, filename)) do |shape|
      shape.each do |record|
        name = if ns == 'zip'
                 record.attributes['GEOID20']
               else
                 record.attributes.include?('NAMELSAD') ? record.attributes['NAMELSAD'] : record.attributes['NAME'] || record.attributes['GEOID']
               end
        geoid = ns == 'zip' ? record.attributes['GEOID20'] : record.attributes['GEOID']
        Geospace.upsert({
                          name: name,
                          namespace: ns,
                          geom: record.geometry,
                          geoid: geoid

                        }, unique_by: %i[namespace geoid])
      end
    end
  end
end

# US

url = 'https://www2.census.gov/geo/tiger/GENZ2025/shp/cb_2025_us_nation_5m.zip'
import_from_url('cb_2025_us_nation_5m', 'country', url)

# States

url = 'https://www2.census.gov/geo/tiger/TIGER2025/STATE/tl_2025_us_state.zip'
import_from_url('tl_2025_us_state', 'state', url)

# Counties

url = 'https://www2.census.gov/geo/tiger/TIGER2025/COUNTY/tl_2025_us_county.zip'
import_from_url('tl_2025_us_county', 'county', url)

# Census Places

(1..78).each do |fips|
  fips = fips.to_s.rjust(2, '0')
  url = "https://www2.census.gov/geo/tiger/TIGER2025/PLACE/tl_2025_#{fips}_place.zip"
  import_from_url("tl_2025_#{fips}_place", 'census_place', url)
end

# Census Tracts

(1..78).each do |fips|
  fips = fips.to_s.rjust(2, '0')
  url = "https://www2.census.gov/geo/tiger/TIGER2025/TRACT/tl_2025_#{fips}_tract.zip"
  import_from_url("tl_2025_#{fips}_tract", 'census_tract', url)
end

url = 'https://www2.census.gov/geo/tiger/TIGER2025/ZCTA520/tl_2025_us_zcta520.zip'
import_from_url('tl_2025_us_zcta520', 'zip', url)
