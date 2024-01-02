


require("../db/index")
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const registerModel = require("../models/register_model")
const imageModel = require("../models/image_model")
const auth = require("../middleWare/auth");
const jwtToken = process.env.JWT_TOKEN
const { multerUpload, downloadFile } = require("../components/index.js")


router.get("/", (req, res) => {
    res.send("it is from router");
});

router.post("/register", [
    check("name", "Please enter a valid name").notEmpty(),
    check("email", "Please enter a valid email").isEmail().notEmpty(),
    check("password", "Please enter a valid email").notEmpty(),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
            "message": errors.array()[0]?.msg,
            "status": false,
        });
    }

    const { name, email, password } = req.body;

    try {
        let user = await registerModel.findOne({ email })
        if (user) {
            return res.status(400).json({
                "message": "User already available",
                "status": false,
            });
        }

        let newUser = new registerModel({
            name,
            email,
            password
        })

        let newUserSaved = await newUser.save();

        const payload = {
            userInfo: {
                id: email
            }
        }

        jwt.sign(
            payload,
            jwtToken,
            {
                expiresIn: 3600
            },
            (err, token) => {
                if (err) throw err;
                return res.status(200).json({
                    "message": "Register Successfull",
                    "status": true,
                    "token": token,
                })
            })
    } catch (error) {
        return res.status(500).json({
            "message": "Something went wrong",
            "status": false,
        })
    }
});

router.post("/login", [
    check("email", "Please enter a valid email").isEmail().notEmpty(),
    check("password", "Please enter a valid email").notEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
            "message": errors.array()[0]?.msg,
            "status": false,
        });
    }

    const { email, password } = req.body;

    try {
        let isAvailable = await registerModel.findOne({ email })
        if (!isAvailable) {
            return res.status(400).json({
                "message": "User not available",
                "status": false,
            });
        }
        let user = await registerModel.findOne({ email, password })
        if (!user) {
            return res.status(400).json({
                "message": "Incorrect username or password",
                "status": false,
            });
        }

        const payload = {
            userInfo: {
                id: email
            }
        }

        jwt.sign(
            payload,
            jwtToken,
            {
                expiresIn: 3600,
            },
            (err, token) => {
                if (err) throw err;
                return res.status(200).json({
                    "message": "Login Successfull",
                    "status": true,
                    "token": token,
                })
            }
        )
    } catch (error) {
        return res.status(500).json({
            "message": "Something went wrong",
            "status": false,
        })
    }
})

router.post("/upload_image", auth, multerUpload.single("image"), async (req, res) => {

    try {
        const isAdmin = await registerModel.findOne({ email: req.user.id })
        if (!isAdmin) {
            return res.status(408).json({
                message: "Not Authorized",
                status: false,
            })
        }

        return res.status(200).json({
            "message": "Image uploaded",
            "path": "http://localhost:5050/" + req.file.filename, //for local
            "status": true,
        });
    } catch (error) {
        return res.status(500).json({
            "message": "Something went wrong",
            "status": false,
        });
    }

});

router.post("/save_image", auth, async (req, res) => {
    try {
        const user = await registerModel.findOne({ email: req.user.id })
        if (!user) {
            return res.status(408).json({
                message: "Not Authorized",
                status: false,
            })
        }

        const { imageTitle, imagePath } = req.body;
        function generateRandomCode() {
            const min = 100000;
            const max = 999999;

            const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;

            return randomCode;
        }

        // Example usage
        const randomCode = generateRandomCode();

        const data = new imageModel({
            imageTitle: imageTitle,
            imagePath: imagePath,
            imageCode: randomCode
        })

        const imageSaved = await data.save();

        return res.status(200).json({
            "message": "Image uploaded successfully",
            "status": true,
        });

    } catch (error) {
        return res.status(500).json({
            "message": "Something went wrong",
            "status": false,
        });
    }
})

router.get("/getPhotos", auth, async (req, res) => {

    const { page, itemsPerPage } = req.query;
    const pageSize = itemsPerPage;

    try {
        const pageNumber = parseInt(page, 10) || 1;
        const skip = (pageNumber - 1) * pageSize;

        const photoData = await imageModel.find({}).skip(skip).limit(pageSize);

        const totalItems = (await imageModel.find({})).length
        const totalPagesCount = Math.ceil(totalItems / pageSize)

        if (!photoData) {

            return res.status(200).json({
                message: "No Data Available",
                status: "Failure",
            })
        }

        return res.status(200).json({
            message: photoData,
            status: "Success",
            totalPagesCount,
            itemsPerPage: pageSize
        })
    } catch (error) {
        return res.status(500).json({
            "message": "Something went wrong",
            "status": "Failure",
        });
    }


})

router.post("/deleteImage", auth, async (req, res) => {

    const { id } = req.body;

    try {

        const imageData = await imageModel.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Item deleted successfully",
            status: "Success"
        })

    } catch (error) {
        return res.status(500).json({
            "message": "Something went wrong",
            "status": "Failure",
        });
    }

})

router.post("/downloadImage", auth, async (req, res) => {

    const { otp } = req.body;

    try {

        const imageData = await imageModel.findOne({ imageCode: otp });
        if (!imageData) {
            return res.status(400).json({
                "message": "Incorrect PIN",
                "status": false,
            });
        }

        const Path = `./downloads/${imageData?.imageTitle}.jpg`;

        const url = imageData?.imagePath;

        const fileData = downloadFile(Path, url);

        return res.status(200).json({
            "message": "Image Downloaded successfully",
            "status": true,
        });


    } catch (error) {
        return res.status(500).json({
            "message": "Something went wrong",
            "status": "Failure",
        });
    }

})


module.exports = router