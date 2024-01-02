

const mongoose = require("mongoose");
const dbPath = process.env.DB_PATH

mongoose.connect(dbPath, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
}).then(() => {
    console.log("Database connected")
}).catch((error) => {
    console.log("Database not connected")
})