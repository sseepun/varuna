const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const { Database } = require('./connection');
require('dotenv').config();

const app = express();

// Enable helmet security
app.use(helmet());

// Give permission for fetch resource
const corsOptions = {
  origin: process.env.ALLOW_URLS.split(',').map(d => {
    return new RegExp(`${d.replace(/http:\/\/|https:\/\/|\//g, '')}$`);
  }),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Parse requests of content-type - application/json
app.use(bodyParser.json({ limit: '1000mb' }));
// Parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: '1000mb', extended: true, parameterLimit: 1000000 }));
app.use(cookieParser());


// Routes
require('./routes/app.routes')(app);
require('./routes/frontend.routes')(app);
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/admin.routes')(app);


// Set port listening for requests
const PORT = process.env.SERVER_PORT;
server = app.listen(PORT, () => {
  console.log(`APIs is running on port ${PORT}.`);
});


// Connect to database
Database();


// Initiate app
module.exports = app;