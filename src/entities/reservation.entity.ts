export type ReservationPayload = {
  room_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  date: string;
};

export type ReservationUpdate = {
  room_id?: string;
  start_time?: string;
  end_time?: string;
  date?: string;
};
