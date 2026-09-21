# Multi-study metrics projection (Fresno study)

Date: 2026-09-21

## Goal

Run a second study, for Fresno County, California, on the same metrics
projection that serves the rural study today. Same five counters, same
event sources, same hourly and daily snapshots, same Grafana dashboard
with a study selector. The Fresno study differs in three ways:

- Its tree is state -> county -> census tract, plus ZIP under state.
  It has no census place level.
- A location completes its goal after 7 online days, not 90.
- It sends no notifications.

## Background: how the projection works today

`StudyMetricsProjectionProcessor::Processor` replays events in time
order (pod online/offline changes, measurements, speed tests, one
daily tick). For each point it loads the shapes that contain it, then
find-or-creates one `StudyAggregate` row per level (state,
state_with_study_only, county, isp_county, census_place) and bumps
in-memory counters keyed by aggregate and ISP. Every hour and day it
writes every counter it holds into `metrics_projections`.

"Is this shape in the study" is a boolean on `geospaces`, set by seeds
from hard-coded FIPS lists. `study_aggregates.study_aggregate` copies
it. Rows for shapes outside the study are still created and counted;
the dashboard shows the ones inside study states as "Other (Texas)"
and never shows the rest.

Two defects in the current code affect this work and are fixed by it:

1. The processor includes `study_aggregate` in its find-or-create
   lookup. Flipping a shape from "other" to "study" creates a second
   aggregate row for the same shape instead of updating the first.
2. `Geospace#link_to_locations` links by bounding-box overlap, not
   containment. Tracts and ZIPs are small, so a location can end up
   linked to several. The processor then picks an arbitrary one.

## Decisions

- One processor, one set of tables, one consumer offset. No copy of
  the processor for Fresno.
- A `Study` record holds the per-study settings. Levels stay in code;
  the study only toggles which optional levels it builds.
- A shape can belong to more than one study, so membership is a join
  table, not a column.
- If two studies cover the same shape, each gets its own aggregate
  rows. Their completed counts differ when their thresholds differ.
- Points whose shapes belong to no study create nothing and count
  nothing. Today they create rows that nothing reads.
- Days online is a fact about a location and stays shared. "Completed"
  is a study rule, derived as `days_online >= study.completion_days`.
  The stored `completed` column is dropped.
- A ZIP sits under the state. A ZIP that straddles two counties counts
  pods from both sides. Counters do not roll up the tree, so the
  county counts are unaffected.
- Notifications are a study setting. Fresno has them off.
- Full replay after deploy. Fresno already has pods, and their tract
  and ZIP history only exists after a replay.
- Aggregate rows for every tagged shape are pre-created by a populate
  step, so the dashboard lists them and goals can be set before any
  pod reports from there. Today's `populate_from_geospaces!` does this
  for the rural study; it becomes per study.

## Data model

### New: `studies`

| column                  | type    | notes                                    |
|-------------------------|---------|------------------------------------------|
| name                    | string  | not null, unique                         |
| completion_days         | integer | not null. rural: 90, fresno: 7           |
| notifications_enabled   | boolean | not null, default false. rural: true     |
| level_census_place      | boolean | not null, default false. rural: true     |
| level_census_tract      | boolean | not null, default false. fresno: true    |
| level_zip               | boolean | not null, default false. fresno: true    |
| level_isp_county        | boolean | not null, default false. both: true      |

State, state_with_study_only and county are always built. The four
booleans toggle the optional levels.

### New: `geospaces_studies`

`study_id`, `geospace_id`, unique on the pair. Replaces
`geospaces.study_geospace`, which is dropped.

### Changed: `study_aggregates`

- Add `study_id` (bigint, nullable, indexed). Which study's tree the
  row belongs to. Every row the new processor creates has one.
  Existing rows outside the rural study keep NULL until the replay
  deletes them.
- Keep `study_aggregate`. It now means "this shape is in this study",
  as opposed to an "other" shape inside the study's area. Both columns
  are needed by the dashboard logic; they are not redundant.
- Add a unique index on
  `(study_id, level, geospace_id, COALESCE(autonomous_system_org_id, 0))`.
  This is the row's identity and the guard against defect 1.

### Changed: `location_metadata_projections`

Drop `completed`. Nothing outside the processor reads it.

### Changed: `geospaces`

Drop `study_geospace`.

### Unchanged: `metrics_projections`

Rows link to a study through `study_aggregate_id`.

## Rules

### A point's studies

The studies of a point are the union of the studies of every shape
that contains it. A pod in Amarillo has one study, rural, through the
Texas shape. A pod in Los Angeles has one study, fresno, through the
California shape. A pod in Ohio has none.

### The tree, per study

For each study of the point, the processor builds:

| level                  | shape         | parent  | when                                   |
|------------------------|---------------|---------|----------------------------------------|
| state                  | state         | none    | always                                 |
| state_with_study_only  | state         | none    | always; counted only for study counties|
| county                 | county        | state   | always                                 |
| isp_county             | county        | state   | `level_isp_county` and the point has an ISP |
| census_place           | census_place  | county  | `level_census_place` and the point is in a place |
| census_tract           | census_tract  | county  | `level_census_tract` and the tract is in this study |
| zip                    | zip           | state   | `level_zip` and the ZIP is in this study |

`study_aggregate` is true when the row's shape is in this study. For
census_place it copies the county's flag, as today. Tract and ZIP rows
are only created for study shapes, so every pod in the country does
not add rows to every snapshot.

A point with no study builds nothing. Its location metadata is still
maintained (online state, days online).

### Counting

Unchanged. For every aggregate of the point, except a
`state_with_study_only` aggregate whose study has no study county
among the point's aggregates, bump the counter. The four call sites
that repeat this check today share one helper.

### Completion

Each aggregate's threshold is its study's `completion_days`.

- Daily tick: as today, add one to `days_online` when the location was
  online. If the new value equals the `completion_days` of any study,
  load the location's aggregates and bump `completed_locations_count`
  on those whose threshold equals the new value. Also bump
  `completed_and_online_locations_count` when the location is offline,
  as today. `days_online` grows by at most one per day, so each
  threshold fires once.
- Online and offline events: the "already completed" check becomes
  `days_online >= threshold` for each aggregate.
- Studies are loaded once when the processor starts.

Behaviour for rural rows is identical to today.

Known limit: a location that already has more online days than a
threshold when its study is created never "crosses" it. Only a replay
counts it. The rural study has the same property today.

### Notifications

- The goal alerts in `NotifyLocationOnline` run only when the
  location's county belongs to a study with `notifications_enabled`.
  That study is used to look up the county, place and ISP-county
  aggregates for their goals.
- The Discord notifier routes "new location" and "location online"
  alerts to the study channel, and uses the study fieldset, when the
  location's county belongs to a study with notifications on.
- `NotifiedStudyGoal` stays keyed by shape and ISP. It supports one
  alerting study per county, which is the case.

## Code changes

### `app/models/study.rb` (new)

`has_and_belongs_to_many :geospaces`, `has_many :study_aggregates`.
Validates name and completion_days.

`populate_aggregates!` creates every aggregate row for the study's
tagged shapes. Per state in the study: state and state_with_study_only
rows. Per county in the study, matched to its state by geoid prefix:
the county row; isp_county rows from `GeoTools.get_county_as_orgs`
when `level_isp_county`; census_place rows for tagged places that
intersect the county when `level_census_place`; census_tract rows for
tagged tracts with the county's geoid prefix when `level_census_tract`.
Per state: zip rows for tagged ZIPs that intersect it when `level_zip`.
It only creates rows. Tagging shapes into the study is the seed's job.
Safe to run again.

### `app/models/geospace.rb`

- `has_and_belongs_to_many :studies`.
- Scope `study_geospaces` becomes "has at least one study".
- `study_aggregate_by_level(study, level)`.
- `link_to_locations` uses `ST_Contains`, not `&&`.
- New `Geospace.link_all_locations(namespaces)`: one set-based SQL
  insert of missing `(geospace_id, location_id)` pairs by containment.

### `app/reporting_models/study_aggregate.rb`

- `belongs_to :study, optional: true`.
- New `StudyAggregate.find_or_create_for!(study:, level:, geospace:,
  parent:, autonomous_system_org: nil, study_shape:)`. Looks the row
  up by its identity, then sets name, parent and `study_aggregate`.
  Used by the processor loaders and by `Study#populate_aggregates!`,
  so one place owns the identity rule.
- Remove `populate_from_geospaces!`. Its job moves to
  `Study#populate_aggregates!`.

### `app/models/location.rb`

- Replace `study_state?` and `study_county?` with `notifying_study`,
  which returns the county's study with notifications on, or nil.
- Update the two Discord notifier call sites and the local notifier
  line that use them.

### `app/jobs/location_notification_jobs.rb`

`return unless study = location.notifying_study`, then
pass `study` to the three aggregate lookups.

### `app/eventhandlers/study_metrics_projection_processor/common.rb`

- `load_geospaces_for_point` returns each shape with its study ids,
  preloaded from `geospaces_studies`.
- `get_aggregates_for_point` computes the point's studies and builds
  one tree per study. Returns a flat list. Cache key unchanged.
- Each loader takes the study and calls
  `StudyAggregate.find_or_create_for!`.
- New `load_census_tract_aggregate` and `load_zip_aggregate`.
- New `aggregates_to_count(aggs)`: drops `state_with_study_only`
  aggregates whose study has no study county in `aggs`.
- New `completion_days_for(aggregate)` reading the studies cache.

### `measurements_processor.rb`, `events_processor.rb`, `daily_trigger_processor.rb`

Use `aggregates_to_count`. Replace `completed?` checks and the
hard-coded 90 with the rules above.

### `processor.rb`

- Load studies into memory in `initialize`.
- `clear` also runs `DELETE FROM study_aggregates WHERE study_id IS NULL`.
  Rural aggregate ids survive, so the goal seed's hard-coded ids stay
  valid.

## Migration

Two migrations, deployed together, in this order:

1. Create `studies`. Insert the rural study, named `rural`: 90 days, notifications
   on, census_place and isp_county on.
2. Create `geospaces_studies`. Insert one row per geospace with
   `study_geospace = true`, for the rural study.
3. Add `study_aggregates.study_id`. Set it to the rural study for:
   state and state_with_study_only rows whose shape is in the rural
   study; rows whose parent is one of those; rows whose parent's
   parent is one of those.
4. Raise if any two rows now share
   `(study_id, level, geospace_id, COALESCE(autonomous_system_org_id, 0))`
   with a non-null study. Then add the unique index.
5. In the second migration, drop `geospaces.study_geospace` and
   `location_metadata_projections.completed`.

Fixtures: drop `study_geospace` from `geospaces.yml`; add
`studies.yml` listing each study's shapes; add `study` to
`study_aggregates.yml`.

## Seeds

`db/custom_seeds/seed_fresno_study.rb`:

1. Create the fresno study, named `fresno`: 7 days, notifications off, census_tract,
   zip and isp_county on.
2. Tag California (geoid `06`), Fresno County (geoid `06019`), every
   census tract with geoid prefix `06019`, and every ZIP whose shape
   intersects Fresno County.
3. `Geospace.link_all_locations(['census_tract', 'zip'])`, so existing
   locations are linked to tracts and ZIPs by containment. The
   processor reads a location's shapes from that link table.
4. `study.populate_aggregates!`, so every Fresno tract and ZIP shows
   in the dashboard before pods report from it.

The ZIP import in `seed_fill_geospaces.rb` (uncommitted) must run
before this seed.

## Rollout

1. Deploy code and migration. The running processor keeps working:
   its counters are keyed by aggregate id and no ids change.
2. Run the ZIP import, then the Fresno seed.
3. Stop the projection job trigger. Run `Processor.clear`. Run the
   processor once to replay everything. Restart the trigger. The
   dashboard shows partial data while the replay runs. The replay time
   is being measured on a production backup.
4. Dashboard: add a `study` variable from `studies` and a
   `study_id` filter to the four queries in
   `analytics/study_performance`. Add `census_tract` and `zip` to the
   level list. Fresno drill-down is state -> county -> census_tract.

## Tests

Minitest with fixtures, matching `test/eventhandlers`. New
`test/eventhandlers/study_metrics_projection_processor_test.rb`,
driving `handle_measurement` with a `location_id` and links set up in
`geospaces_locations`, so no geometry is needed:

- Point in a rural study county builds state, state_with_study_only,
  county, isp_county and place rows under rural, no tract or ZIP.
- Point in a Fresno tract builds tract under county and ZIP under
  state, both flagged, no place.
- Point in a non-study county of a study state builds the county row
  under the study with the flag off.
- Point outside every study builds nothing.
- Daily tick: a Fresno location reaching 7 days bumps Fresno
  aggregates; a rural location bumps at 90, not at 7.
- Tagging a shape into a study updates the existing aggregate row
  instead of creating a second one.
- `populate_aggregates!` creates rows for every enabled level of a
  study's tagged shapes, and a second run creates nothing new.

## Out of scope

- Making `study_id` not null. Possible after the replay.
- A study column on `NotifiedStudyGoal`.
- Location goals for Fresno.
- The unused single-projection push and the `bucket_name IS NULL`
  dashboard branch.
