export function paginate(query, page = 1, limit = 20) {
  const p = Math.max(1, parseInt(page, 10) || 1)
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))
  return {
    skip: (p - 1) * l,
    limit: l,
    page: p,
    totalPages: 0,
    total: 0,
  }
}

export function buildFilter(query, allowed = []) {
  const filter = {}
  for (const key of allowed) {
    if (query[key] !== undefined) filter[key] = query[key]
  }
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { nameAr: { $regex: query.search, $options: 'i' } },
    ]
  }
  return filter
}
