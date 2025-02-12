import type { Tuple4 } from "./typeutils";

export type Pos = [number, number];

export type RootMsg =
  | {
      __action__: "observe";
      __data__: ObserveGameState;
    }
  | {
      __action__: "SPEAK";
      __data__: string;
    }
  | {
      __action__: "CLEAR";
      __data__: null;
    }
  | {
      __action__: "INIT";
      __data__: null;
    };

export interface ObserveGameState {
  game_uuid: string;
  walls: Pos[];
  shape: Pos;
  food: Pos[];
  food_age: [Pos, number][];
  turn: number;
  round: number;
  gameover: boolean;
  whowins?: any;
  bots: Tuple4<Pos>;
  score: [number, number];
  fatal_errors: any[][];
  errors: null[];
  max_rounds: number;
  timeout: number;
  noise_radius: number;
  sight_distance: number;
  max_food_age: number;
  shadow_distance: number;
  layout_name: string;
  team_names: [string, string];
  team_infos: null[];
  team_time: [number, number];
  deaths: Tuple4<number>;
  kills: Tuple4<number>;
  bot_was_killed: boolean[];
  noisy_positions: (number[] | null)[];
  requested_moves: RequestedMove[];
  say: Tuple4<string>;
  timeout_length: number;
  error_limit: number;
  num_errors: [number, number];
}

export type ObserveGameStateL = ObserveGameState[];

export interface RequestedMove {
  previous_position: number[];
  requested_position: number[];
  success: boolean;
}

export interface GameStats {
  score: [number, number];
  num_errors: [number, number];
  kills: [number, number, number, number];
  deaths: [number, number, number, number];
  team_time: [number, number];
}

export interface GameState {
  game_uuid: string;
  shape: [number, number];
  walls: [number, number][];
  food: [number, number][];
  bots: Tuple4<[number, number]>;
  team_names: [string, string];
  game_stats: GameStats;
  whowins: number;
  gameover: boolean;
  say: Tuple4<string>;
  round: number;
  max_rounds: number;
  turn: number;
}

export function conv_game_state(gs: ObserveGameState): GameState {
  // const bot_directions = gs.bots.map((pos, idx) => {
  //
  // });

  return {
    game_uuid: gs.game_uuid,
    shape: gs.shape,
    walls: gs.walls,
    food: gs.food,
    bots: gs.bots,
    // "bot_directions": bot_directions,
    say: gs.say,
    turn: gs.turn,
    round: gs.round,
    max_rounds: gs.max_rounds,
    team_names: gs.team_names,
    game_stats: {
      score: gs.score,
      num_errors: gs.num_errors,
      kills: gs.kills,
      deaths: gs.deaths,
      team_time: gs.team_time,
    },
    whowins: gs.whowins,
    gameover: gs.gameover,
  };
}
