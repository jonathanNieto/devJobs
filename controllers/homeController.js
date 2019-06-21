const mongoose = require('mongoose');
const Job = mongoose.model('Job');

exports.showJobs = async (req, res, next) => {
    const jobs = await Job.find({});

    if(!jobs) return next();
    res.render('home', {
        pageName: 'devJobs',
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
