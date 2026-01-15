import { Trip } from '../../src/modules/trip/trip.schema';

export const createTrip = (
  {
    id,
    name,
    destination,
    startDate,
    endDate,
    isCompleted,
    userId,
    createdAt,
    updatedAt,
  }: Partial<Trip>,
  MOCK_DATE = new Date('2026-01-11T20:00:00.000Z'),
) => {
  return {
    id: id ?? 1,
    name: name ?? 'Sample Trip',
    destination: destination ?? 'Sample Destination',
    startDate: startDate ?? new Date('2026-02-01T00:00:00.000Z'),
    endDate: endDate ?? new Date('2026-02-10T00:00:00.000Z'),
    isCompleted: isCompleted ?? false,
    userId: userId ?? 1,
    createdAt: createdAt ?? MOCK_DATE,
    updatedAt: updatedAt ?? createdAt ?? MOCK_DATE,
  };
};
