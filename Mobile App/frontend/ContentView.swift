//
//  ContentView.swift
//  testApp
//
//  Created by Payal Rashinkar on 04/04/24.
//

import SwiftUI

struct ContentView: View {
    
    @State private var searchText = ""
    @State private var showCancelButton: Bool = false
    
    var body: some View {
        NavigationView{
            VStack {
                HStack{
                    Image(systemName: "Magnifyingglass")
                    TextField("search", text: $searchText)
                }
                //Text("Current Date: \(Date(), formatter: dateFormatter)")
                Image(systemName: "globe")
                    .imageScale(.large)
                    .foregroundStyle(.tint)
                Text("Hello, Payal")
            }
            //.padding()
            .navigationTitle("Stocks")
        }
    }
}

#Preview {
    ContentView()
}
