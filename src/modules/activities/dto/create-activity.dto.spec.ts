import { plainToInstance } from 'class-transformer';
import { CreateActivityDto } from './create-activity.dto';

describe('CreateActivityDto', () => {
  it('should transform string dates to Date objects', () => {
    const plain = {
      tripId: 1,
      name: 'Test Activity',
      type: 'sightseeing',
      location: 'Paris',
      startTime: '2026-01-01T10:00:00.000Z',
      endTime: '2026-01-01T12:00:00.000Z',
    };

    const dto = plainToInstance(CreateActivityDto, plain);

    expect(dto).toBeInstanceOf(CreateActivityDto);
    expect(dto.startTime).toBeInstanceOf(Date);
    expect(dto.endTime).toBeInstanceOf(Date);
    expect(dto.startTime.toISOString()).toBe(plain.startTime);
    expect(dto.endTime.toISOString()).toBe(plain.endTime);
  });
});
