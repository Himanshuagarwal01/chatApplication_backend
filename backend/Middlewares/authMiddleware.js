const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const asynchandler = require('express-async-handler');

const protect = asynchandler(async (req, resp, next) => {
    let token;
    console.log("dgsh");
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            let LogUser = await User.find({ _id: decoded.id }).select('-password');
            req.user = LogUser[0];
            console.log("try", req.user)
            next();
        } catch (error) {
            resp.status(400);
            throw new Error('not Authorized , no Token')
        }
    }
})

module.exports = {
    protect
}
