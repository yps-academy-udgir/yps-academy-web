/**
 * Shared Material Module
 * Centralized location for all Angular Material imports
 * Makes it easy to add/remove Material components globally
 * Export all Material modules from here for use in standalone components
 */

import { NgModule } from '@angular/core';

// Material UI Components
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * Array of all Material modules to be exported
 * Makes it easy to manage and update
 */
const MATERIAL_MODULES = [
  MatTableModule,
  MatCardModule,
  MatButtonModule,
  MatInputModule,
  MatSelectModule,
  MatFormFieldModule,
  MatProgressSpinnerModule,
  MatIconModule,
  MatPaginatorModule,
  MatSortModule,
  MatToolbarModule,
  MatSnackBarModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatTabsModule,
  MatDialogModule,
  MatProgressBarModule,
  MatChipsModule,
  MatExpansionModule,
  MatCheckboxModule,
  MatRadioModule,
  MatTooltipModule,
];

@NgModule({
  exports: MATERIAL_MODULES,
})
export class SharedMaterialModule {}
