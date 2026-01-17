import { Sequelize } from 'sequelize'

const storage = process.env.SQLITE_PATH ?? './.data/app.db'

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: false
})
