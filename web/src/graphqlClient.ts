const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL

export async function fetchLeads() {
    const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            query: `
        query {
          leads {
            id
            name
            email
            postcode
            services,
            createdAt
          }
        }
      `
        })
    })

    const json = await res.json()
    return json.data.leads
}

export async function registerLead(input: {
    name: string
    email: string
    mobile: string
    postcode: string
    services: string[]
}) {
    const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            query: `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            id
            name
            email
            postcode
            services
          }
        }
      `,
            variables: {input}
        })
    })

    const json = await res.json()

    if (json.errors?.length) {
        throw new Error(json.errors[0].message)
    }

    return json.data.register
}

