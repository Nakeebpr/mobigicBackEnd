


const mongoose = require("mongoose");

const imageSchema = mongoose.Schema({
    imageTitle: {
        type: String
    },
    imagePath: {
        type: String
    },
    imageCode: {
        type: String
    },
}, { timeStamps: true });


module.exports = mongoose.model("image", imageSchema)