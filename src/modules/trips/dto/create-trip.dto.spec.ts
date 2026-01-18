import { plainToInstance } from 'class-transformer';
import { CreateTripDto } from './create-trip.dto';

describe('CreateTripDto', () => {
  it('should transform string dates to Date objects', () => {
    const plain = {
      name: 'Test Trip',
      destination: 'Paris',
      startDate: '2026-01-01T10:00:00.000Z',
      endDate: '2026-01-10T10:00:00.000Z',
    };

    const dto = plainToInstance(CreateTripDto, plain);

    expect(dto).toBeInstanceOf(CreateTripDto);
    expect(dto.startDate).toBeInstanceOf(Date);
    expect(dto.endDate).toBeInstanceOf(Date);
    expect(dto.startDate.toISOString()).toBe(plain.startDate);
    expect(dto.endDate.toISOString()).toBe(plain.endDate);
  });
});
