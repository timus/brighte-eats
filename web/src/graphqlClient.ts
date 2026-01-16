const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL

export async function fetchLeads() {
    const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `
        query {
          leads {
            id
            name
            email
            postcode
            services
          }
        }
      `
        })
    })

    const json = await res.json()
    return json.data.leads
}
