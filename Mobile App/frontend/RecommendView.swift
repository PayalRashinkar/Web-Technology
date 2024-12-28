import SwiftUI
import Alamofire

struct CompanyChart: Codable {
    let buy: Int
    let hold: Int
    let period: String
    let sell: Int
    let strongBuy: Int
    let strongSell: Int
    let symbol: String
}

struct CompanyChartsResponse: Codable {
    let rec_trend: [CompanyChart]
}

class CompanyChartViewModel: ObservableObject {
    @Published var strongBuy: [Int] = []
    @Published var buy: [Int] = []
    @Published var hold: [Int] = []
    @Published var sell: [Int] = []
    @Published var strongSell: [Int] = []
    @Published var period: [String] = []
    @Published var symbol: [String] = []
    @Published var htmlContent: String = ""
    
    
    func fetchCompanyCharts(for symbol: String) {
        let urlString = "https://backend-eh73qogznq-uw.a.run.app/api/company-charts4/\(symbol)"
        AF.request(urlString).responseDecodable(of: CompanyChartsResponse.self) { response in
            switch response.result {
            case .success(let chartsResponse):
                DispatchQueue.main.async {
                    self.processChartsData(chartsResponse.rec_trend)
                    self.updateChartHTML()
                }
            case .failure(let error):
                print(error)
            }
        }
    }
    
    private func processChartsData(_ chartsData: [CompanyChart]) {
        
        strongBuy = chartsData.map { $0.strongBuy }
        buy = chartsData.map { $0.buy }
        hold = chartsData.map { $0.hold }
        sell = chartsData.map { $0.sell }
        strongSell = chartsData.map { $0.strongSell }
        period = chartsData.map {String($0.period.prefix(7))}
        symbol = chartsData.map { $0.symbol }
        
    }
    
    func updateChartHTML(){
        let script = """
        document.addEventListener('DOMContentLoaded', function() {
                    Highcharts.chart('container', {
        chart: {
          type: 'column',
          spacingTop: 10,
          spacingBottom: 10,
          spacingLeft: 10,
          spacingRight: 10,
          // other chart options...
        },
        title: {
          text: 'Recommendation Trends',
          align: 'center',
          style: {
            fontSize: '70px' // Smaller font size for the title
          }
        },
            xAxis: {
              categories: \(period.description),
            },
            yAxis: {
        min: 0,
        title: {
          text: '#Analysis',
          style: {
            fontSize: '12px' // Smaller font size for the yAxis title
          }
        },
              stackLabels: {
                enabled: true,
              },
            },
            tooltip: {
              headerFormat: '<b>{point.x}</b><br/>',
              pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}',
            },
            plotOptions: {
              column: {
                stacking: 'normal',
                dataLabels: {
                  enabled: true,
                },
              pointPadding: 0.1, // Less padding between columns
              borderWidth: 0, // No border
              },
            },
          legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
            itemStyle: {
              fontSize: '10px' // Smaller font size for legend items
            }
            // other legend options...
          },
            series: [
              {
                name: 'Strong Buy',
                type: 'column',
                //data: strongBuy,
                data: \(strongBuy.description),
                color: '#316139',
              },
              {
                name: 'Buy',
                type: 'column',
                //data: buy,
                data: \(buy.description),
                color: '#55AB5C',
              },
              {
                name: 'Hold',
                type: 'column',
                //data: hold,
                data: \(hold.description),
                color: '#A97F3A',
              },
              {
                name: 'Sell',
                type: 'column',
                //data: sell,
                data: \(sell.description),
                color: 'red',
              },
              {
                name: 'Strong Sell',
                type: 'column',
                //data: strongSell,
                data: \(strongSell.description),
                color: 'Maroon',
              },
            ],
                    });
                });
        """
        self.htmlContent = """
                <html>
                <head>
                    <script src="https://code.highcharts.com/highcharts.js"></script>
                </head>
                <body>
                    <div id="container" style="height: 100%;"></div>
                    <script>
                    \(script)
                    </script>
                </body>
                </html>
        """
    }
    
    
}

struct RecommendView: View {
    @StateObject private var viewModel = CompanyChartViewModel()
    let ticker: String
    
    var body: some View {
        WebView(htmlContent: viewModel.htmlContent)
            .onAppear {
                viewModel.fetchCompanyCharts(for: ticker)
            }
    }
}

struct RecommendView_Previews: PreviewProvider {
    static var previews: some View {
        RecommendView(ticker: "AAPL")
    }
}

