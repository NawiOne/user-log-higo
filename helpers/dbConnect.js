require('dotenv').config()
const mongoose = require('mongoose')


const dbString = process.env.DB_URL

async function dbConnect() {
    try {
        await mongoose.connect(dbString);
        console.log('Database connected')

    } catch (error) {
        console.log(error)
        console.log('Failed to connect database')
    }


}

module.exports = dbConnect