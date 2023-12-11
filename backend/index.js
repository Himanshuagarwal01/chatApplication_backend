const express = require('express');
const chats = require('./data/data');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
const connect = require('./config/db');
const { notFound, errorHandler } = require('./Middlewares/errorHandling')

app.use(cors());
dotenv.config();
app.use(express.json())
connect();

const port = process.env.PORT || 7000;

app.use('/user', require('./routes/userRoutes'));

app.use(notFound);
app.use(errorHandler);

app.get('/chat', (req, resp) => {
    resp.send(chats);
})
app.listen(7000, () => {
    console.log(`server started on port ${port}`)
}); 