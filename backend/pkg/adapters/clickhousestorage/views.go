package clickhousestorage

// maps all views that should be created at each update
var views = map[string]string{
	"summary_alltime": `
CREATE MATERIALIZED VIEW summary_alltime_tmp
ENGINE=MergeTree
ORDER BY (upload, geospace_id, asn_id)
POPULATE
AS
SELECT
    quantileExact(0.5)(m_ip.med_ip_mbps) as med_mbps,
    quantileExact(0.5)(m_ip.med_ip_rtt) as med_min_rtt,
    CountIf(med_ip_mbps < if(upload=0, 25, 3)) as bad_count,
    CountIf(med_ip_mbps >= if(upload=0, 25, 3) AND med_ip_mbps < if (upload=0, 100, 20)) as normal_count,
    CountIf(med_ip_mbps > if(upload=0, 100, 20)) as good_count,
    Count(*) as total_samples,
    m_ip.geospace_id,
    m_ip.asn_id,
    m_ip.upload
FROM (
    SELECT 
        m.geospace_id, 
        m.asn_id, 
        quantileExact(0.5)(m.mbps) as med_ip_mbps,
        quantileExact(0.5)(m.min_rtt) as med_ip_rtt,
        m.upload
    FROM measurements m
    GROUP BY m.geospace_id, m.asn_id, m.upload, m.ip
) m_ip 
GROUP BY m_ip.geospace_id, m_ip.asn_id, m_ip.upload;
`,

	"summary_geospace_alltime": `
CREATE MATERIALIZED VIEW summary_geospace_alltime_tmp
ENGINE=MergeTree
ORDER BY (upload, geospace_id)
POPULATE
AS
SELECT
    quantileExact(0.5)(m_ip.med_ip_mbps) as med_mbps,
    quantileExact(0.5)(m_ip.med_ip_rtt) as med_min_rtt,
    CountIf(med_ip_mbps < if(upload=0, 25, 3)) as bad_count,
    CountIf(med_ip_mbps >= if(upload=0, 25, 3) AND med_ip_mbps < if (upload=0, 100, 20)) as normal_count,
    CountIf(med_ip_mbps > if(upload=0, 100, 20)) as good_count,
    Count(*) as total_samples,
    m_ip.geospace_id,
    m_ip.upload
FROM (
    SELECT 
        m.geospace_id, 
        quantileExact(0.5)(m.mbps) as med_ip_mbps,
        quantileExact(0.5)(m.min_rtt) as med_ip_rtt,
        m.upload
    FROM measurements m
    GROUP BY m.geospace_id, m.upload, m.ip
) m_ip 
GROUP BY m_ip.geospace_id, m_ip.upload;
`,

	"summary_year": `
CREATE MATERIALIZED VIEW summary_year_tmp
ENGINE=MergeTree
ORDER BY (upload, geospace_id, asn_id, year)
POPULATE
AS
SELECT
    quantileExact(0.5)(m_ip.med_ip_mbps) as med_mbps,
    quantileExact(0.5)(m_ip.med_ip_rtt) as med_min_rtt,
    CountIf(med_ip_mbps < if(upload=0, 25, 3)) as bad_count,
    CountIf(med_ip_mbps >= if(upload=0, 25, 3) AND med_ip_mbps < if (upload=0, 100, 20)) as normal_count,
    CountIf(med_ip_mbps > if(upload=0, 100, 20)) as good_count,
    Count(*) as total_samples,
    m_ip.geospace_id,
    m_ip.asn_id,
    m_ip.upload,
    m_ip.year as year
FROM (
    SELECT 
        m.geospace_id, 
        m.asn_id, 
        quantileExact(0.5)(m.mbps) as med_ip_mbps,
        quantileExact(0.5)(m.min_rtt) as med_ip_rtt,
        m.upload,
        YEAR(m.time) as year
    FROM measurements m
    GROUP BY m.geospace_id, m.asn_id, m.upload, m.ip, year
) m_ip 
GROUP BY m_ip.geospace_id, m_ip.asn_id, m_ip.upload, m_ip.year;
`,

	"summary_geospace_year": `
CREATE MATERIALIZED VIEW summary_geospace_year_tmp
ENGINE=MergeTree
ORDER BY (upload, geospace_id, year)
POPULATE
AS
SELECT
    quantileExact(0.5)(m_ip.med_ip_mbps) as med_mbps,
    quantileExact(0.5)(m_ip.med_ip_rtt) as med_min_rtt,
    CountIf(med_ip_mbps < if(upload=0, 25, 3)) as bad_count,
    CountIf(med_ip_mbps >= if(upload=0, 25, 3) AND med_ip_mbps < if (upload=0, 100, 20)) as normal_count,
    CountIf(med_ip_mbps > if(upload=0, 100, 20)) as good_count,
    Count(*) as total_samples,
    m_ip.geospace_id,
    m_ip.upload,
    m_ip.year as year
FROM (
    SELECT 
        m.geospace_id, 
        quantileExact(0.5)(m.mbps) as med_ip_mbps,
        quantileExact(0.5)(m.min_rtt) as med_ip_rtt,
        m.upload,
        YEAR(m.time) as year
    FROM measurements m
    GROUP BY m.geospace_id, m.upload, m.ip, year
) m_ip 
GROUP BY m_ip.geospace_id, m_ip.upload, m_ip.year;
`,

	"summary_semester": `
CREATE MATERIALIZED VIEW summary_semester_tmp
ENGINE=MergeTree
ORDER BY (upload, geospace_id, asn_id, year, semester)
POPULATE
AS
SELECT
    quantileExact(0.5)(m_ip.med_ip_mbps) as med_mbps,
    quantileExact(0.5)(m_ip.med_ip_rtt) as med_min_rtt,
    CountIf(med_ip_mbps < if(upload=0, 25, 3)) as bad_count,
    CountIf(med_ip_mbps >= if(upload=0, 25, 3) AND med_ip_mbps < if (upload=0, 100, 20)) as normal_count,
    CountIf(med_ip_mbps > if(upload=0, 100, 20)) as good_count,
    Count(*) as total_samples,
    m_ip.geospace_id,
    m_ip.asn_id,
    m_ip.upload,
    m_ip.year as year,
    m_ip.semester as semester
FROM (
    SELECT 
        m.geospace_id, 
        m.asn_id, 
        quantileExact(0.5)(m.mbps) as med_ip_mbps,
        quantileExact(0.5)(m.min_rtt) as med_ip_rtt,
        m.upload,
        YEAR(m.time) as year,
        (MONTH(m.time) / 6)::int + 1 as semester
    FROM measurements m
    GROUP BY m.geospace_id, m.asn_id, m.upload, m.ip, year, semester
) m_ip 
GROUP BY m_ip.geospace_id, m_ip.asn_id, m_ip.upload, m_ip.year, m_ip.semester;
`,

	"summary_geospace_semester": `
CREATE MATERIALIZED VIEW summary_geospace_semester_tmp
ENGINE=MergeTree
ORDER BY (upload, geospace_id, year, semester)
POPULATE
AS
SELECT
    quantileExact(0.5)(m_ip.med_ip_mbps) as med_mbps,
    quantileExact(0.5)(m_ip.med_ip_rtt) as med_min_rtt,
    CountIf(med_ip_mbps < if(upload=0, 25, 3)) as bad_count,
    CountIf(med_ip_mbps >= if(upload=0, 25, 3) AND med_ip_mbps < if (upload=0, 100, 20)) as normal_count,
    CountIf(med_ip_mbps > if(upload=0, 100, 20)) as good_count,
    Count(*) as total_samples,
    m_ip.geospace_id,
    m_ip.upload,
    m_ip.year as year,
    m_ip.semester as semester
FROM (
    SELECT 
        m.geospace_id, 
        quantileExact(0.5)(m.mbps) as med_ip_mbps,
        quantileExact(0.5)(m.min_rtt) as med_ip_rtt,
        m.upload,
        YEAR(m.time) as year,
        (MONTH(m.time) / 6)::int + 1 as semester
    FROM measurements m
    GROUP BY m.geospace_id, m.upload, m.ip, year, semester
) m_ip 
GROUP BY m_ip.geospace_id, m_ip.upload, m_ip.year, m_ip.semester;
`,

	"summary_month": `
CREATE MATERIALIZED VIEW summary_month_tmp
ENGINE=MergeTree
ORDER BY (upload, geospace_id, asn_id, year, month)
POPULATE
AS
SELECT
    quantileExact(0.5)(m_ip.med_ip_mbps) as med_mbps,
    quantileExact(0.5)(m_ip.med_ip_rtt) as med_min_rtt,
    CountIf(med_ip_mbps < if(upload=0, 25, 3)) as bad_count,
    CountIf(med_ip_mbps >= if(upload=0, 25, 3) AND med_ip_mbps < if (upload=0, 100, 20)) as normal_count,
    CountIf(med_ip_mbps > if(upload=0, 100, 20)) as good_count,
    Count(*) as total_samples,
    m_ip.geospace_id,
    m_ip.asn_id,
    m_ip.upload,
    m_ip.year as year,
    m_ip.month as month
FROM (
    SELECT 
        m.geospace_id, 
        m.asn_id, 
        quantileExact(0.5)(m.mbps) as med_ip_mbps,
        quantileExact(0.5)(m.min_rtt) as med_ip_rtt,
        m.upload,
        YEAR(m.time) as year,
        MONTH(m.time) as month
    FROM measurements m
    GROUP BY m.geospace_id, m.asn_id, m.upload, m.ip, year, month
) m_ip 
GROUP BY m_ip.geospace_id, m_ip.asn_id, m_ip.upload, m_ip.year, m_ip.month;
`,

	"summary_geospace_month": `
CREATE MATERIALIZED VIEW summary_geospace_month_tmp
ENGINE=MergeTree
ORDER BY (upload, geospace_id, year, month)
POPULATE
AS
SELECT
    quantileExact(0.5)(m_ip.med_ip_mbps) as med_mbps,
    quantileExact(0.5)(m_ip.med_ip_rtt) as med_min_rtt,
    CountIf(med_ip_mbps < if(upload=0, 25, 3)) as bad_count,
    CountIf(med_ip_mbps >= if(upload=0, 25, 3) AND med_ip_mbps < if (upload=0, 100, 20)) as normal_count,
    CountIf(med_ip_mbps > if(upload=0, 100, 20)) as good_count,
    Count(*) as total_samples,
    m_ip.geospace_id,
    m_ip.upload,
    m_ip.year as year,
    m_ip.month as month
FROM (
    SELECT 
        m.geospace_id, 
        quantileExact(0.5)(m.mbps) as med_ip_mbps,
        quantileExact(0.5)(m.min_rtt) as med_ip_rtt,
        m.upload,
        YEAR(m.time) as year,
        MONTH(m.time) as month
    FROM measurements m
    GROUP BY m.geospace_id, m.upload, m.ip, year, month
) m_ip 
GROUP BY m_ip.geospace_id, m_ip.upload, m_ip.year, m_ip.month;
`,

	"summary_week": `
CREATE MATERIALIZED VIEW summary_week_tmp
ENGINE=MergeTree
ORDER BY (upload, geospace_id, asn_id, year, week)
POPULATE
AS
SELECT
    quantileExact(0.5)(m_ip.med_ip_mbps) as med_mbps,
    quantileExact(0.5)(m_ip.med_ip_rtt) as med_min_rtt,
    CountIf(med_ip_mbps < if(upload=0, 25, 3)) as bad_count,
    CountIf(med_ip_mbps >= if(upload=0, 25, 3) AND med_ip_mbps < if (upload=0, 100, 20)) as normal_count,
    CountIf(med_ip_mbps > if(upload=0, 100, 20)) as good_count,
    Count(*) as total_samples,
    m_ip.geospace_id,
    m_ip.asn_id,
    m_ip.upload,
    m_ip.year as year,
    m_ip.week as week
FROM (
    SELECT 
        m.geospace_id, 
        m.asn_id, 
        quantileExact(0.5)(m.mbps) as med_ip_mbps,
        quantileExact(0.5)(m.min_rtt) as med_ip_rtt,
        m.upload,
        YEAR(m.time) as year,
        WEEK(m.time) as week
    FROM measurements m
    GROUP BY m.geospace_id, m.asn_id, m.upload, m.ip, year, week
) m_ip 
GROUP BY m_ip.geospace_id, m_ip.asn_id, m_ip.upload, m_ip.year, m_ip.week;
`,

	"summary_geospace_week": `
CREATE MATERIALIZED VIEW summary_geospace_week_tmp
ENGINE=MergeTree
ORDER BY (upload, geospace_id, year, week)
POPULATE
AS
SELECT
    quantileExact(0.5)(m_ip.med_ip_mbps) as med_mbps,
    quantileExact(0.5)(m_ip.med_ip_rtt) as med_min_rtt,
    CountIf(med_ip_mbps < if(upload=0, 25, 3)) as bad_count,
    CountIf(med_ip_mbps >= if(upload=0, 25, 3) AND med_ip_mbps < if (upload=0, 100, 20)) as normal_count,
    CountIf(med_ip_mbps > if(upload=0, 100, 20)) as good_count,
    Count(*) as total_samples,
    m_ip.geospace_id,
    m_ip.upload,
    m_ip.year as year,
    m_ip.week as week
FROM (
    SELECT 
        m.geospace_id, 
        quantileExact(0.5)(m.mbps) as med_ip_mbps,
        quantileExact(0.5)(m.min_rtt) as med_ip_rtt,
        m.upload,
        YEAR(m.time) as year,
        WEEK(m.time) as week
    FROM measurements m
    GROUP BY m.geospace_id, m.upload, m.ip, year, week
) m_ip 
GROUP BY m_ip.geospace_id, m_ip.upload, m_ip.year, m_ip.week;
`,

	"us_asns": `
CREATE MATERIALIZED VIEW us_asns_tmp
ENGINE=MergeTree
ORDER BY (geospace_id)
POPULATE
AS
SELECT DISTINCT ON (m.asn_id, m.geospace_id) m.asn_id, m.geospace_id, a.asn, a.organization
FROM measurements m
JOIN asns a ON a.id = m.asn_id
WHERE m.geospace_id IS NOT NULL;
`,
}
