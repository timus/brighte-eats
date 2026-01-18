import { DataTypes, type Model, type Optional, type Sequelize } from "sequelize"

export type LeadServiceAttributes = {
  leadId: number
  service: string
}

export type LeadServiceCreationAttributes = Optional<LeadServiceAttributes, never>

export type LeadServiceInstance = Model<LeadServiceAttributes, LeadServiceCreationAttributes>

export const LeadServiceModel = (sequelize: Sequelize) =>
  sequelize.define<LeadServiceInstance>(
    "LeadService",
    {
      leadId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      service: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "lead_services",
      timestamps: false,
      indexes: [{ unique: true, fields: ["leadId", "service"] }],
    },
  )
