const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const knex = require('../database/db');
const crypto = require('crypto');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3333/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {

      let user = await knex('users').where({ google_id: profile.id }).first();

      function generateRandomPassword(length = 12) {
        return crypto.randomBytes(length).toString('hex');
      }

      if (!user) {
        user = await knex('users').where({ email: profile.emails[0].value }).first();
        
        if (!user) {
          const randomPassword = generateRandomPassword();
          const [newUserId] = await knex('users').insert({
            name: profile.displayName,
            email: profile.emails[0].value,
            google_id: profile.id,
            email_verified: true,
            nickname: profile.displayName,
            password: randomPassword,
            created_at: new Date(),
            updated_at: new Date()
          });

          user = await knex('users').where({ id: newUserId }).first();
        }
      }

      done(null, user);
    } catch (error) {
      console.error('Error in GoogleStrategy:', error);
      done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await knex('users').where({ id }).first();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;