import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent } from './component/header/header.component';
import { FooterComponent } from './component/footer/footer.component';
import { WatchlistComponent } from './component/watchlist/watchlist.component';
import { PortfolioComponent } from './component/portfolio/portfolio.component';
import { SearchComponent } from './component/search/search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CompanyService } from './service/company.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { HighchartsChartModule } from 'highcharts-angular';
//import { HighchartsChartComponent } from 'highcharts-angular';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BuymodalComponent } from './component/buymodal/buymodal.component';
//import { MatFormFieldModule, MatInputModule, MatButtonModule } from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HomeComponent } from './component/home/home.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
// ... any other material modules




@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    WatchlistComponent,
    PortfolioComponent,
    SearchComponent,
    BuymodalComponent,
    HomeComponent
    
    //HighchartsChartComponent
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatTabsModule,
    HighchartsChartModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    ReactiveFormsModule
  ],
  
  providers: [CompanyService],
  bootstrap: [AppComponent]
})

export class AppModule { }
