import SwiftUI
import Alamofire

struct CompanyChart3: Codable {
    let actual: Float
    let estimate: Float
    let period: String
    let surprise: Float

}

struct CompanyChartsResponse3: Codable {
    let earn_chart: [CompanyChart3]
}

class CompanyChartViewModel3: ObservableObject {
    @Published var actual: [Float] = []
    @Published var estimate: [Float] = []
    @Published var period: [String] = []
    @Published var surprise: [Float] = []
    @Published var htmlContent: String = ""
    
    
    func fetchCompanyCharts3(for symbol: String) {
        let urlString = "https://backend-eh73qogznq-uw.a.run.app/api/company-charts3/\(symbol)"
        AF.request(urlString).responseDecodable(of: CompanyChartsResponse3.self) { response in
            switch response.result {
            case .success(let chartsResponse3):
                DispatchQueue.main.async {
                    self.processChartsData3(chartsResponse3.earn_chart)
                    self.updateChartHTML3()
                }
            case .failure(let error):
                print(error)
            }
        }
    }
    
    private func processChartsData3(_ chartsData: [CompanyChart3]) {
        
        actual = chartsData.map { $0.actual }
        estimate = chartsData.map { $0.estimate }
        period = chartsData.map { $0.period }
        surprise = chartsData.map { $0.surprise }
        
    }
    
    func updateChartHTML3(){
        
        let actualData = actual.map { $0.description }.joined(separator: ", ")
        let estimateData = estimate.map { $0.description }.joined(separator: ", ")
        let categories = period.map { "'\($0)'" }.joined(separator: ", ")
        
        let script = """
        document.addEventListener('DOMContentLoaded', function() {
                    Highcharts.chart('container', {
        title: {
              text: 'Historical EPS Surprises',
                  align: 'center',
                  style: {
                    fontSize: '50px' // Smaller font size for the title
                  }
            },
            xAxis: {
            categories: \(period),
                labels: {
                  formatter: function () {
                    const index = this.axis.categories.indexOf(String(this.value));
                    const surpriseValue = \(surprise)[index];
                    return `${this.value}<br>Surprise: ${surpriseValue}`;
                  },
                },
            },

            yAxis: {
              title: {
                text: 'Quarterly EPS',
              },
            },
            tooltip: {
              shared: true,
              valueSuffix: ' units',
            },
            series: [
              {
                name: 'Actual',
                data: \(actual),
                type: 'line',
              },
              {
                name: 'Estimate',
                data: \(estimate),
                type: 'line',
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

struct EpsChartsView: View {
    @StateObject private var viewModel3 = CompanyChartViewModel3()
    let ticker: String
    
    var body: some View {
        WebView(htmlContent: viewModel3.htmlContent)
            .onAppear {
                viewModel3.fetchCompanyCharts3(for: "AAPL")
            }
    }
}

struct EpsChartsView_Previews: PreviewProvider {
    static var previews: some View {
        EpsChartsView(ticker: "AAPL")
    }
}

