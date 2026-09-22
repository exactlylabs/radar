# Multi-study Metrics Projection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the existing metrics projection serve a second study (Fresno County) with its own tree, completion threshold and notification setting, on one processor and one set of tables.

**Architecture:** A `Study` record holds per-study settings. Shape membership lives in a `geospaces_studies` join table. Every `study_aggregates` row belongs to one study's tree. The processor builds one tree per study of a point, and points with no study build nothing. "Completed" is derived from `days_online` against the study's threshold.

**Tech Stack:** Rails 6.1, PostgreSQL + PostGIS (`activerecord-postgis-adapter`), Minitest with fixtures, Sidekiq.

**Spec:** `docs/superpowers/specs/2026-09-21-multi-study-metrics-projection-design.md`

## Global Constraints

- Rails 6.1. Migrations use `ActiveRecord::Migration[6.1]`.
- Tests are Minitest with `fixtures :all`. Run one file with `bin/rails test <path>`.
- No geometry in processor tests. The processor reads a location's shapes from the `geospaces_locations` join table when given a `location_id`, so tests link shapes to locations by hand.
- Comments only where the logic is not obvious. No commented-out code, no placeholders.
- Errors raise. Do not rescue and log.
- Commit messages: short, lowercase, present tense, like the repo history. No `Co-Authored-By` line.
- The join table is `geospaces_studies`, the Rails default name for a `has_and_belongs_to_many`. The schema change is split into two migrations so every task keeps the suite green. Both run in the same deploy.

## File map

| File | Responsibility |
|------|----------------|
| `db/migrate/20260921120000_add_studies.rb` | Create `studies`, `geospaces_studies`, `study_aggregates.study_id`; backfill the rural study; unique identity index |
| `db/migrate/20260921120100_drop_study_geospace_and_completed.rb` | Drop the two replaced columns |
| `app/models/study.rb` | Study settings, membership, `populate_aggregates!` |
| `app/models/geospace.rb` | Membership association, new scopes, per-study aggregate lookup, containment linking |
| `app/reporting_models/study_aggregate.rb` | `find_or_create_for!`, the one place that knows an aggregate row's identity |
| `app/models/location.rb` | `notifying_study` |
| `app/jobs/location_notification_jobs.rb` | Goal alerts only for a notifying study |
| `lib/events_notifier/discord_notifier.rb`, `local_notifier.rb` | Route by `notifying_study` |
| `app/eventhandlers/study_metrics_projection_processor/common.rb` | Per-study tree building, counting filter, completion threshold |
| `.../measurements_processor.rb`, `events_processor.rb`, `daily_trigger_processor.rb` | Use the new helpers |
| `.../processor.rb` | Load studies, `clear` removes study-less aggregates |
| `db/custom_seeds/seed_fresno_study.rb` | Create and tag the Fresno study |
| `db/custom_seeds/seed_fill_study_geospace.rb` | Tag the rural study through the join table |
| `analytics/study_performance/**` | Dashboard study filter |
| `test/fixtures/{studies,geospaces,study_aggregates}.yml` | Fixtures |
| `test/models/study_test.rb`, `test/models/geospace_test.rb`, `test/reporting_models/study_aggregate_test.rb`, `test/eventhandlers/study_metrics_projection_processor_test.rb`, `test/jobs/location_notification_test.rb` | Tests |

---

### Task 1: Studies schema, `Study` model, fixtures

**Files:**
- Create: `db/migrate/20260921120000_add_studies.rb`
- Create: `app/models/study.rb`
- Create: `test/fixtures/studies.yml`
- Create: `test/models/study_test.rb`
- Modify: `app/models/geospace.rb:11-18`
- Modify: `app/reporting_models/study_aggregate.rb:1-10`
- Modify: `test/fixtures/geospaces.yml`
- Modify: `test/fixtures/study_aggregates.yml`

**Interfaces:**
- Produces: `Study` with columns `name`, `completion_days`, `notifications_enabled`, `level_census_place`, `level_census_tract`, `level_zip`, `level_isp_county`; `Study#geospaces`, `Geospace#studies` (HABTM through `geospaces_studies`); `StudyAggregate#study`; scopes `Geospace.census_tracts`, `Geospace.zips`; fixtures `studies(:rural)`, `studies(:fresno)`, `geospaces(:fresno_state)`, `geospaces(:fresno_county)`, `geospaces(:fresno_other_county)`, `geospaces(:fresno_tract)`, `geospaces(:fresno_zip)`.

- [ ] **Step 1: Write the failing test**

Create `test/models/study_test.rb`:

```ruby
require 'test_helper'

class StudyTest < ActiveSupport::TestCase
  test "fixtures link the rural study to its shapes on both sides" do
    rural = studies(:rural)

    assert_equal 90, rural.completion_days
    assert rural.notifications_enabled
    assert_equal [geospaces(:study_county), geospaces(:study_place), geospaces(:study_state)].map(&:id).sort, rural.geospaces.pluck(:id).sort
    assert_includes geospaces(:study_county).studies, rural
    assert_equal rural, study_aggregates(:study_county).study
  end

  test "fresno study has notifications off and a seven day threshold" do
    fresno = studies(:fresno)

    assert_equal 7, fresno.completion_days
    assert_not fresno.notifications_enabled
    assert fresno.level_census_tract
    assert fresno.level_zip
    assert_not fresno.level_census_place
  end

  test "name must be unique and completion_days positive" do
    assert_not Study.new(name: "rural", completion_days: 1).valid?
    assert_not Study.new(name: "new", completion_days: 0).valid?
    assert Study.new(name: "new", completion_days: 1).valid?
  end
end
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bin/rails test test/models/study_test.rb`
Expected: FAIL with `NameError: uninitialized constant StudyTest::Study` or a fixture error for `studies`.

- [ ] **Step 3: Write the migration**

Create `db/migrate/20260921120000_add_studies.rb`:

```ruby
class AddStudies < ActiveRecord::Migration[6.1]
  def up
    create_table :studies do |t|
      t.string :name, null: false
      t.integer :completion_days, null: false
      t.boolean :notifications_enabled, null: false, default: false
      t.boolean :level_census_place, null: false, default: false
      t.boolean :level_census_tract, null: false, default: false
      t.boolean :level_zip, null: false, default: false
      t.boolean :level_isp_county, null: false, default: false
      t.timestamps
    end
    add_index :studies, :name, unique: true

    create_join_table :geospaces, :studies do |t|
      t.index [:study_id, :geospace_id], unique: true
      t.index :geospace_id
    end

    add_reference :study_aggregates, :study, index: true

    rural_id = execute(<<~SQL).first["id"]
      INSERT INTO studies (name, completion_days, notifications_enabled, level_census_place, level_isp_county, created_at, updated_at)
      VALUES ('rural', 90, true, true, true, NOW(), NOW())
      RETURNING id
    SQL

    execute <<~SQL
      INSERT INTO geospaces_studies (geospace_id, study_id)
      SELECT id, #{rural_id} FROM geospaces WHERE study_geospace = true
    SQL

    execute <<~SQL
      UPDATE study_aggregates SET study_id = #{rural_id}
      WHERE level IN ('state', 'state_with_study_only')
        AND geospace_id IN (SELECT geospace_id FROM geospaces_studies WHERE study_id = #{rural_id})
    SQL

    # Children of rural states (county, isp_county), then their children (census_place).
    2.times do
      execute <<~SQL
        UPDATE study_aggregates SET study_id = #{rural_id}
        WHERE study_id IS NULL
          AND parent_aggregate_id IN (SELECT id FROM study_aggregates WHERE study_id = #{rural_id})
      SQL
    end

    duplicates = execute(<<~SQL).to_a
      SELECT study_id, level, geospace_id, COALESCE(autonomous_system_org_id, 0) AS org_id, COALESCE(parent_aggregate_id, 0) AS parent_id, COUNT(*) AS rows
      FROM study_aggregates
      WHERE study_id IS NOT NULL
      GROUP BY 1, 2, 3, 4, 5
      HAVING COUNT(*) > 1
    SQL
    raise "Duplicate study aggregates, merge them before migrating: #{duplicates.inspect}" if duplicates.any?

    add_index :study_aggregates, "study_id, level, geospace_id, COALESCE(autonomous_system_org_id, 0), COALESCE(parent_aggregate_id, 0)",
      unique: true, name: "index_study_aggregates_on_identity"
  end

  def down
    remove_index :study_aggregates, name: "index_study_aggregates_on_identity"
    remove_reference :study_aggregates, :study
    drop_join_table :geospaces, :studies
    drop_table :studies
  end
end
```

- [ ] **Step 4: Write the `Study` model and associations**

Create `app/models/study.rb`:

```ruby
class Study < ApplicationRecord
  has_and_belongs_to_many :geospaces
  has_many :study_aggregates

  validates :name, presence: true, uniqueness: true
  validates :completion_days, numericality: { only_integer: true, greater_than: 0 }
end
```

In `app/models/geospace.rb`, replace lines 11-18 (the associations and scopes block) with:

```ruby
  has_and_belongs_to_many :locations
  has_and_belongs_to_many :autonomous_system_orgs
  has_and_belongs_to_many :studies
  has_many :notified_study_goals
  has_many :study_aggregates

  scope :states, -> { where(namespace: "state") }
  scope :counties, -> { where(namespace: "county") }
  scope :census_places, -> { where(namespace: "census_place") }
  scope :census_tracts, -> { where(namespace: "census_tract") }
  scope :zips, -> { where(namespace: "zip") }
```

The `study_geospaces` scope is removed. Nothing calls it.

In `app/reporting_models/study_aggregate.rb`, add after line 2 (`belongs_to :geospace, optional: true`):

```ruby
  belongs_to :study, optional: true
```

- [ ] **Step 5: Write the fixtures**

Create `test/fixtures/studies.yml`:

```yaml
rural:
  name: rural
  completion_days: 90
  notifications_enabled: true
  level_census_place: true
  level_isp_county: true
  geospaces: study_state, study_county, study_place

fresno:
  name: fresno
  completion_days: 7
  notifications_enabled: false
  level_census_tract: true
  level_zip: true
  level_isp_county: true
  geospaces: fresno_state, fresno_county, fresno_tract, fresno_zip
```

Append to `test/fixtures/geospaces.yml` (keep the existing entries and their `study_geospace: true` lines for now; Task 9 removes them):

```yaml

fresno_state:
  name: California
  namespace: state
  geoid: "06"

fresno_county:
  name: Fresno County
  namespace: county
  geoid: "06019"

fresno_other_county:
  name: Los Angeles County
  namespace: county
  geoid: "06037"

fresno_tract:
  name: Census Tract 1
  namespace: census_tract
  geoid: "06019000100"

fresno_zip:
  name: "93701"
  namespace: zip
  geoid: "93701"
```

In `test/fixtures/study_aggregates.yml`, add `study: rural` to every entry. The file becomes:

```yaml
state_non_study:
  name: State 1
  level: state
  study_aggregate: false
  geospace: state1
  study: rural

study_state:
  name: State 1
  level: state
  study_aggregate: true
  geospace: study_state
  study: rural

county_non_study:
  name: County 1
  level: county
  study_aggregate: false
  geospace: county1
  study: rural

study_county:
  name: County 1
  level: county
  study_aggregate: true
  geospace: study_county
  study: rural

place_non_study:
  name: Place 1
  level: census_place
  study_aggregate: false
  geospace: place1
  study: rural

study_place:
  name: Place 1
  level: census_place
  study_aggregate: true
  geospace: study_place
  study: rural
```

- [ ] **Step 6: Migrate and run the test**

Run: `bin/rails db:migrate && bin/rails test test/models/study_test.rb`
Expected: `db/schema.rb` gains `studies`, `geospaces_studies`, `study_aggregates.study_id` and the identity index. Test: 3 runs, 0 failures.

- [ ] **Step 7: Run the whole suite**

Run: `bin/rails test`
Expected: same result as before this task. The old `study_geospace` column still exists, so nothing else changes yet.

- [ ] **Step 8: Commit**

```bash
git add db/migrate/20260921120000_add_studies.rb db/schema.rb app/models/study.rb app/models/geospace.rb app/reporting_models/study_aggregate.rb test/fixtures/studies.yml test/fixtures/geospaces.yml test/fixtures/study_aggregates.yml test/models/study_test.rb
git commit -m "adds studies table and rural study backfill"
```

---

### Task 2: `StudyAggregate.find_or_create_for!`

**Files:**
- Modify: `app/reporting_models/study_aggregate.rb`
- Create: `test/reporting_models/study_aggregate_test.rb`

**Interfaces:**
- Produces: `StudyAggregate.find_or_create_for!(study:, level:, geospace_id:, name:, parent:, study_shape:, autonomous_system_org_id: nil)` returning the saved row, and `StudyAggregate.isp_county_name(org_name, county_name)` returning `"#{org_name} -> #{county_name}"`. Both are used by Task 4 (processor) and Task 7 (populate).

- [ ] **Step 1: Write the failing test**

Create `test/reporting_models/study_aggregate_test.rb`:

```ruby
require 'test_helper'

class StudyAggregateTest < ActiveSupport::TestCase
  test "find_or_create_for! creates a row keyed by study, level, shape and isp" do
    fresno = studies(:fresno)
    county = geospaces(:fresno_county)

    row = nil
    assert_difference 'StudyAggregate.count', 1 do
      row = StudyAggregate.find_or_create_for!(
        study: fresno, level: 'county', geospace_id: county.id, name: county.name, parent: nil, study_shape: true
      )
    end

    assert_equal fresno, row.study
    assert_equal 'county', row.level
    assert_equal county, row.geospace
    assert_equal "Fresno County", row.name
    assert row.study_aggregate
    assert_nil row.autonomous_system_org_id
  end

  test "find_or_create_for! updates the flag and parent of an existing row instead of creating a second one" do
    fresno = studies(:fresno)
    state = geospaces(:fresno_state)
    county = geospaces(:fresno_other_county)
    state_row = StudyAggregate.find_or_create_for!(study: fresno, level: 'state', geospace_id: state.id, name: state.name, parent: nil, study_shape: true)
    first = StudyAggregate.find_or_create_for!(study: fresno, level: 'county', geospace_id: county.id, name: county.name, parent: state_row, study_shape: false)

    assert_no_difference 'StudyAggregate.count' do
      StudyAggregate.find_or_create_for!(study: fresno, level: 'county', geospace_id: county.id, name: county.name, parent: state_row, study_shape: true)
    end

    assert first.reload.study_aggregate
    assert_equal state_row, first.parent_aggregate
  end

  test "isp rows are distinct per isp and named after the org" do
    fresno = studies(:fresno)
    county = geospaces(:fresno_county)
    org1 = autonomous_system_orgs(:as_org1)
    org2 = autonomous_system_orgs(:as_org2)

    assert_difference 'StudyAggregate.count', 2 do
      [org1, org2].each do |org|
        StudyAggregate.find_or_create_for!(
          study: fresno, level: 'isp_county', geospace_id: county.id,
          name: StudyAggregate.isp_county_name(org.name, county.name),
          parent: nil, study_shape: true, autonomous_system_org_id: org.id
        )
      end
    end

    row = StudyAggregate.find_by!(study: fresno, level: 'isp_county', geospace_id: county.id, autonomous_system_org_id: org1.id)
    assert_equal "Test Org 1 -> Fresno County", row.name
  end
end
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bin/rails test test/reporting_models/study_aggregate_test.rb`
Expected: FAIL with `NoMethodError: undefined method 'find_or_create_for!'`.

- [ ] **Step 3: Implement**

In `app/reporting_models/study_aggregate.rb`, add these two class methods after the `having_location_id` scope and delete `populate_from_geospaces!` entirely (Task 7 replaces it with `Study#populate_aggregates!`):

```ruby
  def self.isp_county_name(org_name, county_name)
    "#{org_name} -> #{county_name}"
  end

  # The row identity is (study, level, shape, isp, parent). A shape spanning two parents, such as
  # a census place across two counties, gets one row per parent. Name and the study flag are
  # updated in place, so tagging a shape into a study later flips the existing row instead of adding one.
  def self.find_or_create_for!(study:, level:, geospace_id:, name:, parent:, study_shape:, autonomous_system_org_id: nil)
    aggregate = find_or_initialize_by(
      study_id: study.id, level: level, geospace_id: geospace_id,
      autonomous_system_org_id: autonomous_system_org_id, parent_aggregate_id: parent&.id
    )
    aggregate.name = name
    aggregate.study_aggregate = study_shape
    aggregate.save! if aggregate.new_record? || aggregate.changed?
    aggregate
  end
```

The file after this task:

```ruby
class StudyAggregate < ActiveRecord::Base
  belongs_to :geospace, optional: true
  belongs_to :study, optional: true
  belongs_to :autonomous_system_org, optional: true
  belongs_to :parent_aggregate, class_name: 'StudyAggregate', optional: true
  has_many :study_aggregates, foreign_key: :parent_aggregate_id
  has_many :study_level_projections
  has_many :study_level_measurements_projections

  scope :having_location_id, ->(location_id) { joins(:geospace => :locations).where("locations.id = ?", location_id) }

  def self.isp_county_name(org_name, county_name)
    "#{org_name} -> #{county_name}"
  end

  # The row identity is (study, level, shape, isp, parent). A shape spanning two parents, such as
  # a census place across two counties, gets one row per parent. Name and the study flag are
  # updated in place, so tagging a shape into a study later flips the existing row instead of adding one.
  def self.find_or_create_for!(study:, level:, geospace_id:, name:, parent:, study_shape:, autonomous_system_org_id: nil)
    aggregate = find_or_initialize_by(
      study_id: study.id, level: level, geospace_id: geospace_id,
      autonomous_system_org_id: autonomous_system_org_id, parent_aggregate_id: parent&.id
    )
    aggregate.name = name
    aggregate.study_aggregate = study_shape
    aggregate.save! if aggregate.new_record? || aggregate.changed?
    aggregate
  end
end
```

- [ ] **Step 4: Run the test**

Run: `bin/rails test test/reporting_models/study_aggregate_test.rb`
Expected: 3 runs, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add app/reporting_models/study_aggregate.rb test/reporting_models/study_aggregate_test.rb
git commit -m "adds StudyAggregate.find_or_create_for! keyed by study, level, shape and isp"
```

---

### Task 3: Notifications only for a notifying study

**Files:**
- Modify: `app/models/location.rb:310-316`
- Modify: `app/models/geospace.rb` (`study_aggregate_by_level`)
- Modify: `app/jobs/location_notification_jobs.rb:46-53`
- Modify: `lib/events_notifier/discord_notifier.rb:58-60, 81-82, 97-98, 208`
- Modify: `lib/events_notifier/local_notifier.rb:86`
- Modify: `test/jobs/location_notification_test.rb`

**Interfaces:**
- Produces: `Location#notifying_study` returning the county's `Study` with `notifications_enabled`, or nil. `Geospace#study_aggregate_by_level(study, level)`.
- Removes: `Location#study_state?`, `Location#study_county?`.

- [ ] **Step 1: Write the failing tests**

Append to `test/jobs/location_notification_test.rb`, inside the class, before the final `end`:

```ruby
  test "When_county_belongs_to_a_study_with_notifications_off_Expect_no_goal_notification" do
    locations = []
    (1..Location::LOCATIONS_PER_COUNTY_GOAL).each do |i|
      l = Location.create!(
        name: "Loc #{i}", address: "New Address", account: accounts(:root), created_by_id: 1, lonlat: "POINT(#{i} #{i})",
        online: true
      )
      l.geospaces << [geospaces(:fresno_state), geospaces(:fresno_county)]
      l.save!
      locations << l
    end

    EventsNotifier.stub :notify_study_goal_reached, -> (*args) { raise "notify_study_goal_reached shouldn't be called" } do
      LocationNotificationJobs::NotifyLocationOnline.perform_now(locations[-1], Time.now)
    end
  end

  test "When_location_is_in_a_notifying_study_county_Expect_notifying_study_to_be_that_study" do
    l = Location.create!(name: "Loc", address: "New Address", account: accounts(:root), created_by_id: 1, lonlat: "POINT(9 9)")
    l.geospaces << [geospaces(:study_state), geospaces(:study_county)]

    assert_equal studies(:rural), l.notifying_study
  end

  test "When_location_is_in_a_silent_study_county_Expect_notifying_study_to_be_nil" do
    l = Location.create!(name: "Loc", address: "New Address", account: accounts(:root), created_by_id: 1, lonlat: "POINT(9 9)")
    l.geospaces << [geospaces(:fresno_state), geospaces(:fresno_county)]

    assert_nil l.notifying_study
  end
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bin/rails test test/jobs/location_notification_test.rb`
Expected: the two `notifying_study` tests FAIL with `NoMethodError`. The "notifications off" test FAILS because the job still checks `study_geospace?`, which is false for `fresno_county`, so it passes by accident. Read the output and confirm at least the two `NoMethodError` failures.

- [ ] **Step 3: Implement `notifying_study` and the per-study aggregate lookup**

In `app/models/location.rb`, replace lines 310-316 (`study_state?` and `study_county?`) with:

```ruby
  def notifying_study
    county_geospace&.studies&.find_by(notifications_enabled: true)
  end
```

In `app/models/geospace.rb`, replace `study_aggregate_by_level`:

```ruby
  def study_aggregate_by_level(study, level)
    study_aggregates.find_by(study_id: study.id, level: level)
  end
```

- [ ] **Step 4: Update the notification job**

In `app/jobs/location_notification_jobs.rb`, in `NotifyLocationOnline#perform`, replace lines 46-53:

```ruby
      return unless location_info&.county&.study_geospace?

      county_goal = location_info&.county&.study_aggregate_by_level('county')&.locations_goal || Location::LOCATIONS_PER_COUNTY_GOAL
      place_goal = location_info&.place&.study_aggregate_by_level('census_place')&.locations_goal || Location::LOCATIONS_PER_PLACE_GOAL

      isp_county_goal = Location::LOCATIONS_PER_ISP_PER_COUNTY_GOAL
      if as_org.present?
        isp_county_goal = location_info&.county.study_aggregate_by_level('isp_county')&.locations_goal || Location::LOCATIONS_PER_ISP_PER_COUNTY_GOAL
      end
```

with:

```ruby
      study = location.notifying_study
      return unless study

      county_goal = location_info.county.study_aggregate_by_level(study, 'county')&.locations_goal || Location::LOCATIONS_PER_COUNTY_GOAL
      place_goal = location_info.place&.study_aggregate_by_level(study, 'census_place')&.locations_goal || Location::LOCATIONS_PER_PLACE_GOAL

      isp_county_goal = Location::LOCATIONS_PER_ISP_PER_COUNTY_GOAL
      if as_org.present?
        isp_county_goal = location_info.county.study_aggregate_by_level(study, 'isp_county')&.locations_goal || Location::LOCATIONS_PER_ISP_PER_COUNTY_GOAL
      end
```

- [ ] **Step 5: Update the notifiers**

In `lib/events_notifier/discord_notifier.rb`:

Line 59, in `notify_new_location`:
```ruby
    if !location_info.location.notifying_study
```

Lines 81-82, in `notify_location_online`:
```ruby
    in_study = location_info.location.notifying_study.present?
    client = in_study ? @tbp_alerts_client : @client
    fill_fn = in_study ? method(:fill_study_online_notification_fieldset) : method(:fill_online_notification_fieldset)
```

Lines 97-98, in `notify_location_offline`: same three lines as above.

Line 208, in `fill_default_study_location_fieldset`:
```ruby
    fieldset.add_field(name: "County", value: location_info.county.name + " (#{location_info.location.notifying_study ? "Inside" : "Outside"} Study Area)") if location_info.county
```

In `lib/events_notifier/local_notifier.rb` line 86:
```ruby
      * Location Study: #{location_info.location.notifying_study&.name}
```

- [ ] **Step 6: Confirm nothing else calls the removed methods**

Run: `grep -rn -E 'study_state\?|study_county\?|study_aggregate_by_level\(' app lib test`
Expected: only the new `notifying_study` definition context and the three two-argument `study_aggregate_by_level(study, ...)` calls in the job.

- [ ] **Step 7: Run the tests**

Run: `bin/rails test test/jobs/location_notification_test.rb`
Expected: all runs pass, including the four pre-existing goal tests. They rely on `studies(:rural)` having notifications on and on the `study_*` aggregates carrying `study: rural`, both set in Task 1.

- [ ] **Step 8: Commit**

```bash
git add app/models/location.rb app/models/geospace.rb app/jobs/location_notification_jobs.rb lib/events_notifier/discord_notifier.rb lib/events_notifier/local_notifier.rb test/jobs/location_notification_test.rb
git commit -m "routes study notifications by the county's notifying study"
```

---

### Task 4: Processor builds one tree per study

**Files:**
- Modify: `app/eventhandlers/study_metrics_projection_processor/common.rb`
- Modify: `app/eventhandlers/study_metrics_projection_processor/measurements_processor.rb`
- Modify: `app/eventhandlers/study_metrics_projection_processor/events_processor.rb:111-140`
- Modify: `app/eventhandlers/study_metrics_projection_processor/daily_trigger_processor.rb:34-47`
- Modify: `app/eventhandlers/study_metrics_projection_processor/processor.rb:16-36, 66-68`
- Create: `test/eventhandlers/study_metrics_projection_processor_test.rb`

**Interfaces:**
- Consumes: `StudyAggregate.find_or_create_for!`, `StudyAggregate.isp_county_name` (Task 2); `Study` columns (Task 1).
- Produces: `Common#aggregates_to_count(aggs)`, `Common#completion_days_for(aggregate)`, `Common#completion_thresholds`; `Processor#initialize` loads `@studies_by_id`. Task 5 uses the last two.

- [ ] **Step 1: Write the failing tests**

Create `test/eventhandlers/study_metrics_projection_processor_test.rb`:

```ruby
require 'test_helper'

class StudyMetricsProjectionProcessorTest < ActiveSupport::TestCase
  setup do
    set_up_geocoder
    @as_org = autonomous_system_orgs(:as_org1)
    @processor = StudyMetricsProjectionProcessor::Processor.new
  end

  # Links a new location to the given shapes by hand. The processor reads a location's shapes
  # from geospaces_locations, so no geometry is needed. Creating a location geocodes its address
  # and overwrites lonlat, so the point is set afterwards without callbacks.
  def location_in(*shapes, point:)
    location = Location.create!(name: "Loc #{point}", address: "New Address", account: accounts(:root), created_by_id: 1)
    location.update_column(:lonlat, point)
    location.geospaces << shapes
    location
  end

  def projections
    @processor.instance_variable_get(:@consumer_offset).state["projections"]
  end

  def measure(location, longitude, latitude, processor: @processor)
    processor.handle_measurement(1, location.id, longitude, latitude, Time.now, @as_org.id, @as_org.name)
  end

  test "point in a rural study county builds the rural tree and reuses existing rows" do
    location = location_in(geospaces(:study_state), geospaces(:study_county), geospaces(:study_place), point: "POINT(1 1)")

    measure(location, 1.0, 1.0)

    rural = studies(:rural)
    shapes = [geospaces(:study_state), geospaces(:study_county), geospaces(:study_place)]
    levels = StudyAggregate.where(study: rural, geospace: shapes).pluck(:level).sort
    assert_equal %w[census_place county isp_county state state_with_study_only], levels
    assert_equal 1, StudyAggregate.where(study: rural, level: 'county', geospace: geospaces(:study_county)).count
    assert StudyAggregate.where(study: rural, level: %w[census_tract zip]).none?

    county = study_aggregates(:study_county)
    assert_equal 1, @processor.get_projection(county.id, county.parent_aggregate_id, @as_org.id)["measurements_count"]
    state_only = StudyAggregate.find_by!(study: rural, level: 'state_with_study_only', geospace: geospaces(:study_state))
    assert_equal 1, projections["#{state_only.id}-#{@as_org.id}"]["measurements_count"]
  end

  test "point in a fresno tract builds tract under county and zip under state, no place" do
    location = location_in(
      geospaces(:fresno_state), geospaces(:fresno_county), geospaces(:fresno_tract), geospaces(:fresno_zip), point: "POINT(2 2)"
    )

    measure(location, 2.0, 2.0)

    fresno = studies(:fresno)
    state = StudyAggregate.find_by!(study: fresno, level: 'state', geospace: geospaces(:fresno_state))
    county = StudyAggregate.find_by!(study: fresno, level: 'county', geospace: geospaces(:fresno_county))
    tract = StudyAggregate.find_by!(study: fresno, level: 'census_tract', geospace: geospaces(:fresno_tract))
    zip = StudyAggregate.find_by!(study: fresno, level: 'zip', geospace: geospaces(:fresno_zip))
    isp = StudyAggregate.find_by!(study: fresno, level: 'isp_county', geospace: geospaces(:fresno_county), autonomous_system_org_id: @as_org.id)

    assert_equal county, tract.parent_aggregate
    assert_equal state, zip.parent_aggregate
    assert_equal state, isp.parent_aggregate
    assert [state, county, tract, zip, isp].all?(&:study_aggregate)
    assert StudyAggregate.where(study: fresno, level: 'census_place').none?
    assert_equal 1, @processor.get_projection(tract.id, county.id, @as_org.id)["measurements_count"]
    assert_equal 1, @processor.get_projection(zip.id, state.id, @as_org.id)["measurements_count"]
  end

  test "point in a non-study county of a study state builds an other row and skips the study-only state" do
    location = location_in(geospaces(:fresno_state), geospaces(:fresno_other_county), point: "POINT(3 3)")

    measure(location, 3.0, 3.0)

    fresno = studies(:fresno)
    county = StudyAggregate.find_by!(study: fresno, level: 'county', geospace: geospaces(:fresno_other_county))
    assert_not county.study_aggregate
    assert_equal 1, projections["#{county.id}-#{@as_org.id}"]["measurements_count"]

    state_only = StudyAggregate.find_by!(study: fresno, level: 'state_with_study_only', geospace: geospaces(:fresno_state))
    assert_nil projections["#{state_only.id}-#{@as_org.id}"]
  end

  test "point outside every study builds nothing" do
    location = location_in(geospaces(:state2), geospaces(:county2), point: "POINT(4 4)")

    assert_no_difference 'StudyAggregate.count' do
      measure(location, 4.0, 4.0)
    end
    assert_empty projections
  end

  test "tagging a shape into a study updates the existing aggregate instead of creating a second one" do
    location = location_in(geospaces(:fresno_state), geospaces(:fresno_other_county), point: "POINT(5 5)")
    measure(location, 5.0, 5.0)
    county = StudyAggregate.find_by!(study: studies(:fresno), level: 'county', geospace: geospaces(:fresno_other_county))
    assert_not county.study_aggregate

    studies(:fresno).geospaces << geospaces(:fresno_other_county)
    fresh_processor = StudyMetricsProjectionProcessor::Processor.new

    assert_no_difference 'StudyAggregate.count' do
      measure(location, 5.0, 5.0, processor: fresh_processor)
    end
    assert county.reload.study_aggregate
  end
end
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bin/rails test test/eventhandlers/study_metrics_projection_processor_test.rb`
Expected: FAIL. The "outside every study" test fails because today's code creates rows for any point. The fresno test fails because no `census_tract` row exists.

- [ ] **Step 3: Rewrite `common.rb`**

Replace the whole file `app/eventhandlers/study_metrics_projection_processor/common.rb` with:

```ruby
module StudyMetricsProjectionProcessor
  module Common
    def as_org_info(autonomous_system_id)
      if autonomous_system_id.nil?
        return nil, nil
      end
      @as_orgs_cache ||= {}
      if @as_orgs_cache[autonomous_system_id].nil?
        as_org_id, as_org_name = AutonomousSystem.joins(:autonomous_system_org).where("autonomous_systems.id = ?", autonomous_system_id).pluck(
          "autonomous_system_orgs.id, autonomous_system_orgs.name"
        ).first
        @as_orgs_cache[autonomous_system_id] = [as_org_id, as_org_name]
      end
      return @as_orgs_cache[autonomous_system_id]
    end

    def get_projection(study_aggregate_id, parent_aggregate_id, as_org_id)
      proj = @consumer_offset.state["projections"]["#{study_aggregate_id}-#{as_org_id}"]
      if proj.nil?
        proj = {
          "parent_aggregate_id" => parent_aggregate_id,
          "study_aggregate_id" => study_aggregate_id,
          "autonomous_system_org_id" => as_org_id,
          "online_pods_count" => 0,
          "online_locations_count" => 0,
          "measurements_count" => 0,
          "points_with_tests_count" => 0,
          "completed_locations_count" => 0,
          "completed_and_online_locations_count" => 0,
        }
        @consumer_offset.state["projections"]["#{study_aggregate_id}-#{as_org_id}"] = proj
      end
      return proj
    end

    # One tree per study of the point. A point whose shapes belong to no study returns [].
    def get_aggregates_for_point(longitude, latitude, as_org_id, as_org_name, **opts)
      @aggregates_cache ||= {}
      return [] if longitude.nil?

      key = "#{latitude}-#{longitude}-#{as_org_id}"
      if @aggregates_cache[key].nil?
        Rails.logger.debug "Loading Geospaces for point #{latitude}, #{longitude}, #{opts}"
        t = Time.now
        geospaces = load_geospaces_for_point(longitude, latitude, **opts)
        Rails.logger.debug "Loaded Geospaces in #{Time.now - t} seconds"

        @aggregates_cache[key] = studies_for(geospaces).flat_map do |study|
          build_study_tree(study, geospaces, as_org_id, as_org_name)
        end
      end
      return @aggregates_cache[key].dup
    end

    # The study-only state aggregate counts a point only when the point sits in a study county of the same study.
    def aggregates_to_count(aggs)
      aggs.reject do |agg|
        agg.level == 'state_with_study_only' &&
          aggs.none? { |a| a.level == 'county' && a.study_aggregate && a.study_id == agg.study_id }
      end
    end

    def completion_days_for(aggregate)
      @studies_by_id.fetch(aggregate.study_id).completion_days
    end

    def completion_thresholds
      @completion_thresholds ||= @studies_by_id.values.map(&:completion_days).uniq
    end

    def get_location_metadata(location_id)
      @location_metadatas["#{location_id}"] ||= LocationMetadataProjection.find_or_create_by!(location_id: location_id)
    end

    def load_location_metadatas()
      meta = {}
      LocationMetadataProjection.all.each do |lm|
        meta["#{lm.location_id}"] = lm
      end
      meta
    end

    private

    def studies_for(geospaces)
      geospaces.flat_map { |g| g["study_ids"] }.uniq.map { |id| @studies_by_id.fetch(id) }
    end

    def build_study_tree(study, geospaces, as_org_id, as_org_name)
      state = geospaces.find { |g| g["ns"] == "state" }
      return [] if state.nil?

      aggs = []
      state_agg = load_aggregate(study, 'state', state, parent: nil)
      aggs << state_agg
      aggs << load_aggregate(study, 'state_with_study_only', state, parent: nil)

      county = geospaces.find { |g| g["ns"] == "county" }
      return aggs if county.nil?

      county_agg = load_aggregate(study, 'county', county, parent: state_agg)
      aggs << county_agg

      if study.level_isp_county && as_org_id.present?
        aggs << load_aggregate(study, 'isp_county', county, parent: state_agg, as_org_id: as_org_id, as_org_name: as_org_name)
      end

      if study.level_census_place
        place = geospaces.find { |g| g["ns"] == "census_place" }
        aggs << load_aggregate(study, 'census_place', place, parent: county_agg, study_shape: county_agg.study_aggregate) if place
      end

      if study.level_census_tract
        tract = geospaces.find { |g| g["ns"] == "census_tract" && g["study_ids"].include?(study.id) }
        aggs << load_aggregate(study, 'census_tract', tract, parent: county_agg) if tract
      end

      if study.level_zip
        zip = geospaces.find { |g| g["ns"] == "zip" && g["study_ids"].include?(study.id) }
        aggs << load_aggregate(study, 'zip', zip, parent: state_agg) if zip
      end

      aggs
    end

    def load_aggregate(study, level, geospace, parent:, as_org_id: nil, as_org_name: nil, study_shape: nil)
      study_shape = geospace["study_ids"].include?(study.id) if study_shape.nil?
      name = level == 'isp_county' ? StudyAggregate.isp_county_name(as_org_name, geospace["name"]) : geospace["name"]
      StudyAggregate.find_or_create_for!(
        study: study, level: level, geospace_id: geospace["id"], name: name,
        parent: parent, study_shape: study_shape, autonomous_system_org_id: as_org_id
      )
    end

    def load_geospaces_for_point(longitude, latitude, **opts)
      scope =
        if opts[:location].present?
          opts[:location].geospaces
        elsif opts[:location_id].present?
          Geospace.joins(:locations).where("locations.id = ?", opts[:location_id])
        else
          Geospace.containing_point(longitude, latitude)
        end

      scope.includes(:studies).map do |geospace|
        {
          "id" => geospace.id, "ns" => geospace.namespace, "name" => geospace.name,
          "study_ids" => geospace.studies.map(&:id),
        }
      end
    end

    def location_lonlat(location_id)
      if @lonlats[location_id].nil?
        begin
          location = Location.with_deleted.find(location_id)
        rescue ActiveRecord::RecordNotFound
          return
        end
        @lonlats[location_id] = location.lonlat
      end
      @lonlats[location_id]
    end
  end
end
```

- [ ] **Step 4: Use the counting helper in the measurement and event handlers**

Replace the whole file `app/eventhandlers/study_metrics_projection_processor/measurements_processor.rb` with:

```ruby
module StudyMetricsProjectionProcessor
  module MeasurementsProcessor
    include StudyMetricsProjectionProcessor::Common

    def handle_measurement(id, location_id, longitude, latitude, timestamp, as_org_id, as_org_name)
      aggs = self.get_aggregates_for_point(longitude, latitude, as_org_id, as_org_name, location_id: location_id)
      aggregates_to_count(aggs).each do |aggregate|
        update_measurements_count(aggregate, as_org_id, timestamp)
        update_unique_locations_count(timestamp, aggregate, as_org_id, longitude, latitude)
      end
    end

    def handle_speed_test(id, longitude, latitude, timestamp, as_org_id, as_org_name)
      aggs = self.get_aggregates_for_point(longitude, latitude, as_org_id, as_org_name)
      aggregates_to_count(aggs).each do |aggregate|
        update_measurements_count(aggregate, as_org_id, timestamp)
        update_unique_locations_count(timestamp, aggregate, as_org_id, longitude, latitude)
      end
    end

    def update_unique_locations_count(timestamp, aggregate, as_org_id, longitude, latitude)
      key = "#{aggregate.id}-#{as_org_id}-#{longitude}-#{latitude}"
      @consumer_offset.state["unique-locations-with-tests"] ||= {}

      if @consumer_offset.state["unique-locations-with-tests"][key].nil?
        @consumer_offset.state["unique-locations-with-tests"][key] = true
        self.update_projection(aggregate, as_org_id, "points_with_tests_count", 1)
      end
    end

    def update_measurements_count(aggregate, as_org_id, timestamp)
      self.update_projection(aggregate, as_org_id, "measurements_count", 1)
    end
  end
end
```

In `app/eventhandlers/study_metrics_projection_processor/events_processor.rb`, in `update_online_count_for_location`, replace lines 111-118:

```ruby
      aggs = self.get_aggregates_for_point(
        lonlat.longitude, lonlat.latitude, as_org_id, as_org_name, location_id: location_id
      )
      study_county = aggs.find {|agg| agg.level == 'county' && agg.study_aggregate}
      aggs.each do |aggregate|
        # Filter out "other" counties from the state_with_study_only level
        if aggregate.level == 'state_with_study_only' && !study_county
          next
        end

```

with:

```ruby
      aggs = self.get_aggregates_for_point(
        lonlat.longitude, lonlat.latitude, as_org_id, as_org_name, location_id: location_id
      )
      aggregates_to_count(aggs).each do |aggregate|
```

Leave the rest of that loop as is for now; Task 5 changes the `completed?` checks.

In `app/eventhandlers/study_metrics_projection_processor/daily_trigger_processor.rb`, replace lines 34-37:

```ruby
          aggs = self.get_aggregates_for_point(lonlat.longitude, lonlat.latitude, as_org_id, as_org_name, location_id: meta.location_id)
          study_county = aggs.find {|agg| agg.level == 'county' && agg.study_aggregate}
          aggs.each do |aggregate|
            next if aggregate.level == "state_with_study_only" && !study_county
```

with:

```ruby
          aggs = self.get_aggregates_for_point(lonlat.longitude, lonlat.latitude, as_org_id, as_org_name, location_id: meta.location_id)
          aggregates_to_count(aggs).each do |aggregate|
```

- [ ] **Step 5: Load studies in the processor and extend `clear`**

In `app/eventhandlers/study_metrics_projection_processor/processor.rb`, `initialize` becomes:

```ruby
    def initialize
      @insertion_queue = []
      @consumer_offset = ConsumerOffset.find_or_create_by!(consumer_id: "MetricsProjectionProcessor")

      # Initialize states in case of first run.
      @consumer_offset.state["open_buckets"] ||= {}
      @consumer_offset.state["locations_online_days_count"] ||= {}
      @consumer_offset.state["projections"] ||= {}
      @consumer_offset.state["locations_state"] ||= {}

      @lonlats ||= {}
      @studies_by_id = Study.all.index_by(&:id)
      @location_metadatas = self.load_location_metadatas
    end
```

`clear` becomes:

```ruby
    def self.clear
      ActiveRecord::Base.connection.transaction do
        ActiveRecord::Base.connection.execute("TRUNCATE TABLE metrics_projections, location_metadata_projections")
        ActiveRecord::Base.connection.execute("DELETE FROM study_aggregates WHERE study_id IS NULL")
        ConsumerOffset.find_by(consumer_id: "MetricsProjectionProcessor")&.destroy
      end
      return
    end
```

In `process`, lines 66-68 assign the result of `handle_measurement` to `value["lonlat"]` for no reason. Replace:

```ruby
          when Measurement.name
            value["lonlat"] =
            self.handle_measurement value["id"], value["location_id"], value["longitude"], value["latitude"], value["processed_at"], value["autonomous_system_org_id"], value["autonomous_system_org_name"]
```

with:

```ruby
          when Measurement.name
            self.handle_measurement value["id"], value["location_id"], value["longitude"], value["latitude"], value["processed_at"], value["autonomous_system_org_id"], value["autonomous_system_org_name"]
```

- [ ] **Step 6: Run the tests**

Run: `bin/rails test test/eventhandlers/study_metrics_projection_processor_test.rb`
Expected: 5 runs, 0 failures.

- [ ] **Step 7: Run the whole suite**

Run: `bin/rails test`
Expected: 0 failures.

- [ ] **Step 8: Commit**

```bash
git add app/eventhandlers/study_metrics_projection_processor test/eventhandlers/study_metrics_projection_processor_test.rb
git commit -m "builds one metrics projection tree per study of a point"
```

---

### Task 5: Completion per study threshold

**Files:**
- Modify: `app/eventhandlers/study_metrics_projection_processor/daily_trigger_processor.rb`
- Modify: `app/eventhandlers/study_metrics_projection_processor/events_processor.rb` (the `completed?` checks in `update_online_count_for_location`)
- Modify: `test/eventhandlers/study_metrics_projection_processor_test.rb`

**Interfaces:**
- Consumes: `completion_days_for(aggregate)`, `completion_thresholds`, `aggregates_to_count` (Task 4).
- Removes: every read and write of `LocationMetadataProjection#completed`. Task 9 drops the column.

- [ ] **Step 1: Write the failing tests**

Append to `test/eventhandlers/study_metrics_projection_processor_test.rb`, inside the class:

```ruby
  def online_for_days(location, days)
    meta = @processor.get_location_metadata(location.id)
    meta.online = true
    meta.days_online = days
    meta.autonomous_system_org_id = @as_org.id
    meta
  end

  test "daily tick completes a fresno location at 7 days and a rural one at 90" do
    fresno_loc = location_in(geospaces(:fresno_state), geospaces(:fresno_county), geospaces(:fresno_tract), point: "POINT(6 6)")
    rural_at_7 = location_in(geospaces(:study_state), geospaces(:study_county), point: "POINT(7 7)")
    rural_at_90 = location_in(geospaces(:study_state), geospaces(:study_county), point: "POINT(8 8)")
    online_for_days(fresno_loc, 6)
    online_for_days(rural_at_7, 6)
    online_for_days(rural_at_90, 89)

    @processor.handle_daily_trigger(Date.today)

    fresno_county = StudyAggregate.find_by!(study: studies(:fresno), level: 'county', geospace: geospaces(:fresno_county))
    fresno_tract = StudyAggregate.find_by!(study: studies(:fresno), level: 'census_tract', geospace: geospaces(:fresno_tract))
    rural_county = study_aggregates(:study_county)

    assert_equal 1, @processor.get_projection(fresno_county.id, fresno_county.parent_aggregate_id, @as_org.id)["completed_locations_count"]
    assert_equal 1, @processor.get_projection(fresno_tract.id, fresno_tract.parent_aggregate_id, @as_org.id)["completed_locations_count"]
    assert_equal 1, @processor.get_projection(rural_county.id, rural_county.parent_aggregate_id, @as_org.id)["completed_locations_count"]
    assert_equal 7, @processor.get_location_metadata(fresno_loc.id).days_online
    assert_equal 7, @processor.get_location_metadata(rural_at_7.id).days_online
    assert_equal 90, @processor.get_location_metadata(rural_at_90.id).days_online
  end

  test "daily tick does not complete a location whose day count is not a threshold" do
    location = location_in(geospaces(:study_state), geospaces(:study_county), point: "POINT(9 9)")
    online_for_days(location, 40)

    @processor.handle_daily_trigger(Date.today)

    assert_equal 41, @processor.get_location_metadata(location.id).days_online
    assert_empty projections
  end

  test "going offline before completion lowers completed_and_online, after completion it does not" do
    location = location_in(geospaces(:fresno_state), geospaces(:fresno_county), point: "POINT(10 10)")
    client_as = autonomous_systems(:as_1)
    meta = online_for_days(location, 0)
    meta.online = false
    meta.online_pods_count = 0

    @processor.update_online_count_for_location(Time.now, location.id, client_as.id, 1)
    county = StudyAggregate.find_by!(study: studies(:fresno), level: 'county', geospace: geospaces(:fresno_county))
    proj = @processor.get_projection(county.id, county.parent_aggregate_id, @as_org.id)
    assert_equal 1, proj["online_locations_count"]
    assert_equal 1, proj["completed_and_online_locations_count"]

    @processor.update_online_count_for_location(Time.now, location.id, client_as.id, -1)
    assert_equal 0, proj["online_locations_count"]
    assert_equal 0, proj["completed_and_online_locations_count"]

    # Once completed, the location was already counted in completed_and_online by the daily tick,
    # so coming online again must not count it a second time.
    meta.days_online = 7
    @processor.update_online_count_for_location(Time.now, location.id, client_as.id, 1)
    assert_equal 1, proj["online_locations_count"]
    assert_equal 0, proj["completed_and_online_locations_count"]

    @processor.update_online_count_for_location(Time.now, location.id, client_as.id, -1)
    assert_equal 0, proj["online_locations_count"]
    assert_equal 0, proj["completed_and_online_locations_count"]
  end
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bin/rails test test/eventhandlers/study_metrics_projection_processor_test.rb`
Expected: the "7 days" test FAILS (today's code completes at 90 only). The "offline before completion" test FAILS after the location reaches 7 days: today's code still sees `completed?` as false and raises `completed_and_online_locations_count` to 1 when the location comes back online.

- [ ] **Step 3: Rewrite the daily trigger**

Replace the whole file `app/eventhandlers/study_metrics_projection_processor/daily_trigger_processor.rb` with:

```ruby
module StudyMetricsProjectionProcessor
  module DailyTriggerProcessor
    include StudyMetricsProjectionProcessor::Common

    def handle_daily_trigger(date)
      self.process_completed_locations(date)
    end

    # Runs at the start of a day, after every event of the previous day was processed. A location earns
    # a day when it is online now or its last change to online happened on the previous day.
    # days_online grows by at most one per tick, so a threshold is crossed exactly once.
    def process_completed_locations(date)
      @location_metadatas.each do |key, meta|
        next unless meta.online? || (meta.last_online_event_at.present? && meta.last_online_event_at.to_date == date.prev_day)
        meta.days_online += 1
        next unless completion_thresholds.include?(meta.days_online)

        lonlat = location_lonlat(meta.location_id)
        next if lonlat.nil?

        as_org_id = meta.autonomous_system_org_id
        as_org_name = meta.autonomous_system_org&.name
        aggs = self.get_aggregates_for_point(lonlat.longitude, lonlat.latitude, as_org_id, as_org_name, location_id: meta.location_id)
        aggregates_to_count(aggs).each do |aggregate|
          next unless completion_days_for(aggregate) == meta.days_online
          self.update_projection(aggregate, as_org_id, "completed_locations_count", 1)
          # An online location was already counted in completed_and_online when it came online.
          self.update_projection(aggregate, as_org_id, "completed_and_online_locations_count", 1) unless meta.online?
        end
      end
    end
  end
end
```

- [ ] **Step 4: Derive completion in the event handler**

In `app/eventhandlers/study_metrics_projection_processor/events_processor.rb`, the loop in `update_online_count_for_location` becomes:

```ruby
      aggregates_to_count(aggs).each do |aggregate|
        completed = location_meta.days_online >= completion_days_for(aggregate)

        self.update_projection(aggregate, as_org_id, "online_pods_count", incr)
        if asn_location_was_online && !asn_location_is_online
          self.update_projection(aggregate, as_org_id, "online_locations_count", -1)
          self.update_projection(aggregate, as_org_id, "completed_and_online_locations_count", -1) unless completed

        elsif !asn_location_was_online && asn_location_is_online
          self.update_projection(aggregate, as_org_id, "online_locations_count", 1)
          self.update_projection(aggregate, as_org_id, "completed_and_online_locations_count", 1) unless completed
        end
      end
```

- [ ] **Step 5: Confirm `completed` is no longer referenced**

Run: `grep -rn -E '\.completed\b|completed:|completed\?' app/eventhandlers/study_metrics_projection_processor`
Expected: no output.

- [ ] **Step 6: Run the tests**

Run: `bin/rails test test/eventhandlers/study_metrics_projection_processor_test.rb`
Expected: 8 runs, 0 failures.

- [ ] **Step 7: Commit**

```bash
git add app/eventhandlers/study_metrics_projection_processor test/eventhandlers/study_metrics_projection_processor_test.rb
git commit -m "derives location completion from each study's threshold"
```

---

### Task 6: Link shapes to locations by containment

**Files:**
- Modify: `app/models/geospace.rb` (`link_to_locations`, `update_all_locations_links`)
- Create: `test/models/geospace_test.rb`

**Interfaces:**
- Produces: `Geospace.link_all_locations(scope = Geospace.all)`, one set-based insert of missing `(geospace_id, location_id)` pairs by containment. The Fresno seed (Task 8) calls it.
- Removes: `Geospace.update_all_locations_links`. Nothing calls it.

- [ ] **Step 1: Write the failing test**

Create `test/models/geospace_test.rb`:

```ruby
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
end
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bin/rails test test/models/geospace_test.rb`
Expected: the first test FAILS because today's bounding-box link also picks up the (8 8) location. The second FAILS with `NoMethodError: undefined method 'link_all_locations'`.

- [ ] **Step 3: Implement**

In `app/models/geospace.rb`, replace `link_to_locations` and `update_all_locations_links` with:

```ruby
  def link_to_locations
    Geospace.link_all_locations(Geospace.where(id: id))
  end

  def self.link_all_locations(scope = Geospace.all)
    connection.execute(<<~SQL)
      INSERT INTO geospaces_locations (geospace_id, location_id)
      SELECT geospaces.id, locations.id
      FROM geospaces
      JOIN locations ON ST_Contains(ST_SetSRID(geospaces.geom, 4326), locations.lonlat::geometry)
      WHERE geospaces.id IN (#{scope.select(:id).to_sql})
        AND NOT EXISTS (
          SELECT 1 FROM geospaces_locations
          WHERE geospaces_locations.geospace_id = geospaces.id
            AND geospaces_locations.location_id = locations.id
        )
    SQL
  end
```

- [ ] **Step 4: Run the test**

Run: `bin/rails test test/models/geospace_test.rb`
Expected: 2 runs, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add app/models/geospace.rb test/models/geospace_test.rb
git commit -m "links shapes to locations by containment"
```

---

### Task 7: `Study#populate_aggregates!`

**Files:**
- Modify: `app/models/study.rb`
- Modify: `test/models/study_test.rb`

**Interfaces:**
- Consumes: `StudyAggregate.find_or_create_for!`, `StudyAggregate.isp_county_name` (Task 2); `Geospace.census_tracts`, `Geospace.zips` (Task 1); `GeoTools.get_county_as_orgs(fips)` (existing, returns objects with `name`).
- Produces: `Study#populate_aggregates!`. The Fresno seed (Task 8) calls it.

- [ ] **Step 1: Write the failing test**

Append to `test/models/study_test.rb`, inside the class:

```ruby
  test "populate_aggregates! creates rows for every enabled level of the tagged shapes and is idempotent" do
    fresno = studies(:fresno)
    fresno.update!(level_zip: false)
    org = GeoTools::ASOrg.new("Fresno ISP", nil, nil, nil)

    GeoTools.stub :get_county_as_orgs, [org] do
      # state, state_with_study_only, county, isp_county, census_tract
      assert_difference 'StudyAggregate.count', 5 do
        fresno.populate_aggregates!
      end
      assert_no_difference 'StudyAggregate.count' do
        fresno.populate_aggregates!
      end
    end

    state = StudyAggregate.find_by!(study: fresno, level: 'state', geospace: geospaces(:fresno_state))
    county = StudyAggregate.find_by!(study: fresno, level: 'county', geospace: geospaces(:fresno_county))
    tract = StudyAggregate.find_by!(study: fresno, level: 'census_tract', geospace: geospaces(:fresno_tract))
    isp = StudyAggregate.find_by!(study: fresno, level: 'isp_county', geospace: geospaces(:fresno_county))

    assert_equal state, county.parent_aggregate
    assert_equal county, tract.parent_aggregate
    assert_equal state, isp.parent_aggregate
    assert_equal "Fresno ISP -> Fresno County", isp.name
    assert_equal AutonomousSystemOrg.find_by!(name: "Fresno ISP").id, isp.autonomous_system_org_id
    assert [state, county, tract, isp].all?(&:study_aggregate)
    assert StudyAggregate.where(study: fresno, geospace: geospaces(:fresno_other_county)).none?
  end
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bin/rails test test/models/study_test.rb`
Expected: FAIL with `NoMethodError: undefined method 'populate_aggregates!'`.

- [ ] **Step 3: Implement**

Replace `app/models/study.rb` with:

```ruby
class Study < ApplicationRecord
  has_and_belongs_to_many :geospaces
  has_many :study_aggregates

  validates :name, presence: true, uniqueness: true
  validates :completion_days, numericality: { only_integer: true, greater_than: 0 }

  # Creates the aggregate rows for every tagged shape, so the dashboard lists them before any pod
  # reports from there. Counties and tracts are matched to their parent by geoid prefix; places and
  # ZIPs by geometry. Only creates rows; tagging shapes into the study is the seed's job.
  def populate_aggregates!
    geospaces.states.find_each do |state|
      state_agg = aggregate!('state', state, parent: nil)
      aggregate!('state_with_study_only', state, parent: nil)

      geospaces.counties.where("geoid LIKE ?", "#{state.geoid}%").find_each do |county|
        county_agg = aggregate!('county', county, parent: state_agg)
        populate_isp_county!(county, state_agg) if level_isp_county
        if level_census_place
          geospaces.census_places.where(Geospace.arel_table[:geom].st_intersects(county.geom)).find_each do |place|
            aggregate!('census_place', place, parent: county_agg)
          end
        end
        if level_census_tract
          geospaces.census_tracts.where("geoid LIKE ?", "#{county.geoid}%").find_each do |tract|
            aggregate!('census_tract', tract, parent: county_agg)
          end
        end
      end

      if level_zip
        geospaces.zips.where(Geospace.arel_table[:geom].st_intersects(state.geom)).find_each do |zip|
          aggregate!('zip', zip, parent: state_agg)
        end
      end
    end
  end

  private

  def aggregate!(level, shape, parent:, autonomous_system_org: nil)
    name = autonomous_system_org ? StudyAggregate.isp_county_name(autonomous_system_org.name, shape.name) : shape.name
    StudyAggregate.find_or_create_for!(
      study: self, level: level, geospace_id: shape.id, name: name, parent: parent, study_shape: true,
      autonomous_system_org_id: autonomous_system_org&.id
    )
  end

  def populate_isp_county!(county, state_agg)
    GeoTools.get_county_as_orgs(county.geoid).each do |org|
      as_org = AutonomousSystemOrg.find_or_create_by!(name: org.name)
      aggregate!('isp_county', county, parent: state_agg, autonomous_system_org: as_org)
    end
  end
end
```

- [ ] **Step 4: Run the test**

Run: `bin/rails test test/models/study_test.rb`
Expected: 4 runs, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add app/models/study.rb test/models/study_test.rb
git commit -m "adds Study#populate_aggregates! to pre-create a study's aggregate rows"
```

---

### Task 8: Seeds

**Files:**
- Create: `db/custom_seeds/seed_fresno_study.rb`
- Modify: `db/custom_seeds/seed_fill_study_geospace.rb`

**Interfaces:**
- Consumes: `Study`, `Geospace.link_all_locations`, `Study#populate_aggregates!`, `Geospace::STUDY_COUNTIES_FIPS`, `Geospace::STUDY_STATES_FIPS`.

Seeds run with `rails runner db/custom_seeds/<file>.rb` against real TIGER shapes, so there is no automated test. Verification is a syntax check and a dry read.

- [ ] **Step 1: Write the Fresno seed**

Create `db/custom_seeds/seed_fresno_study.rb`:

```ruby
# Creates the Fresno study and tags its shapes. Run after seed_fill_geospaces.rb has imported
# census tracts and ZIPs: `rails runner db/custom_seeds/seed_fresno_study.rb`.

study = Study.find_or_create_by!(name: "fresno") do |s|
  s.completion_days = 7
  s.notifications_enabled = false
  s.level_census_tract = true
  s.level_zip = true
  s.level_isp_county = true
end

california = Geospace.states.find_by!(geoid: "06")
fresno = Geospace.counties.find_by!(geoid: "06019")
tracts = Geospace.census_tracts.where("geoid LIKE ?", "06019%")
zips = Geospace.zips.where(Geospace.arel_table[:geom].st_intersects(fresno.geom))

[california, fresno, *tracts, *zips].each do |shape|
  study.geospaces << shape unless study.geospaces.exists?(shape.id)
end
puts "Tagged #{study.geospaces.count} shapes"

Geospace.link_all_locations(Geospace.where(namespace: ["census_tract", "zip"]))
study.populate_aggregates!
puts "Created #{study.study_aggregates.count} aggregates"
```

- [ ] **Step 2: Update the rural seed**

Replace `db/custom_seeds/seed_fill_study_geospace.rb` with:

```ruby
# Tags the rural study's states and counties. Places were tagged by the original populate step and
# already live in geospaces_studies after the AddStudies migration.

study = Study.find_by!(name: "rural")
shapes = Geospace.where(namespace: "county", geoid: Geospace::STUDY_COUNTIES_FIPS)
  .or(Geospace.where(namespace: "state", geoid: Geospace::STUDY_STATES_FIPS))

shapes.find_each do |shape|
  study.geospaces << shape unless study.geospaces.exists?(shape.id)
end
puts "Tagged #{study.geospaces.count} shapes"
```

- [ ] **Step 3: Syntax check**

Run: `ruby -c db/custom_seeds/seed_fresno_study.rb && ruby -c db/custom_seeds/seed_fill_study_geospace.rb`
Expected: `Syntax OK` twice.

- [ ] **Step 4: Commit**

```bash
git add db/custom_seeds/seed_fresno_study.rb db/custom_seeds/seed_fill_study_geospace.rb
git commit -m "adds fresno study seed and tags rural shapes through studies"
```

---

### Task 9: Drop the replaced columns

**Files:**
- Create: `db/migrate/20260921120100_drop_study_geospace_and_completed.rb`
- Modify: `test/fixtures/geospaces.yml` (remove the three `study_geospace: true` lines)
- Modify: `db/schema.rb` (generated)

**Interfaces:**
- Consumes: Task 1 (join table filled from the old column), Task 3 (no reader of `study_geospace`), Task 5 (no reader of `completed`).

- [ ] **Step 1: Confirm no reader is left**

Run: `grep -rn -E 'study_geospace|\bcompleted\b' app lib db/custom_seeds test/fixtures --include=*.rb --include=*.yml --include=*.erb | grep -v -E 'step_2_completed|geospaces_studies'`
Expected: the three fixture lines in `test/fixtures/geospaces.yml`, and possibly comments that use the word. Any code that still reads either column must be fixed before continuing.

- [ ] **Step 2: Remove the fixture lines**

In `test/fixtures/geospaces.yml`, delete the `study_geospace: true` line under `study_state`, `study_county` and `study_place`.

- [ ] **Step 3: Write the migration**

Create `db/migrate/20260921120100_drop_study_geospace_and_completed.rb`:

```ruby
class DropStudyGeospaceAndCompleted < ActiveRecord::Migration[6.1]
  def up
    remove_column :geospaces, :study_geospace
    remove_column :location_metadata_projections, :completed
  end

  def down
    add_column :geospaces, :study_geospace, :boolean, default: false
    add_column :location_metadata_projections, :completed, :boolean, default: false
    execute <<~SQL
      UPDATE geospaces SET study_geospace = true
      WHERE id IN (SELECT geospace_id FROM geospaces_studies)
    SQL
    execute <<~SQL
      UPDATE location_metadata_projections SET completed = days_online >= 90
    SQL
  end
end
```

- [ ] **Step 4: Migrate and run the whole suite**

Run: `bin/rails db:migrate && bin/rails test`
Expected: `db/schema.rb` no longer has the two columns. 0 failures.

- [ ] **Step 5: Commit**

```bash
git add db/migrate/20260921120100_drop_study_geospace_and_completed.rb db/schema.rb test/fixtures/geospaces.yml
git commit -m "drops geospaces.study_geospace and location_metadata_projections.completed"
```

---

### Task 10: Dashboard study filter

**Files:**
- Create: `analytics/study_performance/vars/studies.pgsql`
- Modify: `analytics/study_performance/vars/top_level.pgsql`
- Modify: `analytics/study_performance/vars/aggregates.pgsql`
- Modify: `analytics/study_performance/vars/as_orgs.sql`
- Modify: `analytics/study_performance/metrics.sql`

These files are the Grafana queries kept in the repo. Grafana itself is updated by hand from them: add a `study` variable (query from `studies.pgsql`) placed before `level`, and add `census_tract` and `zip` to the `level` variable's custom list. There is no automated test; verify by pasting each query into Grafana with the Fresno study selected after the replay.

- [ ] **Step 1: Add the study variable query**

Create `analytics/study_performance/vars/studies.pgsql`:

```sql
SELECT
  name as __text, id as __value
FROM studies
ORDER BY name ASC
```

- [ ] **Step 2: Filter the top-level variable by study and add the new levels**

Replace `analytics/study_performance/vars/top_level.pgsql` with:

```sql
SELECT
    '  ' as __text, -1 as __value
WHERE '$level' = 'state'

UNION

SELECT
  name as __text, id as __value
FROM study_aggregates
WHERE
  study_id = $study
  AND level = 'state'
  AND study_aggregate = true
  AND ('$level' = 'county' OR '$level' = 'isp_county' OR '$level' = 'zip')

UNION

SELECT
  name as __text, id as __value
FROM study_aggregates
WHERE
  study_id = $study
  AND level = 'county'
  AND study_aggregate = true
  AND ('$level' = 'census_place' OR '$level' = 'census_tract')

ORDER BY __text ASC
```

- [ ] **Step 3: Filter the aggregates variable by study**

Replace `analytics/study_performance/vars/aggregates.pgsql` with:

```sql
SELECT
  name as __text, id::text as __value
FROM study_aggregates
WHERE
  study_id = $study
  AND level = '$level'
  AND study_aggregate=true
  AND CASE WHEN '$level' != 'state' THEN
    parent_aggregate_id IN ($top_level_aggregates)
  ELSE
    true
  END

UNION

SELECT CONCAT('Other (', name, ')') as __text, CONCAT('other_', id) as __value
FROM study_aggregates
WHERE study_id = $study AND id IN ($top_level_aggregates) and '$level' != 'state'

ORDER BY __text ASC
```

- [ ] **Step 4: Filter the ISP variable by study**

In `analytics/study_performance/vars/as_orgs.sql`, the `aggregates` CTE becomes:

```sql
), aggregates AS (
  SELECT
    geospace_id
  FROM study_aggregates
  WHERE
    study_id = $study
    AND level = '$level'
    AND (
      id IN (SELECT id FROM selected_study_aggregate_ids)
      OR (study_aggregate=false AND parent_aggregate_id IN (SELECT id FROM selected_other_ids))
    )
)
```

- [ ] **Step 5: Filter the metrics query by study**

In `analytics/study_performance/metrics.sql`, the `aggregates` CTE's `WHERE` becomes:

```sql
  WHERE
  study_aggregates.study_id = $study
  AND study_aggregates.level = '$level'
  AND (
    study_aggregates.id IN (SELECT id FROM selected_study_aggregate_ids)
    OR (study_aggregates.study_aggregate=false AND study_aggregates.parent_aggregate_id IN (SELECT id FROM selected_other_parent_ids))
  )
```

- [ ] **Step 6: Commit**

```bash
git add analytics/study_performance
git commit -m "adds study filter to the study performance dashboard queries"
```

---

## Rollout (manual, after all tasks are merged)

1. Before deploying, on the production backup, run this query. If it returns rows, merge each duplicate pair by deleting the row whose id is not in `db/custom_seeds/fill_study_goals.rb` (nothing else references them; `metrics_projections` is truncated in step 5). The migration raises on duplicates otherwise.

   ```sql
   SELECT level, geospace_id, COALESCE(autonomous_system_org_id, 0) AS org_id, COALESCE(parent_aggregate_id, 0) AS parent_id, array_agg(id) AS ids
   FROM study_aggregates
   GROUP BY 1, 2, 3, 4
   HAVING COUNT(*) > 1;
   ```

2. Deploy. Both migrations run. The scheduled projection job keeps working on the new code.
3. Run the ZIP import in `db/custom_seeds/seed_fill_geospaces.rb`, then `rails runner db/custom_seeds/seed_fresno_study.rb`. Check the two counts it prints, and spot-check one Fresno location: its `geospaces.pluck(:namespace)` must include `census_tract` and `zip`.
4. Confirm every aggregate id in `db/custom_seeds/fill_study_goals.rb` carries a study, so the clear in the next step cannot delete a goal: `StudyAggregate.where(id: ids, study_id: nil).none?` must be true.
5. Stop the projection job trigger. In a console: `StudyMetricsProjectionProcessor::Processor.clear`, then `StudyMetricsProjectionProcessor::Processor.new.process`. Restart the trigger. The dashboard shows partial data until the replay finishes.
6. Update the Grafana dashboard from the queries in `analytics/study_performance`: add a `study` variable from `vars/studies.pgsql`, single-select with "All" disabled, placed before `level`; add `census_tract` and `zip` to the `level` list.

## Notes for the executor

- `StudyAggregate` lives in `app/reporting_models` and inherits from `ActiveRecord::Base`, not `ApplicationRecord`. It is autoloaded like any `app/*` directory.
- Fixture labels for `has_and_belongs_to_many` are listed on the owner fixture (`geospaces: a, b, c` in `studies.yml`). Rails fills the join table from that.
- The processor's `get_projection` creates a counter entry on read. To assert a counter was never touched, look at the raw `projections` hash, as the tests do.
- The notification job looks up `isp_county` goals by level only, not by ISP, exactly as before. That quirk is untouched by this plan.
