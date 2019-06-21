const passport = require('passport');
const mongoose = require('mongoose');
const Job = mongoose.model('Job');
const User = mongoose.model('User');
const crypto = require('crypto');
const sendMail = require('../handlers/email');


exports.userAuthentication = passport.authenticate('local', {
   successRedirect: '/admin',
   failureRedirect: '/login',
   failureFlash: true,
   badRequestMessage: 'Ambos campos son requeridos'
});

/* revisar si el usuario está o no autenticado */
exports.isAuthenticated = (req, res, next) => {
   /* revisar el usuario */
   if (req.isAuthenticated()) {
      return next(); /* si está autenticado */
   }

   /* no está autenticado */
   res.redirect('/login');
}

exports.showPanel = async (req, res) => {

   /* consultar el usuario autenticado */
   const jobs = await Job.find({ userId: req.user._id })
   res.render('admin', {
      pageName: 'Panel de administración',
      tagLine: 'Crea y Administra tus vacantes desde aquí',
      btn: true,
      logout: true,
      name: req.user.name,
      image: (req.user) ? `/uploads/profiles/${req.user.image}` : '/img/icons/user-128.png',
      jobs,
      admin: true
   });
}

/* logout user */
exports.logout = (req, res) => {
   req.logout();
   req.flash('info', 'Cerraste sesión correctamente');
   return res.redirect('/login');
}

/* reset password */
exports.formResetPassword = (req, res) => {
   res.render('resetPassword', {
      pageName: 'Restablecer contaseña',
      tagLine: 'Si olvidaste tu contraseña, escribe tu e-mail para restablecerla',
   });
}

/* generating token */
exports.sendToken = async (req, res, next) => {
   const user = await User.findOne({ email: req.body.email });

   if (!user) {
      req.flash('danger', 'No existe ese usuario!');
      return res.redirect('/login');
   }

   /* el usuario existe */
   user.token = crypto.randomBytes(20).toString('hex');
   user.expirationDate = Date.now() + 3600000;

   await user.save();

   const resetUrl = `http://${req.headers.host}/reset-password/${user.token}`;

   /* enviar notificación por email */
   await sendMail.send({
      user,
      subject: 'Password Reset',
      resetUrl,
      filename: 'reset'
   }).catch(console.error);

   req.flash('success', 'Se te ha enviado un e-mail!');
   req.flash('success', 'Por favor revisalo para restablecer tu contraseña!');
   res.redirect('/login');
}

/* verify si el token es valido y el usuario existe, si si muestra la vista  */
exports.resetPassword = async (req, res, next) => {
   const user = await User.findOne({
      token: req.params.token,
      expirationDate: {
         $gt: Date.now()
      }
   });

   if (!user) {
      req.flash('danger', 'El token ya no es valido, solicita uno nuevo');
      return res.redirect('/reset-password');
   }

   /* todo bien */
   res.render('newPassword', {
      pageName: 'Establecer una nueva contraseña'
   });
}

/* savePassword */
exports.savePassword = async (req, res, next) => {
   const user = await User.findOne({
      token: req.params.token,
      expirationDate: {
         $gt: Date.now()
      }
   });

   if (!user) {
      req.flash('danger', 'El token ya no es valido, solicita uno nuevo');
      return res.redirect('/reset-password');
   }

   /* todo bien, guardar el password en la bd */
   user.password = req.body.password;
   user.token = undefined;
   user.expirationDate = undefined;

   await user.save();

   req.flash('success', 'La contraseña se cambio correctamente');
   res.redirect('/login');
}