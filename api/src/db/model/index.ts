import { CustomerModel } from "./customer"
import { LeadModel } from "./lead"
import { LeadServiceModel } from "./lead-service"
import type { Sequelize } from "sequelize"

export const initModels = (sequelize: Sequelize) => {
  const Customer = CustomerModel(sequelize)
  const Lead = LeadModel(sequelize)
  const LeadService = LeadServiceModel(sequelize)

  Customer.hasMany(Lead, { foreignKey: "customerId", as: "leads" })
  Lead.belongsTo(Customer, { foreignKey: "customerId", as: "customer" })

  Lead.hasMany(LeadService, { foreignKey: "leadId", as: "services" })
  LeadService.belongsTo(Lead, { foreignKey: "leadId" })

  return { Customer, Lead, LeadService }
}
