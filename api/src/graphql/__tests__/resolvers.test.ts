import { GraphQLError } from 'graphql'

jest.mock('../../db/bootstrap', () => ({
    leadRepository: {
        listLeads: jest.fn(),
        getLeadById: jest.fn(),
        registerLead: jest.fn(),
    },
}))
jest.mock('../../logger', () => ({
    logger: {
        child: jest.fn(() => ({
            info: jest.fn(),
            error: jest.fn(),
        })),
        info: jest.fn(),
        error: jest.fn(),
    },
}))

import { leadRepository } from '../../db/bootstrap'
import { logger } from '../../logger'
import { resolvers } from '../resolvers'

type FakeModel = {
    getDataValue: (key: string) => any
}

const model = (values: Record<string, any>): FakeModel => ({
    getDataValue: (key: string) => values[key],
})

describe('GraphQL resolvers', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('Query.leads: filters and DTOs', async () => {
        const createdAt = new Date('2026-01-18T00:00:00.000Z')

        const row = model({
            id: 1,
            createdAt,
        }) as any

        row.customer = model({
            name: 'Tim',
            email: 'tim@example.com',
            mobile: '0400',
            postcode: '2150',
        })

        row.services = [model({ service: 'DELIVERY' }), model({ service: 'PICK_UP' })]

        ;(leadRepository.listLeads as jest.Mock).mockResolvedValue([row])

        const result = await resolvers.Query.leads(undefined as any, {
            filter: { email: 'tim@example.com' },
        })

        expect(leadRepository.listLeads).toHaveBeenCalledWith({ email: 'tim@example.com' })
        expect(result).toEqual([
            {
                id: '1',
                name: 'Tim',
                email: 'tim@example.com',
                mobile: '0400',
                postcode: '2150',
                services: ['DELIVERY', 'PICK_UP'],
                createdAt: createdAt.toISOString(),
            },
        ])

        expect(logger.child).toHaveBeenCalledWith({ filter: { email: 'tim@example.com' } })
    })

    it('Query.lead: returns null when not found', async () => {
        ;(leadRepository.getLeadById as jest.Mock).mockResolvedValue(null)

        const result = await resolvers.Query.lead(undefined as any, { id: '123' })

        expect(leadRepository.getLeadById).toHaveBeenCalledWith(123)
        expect(result).toBeNull()
    })

    it('Query.lead: maps DTO when found', async () => {
        const createdAt = new Date('2026-01-18T00:00:00.000Z')

        const row = model({ id: 7, createdAt }) as any
        row.customer = model({
            name: 'A',
            email: 'a@example.com',
            mobile: '0411',
            postcode: '2000',
        })
        row.services = [model({ service: 'DELIVERY' })]

        ;(leadRepository.getLeadById as jest.Mock).mockResolvedValue(row)

        const result = await resolvers.Query.lead(undefined as any, { id: '7' })

        expect(leadRepository.getLeadById).toHaveBeenCalledWith(7)
        expect(result).toEqual({
            id: '7',
            name: 'A',
            email: 'a@example.com',
            mobile: '0411',
            postcode: '2000',
            services: ['DELIVERY'],
            createdAt: createdAt.toISOString(),
        })
    })

    it('Mutation.register: throws GraphQLError when repository returns null', async () => {
        ;(leadRepository.registerLead as jest.Mock).mockResolvedValue(null)

        await expect(
            resolvers.Mutation.register(undefined as any, {
                input: {
                    name: 'Tim',
                    email: 'tim@example.com',
                    mobile: '0400',
                    postcode: '2150',
                    services: ['DELIVERY'],
                },
            })
        ).rejects.toBeInstanceOf(GraphQLError)

        expect(leadRepository.registerLead).toHaveBeenCalled()
        expect(logger.child).toHaveBeenCalledWith({ email: 'tim@example.com' })
    })

    it('Mutation.register: maps DTO when successful', async () => {
        const createdAt = new Date('2026-01-18T00:00:00.000Z')

        const row = model({ id: 99, createdAt }) as any
        row.customer = model({
            name: 'Tim',
            email: 'tim@example.com',
            mobile: '0400',
            postcode: '2150',
        })
        row.services = [model({ service: 'DELIVERY' }), model({ service: 'PICK_UP' })]

        ;(leadRepository.registerLead as jest.Mock).mockResolvedValue(row)

        const result = await resolvers.Mutation.register(undefined as any, {
            input: {
                name: 'Tim',
                email: 'tim@example.com',
                mobile: '0400',
                postcode: '2150',
                services: ['DELIVERY', 'PICK_UP'],
            },
        })

        expect(leadRepository.registerLead).toHaveBeenCalledWith({
            name: 'Tim',
            email: 'tim@example.com',
            mobile: '0400',
            postcode: '2150',
            services: ['DELIVERY', 'PICK_UP'],
        })

        expect(result).toEqual({
            id: '99',
            name: 'Tim',
            email: 'tim@example.com',
            mobile: '0400',
            postcode: '2150',
            services: ['DELIVERY', 'PICK_UP'],
            createdAt: createdAt.toISOString(),
        })
    })
})
