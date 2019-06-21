const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('User');

/* le decimos a passport como se van a auntenticar los usuarios, a partir de nuestro modelo */
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    const user = await User.findOne({email});

    if (!user) {
        return done(null, false, {
            message: 'Credenciales incorrectas'
        });
    }
    /* el usuario existe, vamos a validar su password */
    const verifyPassword = user.comparePassword(password);
    if (!verifyPassword) {
        return done(null, false, {
            message: 'Credenciales incorrectas'
        });
    }

    /* credenciales correctas */
    return done(null, user);
}));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id).exec();
    return done(null, user);
});

module.exports = passport;