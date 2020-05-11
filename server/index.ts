import './lib/env';
import next from 'next';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { health } from './logics/health';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

interface User {
  id: string;
}

app.prepare().then(() => {
  /* Create server */
  const server = express();

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
        return cb(undefined, profile);
      },
    ),
  );
  passport.serializeUser<User, User['id']>((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    done(null, { id });
  });
  server.use(passport.initialize());
  server.use(passport.session());
  server.get('/auth', passport.authenticate('google', { scope: ['profile'] }));
  server.get('/auth/callback', passport.authenticate('google'), (req, res) => {
    res.redirect('/');
  });

  /* Setup express middleware */
  server.use(bodyParser.json());
  server.use(cookieParser());
  server.use(
    session({ secret: process.env.SESSION_SECRET || 'anoriqq-disposable' }),
  );

  /* Setup routings */
  server.get('/health', health);
  server.get('*', (req, res) => handle(req, res));

  /* Start server */
  server.listen(port, (err) => {
    if (err) throw err;
    // eslint-disable-next-line no-console
    console.log(`> Ready on http://localhost:${port}`);
  });
});
