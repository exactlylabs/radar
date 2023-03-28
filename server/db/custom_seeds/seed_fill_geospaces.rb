require 'zip'

# Imports shapes from TIGER shapes dataset into geospaces table
# `rails runner db/custom_seeds/seed_fill_geospaces.rb` inside the
# /server directory.

Zip.unicode_names = true

def import_from_url(filename, ns, url)
  puts "Importing #{filename} from #{url}"

  res = HTTP.get(url, encoding: Encoding::UTF_8)
  if res.code != 200
    return
  end
  Dir.mktmpdir do |dir|
    zip_path = File.join(dir, "#{filename}.zip")
    File.open(zip_path, 'w', encoding: Encoding::UTF_8) do |f|
      f.write(res.body)
    end

    # Extracts each file from the zip
    Zip::File.open(zip_path) do |zip_file|
      zip_file.each do |f|
        fpath = File.join(dir, f.name)
        zip_file.extract(f, fpath) unless File.exist?(fpath)
      end
    end
    RGeo::Shapefile::Reader.open(File.join(dir, filename)) do |shape|
      shape.each do |record|
        if Geospace.where(geoid: record.attributes["GEOID"]).exists?
          next
        end
        Geospace.create(
          name: record.attributes["NAME"],
          namespace: ns,
          geom: record.geometry,
          geoid: record.attributes["GEOID"],
        )
      end
    end
  end
end

# Census Places

(1..78).each do |fips|
  fips = fips.to_s.rjust(2, "0")
  url="https://www2.census.gov/geo/tiger/TIGER2022/PLACE/tl_2022_#{fips}_place.zip"
  import_from_url("tl_2022_#{fips}_place", "census_place", url)  
end

# Counties

url="https://www2.census.gov/geo/tiger/TIGER2022/COUNTY/tl_2022_us_county.zip"
import_from_url("tl_2022_us_county", "county", url)
