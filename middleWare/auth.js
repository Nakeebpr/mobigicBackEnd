require("dotenv").config();
const jwt = require("jsonwebtoken");

const jwtString = process.env.JWT_TOKEN;


module.exports = function (req, res, next) {
    const token = req.headers["token"];
    if (!token) {
        return res.status(408).json({
            "message": "Not Authenticated",
            "status": "Failure",
        })
    }

    try {

        const decoded = jwt.verify(token, jwtString)
        req.user = decoded.userInfo;
        next()

    } catch (error) {
        res.status(408).json({
            "response_code": "408",
            "message": "Invalid Token",
            "status": "Failure"
        })
    }
}
