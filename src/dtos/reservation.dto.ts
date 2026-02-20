import { z } from 'zod';
import { AVAILABLE_ROOMS } from '../constants';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format');
const timeString = z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format');

export type GetReservationsDto = {
  date?: string;
};

export const getReservationsSchema = z.object({
  date: dateString.optional().describe('Date in YYYY-MM-DD format. If not provided, returns all reservations'),
});

export type GetReservationsByRoomDto = {
  roomId: string;
  date?: string;
};

export const getReservationsByRoomSchema = z.object({
  roomId: z.enum(AVAILABLE_ROOMS).describe('Room name (e.g. "Big Mike", "Gran Enana", "Lakatán", "Dacca", "Cavendish", "Dominico")'),
  date: dateString.optional().describe('Date in YYYY-MM-DD format. If not provided, returns all reservations for the room'),
});

export type GetReservationsByUserDto = {
  userId?: string;
};

export const getReservationsByUserSchema = z.object({
  userId: z.string().uuid().optional().describe('User UUID. Defaults to the authenticated user if not provided'),
});

export type GetReservationDto = {
  reservationId: string;
};

export const getReservationSchema = z.object({
  reservationId: z.string().uuid().describe('The UUID of the reservation'),
});

export type CreateReservationDto = {
  roomId: string;
  startTime: string;
  endTime: string;
  date: string;
};

export const createReservationSchema = z.object({
  roomId: z.enum(AVAILABLE_ROOMS).describe('Room name (e.g. "Big Mike", "Gran Enana", "Lakatán", "Dacca", "Cavendish", "Dominico")'),
  startTime: timeString.describe('Start time in HH:MM format (e.g. "14:00")'),
  endTime: timeString.describe('End time in HH:MM format (e.g. "14:30"). Must be after start time'),
  date: dateString.describe('Date in YYYY-MM-DD format'),
});

export type UpdateReservationDto = {
  reservationId: string;
  roomId?: string;
  startTime?: string;
  endTime?: string;
  date?: string;
};

export const updateReservationSchema = z.object({
  reservationId: z.string().uuid().describe('The UUID of the reservation to update'),
  roomId: z.enum(AVAILABLE_ROOMS).optional().describe('New room name'),
  startTime: timeString.optional().describe('New start time in HH:MM format'),
  endTime: timeString.optional().describe('New end time in HH:MM format'),
  date: dateString.optional().describe('New date in YYYY-MM-DD format'),
});

export type DeleteReservationDto = {
  reservationId: string;
};

export const deleteReservationSchema = z.object({
  reservationId: z.string().uuid().describe('The UUID of the reservation to delete. Only the owner can delete their reservations'),
});
