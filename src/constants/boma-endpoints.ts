export const SUPABASE_URL = 'https://fioifqddyvrmezcytzzt.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpb2lmcWRkeXZybWV6Y3l0enp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTg5NDMsImV4cCI6MjA2NTIzNDk0M30.qh4BYbpQBIuCpWhx2XF7-jFFAjUMJGMVDi5oUZepEJk';

export const AVAILABLE_ROOMS = [
  'Big Mike',
  'Gran Enana',
  'Lakatán',
  'Dacca',
  'Cavendish',
  'Dominico',
] as const;

export type RoomName = (typeof AVAILABLE_ROOMS)[number];
