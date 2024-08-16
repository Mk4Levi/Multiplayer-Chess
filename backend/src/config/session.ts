import session from 'express-session';
import RedisStore from 'connect-redis';
import { redisClient } from './redis';
import { NODE_ENV, SESSION_SECRET } from './config';

const sessionParser = session({
  store: new RedisStore({
    client: redisClient,
  }),
  secret: SESSION_SECRET,
  cookie: {
    secure: NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 10000 * 60 * 60 * 24,
    sameSite: NODE_ENV === 'production' ? 'none' : false,
  },
  resave: false,
  saveUninitialized: false,
});

export default sessionParser;
