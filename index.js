const express = require("express");
const app = express();
const db = require("./utils/db");
const s3 = require("./s3");
const config = require("./config");

//////FILE UPLOAD BOILERPLATE//////
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.use(express.static("public"));

app.use(express.json());

app.get("/images", (req, res) => {
    console.log("I hit the images route");
    // res.json(result); // it's converting the object to json
    db.getImagesTable()
        .then(result => {
            console.log("The image is", result);
            res.json(result);
        })
        .catch(e => {
            console.log("error from getImage:", e);
        });
});

app.get("/morebutton/:imageId", (req, res) => {
    console.log("The req params in more button get", req.params.imageId);
    // const { comment, username, id } = req.body;
    db.moreButton(req.params.imageId)
        .then(result => {
            // console.log("The result in get morebutton is", req.params.iamgeId);
            console.log("The result in get morebutton is", result);
            res.json(result);
        })
        .catch(err => {
            console.log("uploading error in more button get server", err);
        });
});
// app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
//     //req.file --> the file that was just uploaded
//     //req.body --> referes to the values we type in the input fields
//     const { filename } = req.file;
//     const url = config.s3Url + filename;
//     const { title, username, description } = req.body;
//     //req.file --> the file that was just uploaded
//     //req.body --> refers to the values we type in the input fields
//     if (req.file) {
//         res.json({
//             success: true
//         });
//     } else {
//
//         res.json({
//             success: false
//         });
//     }
// });

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    //req.file --> the file that was just uploaded
    //req.body --> referes to the values we type in the input fields
    const { filename } = req.file;
    const url = config.s3Url + filename;
    const { title, username, description } = req.body;
    if (req.file) {
        console.log("The req.file is:", req.file);
    }
    db.addImages(url, username, title, description)
        .then(result => {
            console.log("The new image is:", result);
            // url.unshift();
            res.json(result);
        })

        .catch(err => {
            console.log("The error in post upload is", err);
        });
});

app.get("/modalbox/:imageId", (req, res) => {
    // console.log("I hit the images route");
    console.log("req.params", req.params);
    // res.json(result); // it's converting the object to json
    db.getImages(req.params.imageId)
        .then(result => {
            console.log("The modalbox params is", result);
            res.json(result);
        })
        .catch(e => {
            console.log("error from getImages:", e);
        });
});

///Comments below

app.get("/comments/:imageId", (req, res) => {
    // console.log("comments get route");
    console.log("Params in get params", req.params);
    db.showComment(req.params.imageId).then(result => {
        console.log("Result of the get comment params is: ", result);
        res.json(result);
    });
});

app.post("/comment/", (req, res) => {
    const { comment, username, id } = req.body;
    db.addComments(comment, username, id)
        .then(result => {
            console.log("The result in post comment", result);
            res.json(result);
        })
        .catch(err => {
            console.log("uploading comment error", err);
        });
});

app.listen(8080, () => console.log("My image board server is UP!"));
