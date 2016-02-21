Support Scheduler
=====

## Getting started
brew install mongodb
node
npm install


API
GET /services/users
Returns array of users
[{"_id":"56c8a0273084cd793ca7eb9e","name":"Sherry","username":"Sherry","password":"test"},...]

GEt /services/users/{userId}
Returns object of user
{"_id":"56c8a0273084cd793ca7eb9e","name":"Sherry","username":"Sherry","password":"test"}

GET /services/calendar?startDate=&endDate=
//returns array of dates
startDate/endDate needs to be ISO 8601 format
[{"_id":"56c8a0283084cd793ca7ed32","date":"2016-12-31T08:00:00.000Z","month":"12","day":"31","year":"2016","isWeekend":true,"isHoliday":false,"description":""},...]

GEt /services/schedule?month=
returns array of schedule of a month
month is required

GET /services/schedule/{userId}?month=
returns array of schedule of a month for a user
month is required
[{ _id: 56c8d4e1446df3ba438e45d1,
     userId: 56c8d4e1446df3ba438e45a9,
     calendarId: 56c8d4e1446df3ba438e4442,
     supportHero_userId: 56c8d4e1446df3ba438e45a9,
     day: 
      { _id: 56c8d4e1446df3ba438e4442,
        date: Sun Jan 31 2016 00:00:00 GMT-0800 (PST),
        month: 1,
        day: 31,
        year: 2016,
        isWeekend: false,
        isHoliday: false,
        description: '' },
     suppertHero: 
      { _id: 56c8d4e1446df3ba438e45a9,
        name: 'Kevin',
        username: 'Kevin',
        password: 'test' },
     user: 
      { _id: 56c8d4e1446df3ba438e45a9,
        name: 'Kevin',
        username: 'Kevin',
        password: 'test' } }, ...]


POST /services/schedule/swap
payload: {
    originSchedule
    targetSchedule
}
Ids of target. 
Return update values as object

POST /services/schedule/undoable
payload: {
    schedule: schedule object
}