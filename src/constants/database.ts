export const ROOMS = {
  TABLE: 'rooms',
  ID: 'id',
  NAME: 'name',
  IS_BOOKABLE: 'is_bookable',
} as const;

export const ROOM_RESERVATIONS = {
  TABLE: 'room_reservations',
  ID: 'id',
  ROOM_ID: 'room_id',
  USER_ID: 'user_id',
  START_TIME: 'start_time',
  END_TIME: 'end_time',
} as const;

export const USER_PROFILES = {
  TABLE: 'user_profiles',
  ID: 'id',
  EMAIL: 'email',
} as const;
