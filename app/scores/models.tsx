export interface Team {
  id: number;
  slug: string;
  matches: number;
  display_name: string;
  wins: number;
  draws: number;
  losses: number;
  score: number;
  mu: number;
  sigma: number;
  num_fatals: number;
}

export interface WinsLosses {
  // id: number;
  // game_uuid: number;
  team: string;
  opponent: string;
  wins: number;
  losses: number;
  draws: number;
}

export interface Match {
  id: number;
  game_uuid: string;
  outcome: 0 | 1 | 2;
  had_fatal_error: boolean;
  team_color: 1 | 2;
  team: string;
  opponent: string;
}

export type OutputMode = 'Replay' | 'GameOutput' | 'BlueOutput' | 'RedOutput';

export interface GameParticipantOutput {
  team: string;
  color: number;
  stdout: string;
  stderr: string;
}

export interface GameOutput {
  game_stdout: string;
  game_stderr: string;
  participants: GameParticipantOutput[];
}
