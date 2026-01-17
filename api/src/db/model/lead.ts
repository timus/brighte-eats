import { DataTypes, type Model, type Optional, type Sequelize } from 'sequelize'

export type LeadAttributes = {
    id: number
    customerId: number
    createdAt: Date
    updatedAt: Date
}


export type LeadCreationAttributes = Optional<
    LeadAttributes,
    'id' | 'createdAt' | 'updatedAt'
>


export type LeadInstance = Model<LeadAttributes, LeadCreationAttributes>

export const LeadModel = (sequelize: Sequelize) =>
    sequelize.define<LeadInstance>(
        'Lead',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            customerId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            tableName: 'leads',
            timestamps: true,
        }
    )
