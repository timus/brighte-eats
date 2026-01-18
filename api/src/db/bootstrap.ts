import { sequelize } from "./sequelize"

import { LeadRepository } from "../repositories/lead-repository"
import { initModels } from "./model"

export const models = initModels(sequelize)
export const leadRepository = new LeadRepository(models)

export const bootstrapDb = async () => {
  await sequelize.authenticate()
  await sequelize.sync()

  const leadCount = await models.Lead.count()
  if (leadCount > 0) {
    return
  }

  const customerRecord = await models.Customer.create({
    name: "Sumit",
    email: "sumit@test.com",
    mobile: "0400000000",
    postcode: "2000",
  })
  const customerId = customerRecord.getDataValue("id")

  const leadRecord = await models.Lead.create({ customerId })
  const leadId = leadRecord.getDataValue("id")
  await models.LeadService.bulkCreate([
    { leadId, service: "DELIVERY" },
    { leadId, service: "PAYMENT" },
  ])
}
