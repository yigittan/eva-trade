const express = require("express");
const model = require("./model");
const {
  handleGetShares,
  handleCreateShare,
  handleUpdateShare,
} = require("./shares");
const { handleCreatePortfolio, handleGetPortfolio } = require("./portfolio");
const {
  handleCreateTransaction,
  handleGetTransaction,
} = require("./transaction");

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

  // Error handler middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: "Internal server error" });
  });
}

main().then(console.log).catch(console.error);
