# Custom Rake file for running specific seed files
# from /db/custom_seeds. In order to run specific
# seed files run:
# `rake db:seed:<filename>` where <filename> does
# not include the file extension, e.g.
# `rake db:seed:custom_file`.

namespace :db do
  namespace :seed do
    Dir[Rails.root.join('db', 'custom_seeds', '*.rb')].each do |filename|
      task_name = File.basename(filename, '.rb')
      desc "Seed " + task_name + ", based on the file with the same name in `db/custom_seeds/*.rb`"
      task task_name.to_sym => :environment do
        load(filename) if File.exist?(filename)
      end
    end
  end
end