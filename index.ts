import * as express from 'express'
import * as multer from 'multer'
import * as cors from 'cors'
import * as fs from 'fs'
import * as path from 'path'
import * as Loki from 'lokijs'
import { loadCollection, fileTypeFilter, cleanFolder } from './utils'

const DB_NAME = "db.json";
const COLLECTION_NAME = "clips";
const UPLOAD_PATH = "uploads";

const upload = multer({ dest: `${UPLOAD_PATH}`, fileFilter: fileTypeFilter });
const db = new Loki(`${UPLOAD_PATH}/${DB_NAME}`, { persistenceMethod: "fs" });

//Clean all the folder before start
cleanFolder(UPLOAD_PATH);

const app = express();
app.use(cors());

app.listen(3000, function () {
    console.log("Listening on port 3000!");
})

//post call to upload single file
app.post('/singleUpload', upload.single('media'), async (req, res) => {
    try {
        const col = await loadCollection(COLLECTION_NAME, db);
        const data = col.insert(req.file);

        db.saveDatabase();
        res.send({
            id: data.$loki,
            fileName: data.filename,
            originalName: data.originalname
        })
    } catch(error) {
        res.sendStatus(400);
    }
})

//post call to upload multiple files
app.post('/multipleMedia/upload', upload.array('media', 10), async (req, res) => {
    try {
        const col = await loadCollection(COLLECTION_NAME, db);
        const data = [].concat(col.insert(req.files));

        db.saveDatabase();
        res.send(
            data.map(x => ({ 
                id: x.$loki, 
                fileName: x.filename, 
                originalName: x.originalname
             }))
        )
    } catch(error) {
        res.sendStatus(400);
    }
})

//get call to retrive the media
app.get('/media', async(req, res) => {
    try {
        const col = await loadCollection(COLLECTION_NAME, db);
        res.send(col.data);
    } catch (error) {
        res.sendStatus(400);
    }
})

//Get call to retrive media using Id
app.get('/media/:id', async(req,res) => {
    try {
        const col = await loadCollection(COLLECTION_NAME, db);
        const result = col.get(req.params.id);

        if(!result){
            res.sendStatus(404);
            return;
        }
        res.setHeader('Content-Type', result.mimetype);
        fs.createReadStream(path.join(UPLOAD_PATH, result.filename)).pipe(res);
    } catch (error) {
        res.sendStatus(400);
    }
})