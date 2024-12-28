var search_result = document.getElementById("search_result");
var search_error = document.getElementById("error_search_result");
var company_content = document.getElementById("company-data");
var summary_content = document.getElementById("summary-data");
var chart_content = document.getElementById("charts-data");
var news_content = document.getElementById("news-data");

const ArrowDown = "static/RedArrowDown.png";
const ArrowUp = "static/GreenArrowUp.png";
const input_text = document.getElementsByName('ticker_name')[0];
const reset_button = document.getElementById('reset_but');
const submit_button = document.getElementById('submit_but');

function func_company(response) {
    showErrorResult("off");
    showResult("off");
    if (Object.keys(response).length === 0) {
        console.log("Empty outlook JSON, no such stock");
        showErrorResult("on");
    } else {
        show_company("on");
        console.log(response);
        let company_content = document.getElementById('company-data');

        let outlookHTML = `
        <div class="comp-stock">
            <div class="prd2">
            <img src="${response["logo"]}" alt="Company Logo" width="100" height="100"/>
            </div>
            <table class="comp-stock-table">
                <tr></tr>
                <tr>
                    <th>Company Name</th><th>    ${response["name"]}</th>
                </tr>
                <tr>
                <th>Stock Ticker Symbol</th><th>    ${response["ticker"]}</th>
                </tr>
                <tr>
                <th>Stock Exchange Code </th><th>   ${response["exchange"]}</th>
                </tr>
                <tr>
                <th>Company Start Date </th><th>  ${response["ipo"]}</th>
                </tr>
                <tr>
                <th>Category  </th><th>  ${response["finnhubIndustry"]}</th>
                </tr>
                <tr></tr>
            </table>
        </div>
        `;
        company_content.innerHTML = outlookHTML;
        showResult("on");
    }
}

function func_summary(response) {
    if (Object.keys(response).length === 0) {
        console.log("Empty summary JSON, no such stock");
    } else {
      let summary_content = document.getElementById('summary-data');
      let summaryHTML = `
      <div class="comp-stock2">
          <table class="comp-stock-table2">
          <tr></tr>
              <tr>
                  <th>Stock Ticker Symbol</th><th>${response["symbol"]}</th>
              </tr>
              <tr>
                  <th>Trading Day</th>
                  <th>${
                    (() => {
                      const tradingDay = new Date(response["t"] * 1000);
                      return `${tradingDay.getDate()} ${tradingDay.toLocaleString('default', { month: 'long' })}, ${tradingDay.getFullYear()}`;
                    })()
                  }</th>
              </tr>
              <tr>
                  <th>Previous Closing Price</th>
                  <th>${response["pc"]}</th>
              </tr>
              <tr>
                  <th>Opening Price</th>
                  <th>${response["o"]}</th>
              </tr>
              <tr>
                  <th>High Price</th>
                  <th>${response["h"]}</th>
              </tr>
              <tr>
                  <th>Low Price</th>
                  <th>${response["l"]}</th>
              </tr>
              <tr>
                  <th>Change</th>
                  <th>
                  ${response["d"]}
                  ${response["d"] != null ? (response["d"] < 0 ? `<img src="${ArrowDown}" alt="ArrowDown" class="table-img">` : `<img src="${ArrowUp}" alt="ArrowUp" class="table-img">`) : ''}
                  </th>
              </tr>
              <tr>
                  <th>Change Percent</th>
                  <th>
                  ${response["dp"]}
                  ${response["dp"] != null ? (response["dp"] < 0 ? `<img src="${ArrowDown}" alt="ArrowDown" class="table-img">` : `<img src="${ArrowUp}" alt="ArrowUp" class="table-img">`) : ''}
                  </th>
              </tr>
              <tr></tr>
              </table>
              </div>
              <div>
              <table class='prd3'>
              <tr class="recommendation-trends">
                <td>
                  <div class="recommendation-container">
                    <span class="sell-text">Strong<br>Sell</span>
                    <span class="strong-sell">${response["strongSell"]}</span>
                    <span class="sell">${response["sell"]}</span>
                    <span class="hold">${response["hold"]}</span>
                    <span class="buy">${response["buy"]}</span>
                    <span class="strong-buy">${response["strongBuy"]}</span>
                    <span class="buy-text">Strong <br>Buy</span>
                  </div>
                  <p>Recommendation Trends</p>
                </td>
              </tr>
              </table>
      </div>
      `;
      summary_content.innerHTML = summaryHTML;
    }
}

function func_charts(response) {
    if (response["hist_data"].length === 0) {
        console.log("Empty charts JSON, no such stock");
    } else {
        show_charts("off");
        let histData = response["hist_data"];
        let input_ticker = response['ticker_name'];
        let currentDate = response['current_date'];
        let volume = [], close = [], dataLength = histData.length;
        let i;
        console.log("Historical record number: " + dataLength);

        for (i = 0; i < dataLength; i += 1) {
            close.push([
                histData[i][0],
                histData[i][1]
            ]);

            volume.push([
                histData[i][0],
                histData[i][2]
            ]);
        }

        Highcharts.stockChart('charts-area', {
            stockTools: {
                gui: {
                    enabled: false
                }
            },

            xAxis: {
                type: 'datetime',
                labels: {
                    format: '{value:%e. %b}'
                }
            },

            yAxis: [{
                title: {text: 'Volume'},
                labels: {align: 'left'},
                min: 0,

            }, {
                title: {text: 'Stock Price'},
                opposite: false,
                min: 0,
            }],

            plotOptions: {
                column: {
                    pointWidth: 2,
                    color: '#404040'
                }
            },

            rangeSelector: {
                buttons: [{
                    type: 'day',
                    count: 7,
                    text: '7d'
                }, {
                    type: 'day',
                    count: 15,
                    text: '15d'
                }, {
                    type: 'month',
                    count: 1,
                    text: '1m'
                }, {
                    type: 'month',
                    count: 3,
                    text: '3m'
                }, {
                    type: 'month',
                    count: 6,
                    text: '6m'
                }],
                selected: 4,
                inputEnabled: false
            },

            title: {text: 'Stock Price ' + input_ticker + ' ' + currentDate},

            subtitle: {
                text: '<a href="https://polygon.io/" target="_blank">Source: Polygon.io</a>',
                useHTML: true
            },

            series: [{
                type: 'area',
                name: input_ticker,
                data: close,
                yAxis: 1,
                showInNavigator: true,
                // gapSize: 5,
                tooltip: {
                    valueDecimals: 2
                },
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
            },
                {
                    type: 'column',
                    name: input_ticker + ' Volume',
                    data: volume,
                    yAxis: 0,
                    showInNavigator: false,
                }]


        });
    }
}

function func_news(response) {
    let newsArray = response["latest_news"];
    let latestNews = "";
    let newsNum = newsArray.length;
    let i;
    console.log("news number: " + newsNum);
    for (i = 0; i < newsNum; i++) {
        latestNews += "<div class=\'news-box\'><div class=\'center-crop-img\'>";
        latestNews += "<img class=\'news-img\' alt=\'image\' src=\'" + newsArray[i]["Image"] + "\'/></div>";
        latestNews += "<div class=\'news-text\'><p><b>" + newsArray[i]["Title"] + "</b></p>";
        latestNews += "<p>" + newsArray[i]["Link to Original Post"] + "</p>";
        latestNews += "<p><a href=\'" + newsArray[i]["url"] + "\' target=\"_blank\">See Original Post</a></p>";
        latestNews += "</div></div>";
    }
    news_content.innerHTML = latestNews;
}

function bckend_request(url, reqType, writeFunc) {
    let xhr = new XMLHttpRequest();
    console.log(reqType + " URL: " + url);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(reqType + " response received");
            writeFunc(JSON.parse(xhr.responseText));
        } else {
            console.error(xhr.statusText);
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
}

function showErrorResult(status) {
    if (status === "on") {
        search_error.style.display = "block";
    } else if (status === "off") {
        search_error.style.display = "none";
    } else {
        throw new Error("search error status \'on\' or \'off\'");
    }
}

function showResult(status) {
    if (status === "on") {
        search_result.style.display = "block";
    } else if (status === "off") {
        search_result.style.display = "none";
    } else {
        throw new Error("search status \'on\' or \'off\'");
    }
}

function show_company(status) {
    if (status === "on") {
        company_content.style.display = "block";
    } else if (status === "off") {
        company_content.style.display = "none";
    } else {
        throw new Error("outlook status \'on\' or \'off\'");
    }
}

function show_summary(status) {
    if (status === "on") {
        summary_content.style.display = "block";
    } else if (status === "off") {
        summary_content.style.display = "none";
    } else {
        throw new Error("summary status \'on\' or \'off\'");
    }
}

function show_charts(status) {
    if (status === "on") {
        chart_content.style.display = "block";
    } else if (status === "off") {
        chart_content.style.display = "none";
    } else {
        throw new Error("charts status \'on\' or \'off\'");
    }
}

function show_news(status) {
    if (status === "on") {
        news_content.style.display = "block";
    } else if (status === "off") {
        news_content.style.display = "none";
    } else {
        throw new Error("news status \'on\' or \'off\'");
    }
}

function get_company(input_ticker) {
    bckend_request("/company/" + input_ticker, "outlook", func_company);
}


function get_summary(input_ticker) {
    bckend_request("/summary/" + input_ticker, "summary", func_summary);
}

function get_charts(input_ticker) {
    bckend_request("/charts/" + input_ticker, "charts", func_charts);
}

function get_news(input_ticker) {
    bckend_request("/news/" + input_ticker, "news", func_news);
}

function checkErrorResultDisplay() {
    if (search_error.style.display === "block") {
        return "on";
    } else if (search_error.style.display === "none") {
        return "off";
    } else {
        throw new Error("Invalid search_error.style.display=" + search_error.style.display + ", should be \'none\' or \'block\'")
    }
}


function four_tabs(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-data");

    if (checkErrorResultDisplay() === "off") {
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(tabName).style.display = "block";
        evt.currentTarget.className += " active";
    }
}


function reset_tab() {
    let tablinks, i, outlookLink;
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    outlookLink = document.getElementsByClassName("tablinks")[0];
    outlookLink.className = "tablinks active";
}

function search(event) {
    let input_ticker = input_text.value.trim();
    let input_tickerLen = input_ticker.length;
    if (input_tickerLen >= 1) {
        event.preventDefault();
        reset_tab();
        showErrorResult("off");
        showResult("off");
        get_company(input_ticker);
        show_summary("off");
        get_summary(input_ticker);
        show_charts("off");
        get_charts(input_ticker);
        show_news("off");
        get_news(input_ticker);
    }
}

function reset(event) {
    showResult("off");
    showErrorResult("off");
    reset_tab();
}

submit_button.addEventListener("click", search, false)
reset_button.addEventListener('click', reset, false)
