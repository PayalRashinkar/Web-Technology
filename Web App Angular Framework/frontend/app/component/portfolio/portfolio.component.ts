import { Component, OnInit, OnDestroy } from '@angular/core';
import { CompanyService } from '../../service/company.service';
import { Subscription } from 'rxjs';
import { BuymodalComponent } from '../buymodal/buymodal.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
})
export class PortfolioComponent implements OnInit, OnDestroy {
  private balanceSubscription: Subscription = new Subscription();
  private subscription: Subscription = new Subscription();
  wallet: any;
  portfolio: any[] = [];
  showAlert2: boolean = false;
  alertMessage2: string = '';
  purchaseSuccess = false;
  sellSuccess = false;
  sellTimeout: any;
  purchaseTimeout: any;
  ticker1: string = '';
  finish_fetching: boolean = false;
  noData!: boolean;

  constructor(
    private companyService: CompanyService,
    public dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.companyService.getWallet();

    this.balanceSubscription.add(
      this.companyService.wallet$.subscribe((wallet) => {
        this.wallet = wallet;
      })
    );
    this.getPortfolio();

    this.balanceSubscription.add(
      this.companyService.walletBalance$.subscribe((balance) => {
        // Logic to update your portfolio's balance display
        this.wallet.balance = balance;
      })
    );
    // Subscribe to portfolio updates
    this.balanceSubscription.add(
      this.companyService.portfolioUpdated$.subscribe((updatedPortfolio) => {
        this.portfolio = updatedPortfolio;
      })
    );

    this.subscribeToPortfolioDeletion();
  }

  private subscribeToPortfolioDeletion() {
    this.subscription = this.companyService.portfoliodelete$.subscribe(
      (ticker) => {
        console.log(`Received notification to delete: ${ticker}`);
        // Add your logic here to handle the deletion notification
        // For example, you might refresh a list of stocks in the component
      }
    );
  }

  openBuyModal(
    ticker: string,
    currentPrice: number,
    name: string,
    operation: 'buy' | 'sell'
  ) {
    console.log('inside buy port', ticker, currentPrice);
    const dialogRef = this.dialog.open(BuymodalComponent, {
      width: '500px',

      data: {
        ticker: ticker,
        name: name,
        currentPrice: currentPrice,
        wallet: this.wallet,
        modal: operation,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // if (result === true) {
      this.ticker1 = result;
      if (result) {
        if (operation == 'buy') {
          this.getPortfolio();
          this.purchaseSuccess = true;
          this.purchaseTimeout = setTimeout(
            () => (this.purchaseSuccess = false),
            3000
          );
        } else {
          this.sellSuccess = true;
          this.sellTimeout = setTimeout(() => (this.sellSuccess = false), 3000);
          this.getPortfolio1(result);
        }
      }
    });
  }

  showAlertMessage1() {
    this.showAlert2 = true;
    this.alertMessage2 = `Currently you don't have any stock.`;
    setTimeout(() => (this.showAlert2 = false), 2000);
  }

  getPortfolio() {
    //console.log("Payalayiyaassjklkajhfd");
    this.companyService.getPortfolio().subscribe(
      (data) => {
        //console.log("dataaaaaa", data);
        if (data && Array.isArray(data) && data.length > 0) {
          this.portfolio = data;
          console.log('FE Portfolio comp', this.portfolio);
          this.finish_fetching = true;
        } else {
          this.noData = true;
          this.portfolio = data;
          this.showAlertMessage1();
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }

  getPortfolio1(ticker: string) {
    //console.log("Payalayiyaassjklkajhfd");
    this.companyService.getPortfolio().subscribe(
      (data) => {
        //console.log("dataaaaaa", data);
        if (data && Array.isArray(data) && data.length > 0) {
          this.portfolio = data;
          console.log('FE Portfolio comp', this.portfolio);
        } else {
          this.portfolio = data;
          this.showAlertMessage1();
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    clearTimeout(this.purchaseTimeout);
    clearTimeout(this.sellTimeout);
    if (this.balanceSubscription) {
      this.balanceSubscription.unsubscribe();
    }
  }
}
