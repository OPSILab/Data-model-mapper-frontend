import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DMMComponent } from "./dmm.component";

describe('DMMComponent', () => {
  let component: DMMComponent;
  let fixture: ComponentFixture<DMMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DMMComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DMMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //inputElement().click();
//inputElement().value = typedValue;
});
