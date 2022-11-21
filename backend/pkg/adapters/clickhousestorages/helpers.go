package clickhousestorages

func addLimitOffset(query string, args []any, limit, offset *int) (string, []any) {
	if limit != nil {
		query += " LIMIT ?"
		args = append(args, *limit)
	}
	if offset != nil {
		query += " OFFSET ?"
		args = append(args, *offset)
	}
	return query, args
}
