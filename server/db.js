const { Sequelize, DataTypes } = require('sequelize')
const path = require('path')

const initDb = (dataDir) => {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(dataDir, 'db.sqlite'),
    logging: false,
  })

  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  })

  const Roster = sequelize.define('Roster', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
  })

  User.hasMany(Roster, { foreignKey: 'user_id' })
  Roster.belongsTo(User, { foreignKey: 'user_id' })

  return { sequelize, User, Roster }
}

module.exports = initDb
