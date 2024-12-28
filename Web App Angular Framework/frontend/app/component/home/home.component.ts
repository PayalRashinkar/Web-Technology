import { SearchService } from './../../service/search.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyService } from './../../service/company.service';
import { debounceTime } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  searchedTicker: string = '';
  notFound = false;
  autoComplete: any;
  //filteredOptions: string[] = [];
  formGroup!: FormGroup;
  symbols: string[] = [];
  description: string[] = [];
  combinedArray: { symbol: string; description: string }[] = [];
  spinner = false;

  constructor(
    private router: Router,
    private searchService: SearchService,
    private companyService: CompanyService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initForm();
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
        if (data && Array.isArray(data) && data.length > 0) {
          this.autoComplete = data;
          console.log('auto check kar', this.autoComplete);
          this.symbols = this.autoComplete.map(
            (item: { symbol: string }) => item.symbol
          );
          this.description = this.autoComplete.map(
            (item: { description: string }) => item.description
          );
          this.combinedArray = this.symbols.map((item, index) => ({
            symbol: item,
            description: this.description[index],
          }));
          console.log('Autocomplete FE1 symb', this.symbols);
          console.log('Autocomplete FE1 desc', this.description);
          this.notFound = false;
          this.spinner = false;
        } else {
          //this.notFound = true;
          //this.spinner = false;
        }
      },
      (err) => {
        console.log('FE1 Autocomplete');
        console.error(err);
        this.notFound = true;
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
  

  searchTicker(searchedTicker: string) {
    if (searchedTicker) {
      this.searchService.setCurrentTicker(searchedTicker);
      this.router.navigate(['/search', searchedTicker.trim()]);
      this.spinner = false;
      this.notFound = false;
    }
  }

  clearSearch() {
    this.searchedTicker = '';
    this.notFound = false;
    this.spinner = false;
  }
}
