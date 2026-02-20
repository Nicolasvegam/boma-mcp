import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  AVAILABLE_ROOMS,
  TIMEZONE,
  ROOMS,
  ROOM_RESERVATIONS,
  USER_PROFILES,
} from '../constants';
import { getDateRangeUTC, toUTCTimestamp } from '../utils';
import type { ReservationPayload, ReservationUpdate } from '../entities';

export class BomaClient {
  private supabase: SupabaseClient;
  private userId: string | null = null;
  private roomIdMap: Record<string, string> | null = null;

  constructor(
    private email: string,
    private password: string,
  ) {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  private async ensureAuthenticated(): Promise<void> {
    const { data: session } = await this.supabase.auth.getSession();

    if (session?.session) {
      this.userId = session.session.user.id;
      return;
    }

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: this.email,
      password: this.password,
    });

    if (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }

    this.userId = data.user.id;
  }

  private async ensureRoomMap(): Promise<Record<string, string>> {
    if (this.roomIdMap) return this.roomIdMap;

    const { data, error } = await this.supabase
      .from(ROOMS.TABLE)
      .select(`${ROOMS.ID},${ROOMS.NAME}`)
      .eq(ROOMS.IS_BOOKABLE, true);

    if (error) throw new Error(`Failed to fetch rooms: ${error.message}`);

    this.roomIdMap = {};
    for (const room of data) {
      this.roomIdMap[room.name] = room.id;
    }
    return this.roomIdMap;
  }

  private async resolveRoomId(roomName: string): Promise<string> {
    const map = await this.ensureRoomMap();
    return map[roomName] ?? roomName;
  }

  async getUserId(): Promise<string> {
    await this.ensureAuthenticated();
    return this.userId!;
  }

  async getReservations(date?: string): Promise<unknown> {
    await this.ensureAuthenticated();

    let query = this.supabase.from(ROOM_RESERVATIONS.TABLE).select('*');

    if (date) {
      const { start, end } = getDateRangeUTC(date);
      query = query.gte(ROOM_RESERVATIONS.START_TIME, start).lte(ROOM_RESERVATIONS.START_TIME, end);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get reservations: ${error.message}`);
    return data;
  }

  async getReservationsByRoom(roomName: string, date?: string): Promise<unknown> {
    await this.ensureAuthenticated();

    const roomUuid = await this.resolveRoomId(roomName);
    let query = this.supabase
      .from(ROOM_RESERVATIONS.TABLE)
      .select('*')
      .eq(ROOM_RESERVATIONS.ROOM_ID, roomUuid);

    if (date) {
      const { start, end } = getDateRangeUTC(date);
      query = query.gte(ROOM_RESERVATIONS.START_TIME, start).lte(ROOM_RESERVATIONS.START_TIME, end);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get reservations for room: ${error.message}`);
    return data;
  }

  async getReservationsByUser(userId?: string): Promise<unknown> {
    await this.ensureAuthenticated();

    const resolvedUserId = userId ?? this.userId!;

    const { data, error } = await this.supabase
      .from(ROOM_RESERVATIONS.TABLE)
      .select('*')
      .eq(ROOM_RESERVATIONS.USER_ID, resolvedUserId);

    if (error) throw new Error(`Failed to get user reservations: ${error.message}`);
    return data;
  }

  async getReservation(reservationId: string): Promise<unknown> {
    await this.ensureAuthenticated();

    const { data, error } = await this.supabase
      .from(ROOM_RESERVATIONS.TABLE)
      .select('*')
      .eq(ROOM_RESERVATIONS.ID, reservationId)
      .single();

    if (error) throw new Error(`Failed to get reservation: ${error.message}`);
    return data;
  }

  async createReservation(payload: ReservationPayload): Promise<unknown> {
    await this.ensureAuthenticated();

    const roomUuid = await this.resolveRoomId(payload.room_id);
    const startUTC = toUTCTimestamp(payload.date, payload.start_time);
    const endUTC = toUTCTimestamp(payload.date, payload.end_time);

    const { data: conflicts, error: conflictError } = await this.supabase
      .from(ROOM_RESERVATIONS.TABLE)
      .select('*')
      .eq(ROOM_RESERVATIONS.ROOM_ID, roomUuid)
      .lt(ROOM_RESERVATIONS.START_TIME, endUTC)
      .gt(ROOM_RESERVATIONS.END_TIME, startUTC);

    if (conflictError) throw new Error(`Failed to check conflicts: ${conflictError.message}`);
    if (conflicts && conflicts.length > 0) {
      throw new Error('Time slot conflicts with an existing reservation');
    }

    const { data, error } = await this.supabase
      .from(ROOM_RESERVATIONS.TABLE)
      .insert({
        room_id: roomUuid,
        user_id: payload.user_id,
        start_time: startUTC,
        end_time: endUTC,
      })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create reservation: ${error.message}`);
    return data;
  }

  async updateReservation(reservationId: string, updates: ReservationUpdate): Promise<unknown> {
    await this.ensureAuthenticated();

    const dbUpdates: Record<string, string> = {};

    if (updates.room_id) {
      dbUpdates.room_id = await this.resolveRoomId(updates.room_id);
    }

    if (updates.start_time || updates.end_time || updates.date) {
      let date = updates.date;

      if (!date) {
        const current = (await this.getReservation(reservationId)) as { start_time: string };
        date = new Date(current.start_time).toLocaleDateString('sv-SE', { timeZone: TIMEZONE });
      }

      if (updates.start_time) {
        dbUpdates.start_time = toUTCTimestamp(date, updates.start_time);
      }
      if (updates.end_time) {
        dbUpdates.end_time = toUTCTimestamp(date, updates.end_time);
      }
    }

    const { data, error } = await this.supabase
      .from(ROOM_RESERVATIONS.TABLE)
      .update(dbUpdates)
      .eq(ROOM_RESERVATIONS.ID, reservationId)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to update reservation: ${error.message}`);
    return data;
  }

  async deleteReservation(reservationId: string): Promise<unknown> {
    await this.ensureAuthenticated();

    const { data, error } = await this.supabase
      .from(ROOM_RESERVATIONS.TABLE)
      .delete()
      .eq(ROOM_RESERVATIONS.ID, reservationId)
      .eq(ROOM_RESERVATIONS.USER_ID, this.userId!)
      .select('*');

    if (error) throw new Error(`Failed to delete reservation: ${error.message}`);
    return data;
  }

  async getUserProfile(userId?: string): Promise<unknown> {
    await this.ensureAuthenticated();

    const resolvedUserId = userId ?? this.userId!;

    const { data, error } = await this.supabase
      .from(USER_PROFILES.TABLE)
      .select('*')
      .eq(USER_PROFILES.ID, resolvedUserId)
      .single();

    if (error) throw new Error(`Failed to get user profile: ${error.message}`);
    return data;
  }

  async getUserProfiles(userIds: string[]): Promise<unknown> {
    await this.ensureAuthenticated();

    const { data, error } = await this.supabase
      .from(USER_PROFILES.TABLE)
      .select(`${USER_PROFILES.ID},${USER_PROFILES.EMAIL}`)
      .in(USER_PROFILES.ID, userIds);

    if (error) throw new Error(`Failed to get user profiles: ${error.message}`);
    return data;
  }

  async searchUserByEmail(email: string): Promise<unknown> {
    await this.ensureAuthenticated();

    const { data, error } = await this.supabase
      .from(USER_PROFILES.TABLE)
      .select('*')
      .ilike(USER_PROFILES.EMAIL, `%${email}%`);

    if (error) throw new Error(`Failed to search user: ${error.message}`);
    return data;
  }

  async getAvailableRooms(): Promise<unknown> {
    return AVAILABLE_ROOMS;
  }

  async getRoomAvailability(roomName: string, date: string): Promise<unknown> {
    await this.ensureAuthenticated();

    const roomUuid = await this.resolveRoomId(roomName);
    const { start, end } = getDateRangeUTC(date);

    const { data, error } = await this.supabase
      .from(ROOM_RESERVATIONS.TABLE)
      .select(`${ROOM_RESERVATIONS.START_TIME},${ROOM_RESERVATIONS.END_TIME},${ROOM_RESERVATIONS.USER_ID}`)
      .eq(ROOM_RESERVATIONS.ROOM_ID, roomUuid)
      .gte(ROOM_RESERVATIONS.START_TIME, start)
      .lte(ROOM_RESERVATIONS.START_TIME, end)
      .order(ROOM_RESERVATIONS.START_TIME, { ascending: true });

    if (error) throw new Error(`Failed to get room availability: ${error.message}`);

    return {
      room_id: roomName,
      date,
      reservations: data,
    };
  }

  async getDayOverview(date: string): Promise<unknown> {
    await this.ensureAuthenticated();

    const roomMap = await this.ensureRoomMap();
    const { start, end } = getDateRangeUTC(date);

    const roomNames = Object.keys(roomMap);

    const results = await Promise.all(
      roomNames.map(async (room) => {
        const roomUuid = roomMap[room];
        const { data, error } = await this.supabase
          .from(ROOM_RESERVATIONS.TABLE)
          .select(`${ROOM_RESERVATIONS.ID},${ROOM_RESERVATIONS.START_TIME},${ROOM_RESERVATIONS.END_TIME},${ROOM_RESERVATIONS.USER_ID}`)
          .eq(ROOM_RESERVATIONS.ROOM_ID, roomUuid)
          .gte(ROOM_RESERVATIONS.START_TIME, start)
          .lte(ROOM_RESERVATIONS.START_TIME, end)
          .order(ROOM_RESERVATIONS.START_TIME, { ascending: true });

        return {
          room,
          reservations: error ? [] : data,
        };
      }),
    );

    return { date, rooms: results };
  }
}
