'use strict';

/**
 * Data Model
 * var user = {
 * "firstName": 'Phi',
 * "lastName": 'Tran',
 * "username": 'ptran',
 * "password": 'test'
 * };
 *
 * var calendar = {
 * "date": '',
 * "month": '',
 * "day": '',
 * "year": '',
 * "isWeekend": '',
 * "isHoliday": '',
 * "description": ''
 * };
 *
 * var schedule = {
 * "userId": '',
 * "calendarId": ''
 * };
 */

const moment = require('moment');
const _uniq = require('lodash/uniq');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/support-schedule';

/**
 * Holidays https://www.ftb.ca.gov/aboutFTB/holidays.shtml
 */
function getHoliday(currentDate) {
    const holidays = {
        "New Year's Day": moment('2016-01-01'),
        "Martin Luther King Jr. Day": moment('2016-01-18'),
        "Presidents Day": moment('2016-02-15'),
        "Cesar Chavez Day": moment('2016-03-31'),
        "Memorial Day": moment('2016-05-30'),
        "Independence Day": moment('2016-07-04'),
        "Labor Day": moment('2016-09-05'),
        "Veterans Day": moment('2016-11-11'),
        "Thanksgiving Day": moment('2016-11-24'),
        "Day after Thanksgiving": moment('2016-11-25'),
        "Day after Christmas": moment('2016-12-26')
    };

    for (var i in holidays) {
        if (holidays[i].isSame(currentDate)) {
            return i;
        }
    }

    return null;
}

// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
    console.log("Connected correctly to server:", db.s.databaseName);

    //reset collections
    db.dropCollection("users");
    db.dropCollection("calendar");
    db.dropCollection("schedule");

    /**
     * POPULATE CALENDAR
     * clone first day of year. Keep adding 1 day
     * until currentMoment equals yearLast
     * 0 = Sunday; 6 = Saturday
     * @type {Promise.<T>}
     */
    var populateCalendar = db.createCollection("calendar").then(collection => {
        const yearFirst = new moment([2016, 0]).startOf('month').hour(0).minute(0).seconds(0).milliseconds(0);
        const yearLast = new moment([2016, 11]).endOf('month').hour(0).minute(0).seconds(0).milliseconds(0);
        const currentMoment = yearFirst.clone();
        let dates = [];

        for (var i = 0; !currentMoment.isSame(yearLast); i++) {
            currentMoment.add(1, 'd');

            let isHoliday = getHoliday(currentMoment);
            let currentDate = {
                date: new Date(currentMoment.toISOString()),
                month: parseInt(currentMoment.format('M')),
                day: parseInt(currentMoment.format('D')),
                year: parseInt(currentMoment.format('YYYY')),
                isWeekend: (currentMoment.day() === 0 || currentMoment.day() === 6),
                isHoliday: !!isHoliday,
                description: isHoliday ? isHoliday : ''
            };

            dates.push(currentDate);
        }

        return collection.insertMany(dates);
    });

    /**
     * POPULATE USERS
     * @type {Promise.<T>}
     */
    var populateUsers = db.createCollection("users").then((collection) => {
        const users = ["Sherry", "Boris", "Vicente", "Matte", "Jack", "Sherry",
            "Matte", "Kevin", "Kevin", "Vicente", "Zoe", "Kevin",
            "Matte", "Zoe", "Jay", "Boris", "Eadon", "Sherry",
            "Franky", "Sherry", "Matte", "Franky", "Franky", "Kevin",
            "Boris", "Franky", "Vicente", "Luis", "Eadon", "Boris",
            "Kevin", "Matte", "Jay", "James", "Kevin", "Sherry",
            "Sherry", "Jack", "Sherry", "Jack"];
        let allUsers = [];

        _uniq(users).forEach((value, index) => {
            let currentUser = {name: value, username: value.toLowerCase(), password: 'test'};

            allUsers.push(currentUser);
        });

        return collection.insertMany(allUsers);
    });

    /**
     * Resolve all promises
     * loop through all days in calendar
     * if workday, create schedule record. If 40th scheduled day
     * reset user count
     */
    Promise.all([populateCalendar, populateUsers]).then(value => {
        let days = value[0].ops;
        let users = value[1].ops;
        let allSchedule = [];
        let userIndex = 0;

        days.forEach((value, index) => {
            userIndex++;
            userIndex = userIndex <= users.length ? userIndex : 1;

            var currentSchedule = {
                userId: (value.isWeekend || value.isHoliday) ? null : users[userIndex - 1]._id,
                calendarId: value._id
            };

            allSchedule.push(currentSchedule);
        });

        db.collection("schedule", null, (err, collection) => {
            collection.insertMany(allSchedule).then(value => {
                console.log('data load complete');
                db.close();
            });
        });
    }).catch((err) => {
        console.log(err);

        db.dropCollection("users");
        db.dropCollection("calendar");
        db.dropCollection("schedule");

        db.close();
    });
});