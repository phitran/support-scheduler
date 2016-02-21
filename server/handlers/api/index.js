const userApiHandlers = require('./userHandler');
const calendarApiHandlers = require('./calendarHandler');
const scheduleApiHandlers = require('./scheduleHandler');

module.exports = {
    getUserHandler: userApiHandlers.getUserHandler,
    getCalendarHandler: calendarApiHandlers.getCalendarHandler,
    getScheduleHandler: scheduleApiHandlers.getScheduleHandler,
    swapScheduleHandler: scheduleApiHandlers.swapScheduleHandler,
    cancelScheduleHandler: scheduleApiHandlers.cancelScheduleHandler
};