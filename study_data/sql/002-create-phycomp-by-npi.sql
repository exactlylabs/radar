CREATE TABLE phycomp_by_npi AS (
  SELECT npi,ind_pac_id,ind_enrl_id,lst_nm,frst_nm,mid_nm,suff,gndr,Cred,Med_sch,Grd_yr,pri_spec,sec_spec_1,sec_spec_2,sec_spec_3,sec_spec_4,sec_spec_all,Telehlth,org_nm,org_pac_id,num_org_mem,adr_ln_1,adr_ln_2,ln_2_sprs,cty,st,zip,phn_numbr,ind_assgn,grp_assgn,adrs_id
  FROM (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY npi ORDER BY ind_enrl_id DESC) AS r
    FROM phycomp
  ) a
  WHERE r = 1
)