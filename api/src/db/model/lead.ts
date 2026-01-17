import {DataTypes, type Sequelize} from 'sequelize'

export const LeadModel = (sequelize: Sequelize) =>
    sequelize.define(
        'Lead',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            customerId: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        },
        {
            tableName: 'leads',
            timestamps: true
        }
    )
