from flask import Flask, jsonify, abort, request, Response
import json
import pytz
import finnhub
import datetime
import re
from datetime import datetime
from datetime import *; from dateutil.relativedelta import *
import dateutil
import requests

finnhubAPIKey = 'cmq66h1r01ql684s1bggcmq66h1r01ql684s1bh0'
polygon_api = 'OWM6ov91MnB2EXrRW_5YwaNWJ00M3khK'

app = Flask(__name__, static_folder='static')

@app.route('/')
@app.route('/index')

def index():
    return app.send_static_file('index.html')

def company_API(input_ticker):
    finnhub_client = finnhub.Client(api_key=finnhubAPIKey)
    company_data = finnhub_client.company_profile2(symbol=input_ticker)
    try:
        return company_data
    except KeyError:
        return {}

def summary_API(input_ticker):
    finnhub_client = finnhub.Client(api_key=finnhubAPIKey)
    stock_summary = finnhub_client.quote(input_ticker)
    recommend = finnhub_client.recommendation_trends(input_ticker)
    reco = recommend[0]
    combined_data = stock_summary.copy()
    combined_data.update(reco)
    try:
        return combined_data
    except IndexError:
        return {}

def charts_API(input_ticker):
    la_tz = pytz.timezone('America/Los_Angeles')
    la_current_time = datetime.now(tz=la_tz)
    la_prior_time = la_current_time - relativedelta(months=6)
    formed_la_current_time = la_current_time.strftime("%Y-%m-%d")
    la_prior_date = la_prior_time.strftime("%Y-%m-%d")
    today = date.today()
    headers = {'Content-Type': 'application/json'}
    charts_url = "https://api.polygon.io/v2/aggs/ticker/%s/range/1/day/%s/%s?adjusted=true&sort=asc&limit=120&apiKey=%s" % (input_ticker, la_prior_date, today, polygon_api)
    response = requests.get(charts_url, headers=headers).json()
    if isinstance(response, dict) and response.get('detail') == "Not found.":
        return {}
    histdata = []
    for record in response['results']:
        histdata.append([record['t'], record['c'], int(record['v'])])
    return {'hist_data': histdata, 'ticker_name': input_ticker.upper(), 'current_date': formed_la_current_time}

def filter_news_api(articles):
    filtered = []
    for article in articles:
        if all(article.get(key) for key in ['headline', 'url', 'image', 'datetime']):
            published_date = datetime.utcfromtimestamp(article['datetime']).strftime('%d %B %Y')
            filtered.append({
                'Title': article['headline'],
                'url': article['url'],
                'Image': article['image'],
                'Link to Original Post': published_date
            })
        if len(filtered) == 5:
            break
    return filtered

def news_API(input_ticker):
    finnhub_client = finnhub.Client(api_key=finnhubAPIKey)
    today = date.today()
    thirty_days_prior = today - timedelta(days=30)
    articles = finnhub_client.company_news(input_ticker, _from=thirty_days_prior, to=today)
    candidate = filter_news_api(articles)
    return candidate

@app.route("/company/<string:ticker_name>", methods=['GET'])
def company(ticker_name):
    company_data = company_API(ticker_name)
    return jsonify(company_data)

@app.route("/summary/<string:ticker_name>", methods=['GET'])
def summary(ticker_name):
    summary_data = summary_API(ticker_name)
    return jsonify(summary_data)

@app.route("/charts/<string:ticker_name>", methods=['GET'])
def charts(ticker_name):
    charts_data = charts_API(ticker_name)
    return jsonify(charts_data)

@app.route("/news/<string:ticker_name>", methods=['GET'])
def news(ticker_name):
    news_data = news_API(ticker_name)
    return jsonify({'latest_news': news_data})

if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)
