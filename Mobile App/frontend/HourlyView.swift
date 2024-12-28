import SwiftUI
import Alamofire

struct HourlyView: View {
    
    @State private var htmlContent: String = ""
    let stockSymbol: String
    let color: Color
    
    var body: some View {
        WebView(htmlContent: htmlContent)
            .onAppear {
                loadChartData(for: stockSymbol)
            }
    }
    
    func loadChartData(for searchQuery: String) {
        let urlString = "https://backend-eh73qogznq-uw.a.run.app/api/company-charts/\(searchQuery.uppercased())"
        AF.request(urlString).responseJSON { response in
            switch response.result {
            case .success(let value):
                if let jsonData = value as? [String: Any],
                   let histData = jsonData["hist_data"] as? [[Any]],
                   !histData.isEmpty {
                    // Process the data for the chart
                    let processedData = histData.compactMap { dataPoint -> [Any]? in
                        guard dataPoint.count > 1,
                              let timestamp = dataPoint[0] as? TimeInterval,
                              let price = dataPoint[1] as? Double else { return nil }
                        return [timestamp * 1000, price]
                    }
                    
                    DispatchQueue.main.async {
                        self.updateChartHTML(with: processedData, color: color, searchQuery: searchQuery.uppercased())
                    }
                } else {
                    print("chartsAPI error huvalai")
                }
            case .failure(let error):
                print("Error: \(error.localizedDescription)")
            }
        }
    }
    
    func updateChartHTML(with data: [[Any]], color: Color, searchQuery: String) {
        let script = """
        document.addEventListener('DOMContentLoaded', function() {
                    Highcharts.chart('container', {
                        chart: {
                            type: 'line'
                        },
              rangeSelector: {
                enabled: false, // Disable range selector
              },
              scrollbar: {
                enabled: true, // Enable the scrollbar
              },
           exporting: {
                enabled: true
            },
                        title: {
                            text: '\(searchQuery) Hourly Price Variation',
                style: {
                  fontWeight: 'bold',
                  color: 'grey',
                  fontSize: '50px'
                },
                        },
        xAxis: {
        type: 'datetime', // Define x-axis as datetime type
        //                   labels: {
        //                     format: '{value:%H}',
        //                    },
        },

                        yAxis: {
                            title: {
                                text: null
                            },
                opposite: true
                        },
                        series: [{
        showInLegend: false,
                            name: '\(searchQuery)',
        type: 'line',
                            data: \(data),
                            color: '\(color)',
                  marker: {
                    enabled: false, // Disable markers on the line
                  },
                        }]
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

struct HourlyView_Previews: PreviewProvider {
    static var previews: some View {
        HourlyView(stockSymbol: "AAPL", color: .red)
    }
}

