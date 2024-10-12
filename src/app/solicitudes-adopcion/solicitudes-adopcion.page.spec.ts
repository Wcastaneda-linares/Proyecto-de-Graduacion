import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SolicitudesAdopcionPage } from './solicitudes-adopcion.page';

describe('SolicitudesAdopcionPage', () => {
  let component: SolicitudesAdopcionPage;
  let fixture: ComponentFixture<SolicitudesAdopcionPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SolicitudesAdopcionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
