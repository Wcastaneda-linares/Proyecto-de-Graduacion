import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InformacionModalPage } from './informacion-modal.page';

describe('InformacionModalPage', () => {
  let component: InformacionModalPage;
  let fixture: ComponentFixture<InformacionModalPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(InformacionModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
