import type { ModelStatic } from 'sequelize'

type LeadFilter = { email?: string; postcode?: string }

type Models = {
    Customer: ModelStatic<any>
    Lead: ModelStatic<any>
    LeadService: ModelStatic<any>
}

export class LeadRepository {
    constructor(private models: Models) {}

    async listLeads(filter?: LeadFilter) {
        const customerWhere: Record<string, any> = {}
        if (filter?.email) {
            customerWhere.email = filter.email
        }
        if (filter?.postcode) {
            customerWhere.postcode = filter.postcode
        }

        return this.models.Lead.findAll({
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: this.models.Customer,
                    as: 'customer',
                    ...(Object.keys(customerWhere).length ? { where: customerWhere } : {})
                },
                { model: this.models.LeadService, as: 'services' }
            ]
        })
    }

    async getLeadById(id: number) {
        return this.models.Lead.findByPk(id, {
            include: [
                { model: this.models.Customer, as: 'customer' },
                { model: this.models.LeadService, as: 'services' }
            ]
        })
    }
}
