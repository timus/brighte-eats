import {DataTypes, type Sequelize} from 'sequelize'

export const LeadServiceModel = (sequelize: Sequelize) =>
    sequelize.define(
        'LeadService',
        {
            leadId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            service: {
                type: DataTypes.STRING,
                allowNull: false
            }
        },
        {
            tableName: 'lead_services',
            timestamps: false,
            indexes: [{ unique: true, fields: ['leadId', 'service'] }]
        }
    )
