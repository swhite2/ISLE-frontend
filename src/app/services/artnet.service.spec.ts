import { TestBed } from '@angular/core/testing';

import { ArtnetService } from './artnet.service';

describe('ArtnetService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ArtnetService = TestBed.get(ArtnetService);
    expect(service).toBeTruthy();
  });
});
