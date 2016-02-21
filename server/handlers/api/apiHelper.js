'use strict';

const Boom = require('boom');
const mongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/support-schedule';

function queryCollection(collection, options) {
    return new Promise((resolve, reject) => {
        mongoClient.connect(url, (err, db) => {
            if (err) {
                reject(Boom.badRequest(err));
            }

            db.collection(collection).find(options).toArray((err, items) => {
                if (err) {
                    db.close();
                    reject(Boom.badRequest(err));
                }

                db.close();
                resolve(items);
            });
        });
    });
}

function updateDocument(collection, filter, options) {
    return new Promise((resolve, reject) => {
        mongoClient.connect(url, (err, db) => {
            if (err) {
                reject(Boom.badRequest(err));
            }

            return db.collection(collection).updateOne(filter, options).then(value => {
                return db.collection(collection).find(filter).limit(1).next((err, document) => {
                    if (err) {
                        reject(Boom.badRequest(err));
                    }

                    resolve(document);
                    db.close();
                });
            }, err => {
                reject(err);
                db.close();
            });
        });
    });
}

function aggregateScheduleCollection(matchers) {
    let pipeline = [
        {
            $lookup: {
                from: 'calendar',
                localField: 'calendarId',
                foreignField: '_id',
                as: 'day'
            }
        },
        {
            $unwind: '$day'
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $unwind: '$user'
        }
    ];

    //merge matchers into pipline
    pipeline = pipeline.concat(matchers);

    return new Promise((resolve, reject) => {
        mongoClient.connect(url, function (err, db) {
            if (err) {
                reject(Boom.badRequest(err))
            }

            db.collection('schedule').aggregate(pipeline, (err, result) => {
                if (err) {
                    reject(Boom.badRequest(err))
                }

                db.close();
                resolve(result);
            })
        });
    });
}

module.exports = {
    queryCollection: queryCollection,
    updateDocument: updateDocument,
    aggregateScheduleCollection: aggregateScheduleCollection
};