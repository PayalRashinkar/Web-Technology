const {
  getCompanyProfile,
  getCompanyQuote,
  getCompanyPeer,
  chartsAPI,
  chartsAPI_hist,
  chartsAPI3,
  chartsAPI4,
  getNewsAPI,
  getInsiderSentiment,
  getAutoComplete,
} = require("./api_call");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
//const mongo_login = "mongodb+srv://payalrashinkar17:Ganapathi%4092@cluster0.nsmf0sr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const mongo_login =
  "mongodb+srv://rashinkar:Ganapathi%4092@cluster0.kwnu2fv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const { MongoClient } = require("mongodb");
const mongo_client = new MongoClient(mongo_login);
//const WatchlistItem = require('./models/WatchlistItem'); // Adjust the path as necessary
const app = express();
app.use(express.json());
//const mongoose = require('mongoose');
const { ObjectId } = require("mongodb");
//const path = require('path');

console.log("Express cha khalte");

// Enable CORS for all requests
app.use(cors());

//app.use(express.static(path.join(__dirname, 'dist/prd_project')));

app.get("/api/company-profile/:ticker", async (req, res) => {
  const ticker = req.params.ticker;
  try {
    const profile = await getCompanyProfile(ticker);
    //console.log("Autocomplete BE1:", profile);
    res.json(profile);
  } catch (error) {
    res.status(500).send("Error fetching company profile");
  }
});

app.get("/api/auto-complete/:ticker", async (req, res) => {
  const ticker = req.params.ticker;
  try {
    const auto_c = await getAutoComplete(ticker);
    //console.log("Autocomplete BE1:", auto_c);
    res.json(auto_c);
  } catch (error) {
    res.status(500).send("Error fetching autocomplete");
  }
});

// Route handler to get company quote
app.get("/api/quote/:ticker", async (req, res) => {
  const ticker = req.params.ticker;
  console.log("eta payal");
  try {
    const quote = await getCompanyQuote(ticker);
    //console.log("Quote Data:", quote);
    res.json(quote);
  } catch (error) {
    console.error("Error getting quote data:", error);
    res.status(500).send(error.message);
  }
});

// Route handler to get company quote
app.get("/api/insider/:ticker", async (req, res) => {
  const ticker = req.params.ticker;
  //console.log("insider BE1 payal");
  try {
    const insider = await getInsiderSentiment(ticker);
    //console.log("Insider:", insider);
    res.json(insider);
  } catch (error) {
    console.error("Error getting insider be1:", error);
    res.status(500).send(error.message);
  }
});

// Route handler to get company quote
app.get("/api/company-peer/:ticker", async (req, res) => {
  const ticker = req.params.ticker;
  console.log("Heiii");
  try {
    const peer = await getCompanyPeer(ticker);
    //console.log("Payal Company Peer:", peer);
    res.json(peer);
  } catch (error) {
    console.error("Error getting peer data:", error);
    res.status(500).send(error.message);
  }
});

// Route handler to get company quote
app.get("/api/company-charts/:ticker", async (req, res) => {
  const ticker = req.params.ticker;
  console.log("charts payal");
  try {
    const charts = await chartsAPI(ticker);
    //console.log("Payal Company charts:", charts);
    res.json(charts);
  } catch (error) {
    console.error("Error getting peer data:", error);
    res.status(500).send(error.message);
  }
});

// Route handler to get company quote
app.get("/api/company-charts3/:ticker", async (req, res) => {
  const ticker = req.params.ticker;
  console.log("charts3 payal");
  try {
    const charts3 = await chartsAPI3(ticker);
    //console.log("Payal Company charts3:", charts3);
    res.json(charts3);
  } catch (error) {
    console.error("Error getting charts3 data:", error);
    res.status(500).send(error.message);
  }
});

// Route handler to get company quote
app.get("/api/company-charts4/:ticker", async (req, res) => {
  const ticker = req.params.ticker;
  console.log("charts4 payal");
  try {
    const charts4 = await chartsAPI4(ticker);
    //console.log("Payal Company charts4:", charts4);
    res.json(charts4);
  } catch (error) {
    console.error("Error getting charts4 data:", error);
    res.status(500).send(error.message);
  }
});

// Route handler to get company quote
app.get("/api/company-charts2/:ticker", async (req, res) => {
  const ticker = req.params.ticker;
  console.log("charts2 payal");
  try {
    const charts2 = await chartsAPI_hist(ticker);
    //console.log("Payal Company chartshist:", charts2);
    res.json(charts2);
  } catch (error) {
    console.error("Error getting chartshist data:", error);
    res.status(500).send(error.message);
  }
});

app.get("/api/company-news/:ticker", async (req, res) => {
  const ticker = req.params.ticker;
  console.log("news payal");
  try {
    const news = await getNewsAPI(ticker);
    //console.log("Payal Company news:", news);
    res.json(news);
  } catch (error) {
    console.error("Error getting peer data:", error);
    res.status(500).send(error.message);
  }
});

async function getWatchlist() {
  try {
    // No need to connect here if you're already connected at the start of your app.
    const database = mongo_client.db("HW4DB");
    const watchlist = database.collection("HW4_Collection");

    // Query for an item with id "1"
    const query = { id: "2" };
    //const watch = await watchlist.findOne(query); // Use await to get the result of the promise
    const watch = await watchlist.find({}).toArray();

    // console.log(watch);
    return watch; // This will be a document or null if not found
  } catch (error) {
    // If an error occurs during connection or query, log the error
    console.error("Failed to connect to MongoDB", error);
    throw error; // Rethrow the error so it can be handled by the caller
  } finally {
    // You might not want to close the connection after every query.
    // Only close it when you're sure you're done with all database operations.
    //await mongo_client.close();
    //console.log("Disconnected from MongoDB");
  }
}

async function getPortData(ticker) {
  try {
    // No need to connect here if you're already connected at the start of your app.
    const database = mongo_client.db("HW4DB");
    const get_port = database.collection("portfolio");

    // Query for an item with id "1"
    const query = { ticker: ticker };
    const portdata = await get_port.findOne(query); // Use await to get the result of the promise
    //const portdata = await get_port.find({}).toArray();

    // console.log("debug payal", portdata);
    return portdata; // This will be a document or null if not found
  } catch (error) {
    // If an error occurs during connection or query, log the error
    console.error("Failed to connect to MongoDB", error);
    throw error; // Rethrow the error so it can be handled by the caller
  } finally {
  }
}

async function getPortfolio() {
  try {
    // No need to connect here if you're already connected at the start of your app.
    const database = mongo_client.db("HW4DB");
    const portfolioc = database.collection("portfolio");

    const portfolio_be = await portfolioc.find({}).toArray();

    // console.log(portfolio_be);
    return portfolio_be; // This will be a document or null if not found
  } catch (error) {
    // If an error occurs during connection or query, log the error
    console.error("Failed to connect to MongoDB for portfolio", error);
    throw error; // Rethrow the error so it can be handled by the caller
  } finally {
  }
}

async function getWallet() {
  try {
    // No need to connect here if you're already connected at the start of your app.
    const database = mongo_client.db("HW4DB");
    const wallet_c = database.collection("wallet");

    const wallet = await wallet_c.findOne({});

    // console.log(wallet);
    return wallet; // This will be a document or null if not found
  } catch (error) {
    // If an error occurs during connection or query, log the error
    console.error("Failed to connect to MongoDB", error);
    throw error; // Rethrow the error so it can be handled by the caller
  } finally {
  }
}

app.get("/api/watchlist", async (req, res) => {
  try {
    const watchlist = await getWatchlist(); // Use await to wait for the asynchronous operation to complete
    // console.log("Payal watchlist be:", watchlist);
    res.json(watchlist || {}); // Send an empty object if watchlist is null
  } catch (error) {
    console.error("Error getting watchlist:", error);
    res.status(500).send(error.message);
  }
});

app.get("/api/portdata/:ticker", async (req, res) => {
  const ticker = req.params.ticker;
  try {
    const portdata = await getPortData(ticker); // Use await to wait for the asynchronous operation to complete
    // console.log("Payal portdata be apibe:", portdata);
    res.json(portdata || {}); // Send an empty object if watchlist is null
  } catch (error) {
    console.error("Error getting watchlist:", error);
    res.status(500).send(error.message);
  }
});

app.get("/api/portfolio1", async (req, res) => {
  try {
    const portfolio1 = await getPortfolio(); // Use await to wait for the asynchronous operation to complete
    // console.log("Payal portfolio1 BE:", portfolio1);
    res.json(portfolio1 || {}); // Send an empty object if watchlist is null
  } catch (error) {
    console.error("BE Error getting portfolio data from backend DB:", error);
    res.status(500).send(error.message);
  }
});

app.get("/api/wallet", async (req, res) => {
  try {
    const wallet = await getWallet(); // Use await to wait for the asynchronous operation to complete
    // console.log("Payal wallet BE:", wallet);
    res.json(wallet || {}); // Send an empty object if watchlist is null
  } catch (error) {
    console.error("Error getting wallet BE:", error);
    res.status(500).send(error.message);
  }
});

app.post("/api/watchlist/add", async (req, res) => {
  try {
    const database = mongo_client.db("HW4DB");
    const collection = database.collection("HW4_Collection");

    // req.body contains the companyDetails object sent from the frontend
    const companyDetails = req.body;

    // Insert the document into the collection
    const result = await collection.insertOne(companyDetails);
    // console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } catch (error) {
    console.error("Error saving to watchlist:", error);
  } finally {
  }
});

app.delete("/api/watchlist/delete/:ticker", async (req, res) => {
  try {
    const ticker = req.params.ticker;
    const database = mongo_client.db("HW4DB");
    const collection = database.collection("HW4_Collection");
    // console.log("Inside Payal rty");
    const result = await collection.deleteOne({ ticker: ticker });

    if (result.deletedCount === 1) {
      //console.log(`Successfully removed company with ticker ${ticker}`);
      res.status(200).json({
        message: `Successfully removed company with ticker ${ticker}`,
      });
    } else {
      console.log(`No company found with ticker ${ticker}`);
      res
        .status(404)
        .json({ message: `No company found with ticker ${ticker}` });
    }
  } catch (error) {
    // console.log("Thats ok");
    console.error("Error removing company from watchlist:", error);
    res.status(500).send(error.message);
  }
});

app.delete("/api/portfolio/delete/:ticker", async (req, res) => {
  try {
    const ticker = req.params.ticker;
    const database = mongo_client.db("HW4DB");
    const collection = database.collection("portfolio");
    console.log("Inside portfolio DB Delete");
    const result = await collection.deleteOne({ ticker: ticker });

    if (result.deletedCount === 1) {
      console.log(`Successfully removed company with ticker ${ticker}`);
      res.status(200).json({
        message: `Successfully removed company with ticker ${ticker}`,
      });
    } else {
      console.log(`failed to delete entry from portfolio ${ticker}`);
      res
        .status(404)
        .json({ message: `failed to delete entry from portfolio ${ticker}` });
    }
  } catch (error) {
    console.log("Thats crazy");
    console.error("Error removing company from portfolio:", error);
    res.status(500).send(error.message);
  }
});

async function initializeWallet() {
  try {
    const database = mongo_client.db("HW4DB");
    const wallets = database.collection("wallet");

    // Check if the wallet document already exists
    const walletExists = await wallets.findOne({}); // Assuming there's only one wallet document
    if (walletExists) {
      console.log("Wallet already initialized.");
    } else {
      // Insert the new wallet document with a balance of 25000
      const initialBalance = { balance: 25000 };
      await wallets.insertOne(initialBalance);
      console.log("Wallet initialized with $25000.");
    }
  } catch (error) {
    console.error("Error initializing wallet:", error);
    throw error;
  }
}

app.post("/api/portfolio/update", async (req, res) => {
  try {
    const database = mongo_client.db("HW4DB");
    const portfolioCollection = database.collection("portfolio");

    console.log("check paylllllll", req.body);
    // req.body contains the transaction details sent from the frontend
    const {
      ticker,
      name,
      currentPrice,
      quantity,
      totalCost,
      avgCostPerShare,
      marketValue,
      costDiff,
    } = req.body;

    // Define the update query for the portfolio
    const updateQuery = { ticker: ticker, name: name };
    const updateDocument = {
      $set: {
        currentPrice,
        quantity,
        totalCost,
        avgCostPerShare,
        marketValue,
        costDiff,
      },
    };

    // Update the document in the collection
    const result = await portfolioCollection.updateOne(
      updateQuery,
      updateDocument,
      { upsert: true }
    );
    console.log(
      `${result.matchedCount} portfolio document(s) matched the filter, updated ${result.modifiedCount} document(s)`
    );

    res.status(200).json({ message: "Portfolio updated successfully" });
  } catch (error) {
    console.error("Error updating portfolio:", error);
    res.status(500).json({ message: "Error updating portfolio", error });
  } finally {
  }
});

// Ensure this is at the top of your file

app.post("/api/wallet/update", async (req, res) => {
  try {
    const database = mongo_client.db("HW4DB");
    const walletCollection = database.collection("wallet");
    //console.log("Request body:", req.body);

    const { walletId, balance } = req.body;

    // Convert string to ObjectId
    const updateQuery = { _id: new ObjectId(walletId) };

    const updateDocument = {
      $set: { balance: balance },
    };

    const result = await walletCollection.updateOne(
      updateQuery,
      updateDocument
    );
    console.log(
      `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
    );

    res.status(200).json({ message: "Wallet updated successfully" });
  } catch (error) {
    console.error("Error updating wallet:", error);
    res.status(500).json({ message: "Error updating wallet", error });
  }
});

//app.get('*', (req, res) => {
//res.sendFile(path.join(__dirname, 'dist/prd_project/index.html'));
//});

const PORT = process.env.PORT || 8080;
//const PORT = 8080;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await mongo_client.connect();
    console.log("Connected successfully to MongoDB");
    await initializeWallet(); // Initialize the wallet after successful connection
  } catch (error) {
    console.error("Failed to connect to MongoDB or initialize wallet.", error);
  }
});
