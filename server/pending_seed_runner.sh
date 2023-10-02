# This script is intended to have the list of seed files to be run
# with a new deployment. This has to be maintained manually, appending
# each runner line to be executed all at once, and after a new deployment
# where we execute this file, these lines must be deleted as to avoid
# running the seed files more than once.
# This script must be run from the root directory.
# Whenever we add a new seed file, we need this file to get updated as well

rails runner db/custom_seeds/seed_disable_ftue_for_existing_users.rb