WITH location_grouped AS (
  SELECT
    date_trunc('h', processed_at) as "time",
    percentile_disc(0.5) WITHIN GROUP (ORDER BY measurements.upload) as "upload_median",
    avg(measurements.upload) AS "average",
    stddev(measurements.upload) as "stdd",
    location_id

  FROM measurements
  JOIN autonomous_systems ON autonomous_systems.id = autonomous_system_id
  JOIN autonomous_system_orgs ON autonomous_system_orgs.id = autonomous_systems.autonomous_system_org_id
  WHERE
    processed_at BETWEEN '2023-03-06T11:39:06.204Z' AND '2023-03-08T01:37:17.594Z'
    AND account_id IN ('9')
    AND autonomous_system_orgs.id IN ('9','2','1','19','12','7','8','11','4','28','18','27','3','21','5','13','26','14','6','10','17','25','30','22','16','15','24','32','31','29')
    AND location_id IN ('34','54','57','9','27','22','107','30','116','29','50','31','21','32','25','11','20','15','47','12','23','51','52','16','40','38','24','13','14','18','49','33','26','48','55','17','53','56','59','80','85','88','103','67','90','108','76','66','104','58','84','73','64','97','138','93','71','102','60','65','106','105','63','100','62','68','99','10','144','69','75','92','112','74','143','113','117','115','130','137','139','145','81','131','28','121','123','127','119','120','110','129','118','133','140','141','124','132','126','70','125','142','135','79','136','122','86','89','111','160','176','147','155','156','157','168','161','109','134','174','169','149','183','170','171','151','172','152','153','154','182','181','180','146','179','150','184','87','185')

  GROUP BY 1, location_id
  ORDER BY "time" ASC
)

SELECT 
  time,
  percentile_disc(0.5) WITHIN GROUP (ORDER BY upload_median) as "upload_median",
  avg(average) AS "average",
  stddev(stdd) as "stdd"
FROM location_grouped
GROUP BY 1
ORDER BY "time"