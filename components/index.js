

const multer = require("multer");
const http = require("http");
const fs = require("fs")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname.replace(/\s+/g, '_'));
    }
});

module.exports.multerUpload = multer({ storage: storage })

module.exports.downloadFile = (ath, url) => {
    let fileData = http.get(url, function (res) {
        const fileStream = fs.createWriteStream(Path)
        res.pipe(fileStream);
        fileStream.on("finish", function () {
            fileStream.close();
        });
        fileStream.on('error', function (err) {
            console.error('Error writing to file:', err.message);
            return { fileStatus: false }
        });
    }).on('error', function (err) {
        console.error('Error downloading file:', err.message);
        return { fileStatus: false }
    });

    return { fileStatus: true }

}

