import SwiftUI
import Alamofire


//Portfolio get from db
struct PortfolioData: Decodable {
    var ticker: String
    var name: String
    var currentPrice: Double
    var quantity: Int
    var totalCost: Double
    var avgCostPerShare: Double
    var marketValue: Double
    var costDiff: Double
}

//Portfolio post to db
struct TradeData: Encodable {
    var ticker: String
    var name: String
    var avgCostPerShare: Double
    var costDiff: Double
    var currentPrice: Double
    var marketValue: Double
    var quantity: Int
    var totalCost: Double
}

//Wallet get from db
struct WalletData: Decodable {
    var _id: String // 660478346b7da5fe2a9973e4
    var balance: Double
}

//Buy and Sell Toast Message
struct ToastMessage: View {
    let message: String
    
    var body: some View {
        Text(message)
            .padding(20)
            .background(Color.gray.opacity(1.0))
            .foregroundColor(.white)
            .cornerRadius(17)
    }
}

//View Model
class PortfolioViewModel: ObservableObject {
    @Published var portfolioData: PortfolioData?
    @Published var showTradeSheet = false
    @Published var walletBalance: Double? = nil
    @Published var walletIdp: String? = ""
    @Published var showToast: Bool = false
    @Published var toastMessage: String = ""
    @Published var tradeSuccess: Bool = false
    @Published var tradeSuccessSell: Bool = false
    
    
    
    
    //get portfolio data for that ticker
    func fetchPortfolioData(ticker: String) {
        AF.request("https://backend-eh73qogznq-uw.a.run.app/api/portdata/\(ticker)")
            .validate()
            .responseDecodable(of: PortfolioData.self) { response in
                switch response.result {
                case .success(let data):
                    DispatchQueue.main.async {
                        self.portfolioData = data
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
            .responseDecodable(of: WalletData.self) { response in
                switch response.result {
                case .success(let data):
                    DispatchQueue.main.async {
                        self.walletBalance = data.balance
                        self.walletIdp = data._id
                    }
                case .failure(let error):
                    print(error)
                }
            }
    }
    
    //Post portfolio data
    func postPortfolioData(tradeData: TradeData) {
        AF.request("https://backend-eh73qogznq-uw.a.run.app/api/portfolio/update", method: .post, parameters: tradeData, encoder: JSONParameterEncoder.default).response { response in
            switch response.result {
            case .success(_):
                print("Trade data posted successfully.")
                DispatchQueue.main.async {
                    //self.tradeSuccess = true
                    
                }
            case .failure(let error):
                print("Failed to post trade data: \(error)")
                DispatchQueue.main.async {
                    self.toastMessage = "Failed to complete the trade."
                    self.showToast = true
                }
            }
        }
    }
    
    
    //Post wallet balance
    func postWalletBalance(walletId: String, newBalance: Double) {
        
        struct WalletUpdateData: Encodable {
            let walletId: String
            let balance: Double
        }
        
        let walletUpdateData = WalletUpdateData(walletId: walletId, balance: newBalance)
        
        AF.request("https://backend-eh73qogznq-uw.a.run.app/api/wallet/update", method: .post, parameters: walletUpdateData, encoder: JSONParameterEncoder.default)
            .validate()
            .response { response in
                switch response.result {
                case .success(_):
                    print("Wallet balance updated successfully.")
                    // You might want to fetch the latest wallet balance here to confirm
                case .failure(let error):
                    print("Failed to update wallet balance: \(error)")
                    // Handle the failure, maybe retry or show an error message
                }
            }
    }
    
    //Delete portfolio data based on ticker
    func deletePortfolioItem(ticker: String) {
        let urlString = "https://backend-eh73qogznq-uw.a.run.app/api/portfolio/delete/\(ticker)"
        AF.request(urlString, method: .delete).responseJSON { response in
            switch response.result {
            case .success:
                print("Success: \(ticker) has been deleted from the portfolio.")
                if let data = response.data, let utf8Text = String(data: data, encoding: .utf8) {
                    print("Data: \(utf8Text)") // Original server response as a string
                }
            case .failure(let error):
                print("Error: \(error)")
            }
        }
    }
}


//The real view
struct PortfolioView: View {
    @StateObject private var viewModel = PortfolioViewModel()
    @State private var numberOfShares: String = ""
    @State private var totalCost: Double = 0.0
    var ticker: String = ""
    var quote: Double = 0.00
    var name: String = ""
    //@State private var isActive = false
    
    
    var body: some View {
        VStack {
            if let data = viewModel.portfolioData {
                
                HStack{
                    VStack(alignment: .leading){
                        Text("Shares Owned: \(data.quantity)")
                        Text("Avg. Cost / Share: $\(data.avgCostPerShare, specifier: "%.2f")")
                        HStack{
                            Text("Total Cost: $\(data.totalCost, specifier: "%.2f")")

                        }
                        HStack {
                            Text("Change: ")
                                .foregroundColor(.primary)
                            Text("$\(data.costDiff >= 0 ? "" : "")\(data.costDiff, specifier: "%.2f")")
                                .foregroundColor(data.costDiff > 0 ? .green : data.costDiff < 0 ? .red : .primary)
                        }
                    
                        HStack{
                            Text("Market Value: ")
                                .foregroundColor(.primary)
                            Text("$\(data.marketValue, specifier: "%.2f")")
                                .foregroundColor(data.costDiff > 0 ? .green : data.costDiff < 0 ? .red : .primary)
                        }
     
                    }
                    Button("Trade") {
                        viewModel.fetchWalletBalance()
                        viewModel.showTradeSheet.toggle()
                        viewModel.tradeSuccess = false
                        viewModel.tradeSuccessSell = false
                        
                    }
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .padding(.vertical)
                    .padding(.horizontal, 40)
                    .background(Color.green)
                    .cornerRadius(20)
                }
                
            } else{
                HStack{
                    VStack(alignment: .leading){
                        Text("You have 0 shares of \(ticker).")
                        Text("Start trading!")
                    }
                    Spacer()
                    
                    Button("Trade") {
                        viewModel.fetchWalletBalance()
                        viewModel.showTradeSheet.toggle()
                        viewModel.tradeSuccess = false
                        viewModel.tradeSuccessSell = false
                    }
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .padding(.vertical)
                    .padding(.horizontal, 40)
                    .background(Color.green)
                    .cornerRadius(20)
                }
            }
        }
        .sheet(isPresented: $viewModel.showTradeSheet, onDismiss: {
            viewModel.showTradeSheet = false; numberOfShares = "0"
        }) {
            VStack() {
                
                HStack {
                    Spacer()
                    Button(action: {
                        viewModel.fetchWalletBalance()
                        viewModel.showTradeSheet = false
                        
                    }) {
                        Image(systemName: "xmark")
                            .foregroundColor(.black)
                    }
                }
                .padding()
                
                Text("Trade \(name) shares")
                    .font(.subheadline)
                    .bold()
                Spacer()
                HStack {
                    VStack(alignment: .leading) {
                        TextField("0", text: $numberOfShares)
                            .keyboardType(.numberPad)
                            .font(.system(size: 50))
                            .frame(width: 100)
                            .multilineTextAlignment(.leading)
                            .onChange(of: numberOfShares) { newValue in
                                calculateTotalCost()
                            }
                    }
                    .fixedSize()
                    
                    VStack(alignment: .trailing) {
                        Text("Share" + (Int(numberOfShares) ?? 0 > 1 ? "s" : ""))
                            .font(.title)
                        HStack {
                            Text("x $\(quote, specifier: "%.2f")/share = ")
                            Text("$\(totalCost, specifier: "%.2f")")
                        }
                        .fixedSize(horizontal: true, vertical: false)
                    }
                }
                .padding()
                Spacer()
                Text(" $\(viewModel.walletBalance ?? 0, specifier: "%.2f") available to buy \(ticker) ")
                HStack{
                    Button("Buy") {
                        if let shareCount = Int(numberOfShares), shareCount > 0 {
                            let wallet_quantity = Int(numberOfShares) ?? 0 //this is only for wallet update
                            
                            let quantity = Int(numberOfShares) ?? 0
                            let totalCost = Double(quantity) * quote
                            let avgCostPerShare = quantity > 0 ? totalCost / Double(quantity) : 0
                            let costDiff = (quote - avgCostPerShare) * Double(quantity)
                            
                            
                            let tradeDataBuy = TradeData(
                                ticker: ticker,
                                name: name,
                                avgCostPerShare: avgCostPerShare,
                                costDiff: costDiff,
                                currentPrice: quote,
                                marketValue: quote * Double(quantity),
                                quantity: quantity,
                                totalCost: totalCost
                            )
                            
                            viewModel.postPortfolioData(tradeData: tradeDataBuy)
                            if let walletBalance = viewModel.walletBalance, walletBalance >= totalCost {
                                viewModel.walletBalance! -= Double(wallet_quantity) * quote
                                //viewModel.postWalletBalance(walletId: "660478346b7da5fe2a9973e4", newBalance: viewModel.walletBalance!)
                                //_id
                                viewModel.postWalletBalance(walletId: viewModel.walletIdp!, newBalance: viewModel.walletBalance!)
                                
                                viewModel.tradeSuccess = true
                                
                            }
                            
                            
                            
                            
                        } else {
                            viewModel.toastMessage = "Please enter a valid amount"
                            viewModel.showToast = true
                            DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                                viewModel.showToast = false
                            }
                        }
                        
                    }
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .padding(.vertical)
                    .padding(.horizontal, 60)
                    .background(Color.green)
                    .cornerRadius(30)
                    
                    .sheet(isPresented: $viewModel.tradeSuccessSell, onDismiss: {
                        viewModel.tradeSuccessSell = false
                    }) {
                        //NavigationView {
                            VStack {
                                Spacer()
                                Text("Congratulations!")
                                    .font(.largeTitle)
                                    .bold()
                                
                                Text("You have successfully sold \(numberOfShares) shares of \(viewModel.portfolioData?.ticker ?? ticker)")
                                    .multilineTextAlignment(.center)
                                    .padding()
                                    .lineLimit(1)
                                    .minimumScaleFactor(0.5)
                                Spacer()
                                Button("Done") {
                                    viewModel.showTradeSheet = false
                                    viewModel.tradeSuccessSell = false
                                    viewModel.fetchPortfolioData(ticker: ticker)
                                    //isActive = true
                                    //HomeView()
                                    viewModel.portfolioData = nil

                                }
                                .fontWeight(.semibold)
                                .foregroundColor(Color.green)
                                .padding(.vertical)
                                .padding(.horizontal, 100)
                                .background(.white)
                                .cornerRadius(20)
                                //NavigationLink("", destination: HomeView(), isActive: $isActive)

                                
                            }
                            .padding()
                            .background(Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(20)
                        //}
                    }
                    
                    
                    .sheet(isPresented: $viewModel.tradeSuccess, onDismiss: {
                        viewModel.tradeSuccess = false
                    }) {
                        VStack {
                            Spacer()
                            Text("Congratulations!")
                                .font(.largeTitle)
                                .bold()
                            
                            Text("You have successfully bought \(numberOfShares) shares of \(viewModel.portfolioData?.ticker ?? ticker)")
                                .multilineTextAlignment(.center)
                                .padding()
                                .lineLimit(1)
                                .minimumScaleFactor(0.5)
                            Spacer()
                            Button("Done") {
                                viewModel.showTradeSheet = false
                                viewModel.tradeSuccess = false
                                
                                viewModel.fetchPortfolioData(ticker: ticker)
                                
                                
                            }
                            .fontWeight(.semibold)
                            .foregroundColor(Color.green)
                            .padding(.vertical)
                            .padding(.horizontal, 100)
                            .background(.white)
                            .cornerRadius(30)
                        }
                        .padding()
                        .background(Color.green)
                        .foregroundColor(.white)
                        .cornerRadius(30)
                    }
                    
                    
                    
                    Button("Sell") {
                        if let shareCountSell = Int(numberOfShares), shareCountSell > 0 {
                            
                            if let payal = viewModel.portfolioData {
                                if shareCountSell > payal.quantity {
                                    viewModel.toastMessage = "Not enough shares to sell"
                                    viewModel.showToast = true
                                    DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                                        viewModel.showToast = false
                                    }
                                }
                                else if shareCountSell == payal.quantity{
                                    viewModel.deletePortfolioItem(ticker: ticker)
                                    
                                    //viewModel.tradeSuccessSell = true
                                    
                                    
                                    let wallet_quantity = Int(numberOfShares) ?? 0
                                    if let walletBalance = viewModel.walletBalance, walletBalance >= totalCost {
                                        
                                        viewModel.walletBalance! += Double(wallet_quantity) * quote
                                        viewModel.postWalletBalance(walletId: viewModel.walletIdp!, newBalance: viewModel.walletBalance!)
                                        viewModel.tradeSuccessSell = true
                                    }
                                    //viewModel.fetchPortfolioData(ticker: ticker)
                                    
                                }
                                else{
                                    
                                    if let shareCountSell = Int(numberOfShares){
                                        let quantity2 = payal.quantity - shareCountSell
                                        let totalCost2 = Double(quantity2) * quote
                                        let avgCostPerShare2 = quantity2 > 0 ? totalCost2 / Double(quantity2) : 0
                                        let costDiff2 =  (quote - avgCostPerShare2) * Double(quantity2)
                                        
                                        let tradeDataSell = TradeData(
                                            ticker: ticker,
                                            name: name,
                                            avgCostPerShare: avgCostPerShare2,
                                            costDiff: costDiff2,
                                            currentPrice: quote,
                                            marketValue: quote * Double(quantity2),
                                            quantity: quantity2,
                                            totalCost: totalCost2
                                        )
                                        
                                        viewModel.postPortfolioData(tradeData: tradeDataSell)
                                        let wallet_quantity = Int(numberOfShares) ?? 0
                                        if let walletBalance = viewModel.walletBalance, walletBalance >= totalCost {
                                            
                                            viewModel.walletBalance! += Double(wallet_quantity) * quote
                                            viewModel.postWalletBalance(walletId: viewModel.walletIdp!, newBalance: viewModel.walletBalance!)
                                            viewModel.tradeSuccessSell = true
                                        }
                                        
                                    }
                                    
                                }
                            }
                        }
                        
                        else{
                            viewModel.toastMessage = "Please enter a valid amount"
                            viewModel.showToast = true
                            DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                                viewModel.showToast = false
                            }
                        }
                    }
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .padding(.vertical)
                    .padding(.horizontal, 60)
                    .background(Color.green)
                    .cornerRadius(20)
                    
                }
                .overlay(
                    VStack {
                        if viewModel.showToast {
                            ToastMessage(message: viewModel.toastMessage)
                                .transition(.slide)
                                .onTapGesture {
                                    viewModel.showToast = false
                                }
                        }
                    },
                    alignment: .center
                )
            }
        }
        .onAppear {
            viewModel.fetchPortfolioData(ticker: ticker)
        }
    }
    
    func calculateTotalCost() {
        if let shareCount = Int(numberOfShares) {
            totalCost = Double(shareCount) * quote
        } else {
            totalCost = 0
        }
    }
}


//Canvas display
#Preview {
    PortfolioView(ticker: "AAPL", quote: 100.00, name: "Apple Inc")
}
