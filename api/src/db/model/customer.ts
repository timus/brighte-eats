import {DataTypes, type Sequelize} from 'sequelize'

export const CustomerModel = (sequelize: Sequelize) =>
    sequelize.define(
        'Customer',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            mobile: {
                type: DataTypes.STRING,
                allowNull: false
            },
            postcode: {
                type: DataTypes.STRING,
                allowNull: false
            }
        },
        {
            tableName: 'customers',
            timestamps: true
        }
    )
