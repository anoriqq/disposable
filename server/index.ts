import './lib/env';
import next from 'next';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import mongoose from 'mongoose';

import { User, UserDocument } from './lib/db';
import { health } from './logics/health';

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
  server.use(bodyParser.json());
  server.use(cookieParser());
  server.use(
    session({
      secret: process.env.SESSION_SECRET || 'anoriqq-disposable',
      resave: true,
      saveUninitialized: true,
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
        callbackURL: `http://localhost:${port}/auth/callback`,
      },
      (accessToken, refreshToken, profile, cb) => {
        const uq = {
          id: profile.id,
          displayName: profile.displayName,
          accessToken,
        };
        User.findByIdAndUpdate(profile.id, uq, (err, user) => {
          return cb(err, user);
        });
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
      scope: ['profile', 'https://www.googleapis.com/auth/cloud-platform'],
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
  server.get('/logout', (req, res) => {
    if (!req.session) return res.end();
    return req.session.destroy((err) => {
      if (err) throw err;
      return res.end();
    });
  });
  server.get('*', (req, res) => handle(req, res));

  /* Start server */
  server.listen(port, (err) => {
    if (err) throw err;
    // eslint-disable-next-line no-console
    console.log(`> Ready on http://localhost:${port}`);
  });
});
