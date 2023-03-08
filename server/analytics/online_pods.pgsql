with base_series AS (
  SELECT 
    date_trunc('hour', dd) as "time"
  FROM generate_series(
    '2023-03-06T11:39:06.204Z'::timestamp , '2023-03-08T11:39:06.204Z'::timestamp, '1 hour'::interval
  ) dd
), online_status_changes as (
  SELECT 
    online - COALESCE(LAG(online, 1) OVER (partition by (account_id, autonomous_system_id, location_id) ORDER BY online_client_count_projections.id), 0) as incr, 
    online,
    account_id, 
    autonomous_system_id, 
    location_id, 
    timestamp as "time" 
  FROM online_client_count_projections
  JOIN autonomous_systems ON autonomous_systems.id = autonomous_system_id
  JOIN autonomous_system_orgs ON autonomous_system_orgs.id = autonomous_systems.autonomous_system_org_id
  -- Filter by dimensions here
  WHERE 
    account_id IN ('9')
    AND autonomous_system_orgs.id IN ('9','2','1','19','12','7','8','11','4','28','18','27','3','21','5','13','26','14','6','10','17','25','30','22','16','15','24','32','31','29')
    AND location_id IN ('34','54','57','9','27','22','107','30','116','29','50','31','21','32','25','11','20','15','47','12','23','51','52','16','40','38','24','13','14','18','49','33','26','48','55','17','53','56','59','80','85','88','103','67','90','108','76','66','104','58','84','73','64','97','138','93','71','102','60','65','106','105','63','100','62','68','99','10','144','69','75','92','112','74','143','113','117','115','130','137','139','145','81','131','28','121','123','127','119','120','110','129','118','133','140','141','124','132','126','70','125','142','135','79','136','122','86','89','111','160','176','147','155','156','157','168','161','109','134','174','169','149','183','170','171','151','172','152','153','154','182','181','180','146','179','150','184','87','185')
  -- This filter is enforcing that only pods that are claimed and belong to a location will be considered.
), accumulated_counts AS (
  SELECT 
  time,
  SUM(incr) OVER (ORDER BY time) as total_online
  FROM online_status_changes
), count_right_before AS (
  SELECT * 
  FROM accumulated_counts
  WHERE time < '2023-03-06T11:39:06.204Z'
  ORDER BY time DESC LIMIT 1
), count_at_end AS (
  SELECT * 
  FROM accumulated_counts
  WHERE time <= '2023-03-08T01:37:17.594Z'
  ORDER BY time DESC LIMIT 1
), count_with_initial AS (
  SELECT
    *
  FROM accumulated_counts
  WHERE 
    time BETWEEN '2023-03-06T11:39:06.204Z' AND '2023-03-08T01:37:17.594Z'
  UNION
  SELECT '2023-03-06T11:39:06.204Z'::timestamp, total_online 
  FROM count_right_before
  UNION
  SELECT '2023-03-08T01:37:17.594Z'::timestamp, total_online 
  FROM count_at_end
), count_by_hour AS (
  SELECT 
    date_trunc('hour', "time") as "time",
    MAX(total_online) as "total_online"
  FROM count_with_initial
  GROUP BY 1
), all_points_count AS (
  SELECT 
    base_series."time", total_online
  FROM base_series
  LEFT JOIN count_by_hour t2 ON t2.time = base_series.time
), all_points_count_ffill AS (
  SELECT
    t."time",
    COALESCE(total_online, FIRST_VALUE(total_online) OVER (PARTITION BY non_null_count ORDER BY t."time")) as "total_online"
  FROM (
     -- Create a new column with the window count of the online value
    -- This count will keep its value until there's a non-null value in the online field, in which it increases by one
    SELECT *, COUNT(total_online) OVER (ORDER BY all_points_count."time") as non_null_count
    FROM all_points_count
  ) t
)


SELECT * FROM all_points_count_ffill