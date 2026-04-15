import { Component, OnInit, ChangeDetectionStrategy, input, output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { SharedMaterialModule } from '../../shared-material.module';
import { FilterState } from '../../models/student.model';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TitleCasePipe, SharedMaterialModule],
  templateUrl: './filter-bar.component.html',
})
export class FilterBarComponent implements OnInit {
  classOptions  = input<SelectOption[]>([]);
  yearOptions   = input<SelectOption[]>([]);
  statusOptions = input<SelectOption[]>([]);
  filterChange  = output<FilterState>();

  search         = signal<string>('');
  selectedClass  = signal<string>('');
  selectedYear   = signal<string>('');
  selectedStatus = signal<string>('');

  constructor() {
    effect(() => {
      this.filterChange.emit({
        search:         this.search(),
        selectedClass:  this.selectedClass(),
        selectedYear:   this.selectedYear(),
        selectedStatus: this.selectedStatus(),
      });
    });
  }

  ngOnInit(): void {}

  clear(): void {
    this.search.set('');
    this.selectedClass.set('');
    this.selectedYear.set('');
    this.selectedStatus.set('');
  }

  clearClass():  void { this.selectedClass.set(''); }
  clearYear():   void { this.selectedYear.set(''); }
  clearSearch(): void { this.search.set(''); }
  clearStatus(): void { this.selectedStatus.set(''); }

  get hasActiveFilters(): boolean {
    return !!this.search() || !!this.selectedClass() || !!this.selectedYear() || !!this.selectedStatus();
  }
}

