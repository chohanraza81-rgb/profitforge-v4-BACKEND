sources: providerNames.map((name, idx) => ({
  provider: name,
  status: settled[idx].status,
  latency: settled[idx].status === 'fulfilled' && settled[idx].value ? (settled[idx].value._latency || null) : null
}))
