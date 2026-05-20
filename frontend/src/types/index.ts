export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_admin: boolean;
  access_token: string;
}

export interface UserProfile {
  id: string;
  full_name?: string;
  phone?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Child {
  id: string;
  parent_id: string;
  full_name: string;
  birth_date: string;
  gender?: "pojke" | "flicka" | "annat";
  medical_notes?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation?: string;
  created_at: string;
  updated_at: string;
}

export interface Sport {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface SportWeek {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  image_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  sport_week_id: string;
  sport_id: string;
  title: string;
  description?: string;
  session_date: string;
  start_time: string;
  end_time: string;
  location?: string;
  min_age: number;
  max_age: number;
  max_capacity: number;
  current_bookings: number;
  is_active: boolean;
  spots_remaining: number;
  sport?: Sport;
  sport_week?: SportWeek;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  session_id: string;
  child_id: string;
  parent_id: string;
  status: "confirmed" | "cancelled" | "waitlist";
  notes?: string;
  booked_at: string;
  cancelled_at?: string;
  session?: Session;
  child?: Child;
}
