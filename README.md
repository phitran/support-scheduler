Support Schedule
=====

[![Build Status](https://travis-ci.org/phitran/support-scheduler.svg?branch=master)](https://travis-ci.org/phitran/support-scheduler)

Small exercise built on AngularJS and Hapijs. A web client that shows support user's schedules with a Node api backend.

1. Display today’s Support person
2. Display a single user’s schedule for the year and schedule for the current month
4. Users are able to mark one of their days on duty as undoable. This will randomly select a schedule from the following month and swap
5. Users are able to swap duty with another user in the same month.

## Getting started
#### Node ^4.2 and NPM
Visit http://nodejs.org to install both.

#### Project
Get the project source and install dependencies: ```$ git clone https://github.com/phitran/support-scheduler.git [dest dir]```

#### MongoDB 3.2
Visit https://www.mongodb.org/downloads#production to download and install. Other options are using HomeBrew. ```shell $ brew install mongodb```

Once installed, mongodb can be started with this command (more help here: https://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/):

```shell
$ mongod --config /usr/local/etc/mongod.conf
```
## Building the application
This project uses Gulp for building the project files. It takes care of all the various tasks
such as merging to a single file, expansion and compression, cleaning, etc. There is also a script to populate MongoDB with test data:

```shell
$ npm install --g gulp
```

Download and initialize the dependencies from npm (note: through npm's postinstall hook, ```npm gulp --production``` will be ran automatically):

```shell
$ npm install
```

Populate MongoDB with users and schedules (make sure your MongoDB is running!):

```shell
gulp init
```

Gulp is configured to have several build modes to help with various development tasks. Running Gulp by itself, will build the application in development mode. Javascript and CSS files will not be minimized.

```shell
$ gulp
```

If production build is desired, run the gulp production command. Files will be minified, compressed, obfuscated, and put through several other processes to make the files footprints minimal and general unhelpful for development purposes.

```shell
$ gulp --production
```

## Running the application

Run the node server to see the site locally(localhost:8080):

```shell
$ npm start
```

The app requires you to login, you may login to any one of these users with the password ```test```: 
* sherry
* boris
* vicente
* matte
* jack
* kevin
* zoe
* jay
* eadon
* franky
* luis
* james

## Running Tests

The application is configured to run tests using Karma and the assertion library Jasmine. Karma is installed with the `npm install`. To run the tests:

```shell
$ npm test
```

This will launch the Karma test runner with the `karma.conf.js` file. By default the configuration only tests with the faster, headless, phantomJS browser. See the [Karma configuration docs](http://karma-runner.github.io/0.12/config/configuration-file.html) for more options.

Running with PhantomJS isn't required, but recommended for speed in development cycle.

## Future Plans/To-dos
* Make username field unique on Mongodb
* salt/hash passwords on Mongodb. add Server decoder
* Server unit tests
* Create test fixtures instead of inline
* Split out user's schedule from calendar view
* add validation for api requests
* Ability to cycle through months
* API validation on request

## API

#### Schedule Object Example

```json
[
    {
        "_id": "56c8d4e1446df3ba438e45d1",
        "userId": "56c8d4e1446df3ba438e45a9",
        "calendarId": "56c8d4e1446df3ba438e4442",
        "day": {
            "_id": "56c8d4e1446df3ba438e4442",
            "date": "Sun Jan 31 2016 00:00:00 GMT-0800 (PST)", // ISO 8601
            "month": 1,
            "day": 31,
            "year": 2016,
            "isWeekend": false,
            "isHoliday": false,
            "description": ""
        },
        "user": {
            "_id": "56c8d4e1446df3ba438e45a9",
            "name": "Kevin",
            "username": "Kevin"
        }
    },
    ...
]
```

#### GET Schedule

```GET /services/schedule```

Required query params:
* startDate
* endDate

Response: ```[<Schedule Object>, ...]```

#### GET User's Schedule
```GET /services/schedule/{userId}```

Required query params:
* startDate
* endDate

Response: ```[<Schedule Object>, ...]```

#### POST Schedule Swap
```POST /services/schedule/swap```

Required payload:
```json
{
    "originSchedule": <Schedule Object>
    "targetSchedule": <Schedule Object>
}
```

Response:
```json
{
     "originSchedule": <Schedule Object>
     "targetSchedule": <Schedule Object>
}
```

#### POST Schedule Swap
```POST /services/schedule/undoable```

Required payload:
```json
{
    "schedule": <Schedule Object>
}
```

Response:
```json
{
     "originalSchedule": <Schedule Object>
     "newSchedule": <Schedule Object>
}
```
