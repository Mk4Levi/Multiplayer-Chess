import bcrypt from 'bcryptjs';
import passport from 'passport';
import { UserModel } from '../api/models/userModel';
import passportLocal from 'passport-local';

const LocalStrategy = passportLocal.Strategy;

const verifyCallback = async (
  username: string,
  password: string,
  done: (
    error: any,
    user?: false | Express.User | undefined,
    options?: passportLocal.IVerifyOptions | undefined
  ) => void
) => {
  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return done(null, false, {
        message: 'Incorrect username',
      });
    }

    const isValidUser = await bcrypt.compare(password, user.password);

    if (!isValidUser) {
      return done(null, false, { message: 'Incorrect password' });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
};

const strategy = new LocalStrategy(verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (_id, done) => {
  try {
    const user = await UserModel.findById(_id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
