import passport from 'passport';
import BearerStrategy from 'passport-http-bearer';
import { StatusCodes } from 'http-status-codes';

import { selectUserByApiToken } from '../../../services/db';

passport.use(
    new BearerStrategy(async (token, done) => {
        try {
            const user = await selectUserByApiToken(token);
            if (user) {
                done(null, user);
            } else {
                done({ status: StatusCodes.UNAUTHORIZED, error: 'Authentication failed' }, null);
            }
        } catch (err) {
            done(err, null);
        }
    })
);
