import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { BomaClient } from '../client';
import {
  getReservationsSchema,
  getReservationsByRoomSchema,
  getReservationsByUserSchema,
  getReservationSchema,
  createReservationSchema,
  updateReservationSchema,
  deleteReservationSchema,
} from '../dtos';

export function registerReservationTools(server: McpServer, client: BomaClient): void {
  server.registerTool(
    'get_reservations',
    {
      description: 'Get all room reservations, optionally filtered by date',
      inputSchema: getReservationsSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getReservations(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_reservations_by_room',
    {
      description: 'Get all reservations for a specific room, optionally filtered by date',
      inputSchema: getReservationsByRoomSchema.shape,
    },
    async ({ roomId, date }) => {
      const data = await client.getReservationsByRoom(roomId, date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_reservations_by_user',
    {
      description: 'Get all reservations for a specific user. Defaults to the authenticated user',
      inputSchema: getReservationsByUserSchema.shape,
    },
    async ({ userId }) => {
      const data = await client.getReservationsByUser(userId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_reservation',
    {
      description: 'Get a single reservation by its ID',
      inputSchema: getReservationSchema.shape,
    },
    async ({ reservationId }) => {
      const data = await client.getReservation(reservationId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'create_reservation',
    {
      description:
        'Create a new room reservation. Available rooms: Big Mike, Gran Enana, Lakatán, Dacca, Cavendish, Dominico. Time slots are in 30-minute intervals',
      inputSchema: createReservationSchema.shape,
    },
    async ({ roomId, startTime, endTime, date }) => {
      const userId = await client.getUserId();
      const data = await client.createReservation({
        room_id: roomId,
        user_id: userId,
        start_time: startTime,
        end_time: endTime,
        date,
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'update_reservation',
    {
      description: 'Update an existing reservation. You can change the room, time, or date',
      inputSchema: updateReservationSchema.shape,
    },
    async ({ reservationId, roomId, startTime, endTime, date }) => {
      const updates: Record<string, string> = {};
      if (roomId) updates.room_id = roomId;
      if (startTime) updates.start_time = startTime;
      if (endTime) updates.end_time = endTime;
      if (date) updates.date = date;

      const data = await client.updateReservation(reservationId, updates);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'delete_reservation',
    {
      description: 'Delete a reservation. Only the owner of the reservation can delete it',
      inputSchema: deleteReservationSchema.shape,
    },
    async ({ reservationId }) => {
      const data = await client.deleteReservation(reservationId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data ?? 'Reservation deleted', null, 2) }],
      };
    },
  );
}
