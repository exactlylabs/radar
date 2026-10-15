-- Per ingested UTC day, the finished_at of the processor's completeness manifest its tests
-- came from. The hourly ingestor repairs the days of the last week whose manifest is newer:
-- the processor's daily run re-fetches a day the M-Lab archive grew since (a server pushing a
-- tarball late), and the forward ingest only moves on from its cursor. Also created by the
-- ingestor itself (CREATE TABLE IF NOT EXISTS).
CREATE TABLE IF NOT EXISTS ingested_days (
    day Date,
    finished_at DateTime('UTC'),
    recorded_at DateTime('UTC')
) ENGINE = ReplacingMergeTree(recorded_at) ORDER BY day;
