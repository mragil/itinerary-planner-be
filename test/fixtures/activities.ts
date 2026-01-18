import { Activity } from '../../src/modules/activities/activities.schema';

export const createActivity = (
  {
    id,
    name,
    notes,
    cost,
    type,
    startTime,
    endTime,
    location,
    isCompleted,
    tripId,
    createdAt,
    updatedAt,
    currency,
  }: Partial<Activity> = {},
  MOCK_DATE = new Date('2026-01-11T20:00:00.000Z'),
) => ({
  id: id ?? 1,
  name: name ?? 'Activity 1',
  notes: notes ?? 'Description 1',
  cost: cost ?? 10,
  type: type ?? 'Activity',
  startTime: startTime ?? new Date(),
  endTime: endTime ?? new Date(),
  location: location ?? 'Location 1',
  isCompleted: isCompleted ?? false,
  tripId: tripId ?? 1,
  createdAt: createdAt ?? MOCK_DATE,
  updatedAt: updatedAt ?? MOCK_DATE,
  currency: currency ?? 'IDR',
});
