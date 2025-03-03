const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
app.use(bodyParser.json());
app.use(express.json());

const cors = require('cors');
const corsOptions = {
    origin: "http://3.133.227.144/" // frontend URI (ReactJS)
}
app.use(cors(corsOptions));


// Database ----------------------------------------------------

//const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');

const url = process.env.MONGODB_URL; // protected database url

//const client = new MongoClient(url);

//Test connection
mongoose.connect(url)
    .then(() => {
        console.log('Successfully connected to MongoDB with Mongoose');
        app.listen(5000, () => {
            console.log("Server running at http://localhost:5000");
            // send ready signal to pm2 after db connect
            process.send('ready');
        });
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

const PKRSchema = new mongoose.Schema({
    PK: { type: String, required: true },
    name: String,
    sid: { type: Number, required: true }   //Submit ID
});
const PKRec = mongoose.model('PKRec', PKRSchema);








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



// Routes --------------------------------
app.get("/", (req, res) => {
    res.status(201).json({ message: "Connected to Backend!" });
});



app.post("/submit", async (req, res, next) => {
    // incoming: PK, name
    // outgoing: error

    const { PK, name } = req.body;

    //console.log("Sub API activated")
    //res.status(200).json(js);


    try {
        //const db = client.db();
        //const keyMatched = await db.collection('Public_Keys').find({PK: PK}).toArray();
        //console.log(keyMatched);
        const keyMatched = await PKRec.find({ PK: PK });
        
        if (keyMatched.length > 0) {

            // Return JSON Error: PK already in DB
            res.status(418).json({
                message: 'This Public Key has already been added.',
                error: 'PK already exists'
            });
        } else {
            //calc next sid
            const currrentH = await PKRec.find().sort({ sid: -1 }).limit(1);
            console.log(currentH);
            const curSid = currentH.sid;

            console.log(curSid);


            const newEntry = { PK: PK, name: name, sid: (curSid + 1)};

            const results = await PKRec.insertOne(newEntry);
            const id = newEntry.insertedID;
            console.log(results._id);

            // Return a single JSON response ------User VPN Inst
            res.status(200).json({
                message: 'In good',
                error: ''         // No error
            });
        }

    } catch (e) {
        // Handle any errors that occur during the database operation
        const error = e.toString();
        res.status(500).json({ message: "error", error: error }); // Send an error respons

    }

});


app.post("/delete", async (req, res, next) => {
    // incoming: Autherization token, search
    // outgoing: error

    const { Auth, search } = req.body;

    //console.log("Sub API activated");
    //res.status(200).json(js);


    try {
        //const authT = process.env.AUTHTOKEN;

        if (Auth != process.env.AUTHTOKEN) {

            // Return JSON Error: PK already in DB
            res.status(418).json({
                message: 'You do not have permission to do this.',
                error: 'No Access'
            });
        } else {
            const newEntry = { PK: PK, name: name, sid: 0 };

            const results = await PKRec.insertOne(newEntry);
            const id = newEntry.insertedID;
            console.log(results._id);

            // Return a single JSON response ------User Del
            res.status(200).json({
                message: 'In good',
                error: ''         // No error
            });
        }

    } catch (e) {
        // Handle any errors that occur during the database operation
        const error = e.toString();
        res.status(500).json({ message: "error", error: error }); // Send an error respons

    }

});









function cleanupAndExit() {
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
}
process.on('SIGTERM', cleanupAndExit);
process.on('SIGINT', cleanupAndExit);