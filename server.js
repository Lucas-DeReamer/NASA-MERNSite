const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(cors());
const dotenv = require('dotenv').config();
app.use(bodyParser.json());
app.use(express.json());

const corsOptions = {
    origin: "http://localhost:3000" // frontend URI (ReactJS)
}
app.use(cors(corsOptions));



const MongoClient = require('mongodb').MongoClient;

const url = process.env.MONGODB_URL; // protected database url

const client = new MongoClient(url);

//Test connection
client.connect()
    .then(() => {
        console.log('Successfully connected to MongoDB');
        app.listen(5000, () => {
            console.log("Server running at http://3.133.227.144:5000");
        });
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });




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



//app.listen(5000); // start Node + Express server on port 5000

// route
app.get("/", (req, res) => {
    res.status(201).json({ message: "Connected to Backend!" });
});


app.post("/api/submit/", async (req, res, next) => {
    // incoming: PK, name
    // outgoing: error

    const { PK, name } = req.body;

    var error = "";

    const js = { message: name, error: error };

    res.status(200).json(js);


    try {
        const db = client.db();
        const loginMatched = await db.collection('Users').find({ Username: login }).toArray();
        if (loginMatched.length > 0) {

            // Return JSON Error: PK already in DB
            res.status(418).json({
                message: id,
                error: 'This Public Key has already been added.'
            });
        } else {
            const newEntry = { PK: PK, name: name};

            //const db = client.db();
            const results = await db.collection('Users').insertOne(newEntry);
            //const id = results.insertedId;

            // Return a single JSON response ------User VPN Inst
            res.status(200).json({
                message: '',
                error: ''         // No error
            });
        }

    } catch (e) {
        // Handle any errors that occur during the database operation
        const error = e.toString();
        res.status(500).json({ error }); // Send an error respons

    }


});