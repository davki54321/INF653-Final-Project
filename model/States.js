
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stateSchema = new Schema({
    stateCode: {
        type: String,
        require: true,
        unique: true,
    },
    funfacts: [String]
}

// The line below is used for testing. When populating the DB, this line of code prevents the __V element from being added to the MondgoDB document.
// , { versionKey: false }   // You should be aware of the outcome after set to false

);

module.exports = mongoose.model('State', stateSchema);