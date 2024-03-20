import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageViewerModalPage } from './image-viewer-modal.page';

describe('ImageViewerModalPage', () => {
  let component: ImageViewerModalPage;
  let fixture: ComponentFixture<ImageViewerModalPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ImageViewerModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
