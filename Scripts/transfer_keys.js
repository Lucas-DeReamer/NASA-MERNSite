//Script for transfering contents of the website database into the WireGuard conf file
//
//The previous conf file is renamed based on the current date and the seconds since local
//midnight, so that previous versions can be recorded/restored.
//
//To run this script: "node transfer_keys.js", in this directory

import fs from "fs";
import { request } from 'http';
//const fs = require("fs");
//const http = require("http");  on linux


let keysData = [];

//HTTP request to website API
const postData = JSON.stringify({
    'Auth': 'pO-K/1-1SaiJ-/qAOLaEwvcQ=7aDUPi7K2jVsbV9/m=DBV52vM4Taf=ShtBiSzvXQbxLHh=i7IbewFL'
});

const options = {
    hostname: '3.133.227.144',
    path: '/api/getkeys',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
    }
};

const req = request(options, (res) => { //Define http request and callback
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        keysData = JSON.parse(data);
        //console.log('Body:', keysData);
    });
});

req.on('error', (err) => {
    console.log('Error:', err.message);
});


req.on('close', () => {   //Code to execute AFTER http returns

    if (keysData.length > 1) {

        flow();
        
    }
    //console.log("req is over.");
});




//Declare additional functions
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function initFiles() {

    //rename current file to save it
    var d_t = new Date();
    const newName = "wg" + (d_t.getMonth() + 1) + "-" + d_t.getDate() + "-" + d_t.getFullYear() + "--"
        + (Math.floor(d_t.getTime() / 1000) - d_t.getTimezoneOffset() * 60) % 86400 + ".conf.save";
    fs.rename('wg0.conf', newName, (err) => {
        if (err) {
            console.error(err);
        }
    });

    //wait
    await sleep(1000);
    
    //add new file to serve as conf
    const header = "[Interface]\nAddress = 10.0.0.1/24\nSaveConfig = true\n" +
        "PostUp = iptables - A FORWARD - i % i - j ACCEPT; iptables - t nat - A POSTROUTING - o eth0 - j MASQUERADE\n" +
        "PostDown = iptables - D FORWARD - i % i - j ACCEPT; iptables - t nat - D POSTROUTING - o eth0 - j MASQUERADE\n" +
        "ListenPort = 51820\nPrivateKey = OPCxrZyTPGhpDTrtpzedHxrA5LlOFIjPKDVvqkCc2n4=\n\n";

    fs.writeFile('wg0.conf', header, (err) => {
        if (err) {
            console.error(err);
        }
    });

} //end initFiles

async function fillFile() {
    var peers = "";

    for (let i = 2; i < keysData.length; i++) {

        var csid = keysData[i].sid;
        var newEntry = "[Peer]\nPublicKey = " + keysData[i].PK +
            "\nAllowedIPs = 10.0." + Math.floor(csid / 255) + "." + csid % 255 + "/32\n\n";

        peers = peers + newEntry;
    }
    
    fs.appendFile('wg0.conf', peers, err => {
        if (err) {
            console.error(err);
        }
    });
}

async function flow() {
    await initFiles();
    fillFile();
}


//Run request and cause async functions to run
req.write(postData);
req.end();

