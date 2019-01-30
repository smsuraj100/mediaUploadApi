import * as del from 'del';
import * as Loki from 'lokijs';
import { promises } from 'fs';

const loadCollection = function(colName, db: Loki): Promise<Loki.Collection<any>> {
    return new Promise( resolve => {
        db.loadDatabase({}, () => {
            const _collection = db.getCollection(colName) || db.addCollection(colName);
            resolve(_collection);
        }) 
    })
}

const fileTypeFilter = function(req, file, cb) {
    //Accept Image and Videos
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4|3gp|avi|ogg|wmv|webm|flv)$/)) {
        return cb(new Error("Only Image/Video files are allowed!"), false);
    }
    cb(null, true);
}

const cleanFolder = function (folderPath) {
    // delete files inside folder but not the folder itself
    del.sync([`${folderPath}/**`, `!${folderPath}`]);
};

export { loadCollection, fileTypeFilter, cleanFolder }