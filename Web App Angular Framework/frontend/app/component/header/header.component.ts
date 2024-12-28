import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../service/search.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  ticker: string = ''; // This property needs to be defined

  constructor(private router: Router, private searchService: SearchService) {}

  public isMenuCollapsed = true;

  toggleNavbar() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  setMenuCollapsedNav(val: boolean) {
    this.isMenuCollapsed = true;
  }

  ngOnInit(): void {}

  onSearchClick() {
    // Here you would navigate using the ticker property
    this.ticker = this.searchService.getCurrentTicker();
    if (this.ticker) {
      this.router.navigate(['/search', this.ticker]);
    } else {
      // Handle the case where there is no ticker
      this.router.navigate(['/search', 'home']);
    }
  }
}
