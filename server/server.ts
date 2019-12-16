import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import bodyParser from 'body-parser';
import path from 'path';
import { GameState, ConnectMessage, PlayerId, StateUpdateMesage, ClientSentWebsocketMessage } from './types';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, port: 8081 });

let state: GameState = {
  playerIds : [],
  rectangles: [],
};

let id = 0;
const getUniqueId = () => {
  return String(++id);
};

const idsToWebsockets = new Map<PlayerId, WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  const newPlayerId = getUniqueId();

  idsToWebsockets.set(newPlayerId, ws);

  ws.on("close", () => { 
    idsToWebsockets.delete(newPlayerId);

    state.playerIds = state.playerIds.filter(id => id !== newPlayerId);
    state.rectangles = state.rectangles.filter(rect => rect.owner !== newPlayerId);
  });

  ws.on("message", (message: string) => {
    const data = JSON.parse(message) as ClientSentWebsocketMessage;

    if (data.type === "move-message") {
      const rect = state.rectangles.filter(r => r.owner === newPlayerId)[0];

      rect.x += data.dx;
      rect.y += data.dy;
    }
  });

  state.playerIds.push(newPlayerId);
  state.rectangles.push({
    x    : Math.random() * 450,
    y    : Math.random() * 450,
    owner: newPlayerId
  });

  const connectMessage: ConnectMessage = {
    type    : "connect",
    playerId: getUniqueId(),
    state   : state,
  };

  ws.send(JSON.stringify(connectMessage));
});

const tick = () => {
  for (const playerId of idsToWebsockets.keys()) {
    const ws = idsToWebsockets.get(playerId)!;

    const stateUpdateMessage: StateUpdateMesage = {
      type : "state-update-message",
      state: state,
    };

    ws.send(JSON.stringify(stateUpdateMessage));
  }
};

setInterval(tick, 50);

app.use(express.static(path.join(__dirname, '..', 'build')));

// app.get('/ping', (_req, res) => {
//  return res.send('pong');
// });

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 8080;

app.listen(port);

console.log(`Listening on http://localhost:${ port }`);
