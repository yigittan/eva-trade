const model = require("./model");

const handleGetTransactions = async (req, res) => {
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

const handleCreateTransaction = async (req, res) => {
  const userId = req.userId;
  const { portfolioId, symbol, quantity } = req.body;
  const type = req.query.type;

  if (type !== "buy" && type !== "sell") {
    return res.status(400).send({ error: "Invalid transaction type" });
  }

  const dbTransaction = await model.sequelize.transaction();

  try {
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
      { where: { shareId: share.id, portfolioId: portfolio.id } },
      { transaction: dbTransaction }
    );

    if (type === "buy") {
      if (!asset)
        asset = await model.Asset.create(
          { shareId: share.id, portfolioId: portfolioId },
          { transaction: dbTransaction }
        );

      if (share.quantity < quantity) {
        return res.status(400).send({ error: "Insufficient quantity" });
      }

      asset.quantity += quantity;
      share.quantity -= quantity;
    } else if (type === "sell") {
      if (!asset) {
        return res.status(400).send({ error: "Asset is not registered" });
      }

      if (asset.quantity < quantity) {
        return res.status(400).send({ error: "Insufficient quantity" });
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

    res.status(201).send(transaction);
  } catch (err) {
    await dbTransaction.rollback();

    res.status(500).send({ error: "Internal server error" });
  }
};

module.exports = {
  handleCreateTransaction,
  handleGetTransaction: handleGetTransactions,
};
