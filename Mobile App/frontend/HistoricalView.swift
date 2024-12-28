import SwiftUI
import Alamofire

struct HistoricalView: View {
    
    @State private var htmlContent: String = ""
    @State private var responseText: String = "Loading..."
    @State private var ohlcData: [[Double]] = []
    @State private var volumeData: [[Double]] = []
    let stockSymbol: String
    
    var body: some View {
        WebView(htmlContent: htmlContent)
            .onAppear {
                let urlString = "https://backend-eh73qogznq-uw.a.run.app/api/company-charts2/\(stockSymbol)"
                performRequest(urlString: urlString)
            }
    }
    
    func performRequest(urlString: String) {
        AF.request(urlString).responseDecodable(of: ChartDataResponse2.self) { response in
            DispatchQueue.main.async {
                switch response.result {
                case .success(let dataResponse):
                    if let histData2 = dataResponse.hist_data2, !histData2.isEmpty {
                       
                        self.ohlcData = histData2.map { [$0[4], $0[0], $0[1], $0[2], $0[3]] }
                        self.volumeData = histData2.map { [$0[4], $0[5]] }
                        
                        self.responseText = "Data retrieved successfully."
                      
                        self.updateChartHTML(ohlcData: self.ohlcData, volumeData: self.volumeData)
                    } else {
                        self.responseText = "Success but no historical data found"
                    }
                case .failure(let error):
                    self.responseText = "Error: \(error)"
                }
            }
        }
    }
    
    func updateChartHTML(ohlcData: [[Double]], volumeData: [[Double]]) {
        var groupingUnits: [(String, [Int])] = [
            ("week", [1]),
            ("month", [1, 2, 3, 4, 6]),
            ("year", [1, 2])
        ]
        
        let script1 = """
        document.addEventListener('DOMContentLoaded', function() {
                    Highcharts.chart('container', {
                        rangeSelector: {
                              dropdown: 'responsive',
                              //allButtonsEnabled: true,
                              inputEnabled: true,
                              buttons: [
                                {
                                  // Define the buttons you want to show
                                  type: 'month',
                                  count: 1,
                                  text: '1m',
                                },
                                {
                                  type: 'month',
                                  count: 3,
                                  text: '3m',
                                },
                                {
                                  type: 'month',
                                  count: 6,
                                  text: '6m',
                                },
                {
                  type: 'ytd',
                  text: 'YTD',
                },
                {
                  type: 'year',
                  count: 1,
                  text: '1y',
                },
                {
                  type: 'all',
                  text: 'All',
                },
           ],
            selected: 5, // 'All' selected by default
          },
                  title: {
                    text: '\(stockSymbol) Historical',
                  },
                  subtitle: {
                    text: 'With SMA and Volume by Price technical indicators',
                  },
          navigator: {
            enabled: true,
            // Additional customizations go here
          },
        
                  yAxis: [
                    {
                      startOnTick: false,
                      endOnTick: false,
                      labels: {
                        align: 'right',
                        x: -3,
                      },
                      title: {
                        text: 'OHLC',
                      },
                      height: '60%',
                      lineWidth: 2,
                      resize: {
                        enabled: true,
                      },
                opposite: true
                    },
                    {
                      labels: {
                        align: 'right',
                        x: -3,
                      },
                      title: {
                        text: 'Volume',
                      },
                
                     top: '65%',
                      height: '35%',
                      offset: 0,
                      lineWidth: 2,
                opposite: true
                    },
                  ],
        
                  tooltip: {
                    split: true,
                  },
        
                  plotOptions: {
                    series: {
                      dataGrouping: {
                        units: \(groupingUnits),
                      },
                    },
                  },
        
                  series: [
                {
                  linkedTo: '\(stockSymbol)',
                  name: '\(stockSymbol)',
                  id: '\(stockSymbol)',
                  zIndex: 2,
              
                data: \(ohlcData),
        
                  type: 'candlestick',
                },
                    {
                      type: 'column',
                      name: 'Volume',
                      id: 'volume',
         
                data: \(volumeData),
                      yAxis: 1,
                    },
                    {
                      type: 'vbp',
                      //linkedTo: '\(stockSymbol)',
                      id: '\(stockSymbol)',
                      linkedTo: '\(stockSymbol)',
                      params: {
                        volumeSeriesID: 'volume',
                      },
                      dataLabels: {
                        enabled: false,
                      },
                      zoneLines: {
                        enabled: false,
                      },
        
                    },
                    {
                      type: 'sma',
                      //linkedTo: '\(stockSymbol)',
                      id: '\(stockSymbol)',
                      linkedTo: '\(stockSymbol)',
                      zIndex: 1,
                      marker: {
                        enabled: false,
                      },
                    },
                  ]
                    });
                });
        """
        self.htmlContent = """
                <html>
                <head>
                   
        <script src="https://code.highcharts.com/stock/highstock.js"></script>
        <script src="https://code.highcharts.com/stock/indicators/indicators.js"></script>
        <script src="https://code.highcharts.com/stock/indicators/volume-by-price.js"></script>
        <script src="https://code.highcharts.com/stock/indicators/sma.js"></script>
        <script src="https://code.highcharts.com/stock/modules/drag-panes.js"></script>
         <script src="https://code.highcharts.com/modules/accessibility.js"></script>
        <script src="https://code.highcharts.com/stock/modules/exporting.js"></script>


                </head>
                <body>
                    <div id="container" style="height: 100%;"></div>
                    <script>
                    \(script1)
                    </script>
                </body>
                </html>
        """
    }
}

struct ChartDataResponse2: Decodable {
    let hist_data2: [[Double]]?
}

struct HistoricalView_Previews: PreviewProvider {
    static var previews: some View {
        HistoricalView(stockSymbol: "AAPL")
    }
}


