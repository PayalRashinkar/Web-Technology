import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class SearchService {
  private searchResults: any = null; 
  private currentTicker: string = '';

  constructor() {}

  setSearchResults(results: any) { 
    this.searchResults = results;
  }

  getSearchResults() {
    return this.searchResults;
  }

  setCurrentTicker(ticker: string) {
    console.log(" setting ticker service", ticker);
    this.currentTicker = ticker;
  }

  getCurrentTicker() {
    return this.currentTicker;
  }

  clearSearchResults() {
    this.searchResults = null;
    this.currentTicker = '';
  }
}
