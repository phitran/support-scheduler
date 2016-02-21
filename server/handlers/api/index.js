const userApiHandlers = require('./user');
const calendarApiHandlers = require('./calendar');
const scheduleApiHandlers = require('./schedule');

module.exports = {
    getUser: userApiHandlers.getUser,
    getCalendar: calendarApiHandlers.getCalendar,
    getSchedule: scheduleApiHandlers.getSchedule,
    swapSchedule: scheduleApiHandlers.swapSchedule,
    cancelSchedule: scheduleApiHandlers.cancelSchedule
};