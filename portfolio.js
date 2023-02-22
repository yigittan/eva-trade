const model = require("./model");

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
    return res.status(400).send({ error: "Portfolio is not registered" });
  }

  const assets = await model.Asset.findAll({ where: { portfolioId } });

  res.send({ portfolio, assets });
};

module.exports = {
  handleCreatePortfolio,
  handleGetPortfolio,
};
