import type { ModelStatic, WhereOptions } from 'sequelize'
import type { LeadFilter, RegisterInput } from '../types'
import {CustomerAttributes, CustomerInstance} from "../db/model/customer";
import {LeadInstance} from "../db/model/lead";
import {LeadServiceInstance} from "../db/model/lead-service";

type Models = {
    Customer: ModelStatic<CustomerInstance>
    Lead: ModelStatic<LeadInstance>
    LeadService: ModelStatic<LeadServiceInstance>
}

type CustomerWhere = WhereOptions<Pick<CustomerAttributes, 'email' | 'postcode'>>

export class LeadRepository {
    constructor(private models: Models) {}

    async listLeads(filter?: LeadFilter) {
        const customerWhere: CustomerWhere = {}

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
                    ...(Object.keys(customerWhere).length ? { where: customerWhere } : {}),
                },
                { model: this.models.LeadService, as: 'services' },
            ],
        })
    }

    async getLeadById(id: number) {
        return this.models.Lead.findByPk(id, {
            include: [
                { model: this.models.Customer, as: 'customer' },
                { model: this.models.LeadService, as: 'services' },
            ],
        })
    }

    async registerLead(input: RegisterInput) {
        const services = [...new Set(input.services)]

        const [customer] = await this.models.Customer.findOrCreate({
            where: { email: input.email },
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
            customerId: customer.getDataValue('id') as number,
        })

        const leadId = lead.getDataValue('id') as number

        if (services.length) {
            await this.models.LeadService.bulkCreate(
                services.map((service) => ({
                    leadId,
                    service,
                }))
            )
        }

        return this.getLeadById(leadId)
    }
}
