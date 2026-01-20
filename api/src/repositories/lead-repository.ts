import type { ModelStatic, WhereOptions } from "sequelize"
import type { LeadFilter, PaginationInput, RegisterInput } from "../types"
import { CustomerAttributes, CustomerInstance } from "../db/model/customer"
import { LeadInstance } from "../db/model/lead"
import { LeadServiceInstance } from "../db/model/lead-service"
import { logger } from "../logger"

type Models = {
  Customer: ModelStatic<CustomerInstance>
  Lead: ModelStatic<LeadInstance>
  LeadService: ModelStatic<LeadServiceInstance>
}

type CustomerWhere = WhereOptions<Pick<CustomerAttributes, "email" | "postcode">>

export class LeadRepository {
  constructor(private models: Models) {}

  async listLeads(filter?: LeadFilter, pagination?: PaginationInput) {
    const customerWhere: CustomerWhere = {}
    const log = logger.child({ filter: filter, pagination: pagination })
    log.info("registerLead:start")

    if (filter?.email) {
      customerWhere.email = filter.email
    }
    if (filter?.postcode) {
      customerWhere.postcode = filter.postcode
    }
    const pageSize = 1
    const pageNo = pagination?.page ?? 1
    const limit = pageSize
    const offset = (pageNo - 1) * pageSize

    return this.models.Lead.findAll({
      order: [["createdAt", "DESC"]],
      limit: limit,
      offset: offset,
      include: [
        {
          model: this.models.Customer,
          as: "customer",
          ...(Object.keys(customerWhere).length ? { where: customerWhere } : {}),
        },
        { model: this.models.LeadService, as: "services" },
      ],
    })
  }

  async getLeadById(id: number) {
    return this.models.Lead.findByPk(id, {
      include: [
        { model: this.models.Customer, as: "customer" },
        { model: this.models.LeadService, as: "services" },
      ],
    })
  }

  async registerLead(input: RegisterInput) {
    const log = logger.child({ email: input.email })

    log.info("registerLead:start")

    try {
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

      const customerId = customer.getDataValue("id") as number
      log.info({ customerId }, "registerLead:customerResolved")

      await customer.update({
        name: input.name,
        mobile: input.mobile,
        postcode: input.postcode,
      })

      const lead = await this.models.Lead.create({ customerId })
      const leadId = lead.getDataValue("id") as number
      log.info({ leadId }, "registerLead:leadCreated")

      if (services.length) {
        await this.models.LeadService.bulkCreate(services.map((service) => ({ leadId, service })))
        log.info({ leadId, serviceCount: services.length }, "registerLead:servicesCreated")
      } else {
        log.info({ leadId }, "registerLead:noServices")
      }

      return this.getLeadById(leadId)
    } catch (err) {
      log.error({ err }, "registerLead:failed")
      throw err
    }
  }
}
