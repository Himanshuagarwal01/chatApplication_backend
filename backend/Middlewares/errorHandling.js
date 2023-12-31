const notFound = (req, resp, next) =>{
    const error = new Error(`Not Found-- ${req.originalUrl}`);
    resp.status(400);
    next(error);
}

const errorHandler = (err,req, resp, next) =>{
    const statusCode = resp.statusCode === 200 ? 500 : resp.statusCode;
    resp.status({statusCode});
    resp.json({
        message:err.message,
    })
}

module.exports = {
    notFound,
    errorHandler

}