const mongoose  = require('mongoose')
const { Schema, model } = mongoose;

const userLogSchema = new Schema({
    number: Number,
    name_of_location: String,
    date: { type: Date },
    login_hour: Number,
    name: String,
    age: Number,
    gender: String,
    email: String,
    phone: String,
    brand_device: String,
    digital_interest: String,
    location_type: String
});

const UserLog = model('UserLog', userLogSchema, 'user_log')

module.exports = UserLog