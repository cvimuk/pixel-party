export interface Challenge {
  id: string;
  text: string;
  color: string;
  emoji: string;
}

export enum GameState {
  SETUP = 'SETUP',
  IDLE = 'IDLE',
  SPINNING = 'SPINNING',
  SHOW_RESULT = 'SHOW_RESULT',
}

export type AppMode = 'WHEEL' | 'BOTTLE';

export type BottleType = 'BROWN' | 'GREEN';
export type BottleGameMode = 'CLASSIC' | 'DARE';

export interface GenerationConfig {
  intensity: 'fun' | 'spicy' | 'hardcore';
}

export interface GameSettings {
  mode: 'manual' | 'auto';
  players: string[];
  theme?: string;
}