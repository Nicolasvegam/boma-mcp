import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { BomaClient } from '../client';
import { getUserProfileSchema, getUserProfilesSchema, searchUserSchema } from '../dtos';

export function registerUserTools(server: McpServer, client: BomaClient): void {
  server.registerTool(
    'get_user_profile',
    {
      description: 'Get a user profile by ID. Defaults to the authenticated user',
      inputSchema: getUserProfileSchema.shape,
    },
    async ({ userId }) => {
      const data = await client.getUserProfile(userId);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'get_user_profiles',
    {
      description: 'Get multiple user profiles by their IDs. Useful for resolving emails from reservation user_ids',
      inputSchema: getUserProfilesSchema.shape,
    },
    async ({ userIds }) => {
      const data = await client.getUserProfiles(userIds);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'search_user',
    {
      description: 'Search for a user by email or partial email',
      inputSchema: searchUserSchema.shape,
    },
    async ({ email }) => {
      const data = await client.searchUserByEmail(email);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );
}
