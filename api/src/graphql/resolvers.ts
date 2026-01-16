type EatsService = 'DELIVERY' | 'PICK_UP' | 'PAYMENT'

type Lead = {
    id: string
    name: string
    email: string
    mobile: string
    postcode: string
    services: EatsService[]
    createdAt: string
}

const leads: Lead[] = [
    {
        id: '1',
        name: 'Sumit',
        email: 'sumit@test.com',
        mobile: '0400000000',
        postcode: '2000',
        services: ['DELIVERY', 'PAYMENT'],
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Alex',
        email: 'alex@test.com',
        mobile: '0411111111',
        postcode: '2150',
        services: ['PICK_UP'],
        createdAt: new Date().toISOString()
    }
]

export const resolvers = {
    Query: {
        leads: (
            _: unknown,
            args: { filter?: { email?: string; postcode?: string } }
        ) => {
            const filter = args.filter
            if (!filter) return leads

            return leads.filter(lead => {
                if (filter.email && lead.email !== filter.email) {
                    return false
                }
                if (filter.postcode && lead.postcode !== filter.postcode) {
                    return false
                }
                return true
            })
        },

        lead: (_: unknown, args: { id: string }) => {
            return leads.find(l => l.id === args.id) ?? null
        }
    }
}
