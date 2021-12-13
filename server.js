//using express
const express = require('express');
const app = express();

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
// Week11_Q3
const fs = require('fs');
//formidable for image, and using express framework
const formidable = require('express-formidable');
//
const assert = require('assert');
// const http = require('http');
// const url = require('url');
const mongourl = 'mongodb+srv://andy:andy@cluster0.bdisd.mongodb.net/test?retryWrites=true&w=majority';
const dbName = 'test';

app.use(formidable());
app.set('view engine', 'ejs');
 


const findDocument = (db, criteria, callback) => {
    let cursor = db.collection('bookings').find(criteria);
    console.log(`findDocument: ${JSON.stringify(criteria)}`);
    cursor.toArray((err,docs) => {
        assert.equal(err,null);
        console.log(`findDocument: ${docs.length}`);
        callback(docs);
    });
}

const handle_Find = (res, criteria) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        findDocument(db, criteria, (docs) => {
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('list',{nBookings:docs.length,bookings:docs});
        });
    });
}

const handle_Details = (res, criteria) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        /* use Document ID for query */
        let DOCID = {};
        DOCID['_id'] = ObjectID(criteria._id)
        findDocument(db, DOCID, (docs) => {  // docs contain 1 document (hopefully)
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('details',{booking:docs[0]});  // we have 1 document only
            // res.writeHead(200, {"content-type":"text/html"});
            // res.write('<html><body><ul>');
            // //console.log(docs);
            // res.write(`<H2>Booking Details</H2><hr>`)
            // res.write(`<p>Booking ID: <b>${docs[0].bookingid}</b></p>`);
            // res.write(`<p>Mobile: <b>${docs[0].mobile}</b></p>`)
            // // Q2
            // if (docs[0].photo) {
            //     res.write(`<img src="data:image/jpg;base64, ${docs[0].photo}"><br>`);
            // }
            // // Q1
            // res.write(`<a href="/edit?_id=${docs[0]._id}">edit</a><br><br>`)
            // //
            // res.write(`<a href="/find">back<a>`);
            // res.end('</body></html>');
        });
    });
}

const handle_Edit = (res, criteria) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        /* use Document ID for query */
        let DOCID = {};
        DOCID['_id'] = ObjectID(criteria._id)
        let cursor = db.collection('bookings').find(DOCID);
        cursor.toArray((err,docs) => {
            client.close();
            assert.equal(err,null);
            res.status(200).render('edit',{booking: docs[0]});
            // res.writeHead(200, {"content-type":"text/html"});
            // res.write('<html><body>');
            // res.write('<form action="/update" method="POST" enctype="multipart/form-data">');
            // res.write(`Booking ID: <input name="bookingid" value=${docs[0].bookingid}><br>`);
            // res.write(`Mobile: <input name="mobile" value=${docs[0].mobile} /><br>`);
            // // Q2
            // res.write('<input type="file" name="filetoupload"><br>');
            // //
            // res.write(`<input type="hidden" name="_id" value=${docs[0]._id}>`)
            // res.write(`<input type="submit" value="update">`);
            // res.end('</form></body></html>');
        });
    });
}

const updateDocument = (criteria, updateDoc, callback) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

         db.collection('bookings').updateOne(criteria,
            {
                $set : updateDoc
            },
            (err, results) => {
                client.close();
                assert.equal(err, null);
                callback(results);
            }
        );
    });
}

const handle_Update = (req, res, criteria) => {
    // Q2
    const form = new formidable.IncomingForm(); 
    form.parse(req, (err, fields, files) => {
        var DOCID = {};
        DOCID['_id'] = ObjectID(fields._id);
        var updateDoc = {};
        updateDoc['bookingid'] = fields.bookingid;
        updateDoc['mobile'] = fields.mobile;
        if (files.filetoupload.size > 0) {
            fs.readFile(files.filetoupload.path, (err,data) => {
                assert.equal(err,null);
                updateDoc['photo'] = new Buffer.from(data).toString('base64');
                updateDocument(DOCID, updateDoc, (results) => {
                    res.status(200).render('info', {message: `Updated ${results.result.nModified} document(s)`})
                    // res.writeHead(200, {"content-type":"text/html"});
                    // res.write(`<html><body><p>Updated ${results.result.nModified} document(s)<p><br>`);
                    // res.end('<a href="/">back</a></body></html>');
                });
            });
        } else {
            updateDocument(DOCID, updateDoc, (results) => {
                res.status(200).render('info', {message: `Updated ${results.result.nModified} document(s)`})
                // res.writeHead(200, {"content-type":"text/html"});
                // res.write(`<html><body><p>Updated ${results.result.nModified} document(s)<p><br>`);
                // res.end('<a href="/">back</a></body></html>');
            });
        }
    })
    // end of Q2
}

app.get("/", (req,res) => {
    // what should I do?
    // handle_Find(res, req.query.docs);
    res.redirect('/find');
});

app.get("/find", (req,res) => {
    // what should I do?
    handle_Find(res, req.query.docs);
});

app.get("/details", (req,res) => {
    // what should I do?
    handle_Details(res, req.query);
});

app.get("/edit", (req,res) => {
    // what should I do?
    handle_Edit(res, req.query);
});

app.get("/update", (req,res) => {
    // what should I do?
    handle_Update(res, req.query);
});

// const server = http.createServer((req,res) => {
//     var parsedURL = url.parse(req.url, true);
 
//     switch(parsedURL.pathname) {
//         case '/':
//         case '/find':
//             handle_Find(res, parsedURL.query);
//             break;
//         case '/details':
//             handle_Details(res, parsedURL.query);
//             break;
//         case '/edit':
//             handle_Edit(res, parsedURL.query);
//             break;
//         case '/update':
//             handle_Update(req, res, parsedURL.query);
//             break;
//         default:
//             res.writeHead(404, {'Content-Type': 'text/plain'});
//             res.end(`${parsedURL.pathname} - Unknown request!`);
//     }
// })
 
// server.listen(process.env.PORT || 8099);
app.listen(process.env.PORT || 8099);

