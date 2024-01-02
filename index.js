

require("dotenv").config()
const express = require("express");
const app = express();
const cors = require("cors")
const fs = require("fs");
const path = require('path');
const mongoSanitize = require("express-mongo-sanitize")
const xss = require("xss-clean")

const user = require("./routes/index")


app.use(cors())
app.use(mongoSanitize())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
    app.use(xss())
    const folderPath = path.join(__dirname, 'uploads');
    const downloadPath = path.join(__dirname, 'downloads');

    // Check if the folder exists
    if (!fs.existsSync(folderPath)) {
        // If not, create the folder
        fs.mkdirSync(folderPath);
    }

    // Check if the folder exists
    if (!fs.existsSync(downloadPath)) {
        // If not, create the folder
        fs.mkdirSync(downloadPath);
    }

    next();
});

port = process.env.PORT || 8080

app.use("/", user);


app.listen(port, () => {
    console.log(`App is listenning at port ${port}`)
})