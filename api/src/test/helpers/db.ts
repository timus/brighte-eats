import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import { Sequelize } from 'sequelize'
import {CustomerModel} from "../../db/model/customer";
import {LeadModel} from "../../db/model/lead";
import {LeadServiceModel} from "../../db/model/lead-service";

export const TEST_DB_PATH = path.join(process.cwd(), 'test.db')

export const createTestDb = async () => {
    await fs.rm(TEST_DB_PATH, { force: true })

    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: TEST_DB_PATH,
        logging: false,
    })

    const Customer = CustomerModel(sequelize)
    const Lead = LeadModel(sequelize)
    const LeadService = LeadServiceModel(sequelize)

    Lead.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' })
    Customer.hasMany(Lead, { foreignKey: 'customerId', as: 'leads' })

    Lead.hasMany(LeadService, { foreignKey: 'leadId', as: 'services' })
    LeadService.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' })

    await sequelize.sync({ force: true })

    return {
        sequelize,
        models: { Customer, Lead, LeadService },
    }
}

export const destroyTestDb = async (sequelize: Sequelize) => {
    await sequelize.close()
    await fs.rm(TEST_DB_PATH, { force: true })
}
