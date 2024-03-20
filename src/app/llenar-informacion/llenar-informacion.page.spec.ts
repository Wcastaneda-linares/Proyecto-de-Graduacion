import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LlenarInformacionPage } from './llenar-informacion.page';

describe('LlenarInformacionPage', () => {
  let component: LlenarInformacionPage;
  let fixture: ComponentFixture<LlenarInformacionPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LlenarInformacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
