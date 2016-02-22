const scheduleApiHandlers = require('./scheduleHandler');

module.exports = {
    getScheduleHandler: scheduleApiHandlers.getScheduleHandler,
    swapScheduleHandler: scheduleApiHandlers.swapScheduleHandler,
    undoableScheduleHandler: scheduleApiHandlers.undoableScheduleHandler
};