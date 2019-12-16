export type ClientSentWebsocketMessage = 
  | MoveMessage
  ;

export type ServerSentWebsocketMessage =
  | ConnectMessage
  | StateUpdateMesage
  ;

export type PlayerId = string;

export type ConnectMessage = {
  type    : "connect";

  playerId: PlayerId;
  state   : GameState;
};

export type StateUpdateMesage = {
  type : "state-update-message";

  state: GameState;
};

export type MoveMessage = {
  type : "move-message";

  dx   : number;
  dy   : number;
};

export type GameState = {
  playerIds: PlayerId[];

  rectangles: {
    x    : number;
    y    : number;
    owner: PlayerId;
  }[];
};