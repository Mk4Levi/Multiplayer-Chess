import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import api from './api';
import passport from './config/passport';
import sessionParser from './config/session';
import { ALLOWED_ORIGIN } from './config/config';
import { connectWithRetry } from './config/mongoDb';
import * as middlewares from './middlewares';

const app = express();

connectWithRetry();

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.use(helmet());

app.enable('trust proxy');

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (ALLOWED_ORIGIN === origin) {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     credentials: true,
//   })
// );

app.use(cors());
app.use(sessionParser);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
