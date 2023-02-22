const express = require("express");
const model = require("./model");

const app = express();

app.use(express.json());

async function main() {
  await model.init();

  registerApp(app);

  let port = 3000;
  app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
  });
}

const authorizationMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization)
    return res.status(400).send({ error: "Authorization header is missing" });
  const userId = authorization.split(" ")[1];
  if (!userId) return res.status(400).send({ error: "User id is missing" });
  req.userId = userId;
  next();
};

function registerApp(app) {
  // Create share body: {name, symbol, price, quantity}
  app.post("/shares", handleCreateShare);
  //Update share price body: {price}
  app.put("/shares/:id", handleUpdateShare);
  // Express middlewares to get user id from the authorization header
  // Authorization header format is 'Raw {userId}'
  app.get("/shares", handleGetShares);
  app.use(authorizationMiddleware);
  // Header: Authorization {userId} body: {portfolioId, symbol, quantity} create transaction
  // app.post("/transactions?type=buy|sell", handleGetTransaction)
  app.post("/transactions", handleCreateTransaction);
  // Header: Authorization {userId}
  // Get all the transaction of the portfolio
  // app.get("/transactions?portfolioId=", handleGetTransaction)
  app.get("/transactions", handleGetTransaction);
  // Header: Authorization {userId} body: {name} to create portfolio
  app.post("/portfolios", handleCreatePortfolio);
  // Header: Authorization {userId} params: {portfolioId} to get portfolio
  // Fetch all the assets in the portfolio
  app.get("/portfolios/:id", handleGetPortfolio);

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: "Internal server error" });
  });
}

const handleGetShares = async (req, res) => {
  const shares = await model.Share.findAll();
  res.send(shares);
};

const handleCreateShare = async (req, res) => {
  const { name, symbol, price, quantity } = req.body;

  const share = await model.Share.create({
    name,
    symbol,
    price,
    quantity,
  });
  res.send(share);
};

const handleUpdateShare = async (req, res) => {
  const { price } = req.body;
  const shareId = req.params.id;

  const dbTransaction = await model.sequelize.transaction();

  const share = await model.Share.findOne(
    { where: { id: shareId } },
    { dbTransaction }
  );
  if (!share) return res.status(400).send({ error: "Share is not registered" });

  share.price = price;
  await share.save(dbTransaction);
  res.send(share);
};

const handleCreateTransaction = async (req, res) => {
  const userId = req.userId;
  const { portfolioId, symbol, quantity } = req.body;
  const type = req.query.type;

  if (type !== "buy" && type !== "sell") {
    return res.status(400).send({ error: "Invalid transaction type" });
  }

  const dbTransaction = await model.sequelize.transaction();
  const portfolio = await model.Portfolio.findOne(
    { where: { id: portfolioId, userId } },
    { transaction: dbTransaction }
  );
  if (!portfolio) {
    return res.status(400).send({ error: "Portfolio is not registered" });
  }

  const share = await model.Share.findOne(
    { where: { symbol } },
    { transaction: dbTransaction }
  );
  if (!share) {
    return res.status(400).send({ error: "Share is not registered" });
  }

  let asset = await model.Asset.findOne(
    { where: { shareId: share.id } },
    { transaction: dbTransaction }
  );

  if (type === "buy") {
    if (!asset)
      asset = await model.Asset.create(
        { shareId: share.id, portfolioId: portfolioId },
        { transaction: dbTransaction }
      );

    if (share.quantity < quantity) {
      res.status(400).send({ error: "Insufficient quantity" });
    }

    asset.quantity += quantity;
    share.quantity -= quantity;
  } else if (type === "sell") {
    if (!asset) {
      return res.status(400).send({ error: "Asset is not registered" });
    }

    if (asset.quantity < quantity) {
      res.status(400).send({ error: "Insufficient quantity" });
    }

    asset.quantity -= quantity;
    share.quantity += quantity;
  }

  await asset.save({ transaction: dbTransaction });
  await share.save({ transaction: dbTransaction });

  const transaction = await model.Transaction.create(
    {
      type,
      quantity,
      price: share.price,
      shareId: share.id,
      portfolioId: portfolio.id,
    },
    { transaction: dbTransaction }
  );

  await dbTransaction.commit();
  res.send(transaction);
};

const handleGetTransaction = async (req, res) => {
  const userId = req.userId;
  const portfolioId = req.query.portfolioId;

  const portfolio = await model.Portfolio.findOne({
    where: { id: portfolioId, userId },
  });
  if (!portfolio) {
    return res.status(400).send({ error: "Portfolio is not registered" });
  }

  const transactions = await model.Transaction.findAll({
    where: { portfolioId },
  });

  res.send(transactions);
};

const handleCreatePortfolio = async (req, res) => {
  const { name } = req.body;
  const userId = req.userId;
  const portfolio = await model.Portfolio.create({
    userId,
    name,
  });

  res.send(portfolio);
};

const handleGetPortfolio = async (req, res) => {
  const portfolioId = req.params.id;
  const userId = req.userId;

  const portfolio = await model.Portfolio.findOne({
    where: { id: portfolioId, userId },
  });
  if (!portfolio) {
    res.status(400).send({ error: "Portfolio is not registered" });
  }

  const assets = await model.Asset.findAll({ where: { portfolioId } });

  res.send({ portfolio, assets });
};

main().then(console.log).catch(console.error);
