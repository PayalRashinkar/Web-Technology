import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { CompanyService } from '../../service/company.service';
import { SearchService } from '../../service/search.service';
import * as Highcharts from 'highcharts/highstock';
import IndicatorsCore from 'highcharts/indicators/indicators-all';
import VBP from 'highcharts/indicators/volume-by-price';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
//import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BuymodalComponent } from '../buymodal/buymodal.component';
import { ActivatedRoute } from '@angular/router';
import { InsiderData } from './insider-data.model';
import { Subscription } from 'rxjs';
import { interval, takeWhile } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { map } from 'rxjs/operators';

// Initialize the Indicators Core and VBP
IndicatorsCore(Highcharts);
VBP(Highcharts);

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit, OnDestroy {
  companyProfile: any;
  //insider: any;
  companyQuote: any;
  companyPeer: string[] = [];
  marketStatus: { isOpen: boolean; lastUpdated: Date } | null = null;
  notFound: boolean = false;
  showTabs: boolean = true;
  Highcharts: typeof Highcharts = Highcharts; // Reference to Highcharts
  processedData: any[] = []; // Array to store processed data
  chartOptions!: Highcharts.Options; // Highcharts options
  chartOptions2!: Highcharts.Options;
  chartOptions3!: Highcharts.Options;
  chartOptions4!: Highcharts.Options;
  NewsAPI: any[] = []; // This should hold objects, not strings.
  selectedNewsItem: any;
  showAlert: boolean = false;
  alertMessage: string = ''; // New property for dynamic message
  watchlist: string[] = [];
  //hasBought: boolean = false;
  ticker: string = '';
  purchaseSuccess = false;
  sellSuccess = false;
  sellTimeout: any;
  purchaseTimeout: any;
  notFoundTimeout: any;
  private updateSubscription!: Subscription;
  autoComplete: any;
  //filteredOptions: string[] = [];
  formGroup!: FormGroup;
  symbols: string[] = [];
  description: string[] = [];
  combinedArray: { symbol: string; description: string }[] = [];
  spinner = false;

  @ViewChild('newsDetailsModal', { static: true })
  newsDetailsModal!: TemplateRef<any>;
  enable_sell_button = false;

  constructor(
    private companyService: CompanyService,
    private modalService: NgbModal,
    private router: Router,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private searchService: SearchService,
    private fb: FormBuilder
  ) {}

  public hasBoughtStock(ticker: string): boolean {
    return this.companyService.hasBoughtStock(ticker);
  }

  openBuyModal(operation: 'buy' | 'sell') {
    const dialogRef = this.dialog.open(BuymodalComponent, {
      width: '500px',
      // You can pass data to the modal like this:
      data: {
        ticker: this.companyProfile.ticker,
        name: this.companyProfile.name,
        currentPrice: this.companyQuote.c,
        //currentPrice: 173.40,
        modal: operation,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (operation == 'buy') {
          this.enable_sell_button = true;
          this.purchaseSuccess = true;
          this.purchaseTimeout = setTimeout(
            () => (this.purchaseSuccess = false),
            3000
          );
        } else {
          this.getPortData1(this.ticker);
          this.sellSuccess = true;
          this.sellTimeout = setTimeout(() => (this.sellSuccess = false), 3000);
        }
      }
    });
  }

  sellStock(ticker: string) {
    // Logic to sell the stock
    console.log('Inside sellStock');
  }

  isStarFilled(ticker: string): boolean {
    console.log('watchlist var inside isStarFilled', this.watchlist);
    return this.watchlist.includes(ticker);
    //return false;
  }

  addToDatabase(companyDetails: any): void {
    this.companyService.addToWatchlist(companyDetails).subscribe({
      next: (response) => {
        console.log(`${companyDetails.ticker} added to watchlist.`, response);
      },
      error: (err) => {
        console.error(
          `Error adding ${companyDetails.ticker} to watchlist:`,
          err
        );
      },
    });
  }

  removeFromDatabase(ticker: string): void {
    this.companyService.removeFromWatchlist(ticker).subscribe({
      next: (response) => {
        console.log(`${ticker} removed from watchlist successfully`, response);
      },
      error: (err) => {
        console.error(`Error removing ${ticker} from watchlist:`, err);
      },
    });
  }

  // Refactored showAlert logic
  showAlertMessage(isAdded: boolean) {
    this.showAlert = true;
    this.alertMessage = isAdded
      ? `${this.companyProfile.ticker} added to Watchlist.`
      : `${this.companyProfile.ticker} removed from Watchlist.`;
    setTimeout(() => (this.showAlert = false), 3000);
  }

  toggleStar(ticker: string): void {
    const companyDetails = {
      ticker: this.companyProfile.ticker,
      name: this.companyProfile.name,
      c: this.companyQuote.c,
      d: this.companyQuote.d,
      dp: this.companyQuote.dp,
    };

    if (this.isStarFilled(ticker)) {
      console.log('watchlist var inside if cond', this.watchlist);
      this.watchlist = this.watchlist.filter((t) => t !== ticker); // Update local state first
      this.showAlertMessage(false);
      this.removeFromDatabase(ticker); // Then attempt to update the database
    } else {
      console.log('watchlist var inside else', this.watchlist);
      if (!this.watchlist.includes(ticker)) {
        this.watchlist.push(ticker); // Update local state first
      }
      this.showAlertMessage(true);
      this.addToDatabase(companyDetails); // Then attempt to update the database
    }
  }

  getCompanyProfileAndQuoteAndPeer(ticker: string) {
    this.getInsiderSentiment(ticker);
    this.getCompanyProfile(ticker);
    this.getCompanyQuote(ticker);
    this.getCompanyPeer(ticker);
    //this.saveSearchResults();
    this.chartsAPI(ticker);
    this.getNewsAPI(ticker);
    this.chartsAPI_hist(ticker);
    this.chartsAPI4(ticker);
    this.chartsAPI3(ticker);
  }

  getNewsAPI(searchQuery: string) {
    this.companyService.getNewsAPI(searchQuery).subscribe(
      (data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          this.NewsAPI = data; // Assuming 'data' is an array of peers
          console.log('newpayal', this.NewsAPI);
        } else {
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }

  open(item: any) {
    console.log('Open cha aanth');
    this.selectedNewsItem = item;
    console.log('Open2 cha aanth', this.selectedNewsItem);
    this.modalService.open(this.newsDetailsModal);
  }

  getCompanyProfile(ticker: string) {
    this.companyService.getCompanyProfile(ticker).subscribe(
      (data) => {
        if (data && Object.keys(data).length > 0) {
          this.companyProfile = data;

          this.notFound = false;
        } else {
          this.notFound = true;
        }
      },
      (err) => {
        console.error(err);
        this.notFound = true;
      }
    );
  }

  insider!: { symbol: string; data: InsiderData[] };
  totalMSPR: number = 0;
  positiveMSPR: number = 0;
  negativeMSPR: number = 0;
  totalChange: number = 0;
  positiveChange: number = 0;
  negativeChange: number = 0;

  aggregateMSPR() {
    // Reset values before calculation
    this.totalMSPR = 0;
    this.positiveMSPR = 0;
    this.negativeMSPR = 0;
    this.totalChange = 0;
    this.positiveChange = 0;
    this.negativeChange = 0;

    // Ensure we have the data array and iterate over it
    if (this.insider && Array.isArray(this.insider.data)) {
      this.insider.data.forEach((item: InsiderData) => {
        // Add to total mspr
        this.totalMSPR += item.mspr;
        this.totalChange += item.change;

        // If mspr is positive, add to positiveMSPR, else add to negativeMSPR
        if (item.mspr > 0) {
          this.positiveMSPR += item.mspr;
        } else {
          this.negativeMSPR += item.mspr;
        }

        if (item.change > 0) {
          this.positiveChange += item.change;
        } else {
          this.negativeChange += item.change;
        }
      });
      //console.log("totalMSPR is", this.totalMSPR)
    }
  }

  getInsiderSentiment(ticker: string) {
    this.companyService.getInsiderSentiment(ticker).subscribe(
      (response) => {
        if (
          response &&
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          this.insider = response;
          console.log('FE1, insider', this.insider);
          this.aggregateMSPR();

          this.notFound = false;
        } else {
          this.notFound = true;
        }
      },
      (err) => {
        console.error(err);
        this.notFound = true;
      }
    );
  }

  getCompanyQuote(ticker: string) {
    this.companyService.getCompanyQuote(ticker).subscribe(
      (data) => {
        if (data && Object.keys(data).length > 0) {
          this.companyQuote = data;
          this.companyQuote.t = new Date(this.companyQuote.t * 1000);
          this.marketStatus = {
            isOpen: this.isMarketOpen(this.companyQuote.t),
            //isOpen: true,
            lastUpdated: this.companyQuote.t,
          };

          if (this.marketStatus.isOpen) {
            // Only start the interval if the market is open
            this.startQuoteUpdateInterval(ticker);
          }

          this.notFound = false;
          // You can log or handle the quote data further as needed
          console.log(this.companyQuote);
        } else {
          this.notFound = true;
        }
      },
      (err) => {
        console.error(err);
        this.notFound = true;
        // Handle error for quote data
      }
    );
  }

  startQuoteUpdateInterval(ticker: string) {
    // Unsubscribe from the previous subscription if it exists
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }

    this.updateSubscription = interval(15000)
      .pipe(takeWhile(() => !!this.marketStatus && this.marketStatus.isOpen))
      .subscribe(() => {
        this.getCompanyQuote(ticker);
      });
  }

  ppp!: Date;
  // ppp1:Date = new Date();

  ppp1: Date = new Date();
  private timerSubscription!: Subscription;

  isMarketOpen(quoteDate: Date): boolean {
    // Current time
    const now = new Date();
    console.log('Payal1.o', now);
    this.ppp = now;
    // Calculate the difference in minutes
    const diffInMinutes = (now.getTime() - quoteDate.getTime()) / (1000 * 60);
    // Check if the difference is less than or equal to 5 minutes
    console.log('Payal2', diffInMinutes);
    return diffInMinutes <= 5;
    //return false;
  }

  getCompanyPeer(ticker: string) {
    this.companyService.getCompanyPeer(ticker).subscribe(
      (data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          this.companyPeer = data; // Assuming 'data' is an array of peers
          this.notFound = false;
        } else {
          this.notFound = true;
        }
      },
      (err) => {
        console.error(err);
        this.notFound = true;
      }
    );
  }

  chartsAPI(searchQuery: string) {
    searchQuery = searchQuery.toUpperCase();
    this.companyService.chartsAPI(searchQuery).subscribe((data) => {
      if (data && data.hist_data && data.hist_data.length > 0) {
        // Process and map the data
        let mappedData = data.hist_data.map((dataPoint: any) => {
          return [dataPoint[0], dataPoint[1]]; // Convert to [timestamp, price]
        });

        // Wrap mappedData in another array
        this.processedData = [mappedData];

        const color = this.marketStatus?.isOpen ? '#008000' : '#FF0000';

        // Now that processedData is ready, use it to update the chartOptions
        this.updateChartOptions(color, searchQuery);
      } else {
        console.log('chartsAPI error huvalai');
      }
    });
  }

  updateChartOptions(color: string, searchQuery: string) {
    this.chartOptions = {
      chart: {
        type: 'line', // Define chart type
        backgroundColor: '#F5F5F5',
      },
      rangeSelector: {
        enabled: false, // Disable range selector
      },

      scrollbar: {
        enabled: true, // Enable the scrollbar
      },
      title: {
        text: searchQuery + ` Hourly Price Variation`, // Chart title
        style: {
          fontWeight: 'lighter',
          color: 'grey',
        },
      },
      xAxis: {
        type: 'datetime', // Define x-axis as datetime type
        labels: {
          format: '{value:%H:%M}',
          // Format labels to show only hour and minute
        },

        title: {
          //text: 'Date', // x-axis title
        },
      },
      yAxis: {
        opposite: true,
        title: {
          text: null, // Clear y-axis title
        },
      },
      series: [
        {
          showInLegend: false,
          name: searchQuery,
          type: 'line',
          //data: this.processedData[0], // Use the first element of processedData, which is the data array
          data: this.processedData[0],
          //'#008000' = green
          color: color,
          marker: {
            enabled: false, // Disable markers on the line
          },
        },
      ],
    };
  }

  chartsAPI3(searchQuery: string) {
    this.companyService.chartsAPI3(searchQuery).subscribe((data) => {
      if (data && data.earn_chart && data.earn_chart.length > 0) {
        console.log('FE1 Charts3 payap', data);

        interface EarningsData {
          actual: number;
          estimate: number;
          period: string;
          surprise: number;
        }

        const actuals = data.earn_chart.map(
          (item: EarningsData) => item.actual
        );
        const estimates = data.earn_chart.map(
          (item: EarningsData) => item.estimate
        );
        const periods = data.earn_chart.map(
          (item: EarningsData) => item.period
        );
        const surprises = data.earn_chart.map(
          (item: EarningsData) => item.surprise
        );

        // Output the results
        //console.log('Actuals:', actuals);
        //console.log('Estimates:', estimates);
        // console.log('Periods:', periods);
        //console.log('Surprises:', surprises);

        this.updateChartOptions3(actuals, estimates, periods, surprises);
      }
    });
  }

  updateChartOptions3(
    actuals: number[],
    estimates: number[],
    periods: string[],
    surprises: number[]
  ) {
    this.chartOptions3 = {
      title: {
        text: 'Historical EPS Surprises',
      },
      xAxis: {
        categories: periods,
        labels: {
          formatter: function () {
            // 'this' context is a point on the xAxis, where 'value' is the category
            const index = this.axis.categories.indexOf(String(this.value));
            const surpriseValue = surprises[index];
            // Return the string that combines the period and the surprise
            return `${this.value}<br>Surprise: ${surpriseValue}`;
          },
        },
      },

      yAxis: {
        title: {
          text: 'Quarterly EPS',
        },
      },
      tooltip: {
        shared: true,
        valueSuffix: ' units',
      },
      series: [
        {
          name: 'Actual',
          data: actuals,
          type: 'line',
        },
        {
          name: 'Estimate',
          data: estimates,
          type: 'line',
        },
      ],
    };
  }

  chartsAPI4(searchQuery: string) {
    this.companyService.chartsAPI4(searchQuery).subscribe((data) => {
      if (data && data.rec_trend && data.rec_trend.length > 0) {
        interface RecTrend {
          buy: number;
          hold: number;
          period: string;
          sell: number;
          strongBuy: number;
          strongSell: number;
          Symbol: string;
        }

        console.log('FE1 Charts4 payal', data);

        const buy = data.rec_trend.map((item: RecTrend) => item.buy);
        const hold = data.rec_trend.map((item: RecTrend) => item.hold);
        const period = data.rec_trend.map((item: RecTrend) =>
          item.period.slice(0, 7)
        );
        const sell = data.rec_trend.map((item: RecTrend) => item.sell);
        const strongBuy = data.rec_trend.map(
          (item: RecTrend) => item.strongBuy
        );
        const strongSell = data.rec_trend.map(
          (item: RecTrend) => item.strongSell
        );
        const Symbol = data.rec_trend.map((item: RecTrend) => item.Symbol);

        // Output the results
        console.log('buy:', buy);
        console.log('hold:', hold);
        console.log('Periods:', period);
        console.log('sell:', sell);
        console.log('strongBuy:', strongBuy);
        console.log('strongSell:', strongSell);
        console.log('Symbol:', Symbol);

        this.updateChartOptions4(
          period,
          strongBuy,
          strongSell,
          sell,
          hold,
          buy
        );
      }
    });
  }

  updateChartOptions4(
    period: string[],
    strongBuy: number[],
    strongSell: number[],
    sell: number[],
    hold: number[],
    buy: number[]
  ) {
    this.chartOptions4 = {
      chart: {
        type: 'column',
      },
      title: {
        text: 'Recommendation Trends',
        align: 'center',
      },
      xAxis: {
        categories: period,
      },
      yAxis: {
        min: 0,
        title: {
          text: '#Analysis',
        },
        stackLabels: {
          enabled: true,
        },
      },
      tooltip: {
        headerFormat: '<b>{point.x}</b><br/>',
        pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}',
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: true,
          },
        },
      },
      series: [
        {
          name: 'Strong Buy',
          type: 'column',
          data: strongBuy,
          color: '#316139',
        },
        {
          name: 'Buy',
          type: 'column',
          data: buy,
          color: '#55AB5C',
        },
        {
          name: 'Hold',
          type: 'column',
          data: hold,
          color: '#A97F3A',
        },
        {
          name: 'Sell',
          type: 'column',
          data: sell,
          color: 'red',
        },
        {
          name: 'Strong Sell',
          type: 'column',
          data: strongSell,
          color: 'Maroon',
        },
      ],
    };
  }

  chartsAPI_hist(searchQuery: string) {
    searchQuery = searchQuery.toUpperCase();
    this.companyService.chartsAPI_hist(searchQuery).subscribe((data) => {
      if (data && data.hist_data2 && data.hist_data2.length > 0) {
        console.log('Inside ifffff');
        const ohlc = [],
          volume = [],
          dataLength = data.hist_data2.length,
          // set the allowed units for data grouping
          groupingUnits = [
            [
              'week', // unit name
              [1], // allowed multiples
            ],
            ['month', [1, 2, 3, 4, 6]],
            ['year', [1, 2]],
          ];
        for (let i = 0; i < dataLength; i += 1) {
          ohlc.push([
            data.hist_data2[i][4], // the date
            data.hist_data2[i][0], // open
            data.hist_data2[i][1], // high
            data.hist_data2[i][2], // low
            data.hist_data2[i][3], // close
          ]);

          volume.push([
            data.hist_data2[i][4], // the date
            data.hist_data2[i][5], // the volume
          ]);
        }

        console.log('payal check upper case', searchQuery);
        console.log('ohlc, volume', ohlc, volume, groupingUnits, searchQuery);
        this.updateChartOptions2(ohlc, volume, groupingUnits, searchQuery);
      } else {
        console.log('Error charts_hist payal check');
      }
    });
  }

  updateChartOptions2(
    ohlc: any,
    volume: any,
    groupingUnits: any,
    searchQuery: string
  ) {
    this.chartOptions2 = {
      rangeSelector: {
        //enabled: true, // Enable the range selector
        allButtonsEnabled: true,
        buttons: [
          {
            // Define the buttons you want to show
            type: 'month',
            count: 1,
            text: '1m',
          },
          {
            type: 'month',
            count: 3,
            text: '3m',
          },
          {
            type: 'month',
            count: 6,
            text: '6m',
          },
          {
            type: 'ytd',
            text: 'YTD',
          },
          {
            type: 'year',
            count: 1,
            text: '1y',
          },
          {
            type: 'all',
            text: 'All',
          },
        ],
        selected: 5, // 'All' selected by default
      },

      title: {
        text: searchQuery + ' Historical',
      },

      subtitle: {
        text: 'With SMA and Volume by Price technical indicators',
      },

      yAxis: [
        {
          startOnTick: false,
          endOnTick: false,
          labels: {
            align: 'right',
            x: -3,
          },
          title: {
            text: 'OHLC',
          },
          height: '60%',
          lineWidth: 2,
          resize: {
            enabled: true,
          },
        },
        {
          labels: {
            align: 'right',
            x: -3,
          },
          title: {
            text: 'Volume',
          },
          top: '65%',
          height: '35%',
          offset: 0,
          lineWidth: 2,
        },
      ],

      tooltip: {
        split: true,
      },

      plotOptions: {
        series: {
          dataGrouping: {
            units: groupingUnits,
          },
        },
      },

      series: [
        {
          linkedTo: searchQuery,
          name: searchQuery,
          id: searchQuery,
          zIndex: 2,
          data: ohlc,
          type: 'candlestick',
        },
        {
          type: 'column',
          name: 'Volume',
          id: 'volume',
          data: volume,
          yAxis: 1,
        },
        {
          type: 'vbp',
          //linkedTo: searchQuery,
          id: searchQuery,
          linkedTo: searchQuery,
          params: {
            volumeSeriesID: 'volume',
          },
          dataLabels: {
            enabled: false,
          },
          zoneLines: {
            enabled: false,
          },
        },
        {
          type: 'sma',
          //linkedTo: searchQuery,
          id: searchQuery,
          linkedTo: searchQuery,
          zIndex: 1,
          marker: {
            enabled: false,
          },
        },
      ],
    };
  }

  handleSearch() {
    console.log('Handle search payal');
    /*
    if (!this.ticker) {
      console.log('hiiii  Search query is empty');
      this.clearSearch();
      this.notFound = true;
      this.notFoundTimeout = setTimeout(() => (this.notFound = false), 10000);
      return;
    }*/

    this.enable_sell_button = false;
    this.getPortData(this.ticker);
    this.getWatchlist();
    this.companyProfile = null;
    this.companyQuote = null;
    this.companyPeer = [];
    this.marketStatus = null;
    //this.processedData = [];

    this.searchService.setCurrentTicker(this.ticker);
    this.notFound = false;
    this.showTabs = false;
    this.spinner = false;
    this.getCompanyProfileAndQuoteAndPeer(this.ticker);

    this.router.navigate(['/search', this.ticker.trim()]);
  }

  private subscription = new Subscription();

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.ticker = params.get('ticker') || '';
      console.log('what is this.ticker', this.ticker);
      if (!this.ticker) {
        console.log('Search query is empty');
        this.notFound = true;

        return;
      }
      this.searchService.setCurrentTicker(this.ticker);
      this.notFound = false;
      this.showTabs = true;
      this.getCompanyProfileAndQuoteAndPeer(this.ticker);
      this.initForm();
      console.log('watchlist var inside init', this.watchlist);

      // Logic to fetch and display the details for this.ticker
    });

    this.timerSubscription = interval(15000).subscribe(() => {
      // Update the ppp1 property with the current date and time
      this.ppp1 = new Date();
    });
    this.getPortData(this.ticker);
    this.getWatchlist();
  }

  getWatchlist() {
    // Code to retrieve watchlist from MongoDB Atlas
    this.companyService.getWatchlist().subscribe(
      (data) => {
        //if (data && Object.keys(data).length > 0) {
        console.log('data payal getWatchlist', data);
        if (data && Array.isArray(data) && data.length > 0) {
          //this.watchlist = data;
          //console.log("Hi watchlist prd", this.watchlist);
          this.watchlist = data.map((item) => item.ticker);
          console.log('Checking watchlist ata', this.watchlist);
        } else {
          //this.showAlertMessage1();
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }

  getPortData(port_ticker: string) {
    console.log('Inside search getPortData');

    this.companyService.getPortData(port_ticker).subscribe(
      (data) => {
        if (
          data &&
          Object.keys(data).length > 0 &&
          data.ticker === this.ticker
        ) {
          this.updateButtonVisibility(port_ticker);

          //this.updateBasedOnPortData(data);
        } else {
          //this.updateButton2Visibility(port_ticker);
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }

  getPortData1(port_ticker: string) {
    console.log('Inside search getPortData1');

    this.companyService.getPortData(port_ticker).subscribe(
      (data) => {
        console.log('check y data is not coming', data);
        if (
          data &&
          Object.keys(data).length > 0 &&
          data.ticker === this.ticker
        ) {
        } else {
          this.updateButton2Visibility(port_ticker);
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }

  initForm() {
    this.formGroup = this.fb.group({
      '': [''],
    });

    this.formGroup
      .get('')
      ?.valueChanges.pipe(debounceTime(100))
      .subscribe((response) => {
        console.log('entered data is ', response);
        this.getAutoComplete(response);
      });
  }

  /*
  getAutoComplete(ticker: string) {
    this.spinner = true;
    this.companyService.getAutoComplete(ticker).subscribe(
      (data) => {
        this.spinner = false;
        if (data && Array.isArray(data) && data.length > 0) {
          this.combinedArray = data.map((item) => ({
            symbol: item.symbol,
            description: item.description,
          }));
          //this.spinner = false;
        } else {
          // Handle no results or error
        }
      },
      (err) => {
        console.error(err);
        //this.spinner = false;
        // Handle the error case
      }
    );
  }*/

  getAutoComplete(ticker: string) {
    // Start the spinner when a search is initiated (i.e., when ticker has a value)
    if (ticker) {
      this.spinner = true; // Show spinner
      this.companyService.getAutoComplete(ticker).subscribe(
        (data) => {
          if (data && Array.isArray(data) && data.length > 0) {
            this.combinedArray = data.map((item) => ({
              symbol: item.symbol,
              description: item.description,
            }));
          } else {
            // Handle no results or error
          }
          this.spinner = false; // Hide spinner once data is fetched or no results
        },
        (err) => {
          console.error(err);
          this.spinner = false; // Hide spinner in case of an error
          // Handle the error case
        }
      );
    } else {
      this.spinner = false; // Ensure spinner is not shown if there's no input
    }
  }
  

  updateButtonVisibility(ticker: string) {
    console.log('iNSIDE Disable button visibility', ticker);
    this.enable_sell_button = true;
  }

  updateButton2Visibility(ticker: string) {
    console.log('iNSIDE Disable button visibility', ticker);
    this.enable_sell_button = false;
  }

  clearSearch() {
    this.enable_sell_button = false;
    this.companyProfile = null;
    this.companyQuote = null;
    this.companyPeer = [];
    this.notFound = false;
    this.marketStatus = null;
    this.showTabs = false;
    this.ticker = '';
    //this.searchService.clearSearchResults();
    this.router.navigate(['/search/home']);
  }

  ngOnDestroy() {
    clearTimeout(this.purchaseTimeout);
    clearTimeout(this.sellTimeout);
    clearTimeout(this.notFoundTimeout);
    this.subscription.unsubscribe();
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
