//import Alamofire
//import SwiftUI
//
//class WatchlistViewModel: ObservableObject {
//    @Published var isInWatchlist: Bool = false
//    var stockSymbol: String = "AAPL"
//    var profileName: String = "Apple Inc"
//    var currentPrice: Double = 150.00
//    var change: Double = -1.25
//    var changePercentage: Double = -0.83
//
//    func updateWatchlist(ticker: String) {
//        if isInWatchlist {
//            removeFromWatchlist()
//            isInWatchlist = false
//        } else {
//            addToWatchlist()
//            isInWatchlist = true
//        }
//    }
//
//    private func addToWatchlist() {
//        let watchlistData: [String: Any] = [
//            "ticker": stockSymbol,
//            "name": profileName,
//            "c": currentPrice,
//            "d": change,
//            "dp": changePercentage
//        ]
//
//        AF.request("https://backend-eh73qogznq-uw.a.run.app/api/watchlist/add", method: .post, parameters: watchlistData, encoding: JSONEncoding.default).response { response in
//            switch response.result {
//            case .success(_):
//                self.isInWatchlist = true
//                // Handle UI update
//            case .failure(let error):
//                print(error.localizedDescription)
//            }
//        }
//    }
//
//    private func removeFromWatchlist() {
//        let watchlistData: [String: Any] = [
//            "ticker": stockSymbol
//        ]
//
//        AF.request("https://backend-eh73qogznq-uw.a.run.app/api/watchlist/delete/AAPL", method: .delete)
//            .response { response in
//                switch response.result {
//                case .success(_):
//                    self.isInWatchlist = false
//                    // Handle UI update, e.g., notify the user of successful deletion
//                case .failure(let error):
//                    print(error.localizedDescription)
//                    // Handle error, e.g., notify the user of the failure
//                }
//            }
//
//    }
//}
//
//
//struct WatchlistView: View {
//    @ObservedObject var watchModelInstance = WatchlistViewModel()
//    var ticker: String
//
//    var body: some View {
//        Button(action: {
//            watchModelInstance.updateWatchlist(ticker: ticker)
//        }) {
//            watchModelInstance.isInWatchlist ? Image(systemName: "plus.circle.fill") : Image(systemName: "plus.circle")
//        }
//
//    }
//}
//
//struct WatchlistView_Previews: PreviewProvider {
//    static var previews: some View {
//        WatchlistView(ticker: "AAPL")
//    }
//}
