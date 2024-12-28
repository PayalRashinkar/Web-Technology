import { Component, OnInit } from '@angular/core';
import { CompanyService } from '../../service/company.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css'],
})
export class WatchlistComponent {
  watchlist: any[] = []; // Initialize with data from the database
  // Other properties
  showAlert1: boolean = false;
  alertMessage1: string = ''; // New property for dynamic message
  finish_fetching = false;
  noData!: boolean;

  constructor(private router: Router, private companyService: CompanyService) {}

  ngOnInit() {
    // Load watchlist from the database
    this.getWatchlist();
  }

  showAlertMessage1() {
    this.showAlert1 = true;
    this.alertMessage1 = `Currently you don't have any stock in your watchlist`;
    setTimeout(() => (this.showAlert1 = false), 2000);
  }

  getWatchlist() {
    // Code to retrieve watchlist from MongoDB Atlas
    this.companyService.getWatchlist().subscribe(
      (data) => {
        //if (data && Object.keys(data).length > 0) {
        if (data && Array.isArray(data) && data.length > 0) {
          this.watchlist = data;
          console.log('Hi watchlist prd', this.watchlist);
          this.finish_fetching = true;
        } else {
          this.noData = true;
          this.showAlertMessage1();
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }

  openDetails(ticker: string) {
    // Navigate to the details route of the ticker
    //this.router.navigate(['', ticker]);
    this.router.navigate(['/search', ticker.trim()]);
  }

  removeFromDatabase1(ticker: string): void {
    this.companyService.removeFromWatchlist(ticker).subscribe({
      next: (response) => {
        console.log(`${ticker} removed from watchlist successfully`, response);
      },
      error: (err) => {
        console.error(`Error removing ${ticker} from watchlist:`, err);
      },
    });
  }

  removeFromWatchlist(ticker: string, event: Event) {
    event.stopPropagation(); // Prevent card click event
    // Code to remove the stock from the watchlist in the database
    this.watchlist = this.watchlist.filter((stock) => stock.ticker !== ticker);
    this.removeFromDatabase1(ticker);
  }
}
