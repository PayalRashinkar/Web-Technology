import { Component, Inject, ViewChild, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CompanyService } from '../../service/company.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-buymodal',
  templateUrl: './buymodal.component.html',
  styleUrls: ['./buymodal.component.css'],
})
export class BuymodalComponent {
  quantity: number = 0;
  quantity1: number = 0;
  prd1!: number;
  wallet: any;
  purchaseSuccess = false;
  portdata: any[] = [];
  totalCost: number = 0;
  avgCostPerShare: number = 0;
  marketValue: number = 0;
  costDiff: number = 0;
  buy_button: boolean = true;
  newBalance!: number;


  constructor(
    public dialogRef: MatDialogRef<BuymodalComponent>,
    private companyService: CompanyService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
   
  ) {}

  ngOnInit() {
    this.companyService.getWallet();
    //console.log('Good catch');
    this.companyService.wallet$.subscribe((wallet) => {
      this.wallet = wallet;
    });
    this.button_check();
    this.payal();
  }

  payal() {
    this.companyService.getPortData(this.data.ticker).subscribe(
      (data) => {
        if (data && Object.keys(data).length > 0) {
          //this.portdata = data.name;
          //console.log('fe1 portdata', this.portdata);
          this.prd1 = data.quantity;
        } else {
          //console.log('else buymodal', data);
          this.prd1 = 0;
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }

  button_check() {
    const button = this.data.modal;
    console.log('inside buy button check', button);
    if (button == 'sell') {
      console.log('inside buy button check2', button);
      this.buy_button = false;
    }
  }

  get totalPrice(): number {
    //console.log('in tpf', this.quantity, this.data.currentPrice);
    return this.quantity * this.data.currentPrice;
  }

  get isBuyDisabled(): boolean {
    return this.quantity < 1 || this.totalPrice > this.wallet.balance;
  }

  get isSellDisabled(): boolean {
    return this.prd1 < this.quantity;
  }

  buyStocks() {
    //console.log('Inside buyStocks');
    this.purchaseSuccess = true;
    setTimeout(() => (this.purchaseSuccess = false), 5000);
    const port_ticker = this.data.ticker;
    this.getPortData(port_ticker);
  }

  getPortData(port_ticker: string) {
    console.log('hereeeeeee');

    this.companyService.getPortData(port_ticker).subscribe(
      (data) => {
        if (data && Object.keys(data).length > 0) {
          this.portdata = data.name;
          //console.log('fe1 portdata', this.portdata);
          this.updateBasedOnPortData(data);
        } else {
          //console.log('else buymodal', data);
          this.updateBasedOnPortData(data);
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }

  updateBasedOnPortData(data: any) {
    if (this.buy_button) {
      if (Object.keys(data).length === 0) {
        this.totalCost = 0;
        this.avgCostPerShare = 0;
        this.marketValue = 0;
        this.costDiff = 0;
        this.quantity1 = 0;
      } else {
        this.totalCost = data.totalCost;
        this.avgCostPerShare = data.totalCost / data.quantity;
        this.marketValue = data.currentPrice * data.quantity;
        this.costDiff = data.currentPrice - data.avgCostPerShare;
        this.quantity1 = data.quantity;
      }

      this.quantity1 += this.quantity;
      //console.log("Before tc", this.totalCost);
      //console.log("Before tp", this.totalPrice);
      this.totalCost += this.totalPrice;
      //console.log("After tp", this.totalPrice);
      //console.log("After tc", this.totalCost);
      this.avgCostPerShare = this.totalCost / this.quantity1;
      this.marketValue = this.data.currentPrice * this.quantity1;
      this.costDiff = this.data.currentPrice - this.avgCostPerShare;
    } else {
      this.totalCost = data.totalCost;
      this.avgCostPerShare = data.totalCost / data.quantity;
      this.marketValue = data.currentPrice * data.quantity;
      this.costDiff = data.currentPrice - data.avgCostPerShare;
      this.quantity1 = data.quantity;
      //this.quantity1 = this.prd1;
      this.quantity1 -= this.quantity;
     // console.log('check 0 issue', this.quantity1);

      if (this.quantity1 == 0) {
       // console.log('check 0 issue', this.quantity1);
        this.delete_portentry(data.ticker);
        this.updateWalletBalance(this.totalPrice);
      } else {
        this.totalCost -= this.totalPrice;
        this.avgCostPerShare = this.totalCost / this.quantity1;
        this.marketValue = this.data.currentPrice * this.quantity1;
        this.costDiff = this.data.currentPrice - this.avgCostPerShare;
      }
    }

    if (this.quantity1 > 0) {
      const portfolioUpdate = {
        ticker: this.data.ticker,
        name: this.data.name,
        currentPrice: this.data.currentPrice,
        quantity: this.quantity1,
        totalCost: this.totalCost,
        avgCostPerShare: this.avgCostPerShare,
        marketValue: this.marketValue,
        costDiff: this.costDiff,
      };

      this.companyService.updatePortfolio(portfolioUpdate).subscribe({
        next: (response) => {
         // console.log('Portfolio updated:', response);
          this.updateWalletBalance(this.totalPrice);
          this.companyService.markAsPurchased(this.data.ticker);
          // Call this in the service after successful purchase operation
          //this.updatePortfolioData(portfolioUpdate);
        },
        error: (error) => {
          console.error('Error updating portfolio:', error);
        },
      });
    }
  }

  private updateWalletBalance(totalPrice: number) {
    if (!this.wallet || !this.wallet._id) {
      console.error('Wallet information is missing');
      return;
    }

    const walletId = this.wallet._id;
    if (this.buy_button) {
      this.newBalance = this.wallet.balance - totalPrice;
    } else {
      this.newBalance = this.wallet.balance + totalPrice;
    }

    this.companyService
      .updateWalletBalance(walletId, this.newBalance)
      .subscribe({
        next: (response) => {
          //console.log('Wallet updated:', response);
          
          this.companyService.refreshWalletBalance(this.newBalance);
          this.dialogRef.close(this.data.ticker);
        },
        error: (error) => {
        //  console.error('Error updating wallet:', error);
        },
      });
  }

  delete_portentry(ticker: string) {
    this.companyService.removeFromPortfolio(ticker).subscribe({
      next: (response) => {
        console.log(
          `${ticker} removed from portfolio successfully ya`,
          response
        );
       // this.companyService.notifyPortfolioChange(ticker);
      },
      error: (err) => {
        console.error(`Error removing ${ticker} from portfolio:`, err);
      },
    });
  }
}
