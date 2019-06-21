const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const slug = require('slug');
const shortid = require('shortid');

const JobSchema = new Schema({
    title: {
        type: String,
        required: 'El nombre de la vacante es obligatorio!',
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        required: 'La ubicación de la vacante es obligatoria!',
        trim: true
    },
    salary: {
        type: String,
        default: 0,
        trim: true
    },
    contract: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        lowercase: true
    },
    skills: {
        type: [String]
    },
    applicants: [{
        name: String,
        email: String,
        cv: String
    }],
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'La referencia al usuario es obligatoria'
    }
});

JobSchema.pre('save', function(next) {
    const url = slug(this.title);
    this.url = `${url}-${shortid.generate()}`;
    next();
  });

/* crear un indice */
JobSchema.index({title: 'text'});
  
module.exports = mongoose.model('Job', JobSchema);