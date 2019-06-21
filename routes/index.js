const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController')
const jobController = require('../controllers/jobController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');




module.exports = () => {
    router.get('/', homeController.showJobs);

    /* create a new job */
    router.get('/jobs/new', authController.isAuthenticated, jobController.formNewJob);
    router.post('/jobs/new', authController.isAuthenticated, jobController.jobValidation, jobController.createNewJob);

    /* job details */
    router.get('/jobs/:url', jobController.showJob);
    
    /* edit job */
    router.get('/jobs/edit/:url', authController.isAuthenticated, jobController.formEditJob);
    router.post('/jobs/edit/:url', authController.isAuthenticated, jobController.jobValidation, jobController.editJob);

    /* delete jobs */
    router.delete('/jobs/delete/:id', authController.isAuthenticated, jobController.deleteJob);

    /* crear cuentas */
    router.get('/create-account', userController.formCreateAccount);
    router.post('/create-account', userController.userValidation, userController.createAccount);

    /* autenticar usuarios */
    router.get('/login', userController.formLogin);
    router.post('/login', authController.userAuthentication);

    /* logout user */
    router.get('/logout', authController.isAuthenticated, authController.logout);
    
    /* reset password */
    router.get('/reset-password', authController.formResetPassword);
    router.post('/reset-password', authController.sendToken);
    /* validate token & storage new pass */
    router.get('/reset-password/:token', authController.resetPassword);
    router.post('/reset-password/:token', authController.savePassword);

    /* admin panel */
    router.get('/admin', authController.isAuthenticated, authController.showPanel);

    /* editar perfil */
    router.get('/edit-profile', authController.isAuthenticated, userController.formEditProfile);
    router.post('/edit-profile', authController.isAuthenticated, 
    /* userController.profileValidation,  */
    userController.uploadImage,
    userController.editProfile);

    /* recibir mensajes de candidatos */
    router.post('/jobs/:url', jobController.uploadCV, jobController.contact);

    /* show applicants */
    router.get('/applicants/:id', authController.isAuthenticated, jobController.showApplicants);

    /* buscador de vacantes */
    router.post('/search', jobController.search);

    return router;
}

