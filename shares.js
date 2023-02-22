const model = require("./model");

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

  res.status(201).send(share);
};

const handleUpdateShare = async (req, res) => {
  const { price } = req.body;
  const shareId = req.params.id;

  const dbTransaction = await model.sequelize.transaction();

  try {
    const share = await model.Share.findOne(
      { where: { id: shareId } },
      { transaction: dbTransaction }
    );
    if (!share) {
      return res.status(400).send({ error: "Share is not registered" });
    }

    share.price = price;

    const updatedShare = await share.save({ transaction: dbTransaction });

    await dbTransaction.commit();

    res.send(updatedShare);
  } catch (err) {
    await dbTransaction.rollback();

    res.status(500).send({ error: "Internal server error" });
  }
};

module.exports = {
  handleGetShares,
  handleCreateShare,
  handleUpdateShare,
};
