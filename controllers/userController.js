const mongoose = require('mongoose');
const User = mongoose.model('User');
const multer = require('multer');
const shortid = require('shortid');

const configMulter = {
    limits: { fileSize: 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../public/uploads/profiles');
        },
        filename: (req, file, cb) => {
            const ext = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${ext}`);
        }
    }),
    fileFilter: function (req, file, cb) {
        // The function should call `cb` with a boolean
        // to indicate if the file should be accepted
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            // To accept the file pass `true`, like so:
            cb(null, true);
        } else {
            // To reject this file pass `false`, like so:
            cb(new Error('Formato de imagen no valido'), false);
        }
    },
};

const upload = multer(configMulter).single('avatar');

exports.formCreateAccount = (req, res) => {
    res.render('createAccount', {
        pageName: 'Crea tu cuenta en devJobs',
        tagLine: 'Comienza a publicar tus vacantes, solo debes crear una cuenta'
    });
}

exports.userValidation = (req, res, next) => {
    /* 'sanitizar' */
    req.sanitizeBody('name').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirm').escape();

    /* validar */
    req.checkBody('name', 'El nombre es requerido').notEmpty().trim();
    req.checkBody('email', 'El email debe ser valido').isEmail().trim();
    req.checkBody('password', 'La contraseña es requerida').notEmpty().trim();
    req.checkBody('confirm', 'Confirmar contraseña es requerida').notEmpty().trim();
    req.checkBody('confirm', 'Las contraseñas son diferentes').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
        req.flash('danger ', errors.map((err) => err.msg));

        res.render('createAccount', {
            pageName: 'Crea tu cuenta',
            tagLine: 'Comienza a publicar tus vacantes, solo debes crear una cuenta',
            messages: req.flash()
        });
    }
    /* si toda la validacion es correcta, continua con el siguiente middleware */
    next();
}

exports.createAccount = async (req, res, next) => {
    /* create an user */
    const user = new User(req.body);
    try {
        await user.save();
        res.redirect('/login');
    } catch (err) {
        req.flash('danger', err);
        res.redirect('/create-account');
    }
}

/* login */
exports.formLogin = (req, res, next) => {
    res.render('login', {
        pageName: 'Iniciar Sesión'
    });
}

/* edit profile */
exports.formEditProfile = (req, res) => {
    res.render('editProfile', {
        pageName: 'Editar perfil',
        logout: true,
        name: req.user.name,
        user: req.user,
        admin: true,
        image: (req.user) ? `/uploads/profiles/${req.user.image}` : '/img/icons/user-128.png',
    });
}

exports.editProfile = async (req, res, next) => {
    const user = await User.findById(req.user._id);
    user.name = req.body.name;
    user.email = req.body.email;
    if (req.body.password) {
        user.password = req.body.password;
    }

    if (req.file) {
        user.image = req.file.filename
    }

    await user.save();
    req.flash('info', 'Cambios guardados correctamente');
    res.redirect('/admin');
}

/* sanitizar y validar el formulario */
exports.profileValidation = (req, res, next) => {
    /* 'sanitizar' */
    req.sanitizeBody('name').escape();
    req.sanitizeBody('email').escape();
    if (req.body.password) {
        req.sanitizeBody('password').escape();
    }

    /* validar */
    req.checkBody('name', 'El nombre es requerido').notEmpty().trim();
    req.checkBody('email', 'El email debe ser valido').isEmail().trim();

    const errors = req.validationErrors();

    if (errors) {
        req.flash('danger ', errors.map((err) => err.msg));

        res.render('formEditProfile', {
            pageName: 'Editar perfil',
            logout: true,
            name: req.user.name,
            user: req.user,
            admin: true,
            image: (req.user) ? `/uploads/profiles/${req.user.image}` : '/img/icons/user-128.png',
            messages: req.flash()
        });
    }
    /* si toda la validacion es correcta, continua con el siguiente middleware */
    next();
}

/* upload image */
exports.uploadImage = (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    req.flash('danger ', 'Imagen muy grande, máximo 100 KB son permitidos');
                } else {
                    req.flash('danger', err.message);
                }
            } else {
                req.flash('danger', err.message);
            }
            res.redirect('/admin');
            return;
        } else {
            return next();
        }
    });
}