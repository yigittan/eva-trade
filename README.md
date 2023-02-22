# eva-trade

Eva trade application allows users to create and manage their portfolios. Users can have multiple portfolios to manage easily like (investment, trading portfolios). They can buy and sell shares to their portfolios. All transactions are recorded and can be seen from the portfolio.

## Bootstrap the application

Initial start of the application, five shares, three users, a portfolio, three assets and five transactions are created .
Share are listed below:

- Google(GOG)
- Apple(AAL)
- Tesla(TSL)
- Amazon(AMZ)
- Facebook(FBO)

Users are listed below:

- John Doe
- Jane Doe
- Yigit Tan

Portfolio is listed below:

- Yigit's invesment portfolio

Assets are listed below:

- GOG in Yigit's invesment portfolio
- AAL in Yigit's invesment portfolio
- FBO in Yigit's invesment portfolio

Transactions are listed below:

- Buy GOG to Yigit's invesment portfolio
- Buy AAL to Yigit's invesment portfolio
- Buy FBO to Yigit's invesment portfolio
- Sell GOG from Yigit's invesment portfolio
- Sell AAL from Yigit's invesment portfolio

## Getting started

Install the dependencies

```bash
npm install
```

Run the application

```bash
DB_NAME=<DBNAME> DB_USER=<USERNAME> DB_PASSWORD=<PASSWORD> node server.js
```

## Example scenario

1. Create an invesment portfolio
   ```bash
   curl --location 'localhost:3000/portfolios' \
   --header 'Authorization: Raw 1' \
   --header 'Content-Type: application/json' \
   --data '{
       "name": "Investment"
   }'
   ```
2. Buy Apple(AAL) and Google(GOG) shares

   ```bash
   # Buy Apple shares
    curl --location 'localhost:3000/transactions?type=buy' \
    --header 'Authorization: Raw 1' \
    --header 'Content-Type: application/json' \
    --data '{
        "symbol": "AAL",
        "quantity": 20,
        "portfolioId": 1
    }'

    # Buy Google shares
    curl --location 'localhost:3000/transactions?type=buy' \
    --header 'Authorization: Raw 1' \
    --header 'Content-Type: application/json' \
    --data '{
        "symbol": "GOG",
        "quantity": 20,
        "portfolioId": 1
    }'
   ```

3. You can check your portfolio to verify your asset

   ```bash
   curl --location 'localhost:3000/portfolios/1' \
   --header 'Authorization: Raw 1'
   ```

4. Sell some of your assets

   ```bash
   curl --location 'localhost:3000/transactions?type=sell' \
   --header 'Authorization: Raw 1' \
   --header 'Content-Type: application/json' \
   --data '{
       "portfolioId": 1,
       "symbol": "GOG",
       "quantity": 10
   }'

   ```

5. You can check all your transactions of your portfolio
   ```bash
   curl --location 'localhost:3000/transactions?portfolioId=1' \
   --header 'Authorization: Raw 1'
   ```
