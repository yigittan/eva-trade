const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: "localhost",
    dialect: "postgres",
  }
);

const Share = sequelize.define("shares", {
  name: DataTypes.STRING,
  symbol: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
    validate: {
      len: [3, 3],
      isUppercase: true,
    },
  },
  quantity: DataTypes.INTEGER,
  price: DataTypes.DECIMAL(10, 2),
});

const User = sequelize.define("users", {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
});

const Portfolio = sequelize.define("portfolios", {
  name: DataTypes.STRING,
});

User.hasMany(Portfolio);

const Asset = sequelize.define("assets", {
  quantity: DataTypes.INTEGER,
});

Portfolio.hasMany(Asset);
Share.hasOne(Asset);

const Transaction = sequelize.define("transactions", {
  type: DataTypes.STRING,
  quantity: DataTypes.INTEGER,
  price: DataTypes.DECIMAL(10, 2),
});

Portfolio.hasMany(Transaction);
Share.hasMany(Transaction);

async function init() {
  await Share.sync({ force: true });
  await User.sync({ force: true });
  await Portfolio.sync({ force: true });
  await Asset.sync({ force: true });
  await Transaction.sync({ force: true });

  await Share.bulkCreate([
    { name: "Apple", symbol: "AAL", quantity: 100, price: 100.03 },
    { name: "Google", symbol: "GOG", quantity: 100, price: 122.85 },
    { name: "Facebook", symbol: "FBO", quantity: 100, price: 91.35 },
    { name: "Amazon", symbol: "AMZ", quantity: 100, price: 75.81 },
    { name: "Tesla", symbol: "TSL", quantity: 100, price: 80.32 },
  ]);

  await User.bulkCreate([
    { name: "John Doe", email: "john.doe@gmail.com" },
    { name: "Jane Doe", email: "jane.doe@gmail.com" },
  ]);

  const yigit = await User.create({
    name: "Yigit Tan",
    email: "yigit.tan@gmail.com",
  });

  await Portfolio.create({ name: "Invesment", userId: yigit.id });

  await Asset.bulkCreate([
    { quantity: 20, portfolioId: 1, shareId: 2 },
    { quantity: 15, portfolioId: 1, shareId: 1 },
    { quantity: 25, portfolioId: 1, shareId: 3 },
  ]);

  await Transaction.bulkCreate([
    { type: "buy", quantity: 25, price: 122.85, portfolioId: 1, shareId: 2 },
    { type: "buy", quantity: 25, price: 100.03, portfolioId: 1, shareId: 1 },
    { type: "buy", quantity: 25, price: 91.35, portfolioId: 1, shareId: 3 },
    { type: "sell", quantity: 5, price: 100.15, portfolioId: 1, shareId: 2 },
    { type: "sell", quantity: 10, price: 100.15, portfolioId: 1, shareId: 1 },
  ]);
}

module.exports = {
  Share,
  User,
  Portfolio,
  Asset,
  Transaction,
  sequelize,
  init,
};
