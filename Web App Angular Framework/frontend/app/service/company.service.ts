import { of, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
//import { environment } from '../../environments/environment';
import { HOST_NAME } from './host';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private walletSubject = new BehaviorSubject<any>(null);
  wallet$ = this.walletSubject.asObservable();

  private walletBalanceSource = new BehaviorSubject<number>(0);
  walletBalance$ = this.walletBalanceSource.asObservable();

  private tickerSource = new BehaviorSubject<string>('');
  currentTicker = this.tickerSource.asObservable();

  private portfolioUpdatedSource = new BehaviorSubject<any[]>([]);
  public portfolioUpdated$ = this.portfolioUpdatedSource.asObservable();

  changeTicker(ticker: string) {
    this.tickerSource.next(ticker);
  }

  constructor(private http: HttpClient) {}

  private purchasedTickers = new Set<string>();

  // Call this method when a stock is bought
  markAsPurchased(ticker: string) {
    this.purchasedTickers.add(ticker);
  }

  // This method checks if the stock has been bought
  hasBoughtStock(ticker: string): boolean {
    //console.log("update service that stock is bought", ticker);
    return this.purchasedTickers.has(ticker);
  }

  getCompanyProfile(ticker: string): Observable<any> {
    const url = HOST_NAME + `/api/company-profile/${ticker}`;

    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError<any>('getCompanyProfile', [])));
  }

  getAutoComplete(ticker: string): Observable<any> {
    const url = HOST_NAME + `/api/auto-complete/${ticker}`;
    console.log('autocomplete service');
    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError<any>('getAutoComplete', [])));
  }

  getCompanyQuote(ticker: string): Observable<any> {
    //const url = `${environment.apiUrl}/quote/${ticker}`;
    const url = HOST_NAME + `/api/quote/${ticker}`;
    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError<any>('getCompanyQuote', [])));
  }

  getInsiderSentiment(ticker: string): Observable<any> {
    const url = HOST_NAME + `/api/insider/${ticker}`;
    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError<any>('getInsiderSentiment', [])));
  }

  getCompanyPeer(ticker: string): Observable<any> {
    const url = HOST_NAME + `/api/company-peer/${ticker}`;

    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError<any>('getCompanyPeer', [])));
  }

  chartsAPI(ticker: string): Observable<any> {
    const url = HOST_NAME + `/api/company-charts/${ticker}`;

    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError<any>('chartsAPI', [])));
  }

  chartsAPI3(ticker: string): Observable<any> {
    const url = HOST_NAME + `/api/company-charts3/${ticker}`;

    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError<any>('chartsAPI3', [])));
  }

  chartsAPI4(ticker: string): Observable<any> {
    const url = HOST_NAME + `/api/company-charts4/${ticker}`;

    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError<any>('chartsAPI4', [])));
  }

  chartsAPI_hist(ticker: string): Observable<any> {
    const url = HOST_NAME + `/api/company-charts2/${ticker}`;
    console.log('charts2 payal service');
    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError<any>('chartsAPI_hist', [])));
  }

  getNewsAPI(ticker: string): Observable<any> {
    const url = HOST_NAME + `/api/company-news/${ticker}`;
    console.log('news payal service');
    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError<any>('getNewsAPI', [])));
  }

  getWatchlist(): Observable<any> {
    const url = HOST_NAME + `/api/watchlist`;
    console.log('watchlist payal');
    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError<any>('getWatchlist', [])));
  }

  getPortData(ticker: string): Observable<any> {
    const url = HOST_NAME + `/api/portdata/${ticker}`;
    console.log('portdata service payal');
    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError<any>('getPortData', [])));
  }

  getPortfolio(): Observable<any> {
    const url = HOST_NAME + `/api/portfolio1`;
    console.log('portfolio service payal');
    return this.http
      .get<any>(url)
      .pipe(catchError(this.handleError<any>('getPortfolio', [])));
  }

  // In company.service.ts
  private apiUrl = HOST_NAME + '/api/watchlist/add'; // Corrected: API URL points to the exact endpoint.

  addToWatchlist(companyDetails: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    // Use the apiUrl directly without appending additional path
    return this.http
      .post<any>(this.apiUrl, companyDetails, httpOptions)
      .pipe(catchError(this.handleError<any>('addToWatchlist')));
  }

  removeFromWatchlist(ticker: string): Observable<any> {
    const Url = HOST_NAME + '/api/watchlist/delete';
    return this.http
      .delete(`${Url}/${ticker}`)
      .pipe(catchError(this.handleError<any>('removeFromWatchlist')));
  }

  removeFromPortfolio(ticker: string): Observable<any> {
    const Url = HOST_NAME + '/api/portfolio/delete';
    return this.http
      .delete(`${Url}/${ticker}`)
      .pipe(catchError(this.handleError<any>('removeFromPortfolio')));
  }

  getWallet(forceRefresh: boolean = true): Observable<any> {
    const url = HOST_NAME + `/api/wallet`;
    if (forceRefresh || this.walletSubject.getValue() === null) {
      this.http.get<any>(url).subscribe(
        (data) => this.walletSubject.next(data),
        (error) => console.error('getWallet failed:', error)
      );
    }
    console.log('getwallet() service walletsubject', this.wallet$);
    return this.wallet$;
  }

  updateWalletBalance(walletId: string, newBalance: number) {
    console.log('Inside service updateWallet', walletId, newBalance);
    return this.http.post(HOST_NAME + '/api/wallet/update', {
      walletId: walletId,
      balance: newBalance,
    });
  }

  refreshWalletBalance(newBalance: number) {
    console.log('inside service refreshWalletBalance() ', newBalance);
    this.walletBalanceSource.next(newBalance);
  }

  updatePortfolio(data: any) {
    // replace with the correct URL to your backend endpoint
    console.log('Inside service updatePortfolio', data);
    this.updatePortfolioData(data);
    return this.http.post(HOST_NAME + '/api/portfolio/update', data);
  }

  // Call this method when the portfolio updates
  updatePortfolioData(newData: any[]) {
    this.portfolioUpdatedSource.next(newData);
  }

 
  //private portfoliodeleteSubject = new Subject<string>();
  private portfoliodeleteSubject = new ReplaySubject<string>(1);

  // Call this method to notify about the removal
  notifyPortfolioChange(ticker: string) {
    console.log("service setting deleted ticker", ticker);
    this.portfoliodeleteSubject.next(ticker);
  }

  // Components subscribe to this Observable to get delete notifications
  get portfoliodelete$(): Observable<string> {
    console.log("service sending deleted ticker");
    return this.portfoliodeleteSubject.asObservable();
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
