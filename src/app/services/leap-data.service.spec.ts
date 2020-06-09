import { TestBed } from '@angular/core/testing';

import { LeapDataService } from './leap-data.service';

describe('LeapDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LeapDataService = TestBed.get(LeapDataService);
    expect(service).toBeTruthy();
  });
});
