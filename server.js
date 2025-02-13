const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.json());
require("dotenv").config();

const corsOptions = {
    origin: "http://localhost:3000" // frontend URI (ReactJS)
}
app.use(express.json());
app.use(cors(corsOptions));


app.use((req, res, next) =>
{
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader(
'Access-Control-Allow-Headers',
'Origin, X-Requested-With, Content-Type, Accept, Authorization'
);
res.setHeader(
'Access-Control-Allow-Methods',
'GET, POST, PATCH, DELETE, OPTIONS'
);
next();
});



app.listen(5000); // start Node + Express server on port 5000

// route
app.get("/", (req, res) => {
    res.status(201).json({ message: "Connected to Backend!" });
});