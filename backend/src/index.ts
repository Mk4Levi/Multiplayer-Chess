import app from './app';
import { handleWebSocketUpgrade } from './websockets/webSocketHandler';

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});

server.on('upgrade', (request: Request, socket, head) => {
  handleWebSocketUpgrade(request, socket, head);
});
