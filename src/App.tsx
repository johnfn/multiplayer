import { ServerSentWebsocketMessage, GameState, PlayerId, MoveMessage } from "../server/types";
import React from 'react';

// async function test() {
//   const response = await fetch('/ping');
//   const myJson = await response.text();

//   console.log(JSON.stringify(myJson));
// }

class App extends React.Component<{}, {}> {
  canvas   : HTMLCanvasElement | null = null;
  gameState: GameState         | null = null;
  playerId : PlayerId          | null = null;

  componentDidMount() {
    const ws = new WebSocket('ws://localhost:8081');

    ws.onopen = () => {
      console.log('websocket is connected ...');
    };

    ws.onmessage = ev => {
      const data = JSON.parse(ev.data) as ServerSentWebsocketMessage;

      console.log(data);

      if (data.type === "connect") {
        this.gameState = data.state;
        this.playerId  = data.playerId;
      } else if (data.type === "state-update-message") {
        this.gameState = data.state;
      } else {

      }
    };

    window.requestAnimationFrame(this.gameLoop);

    window.addEventListener("keydown", ev => { 
      let dx = 0;
      let dy = 0;

      if (ev.key === "w") {
        dy = -1;
      }

      if (ev.key === "s") {
        dy = 1;
      }

      if (ev.key === "a") {
        dx = -1;
      }

      if (ev.key === "d") {
        dx = 1;
      }

      if (dx !== 0 || dy !== 0) {
        const moveMessage: MoveMessage = {
          type: "move-message",
          dx  : dx,
          dy  : dy,
        }

        ws.send(JSON.stringify(moveMessage));
      }
    });
  }

  gameLoop = () => {
    window.requestAnimationFrame(this.gameLoop);

    if (!this.canvas || !this.gameState) { return; }

    const context = this.canvas.getContext("2d")!;

    context.clearRect(0, 0, 500, 500);

    for (const rect of this.gameState.rectangles) {
      let blah = Number(rect.owner) * 1230985;

      context.fillStyle = "#" + String(blah);
      context.fillRect(rect.x, rect.y, 32, 32);
    }
  };

  render() {
    return (
      <div>
        <canvas 
          ref={ref => { if (ref) { this.canvas = ref; }}}
          width={500} 
          height={500} 
        >
        </canvas>
      </div>
    );
  }
}

export default App;
