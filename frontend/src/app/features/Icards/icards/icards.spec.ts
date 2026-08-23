import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Icards } from './icards';

describe('Icards', () => {
  let component: Icards;
  let fixture: ComponentFixture<Icards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Icards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Icards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
