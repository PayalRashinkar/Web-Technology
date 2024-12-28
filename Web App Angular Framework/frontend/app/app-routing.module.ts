import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { SearchComponent } from './component/search/search.component';
import { WatchlistComponent } from './component/watchlist/watchlist.component';
import { PortfolioComponent } from './component/portfolio/portfolio.component';


/*
const routes: Routes = [
  { path: '', redirectTo: '/search/home', pathMatch: 'full' },
  { path: 'search/home', component: HomeComponent },
  {path: 'search/:ticker', component: SearchComponent },
  {path: 'watchlist', component: WatchlistComponent},
  {path: 'portfolio', component: PortfolioComponent}
];
*/


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search/home', component: HomeComponent },
  {path: 'search/:ticker', component: SearchComponent },
  {path: 'watchlist', component: WatchlistComponent},
  {path: 'portfolio', component: PortfolioComponent}
];





@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
