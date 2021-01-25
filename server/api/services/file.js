"use strict";
const uuid = require('uuid');
const path = require('path');
const _ = require('lodash');
const fs = require('fs');
const writable = require('stream').Writable;

module.exports = {
    /**
     * @description create request for uploading file
     * @param options : "{
     *                      "destination":<String>,
     *                      "uploadedFiles":<Array>,
     *                      "uploadedFileErrors":<Array>,
     *                  }"
     * @return {Object}
     */
    buildRequest: async (options) => {
        const destination = options.destination ? options.destination : sails.config.services.file.defaultDestinations;
        const validFileTypes = sails.config.services.file.validFileTypes;

        let streamOption = {
            dirName: path.join(sails.config.appPath, '/assets/' + destination + '/'),
            destination: destination,
            validFileTypes: validFileTypes,
            maxBytes: sails.config.services.file.maxMegaBytes * 1024 * 1024,
            saveAs: (file) => {
                return FileService.uniqueNameOfFile(file);
            },
            completed: (fileData, next) => {
                if (fileData.uploaded) {
                    streamOption.uploadedFiles && _.isArray(streamOption.uploadedFiles) ? streamOption.uploadedFiles.push(fileData) : "";
                    next();
                } else {
                    streamOption.uploadedFileErrors && _.isArray(streamOption.uploadedFileErrors) ? streamOption.uploadedFileErrors.push(fileData) : "";
                    next();
                }
            },
            uploadedFiles: [],
            uploadedFileErrors: []
        };
        return streamOption;
    },

    /**
     * @description returns uniquely created name of file
     * @param file: <Stream>
     * @return {string}
     */
    uniqueNameOfFile: (file) => {
        const fileName = file.filename;
        const fileExt = path.extname(fileName);
        const uniqueFileName = path.basename(fileName, fileExt) + "-" + uuid.v4() + fileExt;
        return uniqueFileName;
    },

    /**
     *
     * @param options :"{
     *                      dirName: <string>,
     *                      destination: <string>,
     *                      validFileTypes: <array> // valid types of file ex. ['image/jpeg','image/png'] ,
     *                      saveAs: <function(file)> // overriding skipper save as function,
     *                      completed: <function(fileData, next)> // overriding skipper complete function, where
     *                                                            // fileData is uploaded file data where next is callback
     *                  }"
     *
     * @returns "{
     *               uploaded: <boolean>, // justify file uploaded or not
     *               name: <string>, // name of file
     *               size: <integer>, // size of file
     *               local_name: <string>, // changed name of file
     *               path: <string>, // full path of file
     *               message: <string> // message regarding to file uploaded or not
     *           }"
     */
    documentReceiverStream: (options) => {

        let defaults = {
            dirName: '/dev/null',
            validFileTypes: [],
            saveAs: (file) => {
                return file.filename;
            },
            completed: (file, done) => {
                done();
            }
        };

        // could think of to merge the options.
        let opts = defaults;
        if (options.dirName) opts.dirName = options.dirName;
        if (options.saveAs) opts.saveAs = options.saveAs;
        if (options.completed) opts.completed = options.completed;
        if (options.validFileTypes) opts.validFileTypes = options.validFileTypes;
        if (options.destination) opts.destination = options.destination;

        let documentReceiver = writable({ objectMode: true });

        // This `_write` method is invoked each time a new file is received
        // from the Readable stream (Upstream) which is pumping file streams
        // into this receiver.  (filename === `file.filename`).
        documentReceiver._write = async (file, encoding, done) => {

            var newFileName = opts.saveAs(file),
                fileSavePath = opts.dirName + newFileName,
                outputs = fs.createWriteStream(fileSavePath, encoding),
                isUploaded = true,
                message = "uploaded successfully.";

            // console.log("file", file);
            //console.log("encoding", encoding);
            const fileExt = path.extname(newFileName);
            var uploadFileExtension = fileExt;
            var uploadFileExtensionWithDot = "." + fileExt;


            /* // this section checks uploaded stream contains valid file type ,
             // if it is defined in requested options, else skip this
             if (opts.validFileTypes
                 && opts.validFileTypes.length
                 && (_.indexOf(opts.validFileTypes, uploadFileExtension) === -1
                 && _.indexOf(opts.validFileTypes, uploadFileExtensionWithDot) === -1)) {
                 fs.unlink(fileSavePath, (gcErr) => {
                     if (gcErr) {
                         return done(gcErr);
                     }
                     else {
                         console.log("in ser------")
                         isUploaded = false
                         message = "Please upload valid file types. e.g. " + opts.validFileTypes.join();
                         //return done(message)
                     }
                 });
             }*/


            // copy files into output dir
            file.pipe(outputs);

            // Garbage-collect the bytes that were already written for this file.
            // (called when a read or write error occurs)
            function gc(err) {
                sails.log.debug("Garbage collecting file '" + file.filename + "' located at '" + fileSavePath + "'");
                fs.unlink(fileSavePath, (gcErr) => {
                    if (gcErr) {
                        return done([err].concat([gcErr]));
                    } else {
                        return done(err);
                    }
                });
            };

            file.on('error', (err) => {
                // console.log("fileSavePath", fileSavePath,err);
                //  throw new Error('READ error on file ::', err)
                gc(err)
            });

            outputs.on('error', (err) => {
                //sails.log.error('failed to write file', file.filename, 'with encoding', encoding, ': done =', done);
                gc(err);
            });


            outputs.on('finish', async () => {
                const size = FileService.getFileSize(fileSavePath);
                if (size > sails.config.services.file.maxMegaBytes) {
                    isUploaded = false;
                    message = "Size of file exceed from " + sails.config.services.file.maxMegaBytes + " MB.";
                }

                sails.log.debug("file uploaded", fileSavePath)

                // copy file in temporary directory after upload file
                // if (isUploaded) {
                //     const dir = '.tmp/public/' + opts.destination + "/";
                //     const targetDir = await FileService.createDir(dir);
                //     targetDir ? fs.createReadStream(fileSavePath).pipe(fs.createWriteStream('.tmp/public/' + opts.destination + "/" + newFileName)) : "";


                // }

                var payload = {
                    uploaded: isUploaded,
                    name: file.filename,
                    size: file.size,
                    localName: newFileName,
                    path: fileSavePath,
                    message: message,
                    absolutePath: opts.destination + "/" + newFileName
                }
                opts.completed(payload, done);
            });
        };

        return documentReceiver;
    },

    /**
     * @description: getting size of file
     * @param path
     * @return {number}
     */
    getFileSize: (path) => {
        const stats = fs.statSync(path)
        const fileSizeInBytes = stats.size
        return fileSizeInBytes / 1000000.0 // convert into MB
    },

    /**
     * @description: ensure dir exists
     * @param path
     * @param mask
     * @param cb
     */
    createDir: async (targetDir) => {
        const sep = path.sep;
        const initDir = path.isAbsolute(targetDir) ? sep : '';
        targetDir.split(sep).reduce((parentDir, childDir) => {
            const curDir = path.resolve(parentDir, childDir);
            try {
                fs.mkdirSync(curDir);
            } catch (err) {
                if (err.code !== 'EEXIST') {
                    throw err;
                }
                //console.log(`Directory ${curDir} already exists!`);
            }

            return curDir;
        }, initDir);
        return targetDir;
    },

    /**
     * Read directory and return all files
     * @param path
     * @returns {Promise}
     */
    readdirAsync: async (path) => {
        return new Promise(function (resolve, reject) {
            fs.readdir(path, function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    },

    /**
     * Read file
     */
    readFileAsync: async (path) => {
        return new Promise(function (resolve, reject) {
            fs.readFile(path, 'utf8', (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    },

};