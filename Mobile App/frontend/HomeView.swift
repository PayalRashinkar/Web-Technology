import SwiftUI
import Alamofire

struct WatchlistItem2: Decodable {
    var id: String
    var ticker: String
    var name: String
    var c: Double
    var d: Double
    var dp: Double
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case ticker, name, c, d, dp
    }
}

struct PortfolioItem: Decodable {
    var id: String
    var ticker: String
    var name: String
    var avgCostPerShare: Double
    var costDiff: Double
    var currentPrice: Double
    var marketValue: Double
    var quantity: Int
    var totalCost: Double
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case ticker, name, avgCostPerShare, costDiff, currentPrice, marketValue, quantity, totalCost
    }
}

struct WalletData2: Decodable {
    var _id: String
    var balance: Double
}

class WatchlistViewModel2: ObservableObject {
    @Published var watchlistItems2: [WatchlistItem2] = []
    @Published var portfolioItems: [PortfolioItem] = []
    @Published var walletBalance: Double? = nil
    
    var totalValue: Double {
        let totalMarketValue = portfolioItems.reduce(0) { $0 + $1.marketValue }
        return (walletBalance ?? 0) + totalMarketValue
    }

    
    func fetchWatchlistData() {
        AF.request("https://backend-eh73qogznq-uw.a.run.app/api/watchlist", method: .get)
            .validate()
            .responseDecodable(of: [WatchlistItem2].self) { response in
                switch response.result {
                case .success(let items):
                    DispatchQueue.main.async {
                        self.watchlistItems2 = items
                    }
                case .failure(let error):
                    print(error)
                }
            }
    }
    
    func fetchPortfolioData() {
        AF.request("https://backend-eh73qogznq-uw.a.run.app/api/portfolio1", method: .get)
            .validate()
            .responseDecodable(of: [PortfolioItem].self) { response in
                switch response.result {
                case .success(let items):
                    DispatchQueue.main.async {
                        self.portfolioItems = items
                    }
                case .failure(let error):
                    print(error)
                }
            }
    }
    
    //Get wallet balance
    func fetchWalletBalance() {
        AF.request("https://backend-eh73qogznq-uw.a.run.app/api/wallet")
            .validate()
            .responseDecodable(of: WalletData2.self) { response in
                switch response.result {
                case .success(let data):
                    DispatchQueue.main.async {
                        self.walletBalance = data.balance
                    }
                case .failure(let error):
                    print(error)
                }
            }
    }
    
    func removeFromWatchlist(ticker: String) {
        
        AF.request("https://backend-eh73qogznq-uw.a.run.app/api/watchlist/delete/\(ticker)", method: .delete)
            .response { response in
                switch response.result {
                case .success(_):
                    //self.isInWatchlist = false
                    print()
                    // Handle UI update, e.g., notify the user of successful deletion
                case .failure(let error):
                    print(error.localizedDescription)
                    // Handle error, e.g., notify the user of the failure
                }
            }
        
    }
    
}

struct HomeView: View {
    
    @State private var searchText = ""
    @State private var showCancelButton: Bool = false
    @State private var selectedStock: String?
    @State private var searchResults: [Stock] = []
    @StateObject private var viewModel3 = WatchlistViewModel2()
    
    let cashBalance = 25000.00
    let netWorth = 25000.00

    func move(from source: IndexSet, to destination: Int) {
        viewModel3.watchlistItems2.move(fromOffsets: source, toOffset: destination)
    }
    
    func movePortfolio(from source: IndexSet, to destination: Int) {
        viewModel3.portfolioItems.move(fromOffsets: source, toOffset: destination)
    }
    
    var body: some View {
        NavigationStack {
            List {
                if searchText.isEmpty {
                    Section {
                        HStack {
                            
                            Text("\(Date(), formatter: dateFormatter)")
                                .bold()
                                .font(.title)
                                .foregroundColor(.gray)
                            Spacer()
                        }
                    }
                    Section(header: Text("PORTFOLIO")) {
                        HStack {
                            VStack(alignment: .leading) {
                                Text("Net Worth")                                
                                Text(String(format: "$%.2f", viewModel3.totalValue))
                                    .bold()
                            }
                            Spacer()
                            VStack(alignment: .leading) {
                                Text("Cash Balance")
                                Text("$\(viewModel3.walletBalance ?? 0, specifier: "%.2f")")
                                    .bold()
                            }
                        }
                        


                        
                        ForEach(viewModel3.portfolioItems, id: \.id) { item in
                            NavigationLink(destination: StockDetailView(stockSymbol: item.ticker, isPresented: .constant(true))) {
                                HStack {
                                    VStack(alignment: .leading) {
                                        Text(item.ticker)
                                            .font(.headline)
                                        //Text("\(item.quantity) shares")
                                        Text("\(item.quantity) Share" + (item.quantity ?? 0 > 1 ? "s" : ""))
                                            .font(.subheadline)
                                            .foregroundColor(.gray)
                                    }
                                    
                                    Spacer()
                                    
                                    VStack(alignment: .trailing) {
                                        Text(String(format: "$%.2f", item.marketValue))
                                            .font(.subheadline)
                                        HStack(spacing: 4) {
                                            Image(systemName: item.costDiff >= 0 ? "arrow.up.forward" : "arrow.down.right.circle")
                                                .foregroundColor(item.costDiff >= 0 ? .green : .red)
//                                            Text(String(format: "$%.2f", item.currentPrice))
                                             Text(String(format: "$%.2f", 0.01 * item.marketValue / 100))
//                                             //Text(String(format: "(%.2f%%)", item.costDiff / item.avgCostPerShare * 100))
                                             Text(String(format: "(%.2f%%)", 0.01))
                                        }
                                        .foregroundColor(item.costDiff >= 0 ? .green : .red)
                                    }
                                }
                            }
                        }
                        .onMove(perform: movePortfolio)

                    }
                    Section(header: Text("FAVORITES")) {
                        ForEach(viewModel3.watchlistItems2, id: \.id) { item in
                            // NavigationLink{}label:{
                            NavigationLink(destination: StockDetailView(stockSymbol: item.ticker, isPresented: .constant(true))){
                            HStack {
                                VStack(alignment: .leading) {
                                    Text(item.ticker)
                                        .font(.headline)
                                    Text(item.name)
                                        .font(.subheadline)
                                        .foregroundColor(.gray)
                                }
                                
                                Spacer()
                                
                                VStack(alignment: .trailing) {
                                    Text(String(format: "$%.2f", item.c))
                                        .font(.subheadline)
                                    HStack(spacing: 4) {
                                        Image(systemName: item.dp >= 0 ? "arrow.up.forward" : "arrow.down.left")
                                            .foregroundColor(item.dp >= 0 ? .green : .red)
                                        Text(String(format: "$%.2f", item.d))
                                        Text(String(format: "(%.2f%%)", item.dp))
                                    }
                                    .foregroundColor(item.dp >= 0 ? .green : .red)
                                }
                            }
                        
                            }
                            
                        }
//                        .onDelete{
//                            //indexSet in viewModel3.watchlistItems2.remove(atOffsets: indexSet)
//                            //viewModel3.removeFromWatchlist(ticker: )
//
//                        }
                        .onDelete(perform: deleteItems)
                        .onMove(perform: move)
                        
                    }
                    Section {
                        HStack {
                            Spacer()
                            Link("Powered by Finnhub.io", destination: URL(string: "https://finnhub.io")!)
                                .font(.caption)
                                .foregroundColor(.gray)
                            Spacer()
                        }
                    }
                }
                else {
                    ForEach(searchResults) { stock in
                        NavigationLink(destination: StockDetailView(stockSymbol: stock.symbol, isPresented: .constant(true))) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(stock.symbol)
                                    .bold()
                                    .foregroundColor(.black)
                                Text(stock.description)
                                    .font(.subheadline)
                                    .foregroundColor(.gray)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                        }
                    }
                }
            }
            .navigationBarTitle(Text("Stocks"))
            .navigationBarHidden(showCancelButton)
            .navigationBarItems(trailing: EditButton())
            .onAppear {
                viewModel3.fetchWatchlistData()
                viewModel3.fetchPortfolioData()
                viewModel3.fetchWalletBalance()
            }
            .searchable(text: $searchText, placement: .navigationBarDrawer(displayMode: .always) )
        }
        .onChange(of: searchText) { _ in
            searchForTicker()
        }
    }

    func deleteItems(at offsets: IndexSet) {
        // Retrieve the tickers of items being deleted
        let tickersToRemove = offsets.map { viewModel3.watchlistItems2[$0].ticker }

        // Call the function for each ticker
        tickersToRemove.forEach { ticker in
            viewModel3.removeFromWatchlist(ticker: ticker)
        }

        // Remove the items from the data source
        viewModel3.watchlistItems2.remove(atOffsets: offsets)
    }
    
    func searchForTicker() {
        guard !searchText.isEmpty else {
            searchResults = []
            return
        }
        
        let url = "https://backend-eh73qogznq-uw.a.run.app/api/auto-complete/\(searchText.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")"
        AF.request(url).validate().responseJSON { response in
            switch response.result {
            case .success(let value):
                if let jsonArray = value as? [[String: Any]] {
                    let stocks = jsonArray.compactMap { dict -> Stock? in
                        guard let symbol = dict["symbol"] as? String,
                              let description = dict["description"] as? String else {
                            return nil
                        }
                        return Stock(symbol: symbol, description: description)
                    }
                    DispatchQueue.main.async {
                        self.searchResults = stocks
                    }
                }
            case .failure(let error):
                print(error)
            }
        }
    }
}

struct Stock: Identifiable {
    let id = UUID()
    let symbol: String
    let description: String
}

let dateFormatter: DateFormatter = {
    let formatter = DateFormatter()
    formatter.dateFormat = "MMMM d, yyyy"
    return formatter
}()

struct HomeView_Previews: PreviewProvider {
    static var previews: some View {
        HomeView()
    }
}
