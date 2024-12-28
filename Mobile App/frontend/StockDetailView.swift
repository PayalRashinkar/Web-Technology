import SwiftUI
import Alamofire
import Kingfisher
import SimpleToast

struct StockDetailView: View {
    
    var stockSymbol: String
    
    @State private var companyProfile: CompanyProfile? = nil
    @State private var companyQuote: CompanyQuote? = nil
    @State private var companyPeers: [String] = []
    @State private var selectedTab = "Hourly"
    @ObservedObject var viewModel = ArticlesViewModel()
    @State private var showDetail = false
    @Binding var isPresented: Bool
    @ObservedObject var watchModelInstance = WatchlistViewModel()
    @State private var showToast = false
    
    
    private let toastOptions = SimpleToastOptions(
        alignment:.bottom,
        hideAfter: 2,
        backdrop: .gray.opacity(0.2),
        animation: .default,
        modifierType: .scale
    )
    
    var color: Color {
        companyQuote?.change ?? 0 > 0 ? .green : .red
    }
    
    var body: some View {
        
        NavigationStack{
            if let profile = companyProfile {
                ScrollView {
                    VStack(alignment: .leading, spacing: 10) {
                        
                        HStack{
                            Text("\(profile.name)")
                                .foregroundColor(.gray)
                            //Text("\(watchModelInstance.isInWatchlist)")
                            Spacer()
                            if let logoURL = URL(string: profile.logo) {
                                AsyncImage(url: logoURL) { image in
                                    image.resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(maxWidth: 30, maxHeight: 30)
                                        .cornerRadius(5.0)
                                } placeholder: {
                                    ProgressView()
                                }
                            }
                        }
                        HStack{
                            
                            if let quote = companyQuote {
                                Text("$\(String(format: "%.2f", quote.currentPrice))")
                                    .bold()
                                    .font(.title)
                                
                                HStack(spacing: 0) {
                                    Image(systemName: quote.change >= 0 ? "arrow.up.forward" : "arrow.down.left")
                                        .foregroundColor(quote.change > 0 ? .green : (quote.change < 0 ? .red : .gray))
                                    
                                    Text(" $\(String(format: "%.2f", abs(quote.change))) (\(String(format: "%.2f", quote.changePercentage))%)")
                                        .foregroundColor(quote.change > 0 ? .green : (quote.change < 0 ? .red : .gray))
                                        .font(.title2)
                                }
                            }
                        }
                        
                        TabView(selection: $selectedTab) {
                            HourlyView(stockSymbol: stockSymbol, color: color)
                                .tabItem {
                                    Label("Hourly", systemImage: "chart.xyaxis.line")
                                }
                                .tag("Hourly")
                            
                            HistoricalView(stockSymbol: stockSymbol)
                                .tabItem {
                                    Label("Historical", systemImage: "clock")
                                }
                                .tag("Historical")
                        }.frame(height: 300)
                        
                        
                        Spacer()
                        Text("Portfolio")
                            .bold()
                            .font(.title)
                        if let quote = companyQuote, let profile = companyProfile {
                            PortfolioView(ticker: stockSymbol, quote: quote.currentPrice, name: profile.name )
                        }
                        
                        Text("Stats")
                            .bold()
                            .font(.title)
                        HStack {
                            if let quote = companyQuote {
                                Text("High Price:").bold()
                                Text("$\(String(format: "%.2f", quote.high))")
                                Spacer()
                                Text("Open Price:").bold()
                                Text("$\(String(format: "%.2f", quote.open))")
                            }
                        }
                        HStack {
                            if let quote = companyQuote {
                                Text("Low Price:").bold()
                                Text("$\(String(format: "%.2f", quote.low))")
                                Spacer()
                                Text("Prev. Close:").bold()
                                Text("$\(String(format: "%.2f", quote.previousClose))")
                            }
                        }
                        
                        Spacer()
                        Text("About")
                            .bold()
                            .font(.title)
                        VStack(alignment: .leading) {
                            if let profile = companyProfile {
                                HStack {
                                    Text("IPO Start Date:").bold()
                                    Text(profile.name)
                                }
                                Spacer()
                                HStack {
                                    Text("Industry:").bold()
                                    Text(profile.finnhubIndustry)
                                }
                                Spacer()
                                HStack {
                                    Text("Webpage:").bold()
                                    Link(profile.weburl, destination: URL(string: profile.weburl)!)
                                }
                                
                                HStack{
                                    Text("Company Peers:").bold()
                                    ScrollView(.horizontal, showsIndicators: true) {
                                        HStack{
                                            ForEach(companyPeers, id: \.self) { peer in
                                                NavigationLink(peer, destination: StockDetailView(stockSymbol: peer, isPresented: .constant(true) ))
                                            }}
                                    }
                                }
                                
                                
                                Spacer()
                                Spacer()
                                Spacer()
                                
                                Text("Insights")
                                    .bold()
                                    .font(.title)
                                Insider(ticker: stockSymbol, name: profile.name)
                                
                                Spacer()
                                Spacer()
                                Spacer()
                                Spacer()
                                
                                RecommendView(ticker: stockSymbol)
                                    .frame(height: 300)
                                EpsChartsView(ticker: stockSymbol)
                                    .frame(height: 300)
                                
                            }
                            
                            
                            List {
                                ForEach(viewModel.articles) { article in
                                    VStack(alignment: .leading) {
                                        if viewModel.articles.first == article {
                                            Article1View(article: article)
                                            Spacer()
                                            Divider()
                                        } else {
                                            ArticleView(article: article)
                                        }
                                    }
                                    .listRowSeparator(.hidden)
                                    .onTapGesture {
                                        viewModel.selectedArticle = article
                                        showDetail = true
                                    }
                                }
                            }
                            .frame(minHeight: 2000)
                            .listStyle(PlainListStyle())
                            .sheet(isPresented: $showDetail) {
                                
                                if let selectedArticle = viewModel.selectedArticle {
                                    VStack(alignment: .leading, spacing: 10) {
                                        
                                        HStack {
                                            Spacer()
                                            Button(action: {
                                                self.isPresented = false
                                                showDetail = false
                                                
                                            }) {
                                                Image(systemName: "xmark")
                                                    .foregroundColor(.black)
                                            }
                                        }
                                        .padding()
                                        
                                        Text(selectedArticle.source)
                                            .font(.title)
                                            .bold()
                                        Text(selectedArticle.date)
                                            .foregroundColor(.gray)
                                        Divider()
                                        Text(selectedArticle.title)
                                            .bold()
                                        Text(selectedArticle.summary)
                                        HStack{
                                            Text("For more details click")
                                                .foregroundColor(.gray)
                                            Link("here", destination: URL(string: selectedArticle.url)!)
                                        }
                                        
                                        
                                        
                                        HStack {
                                            
                                            Link(destination: URL(string: "https://twitter.com/intent/tweet?text=\(selectedArticle.title) \(selectedArticle.url)")!) {
                                                Image("x_logo")
                                                    .resizable()
                                                    .scaledToFill()
                                                    .frame(width: 50, height: 50)
                                                    .cornerRadius(10)
                                                    .clipped()
                                            }
                                            
                                            
                                            Link(destination: URL(string: "https://www.facebook.com/sharer/sharer.php?u=\(selectedArticle.url)")!) {
                                                Image("f_logo")
                                                    .resizable()
                                                    .scaledToFill()
                                                    .frame(width: 50, height: 50)
                                                    .cornerRadius(10)
                                                    .clipped()
                                            }
                                            
                                        }
                                        Spacer()
                                    }
                                    
                                }
                                
                            }
                            .onAppear {
                                viewModel.fetchArticles(for: stockSymbol)
                            }
                        }
                        
                        
                    }
                }
                .padding()
            } else {
                ProgressView()
                    .padding()
            }
        }
        .navigationBarTitle(Text(stockSymbol))
        .navigationBarItems(trailing: Button(action: {
            if let profile = companyProfile, let quote = companyQuote {
                watchModelInstance.updateWatchlist(ticker: stockSymbol, name: profile.name, currentPrice: quote.currentPrice, change: quote.change, changePercentage: quote.changePercentage)}
            showToast.toggle()
        }) {
            watchModelInstance.isInWatchlist ? Image(systemName: "plus.circle.fill") : Image(systemName: "plus.circle")
            
            
        }
        )
        .simpleToast(isPresented: $showToast, options: toastOptions, onDismiss: {}){
            HStack{ 
                if watchModelInstance.isInWatchlist{
                    Text("Adding \(stockSymbol) to Favorites")
                }else{
                    Text("Removing \(stockSymbol) from Favorites")
                }
            }
            .padding(20)
            .background(Color.gray.opacity(0.8))
            .foregroundColor(.white)
            .cornerRadius(30)
        }
        .offset(y: -10)
        
        .onAppear {
            //watchModelInstance.checkTickerInWatchlist(ticker: stockSymbol)
            func_companyProfile()
            func_companyQuote()
            func_companyPeer()
            
        }
    }
    
    
    class WatchlistViewModel: ObservableObject {
        @Published var isInWatchlist: Bool = false
        
        func checkTickerInWatchlist(ticker: String) {
            let urlString = "https://backend-eh73qogznq-uw.a.run.app/api/watchlist"
            AF.request(urlString, method: .get).validate().responseJSON { response in
                switch response.result {
                case .success(let value):
                    if let tickers = value as? [String] {
                        self.isInWatchlist = tickers.contains(ticker)
                    } else {
                        print("Error: Unable to decode tickers array")
                        self.isInWatchlist = false
                    }
                case .failure(let error):
                    print("Error while fetching watchlist: \(error.localizedDescription)")
                    self.isInWatchlist = false
                }
            }
        }
        
        
        func updateWatchlist(ticker: String, name: String, currentPrice: Double, change: Double, changePercentage: Double) {
            if isInWatchlist {
                removeFromWatchlist(ticker: ticker)
                isInWatchlist = false
            } else {
                addToWatchlist(ticker: ticker, name: name, currentPrice: currentPrice, change: change, changePercentage: changePercentage)
                isInWatchlist = true
            }
        }
        
        private func addToWatchlist(ticker: String, name: String, currentPrice: Double, change: Double, changePercentage: Double) {
            let watchlistData: [String: Any] = [
                "ticker": ticker,
                "name": name,
                "c": currentPrice,
                "d": change,
                "dp": changePercentage
            ]
            
            //AF.request("https://backend-eh73qogznq-uw.a.run.app/api/watchlist/add", method: .post, parameters: watchlistData, encoding: JSONEncoding.default).response { response in
            AF.request("https://backend-eh73qogznq-uw.a.run.app/api/watchlist/add", method: .post, parameters: watchlistData, encoding: JSONEncoding.default).response { response in
                switch response.result {
                case .success(_):
                    self.isInWatchlist = true
                    // Handle UI update
                case .failure(let error):
                    print(error.localizedDescription)
                }
            }
        }
        
        private func removeFromWatchlist(ticker: String) {
            
            AF.request("https://backend-eh73qogznq-uw.a.run.app/api/watchlist/delete/\(ticker)", method: .delete)
                .response { response in
                    switch response.result {
                    case .success(_):
                        self.isInWatchlist = false
                        // Handle UI update, e.g., notify the user of successful deletion
                    case .failure(let error):
                        print(error.localizedDescription)
                        // Handle error, e.g., notify the user of the failure
                    }
                }
            
        }
    }
    
    func func_companyProfile() {
        let url = "https://backend-eh73qogznq-uw.a.run.app/api/company-profile/\(stockSymbol)"
        AF.request(url).responseData { response in
            switch response.result {
            case .success(let data):
                do {
                    let profile = try JSONDecoder().decode(CompanyProfile.self, from: data)
                    self.companyProfile = profile
                } catch {
                    print("Decoding error: \(error)")
                }
            case .failure(let error):
                print("Error: \(error)")
            }
        }
    }
    
    func func_companyQuote(){
        let url = "https://backend-eh73qogznq-uw.a.run.app/api/quote/\(stockSymbol)"
        AF.request(url).responseData { response in
            switch response.result {
            case .success(let data):
                do {
                    let quote = try JSONDecoder().decode(CompanyQuote.self, from: data)
                    self.companyQuote = quote
                } catch {
                    print("Decoding error: \(error)")
                }
            case .failure(let error):
                print("Error: \(error)")
            }
        }
    }
    
    func func_companyPeer(){
        let url = "https://backend-eh73qogznq-uw.a.run.app/api/company-peer/\(stockSymbol)"
        AF.request(url).responseJSON { response in
            switch response.result {
            case .success(let value):
                if let peerArray = value as? [String] {
                    
                    companyPeers = peerArray.filter { $0 != "\(stockSymbol)" }
                }
            case .failure(let error):
                print(error)
            }
        }
    }
}


struct Article: Codable, Identifiable, Equatable {
    let id: UUID
    let title: String
    let url: String
    let image: String
    let date: String
    let source: String
    let summary: String
    
    enum CodingKeys: String, CodingKey {
        case title = "Title"
        case url
        case image = "Image"
        case date = "Date"
        case source = "Source"
        case summary
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        title = try container.decode(String.self, forKey: .title)
        url = try container.decode(String.self, forKey: .url)
        image = try container.decode(String.self, forKey: .image)
        date = try container.decode(String.self, forKey: .date)
        source = try container.decode(String.self, forKey: .source)
        summary = try container.decode(String.self, forKey: .summary)
        id = UUID()
    }
}

struct ArticlesResponse: Codable {
    let earn_chart: [Article]
}

class ArticlesViewModel: ObservableObject {
    @Published var articles: [Article] = []
    @Published var selectedArticle: Article?
    
    func fetchArticles(for symbol: String) {
        let urlString = "https://backend-eh73qogznq-uw.a.run.app/api/company-news/\(symbol)"
        AF.request(urlString).responseDecodable(of: [Article].self) { response in
            switch response.result {
            case .success(let articles):
                DispatchQueue.main.async {
                    self.articles = articles
                }
            case .failure(let error):
                print(error)
            }
        }
    }
    
    //    func getRelativeTimeString(from dateString: String) -> String {
    //
    //        let dateFormatter = DateFormatter()
    //        dateFormatter.dateFormat = "MMMM dd, yyyy"
    //        if let date = dateFormatter.date(from: dateString) {
    //
    //            let relativeFormatter = RelativeDateTimeFormatter()
    //            relativeFormatter.unitsStyle = .full
    //            let relativeDate = relativeFormatter.localizedString(for: date, relativeTo: Date())
    //            return relativeDate
    //        }
    //        return "Some time ago"
    //    }
    
    func getRelativeTimeString(from dateString: String) -> String {
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MMMM dd, yyyy"
        guard let date = dateFormatter.date(from: dateString) else {
            return "Some time ago"
        }
        
        let calendar = Calendar.current
        let now = Date()
        let components = calendar.dateComponents([.year, .month, .day, .hour, .minute], from: date, to: now)
        
        if let year = components.year, year > 0 {
            return year == 1 ? "Last year" : "\(year) years"
        } else if let month = components.month, month > 0 {
            return month == 1 ? "Last month" : "\(month) months"
        } else if let day = components.day, day > 0 {
            return day == 1 ? "Yesterday" : "\(day) days"
        } else if let hour = components.hour, hour > 0 {
            return hour == 1 ? "An hour" : "\(hour) hr, 27 min"
        } else if let minute = components.minute, minute > 0 {
            return minute == 1 ? "A minute" : "\(minute) minutes"
        } else {
            return "Just now"
        }
    }
    
    
}


struct Article1View: View {
    let article: Article
    @StateObject var viewModel = ArticlesViewModel()
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
//                Spacer()
//                Text("News")
//                    .font(.title)
//                KFImage(URL(string: article.image))
//                    .resizable()
//                    .scaledToFill()
//                    .frame(maxWidth: .infinity)
//                    .cornerRadius(10)
//                
//                Spacer()
                Text("News")
                    .font(.title)
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                KFImage(URL(string: article.image))
                    .resizable()
                    .scaledToFill()
                    .frame(width: UIScreen.main.bounds.width - 32, height: 200)
                    .cornerRadius(10)
                    .clipped()
                HStack {
                    Text(article.source)
                        .font(.subheadline)
                        .foregroundColor(.gray)
                    
                    Text(viewModel.getRelativeTimeString(from: article.date))
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
                Text(article.title)
                    .font(.headline)
            }
            .frame(width: 290, height: 300 )
            .padding(.horizontal)
            
            
        }
    }
}

struct ArticleView: View {
    let article: Article
    @StateObject var viewModel = ArticlesViewModel()
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                HStack {
                    Text(article.source)
                        .font(.subheadline)
                        .foregroundColor(.gray)
                    
                    Text(viewModel.getRelativeTimeString(from: article.date))
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
                Text(article.title)
                    .font(.headline)
                
            }
            .frame(height: 100)
            
            Spacer()
            
            KFImage(URL(string: article.image))
                .resizable()
                .scaledToFill()
                .frame(width: 100, height: 100)
                .cornerRadius(10)
                .clipped()
        }
        
    }
}


struct CompanyProfile: Codable {
    let country: String
    let currency: String
    let estimateCurrency: String
    let exchange: String
    let finnhubIndustry: String
    let ipo: String
    let logo: String
    let marketCapitalization: Double
    let name: String
    let phone: String
    let shareOutstanding: Double
    let ticker: String
    let weburl: String
}

struct CompanyQuote: Codable {
    let currentPrice: Double
    let change: Double
    let changePercentage: Double
    let high: Double
    let low: Double
    let open: Double
    let previousClose: Double
    let timestamp: Int
    
    enum CodingKeys: String, CodingKey {
        case currentPrice = "c"
        case change = "d"
        case changePercentage = "dp"
        case high = "h"
        case low = "l"
        case open = "o"
        case previousClose = "pc"
        case timestamp = "t"
    }
}

struct StockDetailView_Previews: PreviewProvider {
    static var previews: some View {
        StockDetailView(stockSymbol: "AAPL", isPresented: .constant(true))
    }
}
