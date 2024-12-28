import SwiftUI
import Alamofire

struct InsiderSentiment: Codable {
    var year: Int
    var month: Int
    var change: Int
    var mspr: Double
}

struct InsiderSentimentsResponse: Codable {
    var data: [InsiderSentiment]
    var symbol: String
}

class InsiderViewModel: ObservableObject {
    @Published var totalChange = 0
    @Published var totalMSPR: Double = 0.0
    @Published var positiveChange = 0
    @Published var positiveMSPR: Double = 0.0
    @Published var negativeChange = 0
    @Published var negativeMSPR: Double = 0.0
    
    func fetchInsiderSentiments(ticker: String) {
        let urlString = "https://backend-eh73qogznq-uw.a.run.app/api/insider/\(ticker)"
        
        AF.request(urlString).responseDecodable(of: InsiderSentimentsResponse.self) { response in
            switch response.result {
            case .success(let response):
                DispatchQueue.main.async {
                    self.processData(response.data)
                }
            case .failure(let error):
                print(error)
            }
        }
    }
    
    private func processData(_ sentiments: [InsiderSentiment]) {
        // Calculate totals and segregate positive and negative values
        self.totalChange = sentiments.reduce(0) { $0 + $1.change }
        self.totalMSPR = sentiments.reduce(0.0) { $0 + $1.mspr }
        self.positiveChange = sentiments.filter { $0.change > 0 }.reduce(0) { $0 + $1.change }
        self.positiveMSPR = sentiments.filter { $0.mspr > 0 }.reduce(0.0) { $0 + $1.mspr }
        self.negativeChange = sentiments.filter { $0.change < 0 }.reduce(0) { $0 + $1.change }
        self.negativeMSPR = sentiments.filter { $0.mspr < 0 }.reduce(0.0) { $0 + $1.mspr }
    }
}


struct Insider: View {
    @StateObject private var viewModel = InsiderViewModel()
    
    let ticker: String
    let name: String
    
    var body: some View {
        VStack {
            Text("Insider Sentiments")
                .bold()
                .frame(height: 30)
            HStack {
                VStack(alignment: .leading) {
                    Text(name)
                        .bold()
                    Divider()
                    Text("Total")
                        .bold()
                    Divider()
                    Text("Positive")
                        .bold()
                    Divider()
                    Text("Negative")
                        .bold()
                    Divider()
                }
                VStack {
                    Text("MSPR")
                        .bold()
                    Divider()
                    Text(String(format: "%.2f", viewModel.totalMSPR))
                    Divider()
                    Text(String(format: "%.2f", viewModel.positiveMSPR))
                    Divider()
                    Text(String(format: "%.2f", viewModel.negativeMSPR))
                    Divider()
                }
                VStack {
                    Text("Change")
                        .bold()
                    Divider()
                    Text("\(viewModel.totalChange)")
                    Divider()
                    Text("\(viewModel.positiveChange)")
                    Divider()
                    Text("\(viewModel.negativeChange)")
                    Divider()
                }
            }
        }
        
        .onAppear {
            viewModel.fetchInsiderSentiments(ticker: ticker)
        }
    }
}


struct Insider_Previews: PreviewProvider {
    static var previews: some View {
        Insider(ticker: "AAPL", name: "Apple Inc")
    }
}
