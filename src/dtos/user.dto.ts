import { z } from 'zod';

export type GetUserProfileDto = {
  userId?: string;
};

export const getUserProfileSchema = z.object({
  userId: z.string().uuid().optional().describe('User UUID. Defaults to the authenticated user if not provided'),
});

export type GetUserProfilesDto = {
  userIds: string[];
};

export const getUserProfilesSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).describe('Array of user UUIDs to look up'),
});

export type SearchUserDto = {
  email: string;
};

export const searchUserSchema = z.object({
  email: z.string().describe('Email or partial email to search for'),
});
