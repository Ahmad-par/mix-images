const express = require("express");
const app = new express();
const path = require("path");
const fs = require('fs');
const bodyparser = require('body-parser');
const fileUpload = require('express-fileupload');
const jimp = require('jimp');

app.use(express.static('assets'));
app.use(bodyparser.urlencoded({extended: true}));
app.use(fileUpload());

let userCount = 0;
let userNum;

let port = process.env.PORT;
if (!port){
    port = 4000;
}
app.listen(port, () => {
    console.log("App listening...")
});

app.get("/", (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.get("/get-user", (req, res) => {
    userCount += 1;
    if (userCount > 99){
        userCount = 1;
    }
    if (String(userCount).length == 1){
        userNum = '0' + userCount;
    }else{
        userNum = String(userCount)
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({username: `user${userNum}`});
});

app.post("/upload-image", (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    let image = req.files.image;
    let fileExt = path.extname(image.name);
    let fileName = req.body.hidden;
    let version = req.body.version;

    let mainFilename = path.resolve(__dirname, 'assets/images', fileName + '-640' + 'v' + version + fileExt);

    image.mv(mainFilename, (err) => {
        if(err){
           return res.json({loaded: false});
        }
        //Resize image to 640*480
        jimp.read(mainFilename, (err, tempFile) => {
            if (err){
                return res.json({loaded: false});
            }
            tempFile.resize(640, 480, (err, image) => {
                if (err){
                    return res.json({loaded: false});
                }
                image.writeAsync(mainFilename).then(val => {res.json({loaded: true})}).catch(err => res.json({loaded: false}));
            })
            
        })
    })
    
});

app.get("/delete-image/:id", (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    let imagePart = req.params.id;
    let dirName = path.resolve(__dirname, 'assets/images');

    fs.readdir(dirName, (err, files) => {
        if (err){
            return res.json({deleted: false});
        }
        let idx = files.findIndex(file => file.includes(imagePart));
        let imageName = files[idx];
        fs.unlink(path.resolve(dirName, imageName), (err) => {
            if (err){
                return res.json({deleted: false});
            }
            res.json({deleted: true});
        });
    });
});