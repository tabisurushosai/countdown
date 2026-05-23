export interface Deadline {
  id: string;
  name: string;
  date: string;
  repeat?: 'none' | 'weekly' | 'monthly' | 'yearly';
}
