const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');


const userSchema = new Schema({
    email: { type: String, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    token: String,
    expirationDate: Date,
    image: String
});

/* cifrar password */ /* el callback no funciona con un arrow function */
userSchema.pre('save', async function(next) {
    /* si el password ya está cifrado */
    if (!this.isModified('password')) {
        return next(); /* deten la ejecución */
    }
    /* sino está cifrado */
    const pass = await bcrypt.hash(this.password, 10);
    this.password = pass;
    next();
});

/* envia alerta cuando un usuario ya está registrado */
userSchema.post('save', async function(err, doc, next) {
   if (err.name === 'MongoError' && err.code === 11000) {
       next('El correo indicado ya está registrado');
   } else {
       next(err);
   }
});

/* auntenticar usuarios */

userSchema.methods = {
    comparePassword: function (password) {
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = mongoose.model('User', userSchema);