import { z } from 'zod';
import { AVAILABLE_ROOMS } from '../constants';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format');

export type GetRoomAvailabilityDto = {
  roomId: string;
  date: string;
};

export const getRoomAvailabilitySchema = z.object({
  roomId: z.enum(AVAILABLE_ROOMS).describe('Room name (e.g. "Big Mike", "Gran Enana", "Lakatán", "Dacca", "Cavendish", "Dominico")'),
  date: dateString.describe('Date in YYYY-MM-DD format'),
});

export type GetDayOverviewDto = {
  date: string;
};

export const getDayOverviewSchema = z.object({
  date: dateString.describe('Date in YYYY-MM-DD format'),
});
