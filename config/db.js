const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
  console.log(`We're connected to mongo database!!`);
});

/* importar los modelos */
require('../models/Job');
require('../models/User');


