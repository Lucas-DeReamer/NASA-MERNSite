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

const UpdateSchema = new mongoose.Schema({
    change: { type: Number, required: true }
});
const Update = mongoose.model('Update', UpdateSchema);







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

    if (PK.length != 44 || PK[PK.length - 1] != '=') {
        res.status(418).json({
            message: 'This is not a valid WireGuard public key.',
            error: 1
        });
        return;
    }

    try {
        const keyMatched = await PKRec.find({ PK: PK });
        //console.log(keyMatched);
        
        if (keyMatched.length > 0) {
            const matSid = keyMatched[0].sid;
            // Return JSON Error: PK already in DB
            res.status(400).json({
                message: matSid,
                error: 2
            });
        } else {
            //calc next sid
            const currentH = await PKRec.find({}).sort({sid: -1}).limit(1);
            const curSid = currentH[0].sid;
            const sid = curSid + 1;

            const newEntry = { PK: PK, name: name, sid: sid };

            const results = await PKRec.insertOne(newEntry);
            //console.log(results.sid);

            // Return a single JSON response ------User VPN Inst
            res.status(200).json({
                message: sid,
                error: 0         // No error
            });
        }

    } catch (e) {
        // Handle any errors that occur during the database operation
        const error = e.toString();
        res.status(500).json({ message: error, error: 3 }); // Send an error respons

    }

});


app.get("/getkeys", async (req, res, next) => {
    // incoming: Autherization token
    // outgoing: All keys/names/sids

    const { Auth } = req.body;

    try {
        if (Auth != process.env.AUTHTOKEN) {

            // Return JSON Error: PK already in DB
            res.status(401).json({
                message: 'You do not have permission to do this.',
            });
        } else {

            const updata = await Update.find({}, { _id: 0, __v: 0 });

            res.status(200).json(updata);

            /*
            const allKeys = await PKRec.find({}, { _id: 0, name: 0, __v: 0});

            // Return a single response
            res.status(200).send(allKeys);   //.json({allKeys: allKeys}) may be needed      */
        }

    } catch (e) {
        // Handle any errors that occur during the database operation
        const error = e.toString();
        res.status(500).json({ message: "error", error: error }); // Send an error response

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