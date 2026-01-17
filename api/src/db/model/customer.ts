import { DataTypes, type Model, type Sequelize, type Optional } from 'sequelize'

export type CustomerAttributes = {
    id: number
    name: string
    email: string
    mobile: string
    postcode: string
    createdAt: Date
    updatedAt: Date
}

export type CustomerCreationAttributes = Optional<
    CustomerAttributes,
    'id' | 'createdAt' | 'updatedAt'
>

export type CustomerInstance = Model<CustomerAttributes, CustomerCreationAttributes>

export const CustomerModel = (sequelize: Sequelize) =>
    sequelize.define<CustomerInstance>(
        'Customer',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            mobile: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            postcode: {
                type: DataTypes.STRING,
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
            tableName: 'customers',
            timestamps: true,
        }
    )
