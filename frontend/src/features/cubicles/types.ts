/**
 * TypeScript types for the Cubicles module.
 */

export type CubicleStatus = 'available' | 'occupied' | 'maintenance';

export interface UserProfileBasic {
  id: string;
  full_name: string;
  email: string;
}

export interface CubicleReservation {
  id: string;
  cubicle_id: string;
  user_id: string;
  registered_by: string;
  start_time: string;
  end_time?: string;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Cubicle {
  id: string;
  code: string;
  name: string;
  capacity: number;
  status: CubicleStatus;
  active_reservation?: CubicleReservation;
  active_user?: UserProfileBasic;
}

export interface CubicleUsageHistory {
  id: string;
  cubicle_name: string;
  start_time: string;
  end_time?: string;
  status: string;
  notes?: string;
}
