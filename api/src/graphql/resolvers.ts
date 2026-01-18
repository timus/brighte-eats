import {GraphQLError} from 'graphql'
import {leadRepository} from '../db/bootstrap'
import {logger} from '../logger'

import type {LeadFilter, RegisterInput} from '../types'
import type {LeadInstance} from '../db/model/lead'
import type {CustomerInstance} from '../db/model/customer'
import type {LeadServiceInstance} from '../db/model/lead-service'

type LeadWithCustomerAndServices = LeadInstance & {
    customer: CustomerInstance
    services: LeadServiceInstance[]
}

const toServices = (rows: LeadServiceInstance[] = []) =>
    rows.map((r) => r.getDataValue('service'))

const toLeadDto = (lead: LeadWithCustomerAndServices) => ({
    id: String(lead.getDataValue('id')),
    name: lead.customer.getDataValue('name'),
    email: lead.customer.getDataValue('email'),
    mobile: lead.customer.getDataValue('mobile'),
    postcode: lead.customer.getDataValue('postcode'),
    services: toServices(lead.services),
    createdAt: lead.getDataValue('createdAt').toISOString(),
})

export const resolvers = {
    Query: {
        leads: async (_parent: unknown, args: { filter?: LeadFilter }) => {
            const log = logger.child({filter: args.filter})
            log.info('graphql:leads')

            const rows = (await leadRepository.listLeads(
                args.filter
            )) as LeadWithCustomerAndServices[]

            return rows.map(toLeadDto)
        },

        lead: async (_parent: unknown, args: { id: string }) => {
            const leadId = Number(args.id)
            const log = logger.child({leadId})

            log.info('graphql:lead')

            const row = (await leadRepository.getLeadById(
                leadId
            )) as LeadWithCustomerAndServices | null

            return row ? toLeadDto(row) : null
        },
    },

    Mutation: {
        register: async (_parent: unknown, args: { input: RegisterInput }) => {
            const log = logger.child({email: args.input.email})
            log.info('graphql:register:start')

            try {
                const row = (await leadRepository.registerLead(
                    args.input
                )) as LeadWithCustomerAndServices | null

                if (!row) {
                    log.error('graphql:register:nullResult')
                    throw new GraphQLError('Register failed: lead not created', {
                        extensions: {code: 'INTERNAL_SERVER_ERROR'},
                    })
                }

                log.info(
                    {leadId: row.getDataValue('id')},
                    'graphql:register:success'
                )

                return toLeadDto(row)
            } catch (err) {
                log.error({err}, 'graphql:register:failed')
                throw err
            }
        },
    },
}
