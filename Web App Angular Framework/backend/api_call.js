const finnhub = require("finnhub");
const api_key = finnhub.ApiClient.instance.authentications["api_key"];
api_key.apiKey = "cmq66h1r01ql684s1bggcmq66h1r01ql684s1bh0";
const finnhubClient = new finnhub.DefaultApi();
const axios = require("axios");
const moment = require("moment-timezone");
polygonApiKey = "OWM6ov91MnB2EXrRW_5YwaNWJ00M3khK";

function getCompanyProfile(symbol) {
  const API_KEY = "cmq66h1r01ql684s1bggcmq66h1r01ql684s1bh0"; // Replace with your actual API key
  const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`;
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((response) => {
        // The actual quote data is in response.data
        resolve(response.data);
      })
      .catch((error) => {
        // Error handling
        reject(error);
      });
  });
}

function getAutoComplete(symbol) {
  const API_KEY = "cmq66h1r01ql684s1bggcmq66h1r01ql684s1bh0";
  const url = `https://finnhub.io/api/v1/search?q=${symbol}&token=${API_KEY}`;
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((response) => {
        const filteredResults = response.data.result.filter(
          (item) => !item.symbol.includes(".")
        );
        //console.log("filtered data", filteredResults);
        resolve(filteredResults);
        //resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getCompanyQuote(symbol) {
  const API_KEY = "cmq66h1r01ql684s1bggcmq66h1r01ql684s1bh0"; // Replace with your actual API key
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;

  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((response) => {
        // The actual quote data is in response.data
        resolve(response.data);
      })
      .catch((error) => {
        // Error handling
        reject(error);
      });
  });
}

function getInsiderSentiment(symbol) {
  const API_KEY = "cmq66h1r01ql684s1bggcmq66h1r01ql684s1bh0"; // Replace with your actual API key
  //const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
  const url = `https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${symbol}&from=2022-01-01&token=${API_KEY}`;

  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((response) => {
        // The actual quote data is in response.data
        resolve(response.data);
      })
      .catch((error) => {
        // Error handling
        reject(error);
      });
  });
}

function getCompanyPeer(symbol) {
  const API_KEY = "cmq66h1r01ql684s1bggcmq66h1r01ql684s1bh0"; // Replace with your actual API key
  const url = `https://finnhub.io/api/v1/stock/peers?symbol=${symbol}&token=${API_KEY}`;

  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((response) => {
        // The actual quote data is in response.data
        const filteredPeers = response.data.filter(
          (peer) => !peer.includes(".")
        );
        resolve(filteredPeers);
      })
      .catch((error) => {
        // Error handling
        reject(error);
      });
  });
}

async function chartsAPI3(inputTicker) {
  const chartsUrl = `https://finnhub.io/api/v1/stock/earnings?symbol=${inputTicker}&token=cmq66h1r01ql684s1bggcmq66h1r01ql684s1bh0`;

  try {
    const response = await axios.get(chartsUrl);
    const responseData = response.data;

    if (Array.isArray(responseData) && responseData.length) {
      const earnChart = responseData.map((record) => ({
        actual: record.actual,
        estimate: record.estimate,
        period: record.period,
        surprise: record.surprise,
      }));

      //console.log("Earnings Data:", earnChart);
      return { earn_chart: earnChart };
    } else {
      console.log("No data or unexpected response structure.");
      return {};
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Rethrow the error for further handling if necessary
  }
}

async function chartsAPI4(inputTicker) {
  const chartsUrl = `https://finnhub.io/api/v1/stock/recommendation?symbol=${inputTicker}&token=cmq66h1r01ql684s1bggcmq66h1r01ql684s1bh0`;

  try {
    const response = await axios.get(chartsUrl);
    const responseData = response.data;

    if (Array.isArray(responseData) && responseData.length) {
      const recTrend = responseData.map((record) => ({
        buy: record.buy,
        hold: record.hold,
        period: record.period,
        sell: record.sell,
        strongBuy: record.strongBuy,
        strongSell: record.strongSell,
        symbol: record.symbol,
      }));

      // console.log("Recommend Trend:", recTrend);
      return { rec_trend: recTrend };
    } else {
      console.log("No data or unexpected response structure.");
      return {};
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Rethrow the error for further handling if necessary
  }
}

function chartsAPI(inputTicker) {
  const laTz = "America/Los_Angeles";
  const laCurrentTime = moment().tz(laTz);
  const laPriorTime = moment().tz(laTz).subtract(1, "days");
  const formedLaCurrentTime = laCurrentTime.format("YYYY-MM-DD");
  const laPriorDate = laPriorTime.format("YYYY-MM-DD");
  const today = moment().format("YYYY-MM-DD");
  const headers = { "Content-Type": "application/json" };

  const chartsUrl = `https://api.polygon.io/v2/aggs/ticker/${inputTicker}/range/1/hour/${laPriorDate}/${today}?adjusted=true&%20sort=asc&apiKey=ctO8iVF_Gi19afBovU1ZSr6UIxqt8Fr3`;
  return new Promise((resolve, reject) => {
    axios
      .get(chartsUrl, { headers })
      .then((response) => {
        const responseData = response.data;
        if (
          typeof responseData === "object" &&
          responseData.detail === "Not found."
        ) {
          resolve({});
        } else {
          //const histData = responseData.results.map(record => [record.t, record.c, parseInt(record.v)]);
          const histData = responseData.results.map((record) => [
            record.t,
            record.c,
          ]);
          //resolve({ hist_data: histData, ticker_name: inputTicker.toUpperCase(), current_date: formedLaCurrentTime });
          resolve({ hist_data: histData });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function chartsAPI_hist(inputTicker) {
  const laTz = "America/Los_Angeles";
  const laCurrentTime = moment().tz(laTz);
  const laPriorTime = moment().tz(laTz).subtract(2, "years");
  const formedLaCurrentTime = laCurrentTime.format("YYYY-MM-DD");
  const laPriorDate = laPriorTime.format("YYYY-MM-DD");
  //console.log(laPriorDate);
  const today = moment().format("YYYY-MM-DD");
  const headers = { "Content-Type": "application/json" };
  const chartsUrl = `https://api.polygon.io/v2/aggs/ticker/${inputTicker}/range/1/day/${laPriorDate}/${today}?adjusted=true&sort=asc&apiKey=${polygonApiKey}`;

  return new Promise((resolve, reject) => {
    axios
      .get(chartsUrl, { headers })
      .then((response) => {
        const responseData = response.data;
        if (
          typeof responseData === "object" &&
          responseData.detail === "Not found."
        ) {
          resolve({});
        } else {
          //const histData2 = responseData.results.map(record => [record.t, record.c, parseInt(record.v)]);
          const histData2 = responseData.results.map((record) => [
            record.o,
            record.h,
            record.l,
            record.c,
            record.t,
            parseInt(record.v),
          ]);
          //resolve({ hist_data2: histData2, ticker_name: inputTicker.toUpperCase(), current_date: formedLaCurrentTime });
          resolve({ hist_data2: histData2 });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function filterNewsAPI(articles) {
  const filtered = [];
  for (const article of articles) {
    if (article.headline && article.url && article.image && article.datetime) {
      const publishedDate = moment
        .utc(article.datetime * 1000)
        .format("MMMM DD, YYYY");
      filtered.push({
        Title: article.headline,
        url: article.url,
        Image: article.image,
        Date: publishedDate,
        Source: article.source,
        summary: article.summary,
      });
    }
    if (filtered.length === 20) {
      break;
    }
  }
  return filtered;
}

async function getNewsAPI(inputTicker) {
  const today = moment().format("YYYY-MM-DD");
  const sevenDaysPrior = moment().subtract(7, "days").format("YYYY-MM-DD");
  const API_KEY = "cmq66h1r01ql684s1bggcmq66h1r01ql684s1bh0";
  const newsUrl = `https://finnhub.io/api/v1/company-news?symbol=${inputTicker}&from=${sevenDaysPrior}&to=${today}&token=${API_KEY}`;

  try {
    const response = await axios.get(newsUrl);
    const articles = response.data;
    const candidate = filterNewsAPI(articles);
    return candidate;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = {
  getCompanyProfile,
  getCompanyQuote,
  getCompanyPeer,
  chartsAPI,
  chartsAPI_hist,
  getNewsAPI,
  getInsiderSentiment,
  getAutoComplete,
  chartsAPI3,
  chartsAPI4,
};
