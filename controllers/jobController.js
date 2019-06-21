const mongoose = require('mongoose');
const Job = mongoose.model('Job');
const multer = require('multer');
const shortid = require('shortid');

exports.formNewJob = (req, res) => {
    res.render('newJob', {
        pageName: 'Nueva Vacante',
        tagLine: 'Llena el formulario y publica tu vacante',
        logout: true,
        name: req.user.name,
        admin: true,
        image: (req.user) ? `/uploads/profiles/${req.user.image}` : '/img/icons/user-128.png',
    });
}

/* agregar vacantes a la base de datos */
exports.createNewJob = async (req, res) => {
    const job = new Job(req.body);

    /* usuario autor de la vacante */
    job.userId = req.user._id;

    /* crear arreglo de skills */
    job.skills = req.body.skills.split(',');

    /* almacenar en la base de datos */
    const newJob = await job.save();

    /* redireccionar */
    res.redirect(`/jobs/${newJob.url}`);
}

/* muestra una vacante */
exports.showJob = async (req, res, next) => {
    const job = await Job.findOne({ url: req.params.url }).populate('userId');
    job.userId.password = ':(';

    if (!job) return next();
    res.render('jobDetails', {
        pageName: job.tile,
        bar: true,
        job,
        logout: true,
        name: (req.user) ? req.user.name : 'Anonimo',
        admin: (req.user) ? true : false,
        image: (req.user) ? `/uploads/profiles/${req.user.image}` : '/img/icons/user-128.png',
    });
}

/* editar una vacante */
exports.formEditJob = async (req, res, next) => {
    const job = await Job.findOne({ url: req.params.url });

    if (!job) return next();
    res.render('editJob', {
        pageName: `Editar: ${job.title}`,
        bar: true,
        job,
        logout: true,
        name: req.user.name,
        admin: true,
        image: (req.user) ? `/uploads/profiles/${req.user.image}` : '/img/icons/user-128.png',
    });
}

/* eliminar una vacante */
exports.deleteJob = async (req, res, next) => {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (verifyUserId(job, req.user)) {
        /* se trata del mismo usuario, eliminar */
        job.remove();
        res.status(200).send('Vacante eliminada correctamente!')
    } else {
        /* no es el mismo usuario */
        res.status(403).send('No tiene permisos para realizar esa acción!')
    }
}

exports.editJob = async (req, res, next) => {
    const updatedJob = req.body;
    updatedJob.skills = req.body.skills.split(',');

    const job = await Job.findOneAndUpdate({ url: req.params.url }, updatedJob, { new: true, runValidators: true });

    /* redireccionar */
    res.redirect(`/jobs/${job.url}`);
}

/* validar y sanitizar campos de las nuevas vacantes */
exports.jobValidation = (req, res, next) => {
    /* 'sanitizar' */
    req.sanitizeBody('title').escape();
    req.sanitizeBody('company').escape();
    req.sanitizeBody('location').escape();
    req.sanitizeBody('salary').escape();
    req.sanitizeBody('contract').escape();
    req.sanitizeBody('skills').escape();

    /* validar */
    req.checkBody('title', 'El titulo es requerido').notEmpty().trim();
    req.checkBody('company', 'La empresa es requerida').notEmpty().trim();
    req.checkBody('location', 'La ubitación de la vacante es requerida').notEmpty().trim();
    req.checkBody('salary', 'El salario es requerido').notEmpty().trim();
    req.checkBody('contract', 'Selecciona el tipo de contrato').notEmpty().trim();
    req.checkBody('skills', 'Agrega al menos una habilidad').notEmpty().trim();

    const errors = req.validationErrors();

    if (errors) {
        req.flash('danger ', errors.map((err) => err.msg));

        res.render('newJob', {
            pageName: 'Nueva Vacante',
            tagLine: 'Llena el formulario y publica tu vacante',
            logout: true,
            name: req.user.name,
            messages: req.flash()
        });
    }
    /* si toda la validacion es correcta, continua con el siguiente middleware */
    next();
}

const verifyUserId = (job = {}, user = {}) => {
    if (!job.userId.equals(user._id)) {
        return false;
    } else {
        return true;
    }
}

/* contact: almacenar los candidatos en la base de datos */
exports.contact = async (req, res, next) => {
    const job = await Job.findOne({ url: req.params.url });

    /* si no existe la vacante */
    if (!job) {
        return next();
    }

    /* todo bien, creamos el nuevo objeto */
    const newApplicant = {
        name: req.body.name,
        email: req.body.email,
        cv: req.file.filename
    };

    /* almacenar la vacante */
    job.applicants.push(newApplicant);

    await job.save();

    /* mensaje y redireccion */
    req.flash('success', 'Tu información se envío correctamente');
    res.redirect('/');


}

/* subir archivos en pdf */
exports.uploadCV = (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    req.flash('danger ', 'Archivo muy grande, máximo 200 KB son permitidos');
                } else {
                    req.flash('danger', err.message);
                }
            } else {
                req.flash('danger', err.message);
            }
            res.redirect('back');
            return;
        } else {
            return next();
        }
    });
}

const configMulter = {
    limits: { fileSize: 200000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../public/uploads/cvs');
        },
        filename: (req, file, cb) => {
            const ext = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${ext}`);
        }
    }),
    fileFilter: function (req, file, cb) {
        // The function should call `cb` with a boolean
        // to indicate if the file should be accepted
        if (file.mimetype === 'application/pdf') {
            // To accept the file pass `true`, like so:
            cb(null, true);
        } else {
            // To reject this file pass `false`, like so:
            cb(new Error('Formato de archivo no valido'), false);
        }
    },
};

const upload = multer(configMulter).single('curriculum');

/* show Applicants */
exports.showApplicants = async (req, res, next) => {
    const job = await Job.findById(req.params.id);

    if (!job.userId == req.user._id.toString()) {
        return next()
    }

    if (!job) {
        return next();
    }

    res.render('applicants', {
        pageName: `Vacante: ${job.title}`,
        bar: true,
        applicants: job.applicants,
        logout: true,
        name: (req.user) ? req.user.name : 'Anonimo',
        admin: (req.user) ? true : false,
        image: (req.user) ? `/uploads/profiles/${req.user.image}` : '/img/icons/user-128.png',
    })
}

/* search */
exports.search = async (req, res, next) => {
    const jobs = await Job.find({
        $text: {
            $search: req.body.search
        }
    });

    /* mostrar las vacantes */
    res.render('home', {
        pageName: `Resultados de la busqueda: ${req.body.search}`,
        tagLine: 'Encuentra y Pública Trabajos para Desarrolladores',
        bar: true,
        btn: true,
        jobs,
        logout: true,
        name: (req.user) ? req.user.name : 'Anonimo',
        user: (req.user) ? req.user : 'null',
        admin: (req.user) ? true : false
    });
}