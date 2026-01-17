import { leadRepository } from '../db/bootstrap'

type LeadFilter = { email?: string; postcode?: string }

const toServices = (rows: Array<{ service: string }> = []) => rows.map((r) => r.service)

const toLeadDto = (lead: any) => ({
    id: String(lead.id),
    name: lead.customer.name,
    email: lead.customer.email,
    mobile: lead.customer.mobile,
    postcode: lead.customer.postcode,
    services: toServices(lead.services),
    createdAt: lead.createdAt.toISOString()
})

export const resolvers = {
    Query: {
        leads: async (_: unknown, args: { filter?: LeadFilter }) => {
            const rows = await leadRepository.listLeads(args.filter)
            return rows.map(toLeadDto)
        },

        lead: async (_: unknown, args: { id: string }) => {
            const row = await leadRepository.getLeadById(Number(args.id))
            return row ? toLeadDto(row) : null
        }
    }
}
