import type {ModelStatic} from 'sequelize'

type LeadFilter = { email?: string; postcode?: string }

type Models = {
    Customer: ModelStatic<any>
    Lead: ModelStatic<any>
    LeadService: ModelStatic<any>
}

type EatsService = 'DELIVERY' | 'PICK_UP' | 'PAYMENT'

type RegisterInput = {
    name: string
    email: string
    mobile: string
    postcode: string
    services: EatsService[]
}

export class LeadRepository {
    constructor(private models: Models) {
    }

    async listLeads(filter?: LeadFilter) {
        const customerWhere: Record<string, any> = {}

        if (filter?.email) customerWhere.email = filter.email
        if (filter?.postcode) customerWhere.postcode = filter.postcode

        return this.models.Lead.findAll({
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: this.models.Customer,
                    as: 'customer',
                    ...(Object.keys(customerWhere).length ? {where: customerWhere} : {}),
                },
                {model: this.models.LeadService, as: 'services'},
            ],
        })
    }

    async getLeadById(id: number) {
        return this.models.Lead.findByPk(id, {
            include: [
                {model: this.models.Customer, as: 'customer'},
                {model: this.models.LeadService, as: 'services'},
            ],
        })
    }

    async registerLead(input: RegisterInput) {
        const services = [...new Set(input.services)]

        const [customer] = await this.models.Customer.findOrCreate({
            where: {email: input.email},
            defaults: {
                name: input.name,
                email: input.email,
                mobile: input.mobile,
                postcode: input.postcode,
            },
        })

        await customer.update({
            name: input.name,
            mobile: input.mobile,
            postcode: input.postcode,
        })

        const lead = await this.models.Lead.create({
            customerId: customer.getDataValue('id'),
        })

        if (services.length) {
            await this.models.LeadService.bulkCreate(
                services.map((service) => ({
                    leadId: lead.getDataValue('id'),
                    service,
                }))
            )
        }

        return this.getLeadById(lead.getDataValue('id'))
    }
}
