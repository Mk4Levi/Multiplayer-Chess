import { redisClient, publisher, subscriber } from '../../config/redis';
import {
  addUserConnection,
  deleteUserConnection,
  getUserConnection,
} from '../../store/user';
import { GameModel } from '../models/gameModel';
import { UserModel } from '../models/userModel';

function getGameIdFromChannel(channel: string): string | null {
  const match = channel.match(/^games:(.*)$/);
  return match ? match[1] : null;
}

async function onMessage(message: string, channel: string) {
  const parsedPayload = JSON.parse(message);
  const gameId = getGameIdFromChannel(channel);

  if (parsedPayload.method === 'opponentLeft') {
    const remainingPlayerConnection = getUserConnection(
      parsedPayload.remainingPlayerUserId
    );

    if (remainingPlayerConnection === undefined) return;

    const opponentLeftPayload = {
      method: 'opponentLeft',
    };

    remainingPlayerConnection.send(JSON.stringify(opponentLeftPayload));
  }
  if (parsedPayload.method === 'makeMove') {
    const connection = getUserConnection(parsedPayload.to);

    if (!connection) return;
    return connection.send(
      JSON.stringify({
        method: 'opponentMove',
        move: parsedPayload.move,
        whoseTurn: parsedPayload.to,
      })
    );
  }

  if (parsedPayload.method === 'deleteUserConnection') {
    deleteUserConnection(parsedPayload.userId);
    subscriber.unsubscribe(`games:${gameId}`);
  }

  const players = await redisClient.sMembers(`games:${gameId}:users`);

  players.forEach((player) => {
    const connection = getUserConnection(player);
    if (connection) {
      connection.send(message);
    }
  });
}

export async function handleJoinGame(
  socket: any,
  userId: string,
  payload: { method: string; data: { gameId: string } }
) {
  const isGameAvailable = await redisClient.hGet(
    `games:${payload.data.gameId}`,
    'status'
  );

  if (!isGameAvailable) {
    return socket.send(
      JSON.stringify({
        method: 'joinGameResponse',
        status: 'failure',
        data: {
          message: 'game not present',
        },
      })
    );
  }

  const onGoingGameOfPlayer = await redisClient.hGet('userGames', userId);

  if (
    onGoingGameOfPlayer !== null &&
    onGoingGameOfPlayer !== payload.data.gameId
  ) {
    return socket.send(
      JSON.stringify({
        method: 'joinGameResponse',
        status: 'failure',
        data: {
          message: 'Player is already present in other game',
        },
      })
    );
  }

  const noOfPlayersJoinedAlready = await redisClient.sCard(
    `games:${payload.data.gameId}:users`
  );

  const gameState = await redisClient.hGet(
    `games:${payload.data.gameId}`,
    'state'
  );
  const whoseTurn = await redisClient.hGet(
    `games:${payload.data.gameId}`,
    'whoseTurn'
  );

  if (noOfPlayersJoinedAlready === 2) {
    const currentUserGame = await redisClient.hGet('userGames', userId);

    if (currentUserGame !== payload.data.gameId) {
      return socket.send(
        JSON.stringify({
          method: 'joinGameResponse',
          status: 'failure',
          data: {
            message: 'No player slot available',
          },
        })
      );
    }
    const ttl = await redisClient.TTL(`leftTheGame:${userId}`);
    if (ttl >= 0 && ttl < 5) {
      return socket.send(
        JSON.stringify({
          method: 'gameClosed',
        })
      );
    } else if (ttl >= 5) {
      await redisClient.DEL(`leftTheGame:${userId}`);
    }

    subscriber.subscribe(`games:${payload.data.gameId}`, onMessage);

    addUserConnection(userId, socket);

    const userWithWhiteColor = await redisClient.hGet(
      `games:${payload.data.gameId}`,
      'white'
    );

    return socket.send(
      JSON.stringify({
        method: 'joinGameResponse',
        status: 'success',
        data: {
          userId,
          gameStatus: 'gameStarted',
          gameState: gameState,
          whoseTurn: whoseTurn,
          orientation: userWithWhiteColor === userId ? 'white' : 'black',
        },
      })
    );
  }

  const ttl = await redisClient.TTL(`leftTheGame:${userId}`);
  if (ttl >= 0 && ttl < 5) {
    return socket.send(
      JSON.stringify({
        method: 'gameClosed',
      })
    );
  } else if (ttl >= 5) {
    await redisClient.DEL(`leftTheGame:${userId}`);
  }

  await redisClient.sAdd(`games:${payload.data.gameId}:users`, userId);
  await redisClient.hSet('userGames', userId, payload.data.gameId);
  subscriber.subscribe(`games:${payload.data.gameId}`, onMessage);

  addUserConnection(userId, socket);

  const players = await redisClient.sMembers(
    `games:${payload.data.gameId}:users`
  );

  if (players.length == 2) {
    await redisClient.hSet(`games:${payload.data.gameId}`, 'black', userId);

    socket.send(
      JSON.stringify({
        method: 'joinGameResponse',
        status: 'success',
        data: {
          userId,
          gameStatus: 'waitingForOpponent',
          gameState: gameState,
          orientation: 'black',
        },
      })
    );

    await publisher.publish(
      `games:${payload.data.gameId}`,
      JSON.stringify({
        method: 'gameStarted',
        status: 'success',
        data: {
          gameStatus: 'gameStarted',
          gameState: gameState,
          whoseTurn: whoseTurn,
        },
      })
    );
    return;
  }

  await redisClient.hSet(`games:${payload.data.gameId}`, 'white', userId);

  await redisClient.hSet(`games:${payload.data.gameId}`, 'whoseTurn', userId);

  return socket.send(
    JSON.stringify({
      method: 'joinGameResponse',
      status: 'success',
      data: {
        userId,
        gameStatus: 'waitingForOpponent',
        gameState: gameState,
      },
    })
  );
}

export async function handleMakeMove(
  socket: any,
  userId: string,
  payload: {
    method: string;
    data: { gameId: string; move: { after: string; before: string } };
  }
) {
  await redisClient.hSet(
    `games:${payload.data.gameId}`,
    'state',
    payload.data.move.after
  );

  const players = await redisClient.sMembers(
    `games:${payload.data.gameId}:users`
  );

  const whoseTurn = players[0] === userId ? players[1] : players[0];

  await redisClient.hSet(
    `games:${payload.data.gameId}`,
    'whoseTurn',
    whoseTurn
  );
  await publisher.publish(
    `games:${payload.data.gameId}`,
    JSON.stringify({
      method: 'makeMove',
      from: userId,
      to: whoseTurn,
      move: payload.data.move,
    })
  );
  return;
}

export async function handleGameEnd(
  userId: string,
  payload: {
    method: string;
    data: { gameId: string; reason: string };
  }
) {
  const currentUserGame = await redisClient.hGet('userGames', userId);

  if (currentUserGame !== payload.data.gameId) return;

  let opponentPlayerUserId;

  const players = await redisClient.sMembers(`games:${currentUserGame}:users`);

  if (players[0] === userId) {
    opponentPlayerUserId = players[1];
  } else {
    opponentPlayerUserId = players[0];
  }

  const userIdOfPlayerWithWhiteColor = await redisClient.hGet(
    `games:${currentUserGame}`,
    'white'
  );
  const userIdOfPlayerWithBlackColor = await redisClient.hGet(
    `games:${currentUserGame}`,
    'black'
  );
  const gameState = await redisClient.hGet(`games:${currentUserGame}`, 'state');

  if (payload.data.reason === 'Won' || payload.data.reason === 'Draw') {
    const newGame = await GameModel.create({
      gameId: payload.data.gameId,
      gameResult: payload.data.reason,
      winner: payload.data.reason === 'Won' ? userId : null,
      loser: payload.data.reason === 'Won' ? opponentPlayerUserId : null,
      gameState: gameState,
      userIdOfPlayerWithWhiteColor: userIdOfPlayerWithWhiteColor,
      userIdOfPlayerWithBlackColor: userIdOfPlayerWithBlackColor,
    });

    await UserModel.updateMany(
      { _id: { $in: [userId, opponentPlayerUserId] } },
      { $push: { games: newGame._id } }
    );
  }

  await redisClient.HDEL(`games:${payload.data.gameId}`, [
    'state',
    'status',
    'whoseTurn',
    'white',
    'black',
  ]);

  players.forEach((player) => {
    const isDeleted = deleteUserConnection(player);
    if (isDeleted === false) {
      publisher.publish(
        `games:${payload.data.gameId}`,
        JSON.stringify({
          method: 'deleteUserConnection',
          userId: player,
        })
      );
    } else {
      subscriber.unsubscribe(`games:${payload.data.gameId}`);
    }
    redisClient.HDEL('userGames', player);
    redisClient.SREM(`games:${payload.data.gameId}:users`, player);
  });
}
