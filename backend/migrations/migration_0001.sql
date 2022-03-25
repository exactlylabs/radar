

CREATE TABLE IF NOT EXISTS tests (
  id FixedString(37),
  ip String,
  latitude float,
  longitude float,
  upload boolean,
  started_at DateTime,
  mbps float,
  loss_rate Nullable(float),
  min_rtt Nullable(float),
  asn int,
  asn_org String,
  has_access_token boolean,
  access_token_sig Nullable(String)
)
ENGINE=MergeTree
PRIMARY KEY id
ORDER BY (id, started_at)

