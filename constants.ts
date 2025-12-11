import { Challenge } from './types';

export const PIXEL_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEEAD', // Yellow
  '#D4A5A5', // Pink
  '#9B59B6', // Purple
  '#E67E22', // Orange
];

export const DEFAULT_CHALLENGES: Challenge[] = [
  { id: '1', text: 'ดื่ม 1 ช็อต', color: PIXEL_COLORS[0], emoji: '🍺' },
  { id: '2', text: 'คนซ้ายดื่ม', color: PIXEL_COLORS[1], emoji: '👈' },
  { id: '3', text: 'คนขวาดื่ม', color: PIXEL_COLORS[2], emoji: '👉' },
  { id: '4', text: 'พัก 1 ตา', color: PIXEL_COLORS[3], emoji: '🛡️' },
  { id: '5', text: 'หมดแก้ว!', color: PIXEL_COLORS[4], emoji: '😈' },
  { id: '6', text: 'เลือกคนดื่ม', color: PIXEL_COLORS[5], emoji: '👆' },
  { id: '7', text: 'ดื่มพร้อมคนข้างๆ', color: PIXEL_COLORS[6], emoji: '🍻' },
  { id: '8', text: 'เล่าเรื่องน่าอาย', color: PIXEL_COLORS[7], emoji: '😳' },
];

export const SPIN_DURATION_MS = 4000;
