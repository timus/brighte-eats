import {LeadRepository} from "../lead-repository";

import {LeadServiceInstance} from "../../db/model/lead-service";
import {createTestDb, destroyTestDb} from "../../test/helpers/db";

describe('LeadRepository', () => {
    let sequelize: any
    let models: any
    let repo: LeadRepository

    beforeEach(async () => {
        const db = await createTestDb()
        sequelize = db.sequelize
        models = db.models
        repo = new LeadRepository(models)
    })

    afterEach(async () => {
        await destroyTestDb(sequelize)
    })

    it('registerLead: creates customer, lead, services', async () => {
        const result = await repo.registerLead({
            name: 'Tim',
            email: 'tim@example.com',
            mobile: '0400000000',
            postcode: '2150',
            services: ['DELIVERY', 'DELIVERY', 'PICK_UP'],
        })

        expect(result).not.toBeNull()

        expect(await models.Customer.count()).toBe(1)
        expect(await models.Lead.count()).toBe(1)
        expect(await models.LeadService.count()).toBe(2)

        const customer = await models.Customer.findOne({where: {email: 'tim@example.com'}})
        expect(customer).not.toBeNull()
        expect(customer!.get('name')).toBe('Tim')
        expect(customer!.get('mobile')).toBe('0400000000')
        expect(customer!.get('postcode')).toBe('2150')

        const lead = await models.Lead.findOne({order: [['createdAt', 'DESC']]})
        expect(lead).not.toBeNull()
        expect(lead!.get('customerId')).toBe(customer!.get('id'))

        const services: LeadServiceInstance[] = await models.LeadService.findAll({
            where: {leadId: lead!.get('id') as number},
            order: [['service', 'ASC']],
        })

        expect(services.map((service) => service.get('service'))).toEqual(['DELIVERY', 'PICK_UP'])
    })

    it('registerLead: handles empty services ', async () => {
        const result = await repo.registerLead({
            name: 'Tim',
            email: 'tim-nosvc@example.com',
            mobile: '0400000000',
            postcode: '2150',
            services: [],
        })

        expect(result).not.toBeNull()

        expect(await models.Customer.count()).toBe(1)
        expect(await models.Lead.count()).toBe(1)
        expect(await models.LeadService.count()).toBe(0)
    })

    it('registerLead: reuses same customer by email and updates fields', async () => {
        await repo.registerLead({
            name: 'Old Name',
            email: 'tim@example.com',
            mobile: '0400000000',
            postcode: '2000',
            services: ['DELIVERY'],
        })

        await repo.registerLead({
            name: 'New Name',
            email: 'tim@example.com',
            mobile: '0499999999',
            postcode: '2150',
            services: ['PICK_UP'],
        })

        expect(await models.Customer.count()).toBe(1) // reused
        expect(await models.Lead.count()).toBe(2) // new lead each time

        const customer = await models.Customer.findOne({where: {email: 'tim@example.com'}})
        expect(customer).not.toBeNull()
        expect(customer!.get('name')).toBe('New Name')
        expect(customer!.get('mobile')).toBe('0499999999')
        expect(customer!.get('postcode')).toBe('2150')
    })

    it('listLeads: filters by customer email and postcode', async () => {
        await repo.registerLead({
            name: 'A',
            email: 'a@example.com',
            mobile: '0400000001',
            postcode: '2150',
            services: ['DELIVERY'],
        })

        await repo.registerLead({
            name: 'B',
            email: 'b@example.com',
            mobile: '0400000002',
            postcode: '3000',
            services: ['PICK_UP'],
        })

        const byEmail = await repo.listLeads({email: 'a@example.com'})
        expect(byEmail).toHaveLength(1)

        const aCustomer = await models.Customer.findOne({where: {email: 'a@example.com'}})
        expect(aCustomer).not.toBeNull()
        expect(byEmail[0].get('customerId')).toBe(aCustomer!.get('id'))

        const byPostcode = await repo.listLeads({postcode: '3000'})
        expect(byPostcode).toHaveLength(1)

        const bCustomer = await models.Customer.findOne({where: {email: 'b@example.com'}})
        expect(bCustomer).not.toBeNull()
        expect(byPostcode[0].get('customerId')).toBe(bCustomer!.get('id'))

        const byBoth = await repo.listLeads({email: 'b@example.com', postcode: '3000'})
        expect(byBoth).toHaveLength(1)

        const none = await repo.listLeads({email: 'b@example.com', postcode: '9999'})
        expect(none).toHaveLength(0)
    })

    it('getLeadById: returns null when not found', async () => {
        const row = await repo.getLeadById(12345)
        expect(row).toBeNull()
    })

    it('registerLead: rethrows when Lead.create fails ', async () => {
        const createSpy = jest
            .spyOn(models.Lead, 'create')
            .mockRejectedValueOnce(new Error('DB exploded'))

        await expect(
            repo.registerLead({
                name: 'Tim',
                email: 'tim-fail@example.com',
                mobile: '0400000000',
                postcode: '2150',
                services: ['DELIVERY'],
            })
        ).rejects.toThrow()

        createSpy.mockRestore()
    })
})
