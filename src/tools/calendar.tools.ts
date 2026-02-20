import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { BomaClient } from '../client';
import { getRoomAvailabilitySchema, getDayOverviewSchema } from '../dtos';

export function registerCalendarTools(server: McpServer, client: BomaClient): void {
  server.registerTool(
    'get_available_rooms',
    {
      description: 'Get the list of all available rooms/spaces that can be reserved',
      inputSchema: {},
    },
    async () => {
      const data = await client.getAvailableRooms();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_room_availability',
    {
      description: 'Get the schedule for a specific room on a given date, showing all booked time slots',
      inputSchema: getRoomAvailabilitySchema.shape,
    },
    async ({ roomId, date }) => {
      const data = await client.getRoomAvailability(roomId, date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_day_overview',
    {
      description: 'Get a complete overview of all rooms and their reservations for a given date. Shows every room with its booked slots',
      inputSchema: getDayOverviewSchema.shape,
    },
    async ({ date }) => {
      const data = await client.getDayOverview(date);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
