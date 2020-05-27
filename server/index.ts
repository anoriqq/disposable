/// <reference types="./@types/express" />
/// <reference types="./@types/express/express" />

import type { Express, APIError } from 'express-serve-static-core';
import './lib/env';
import './lib/tracer';
import next from 'next';
import express, { ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Firestore } from '@google-cloud/firestore';
import { FirestoreStore } from '@google-cloud/connect-firestore';

import type { UserDocument } from './lib/db';
import { setupMongoose, User } from './lib/db';
import {
  healthRouter,
  userRouter,
  projectRouter,
  instanceRouter,
} from './route';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const setupPassport = (server: Express): void => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('client ID or client secret is not specified');
  }
  server.use(
    session({
      ...(!dev && {
        store: new FirestoreStore({
          kind: 'express-session',
          dataset: new Firestore({
            projectId: process.env.PROJECT_ID,
          }),
        }),
      }),
      name: 'sessionId',
      secret: process.env.SESSION_SECRET || 'anoriqq-disposable',
      resave: false,
      saveUninitialized: true,
      cookie: {
        httpOnly: true,
        ...(!dev && { secure: true }),
        domain: process.env.PATH_PREFIX || 'localhost',
        maxAge: 900000,
      },
    }),
  );
  const callbackPath = '/user/auth/callback';
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: dev
          ? `http://${process.env.PATH_PREFIX}:${port}${callbackPath}`
          : `https://${process.env.PATH_PREFIX}${callbackPath}`,
      },
      (accessToken, refreshToken, profile, cb) => {
        const uq = {
          id: profile.id,
          displayName: profile.displayName,
          accessToken,
        };
        User.findByIdAndUpdate(
          profile.id,
          uq,
          { upsert: true },
          (err, user) => {
            return cb(err, user);
          },
        );
      },
    ),
  );
  passport.serializeUser<UserDocument, UserDocument['_id']>((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(null, user));
  });
  server.use(passport.initialize());
  server.use(passport.session());
};

app.prepare().then(() => {
  (async (): Promise<void> => {
    /* Create server */
    const server = express();

    /* Setup express app */
    server.set('trust proxy', true);

    /* Setup express middleware */
    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));
    server.use(helmet());
    server.use(bodyParser.json());
    server.use(cookieParser());

    /* Setup mongoose */
    await setupMongoose();

    /* Setup passport */
    setupPassport(server);

    /* Setup routings */
    server.use(healthRouter);
    server.use(userRouter);
    server.use(projectRouter);
    server.use(instanceRouter);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorHandler: ErrorRequestHandler<any, APIError> = (
      err,
      req,
      res,
      nextFn,
    ): void => {
      if (err.message === 'no user') {
        res.status(401).json({ code: 401, message: 'No user' });
        return;
      }
      console.error(err);
      nextFn(err);
    };
    server.use(errorHandler);
    server.all('*', (req, res) => handle(req, res));

    /* Start server */
    server.listen(port, (err) => {
      if (err) throw err;
      // eslint-disable-next-line no-console
      console.log(`> Ready on http://localhost:${port}`);
    });
  })().catch(console.error);
});
