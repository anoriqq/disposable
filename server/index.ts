import './lib/env';
import next from 'next';
import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import mongoose from 'mongoose';
import { Firestore } from '@google-cloud/firestore';
import { FirestoreStore } from '@google-cloud/connect-firestore';

import { User, UserDocument } from './lib/db';
import { health } from './logics/health';
import { wrap } from './util';
import { create } from './logics/create';
import { deleteUser } from './logics/delete';

declare module 'express' {
  export interface Request {
    user?: UserDocument;
  }
}

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
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
  server.use(
    session({
      ...(dev && {
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
      },
    }),
  );

  /* Setup mongoose */
  if (!process.env.MONGODB_CONNECTION_STRING) {
    throw new Error('mongodb connection string is not specified');
  }
  mongoose
    .connect(process.env.MONGODB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(() => {
      // eslint-disable-next-line no-console
      console.log(`> Successfully connected to Mongodb`);
    });

  /* Setup passport */
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('client ID or client secret is not specified');
  }
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${
          dev
            ? `http://${process.env.PATH_PREFIX}:${port}`
            : `https://${process.env.PATH_PREFIX}`
        }/auth/callback`,
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
  server.get(
    '/auth',
    passport.authenticate('google', {
      scope: [
        'profile',
        'https://www.googleapis.com/auth/cloud-platform',
        // 'https://www.googleapis.com/auth/cloudplatformprojects',
        // 'https://www.googleapis.com/auth/cloud-billing',
        // 'https://www.googleapis.com/auth/cloud-platform.read-only',
        // 'https://www.googleapis.com/auth/service.management',
        // 'https://www.googleapis.com/auth/compute',
        // 'https://www.googleapis.com/auth/devstorage.full_control',
      ],
    }),
  );
  server.get(
    '/auth/callback',
    passport.authenticate('google', {
      successRedirect: '/',
      failureRedirect: '/',
    }),
  );

  /* Setup routings */
  server.get('/health', health);
  server.get('/session', (req, res) => {
    const s = {
      ...(req.user && { user: req.user }),
    };
    return res.json(s);
  });
  server.get('/user/logout', (req, res) => {
    if (!req.session) return res.end();
    return req.session.destroy((err) => {
      if (err) throw err;
      return res.end();
    });
  });
  server.get(
    '/user/delete',
    wrap(async (req, res) => {
      if (!req.user) throw new Error('no user');
      const userId = req.user.id;
      if (!req.session) return res.end();
      return req.session.destroy((err) => {
        if (err) throw err;
        deleteUser({ userId });
        return res.end();
      });
    }),
  );
  server.get(
    '/api/create',
    wrap(async (req, res) => {
      if (!req.user) throw new Error('no user');
      const project = await create({ user: req.user });
      return res.json(project);
    }),
  );
  server.get('*', (req, res) => handle(req, res));

  /* Start server */
  server.listen(port, (err) => {
    if (err) throw err;
    // eslint-disable-next-line no-console
    console.log(`> Ready on http://localhost:${port}`);
  });
});
