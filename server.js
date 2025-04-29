
require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;

connectDB();
app.use(cors());                    // for testing -- leaves CORS open
// app.use(cors(corsOptions));                     // blocks certain sites
app.use(express.urlencoded({ extended: false }));
app.use(express.json());                        // built-in middleware for json 
app.use('/', express.static(path.join(__dirname, '/public')));      //serve static files
app.use('/', require('./routes/root'));         // routes
app.use('/state[s]?', require('./routes/api/states'));

// "Catch all" for any URLs that do not exists.
// If the URL does not exist, status 404 will be returned.
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});