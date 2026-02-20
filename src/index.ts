import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { BomaClient } from './client';
import { registerReservationTools, registerUserTools, registerCalendarTools } from './tools';

const BOMA_USER_EMAIL = process.env.BOMA_USER_EMAIL;
const BOMA_USER_PASSWORD = process.env.BOMA_USER_PASSWORD;

if (!BOMA_USER_EMAIL || !BOMA_USER_PASSWORD) {
  console.error(
    'Error: BOMA_USER_EMAIL and BOMA_USER_PASSWORD environment variables are required.\n' +
      'Set them when adding this MCP server:\n' +
      '  claude mcp add boma -e BOMA_USER_EMAIL=you@email.com -e BOMA_USER_PASSWORD=yourpass -- node /path/to/boma-mcp/build/index.js',
  );
  process.exit(1);
}

const server = new McpServer({
  name: 'boma-mcp',
  version: '1.0.0',
});

const client = new BomaClient(BOMA_USER_EMAIL, BOMA_USER_PASSWORD);

registerReservationTools(server, client);
registerUserTools(server, client);
registerCalendarTools(server, client);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('BOMA MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error starting server:', error);
  process.exit(1);
});
