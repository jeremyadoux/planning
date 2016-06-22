var moment = require('moment');

module.exports = function(Planning) {
  Planning.beforeRemote('create', function(context, user, next) {
    var req = context.req;

    for(var i = 0; i < req.body.length; i++) {
      //Transform in simplified date to use in front more easy for the calendar creation
      var momentDate = moment(req.body[i].date);
      req.body[i].dateSimplified = momentDate.year().toString() + (momentDate.month() + 1).toString() + momentDate.date().toString();

      var filterWhere = {
        "date": req.body[i].date,
        "collaboratorId": req.body[i].collaboratorId
      };
      Planning.destroyAll(filterWhere, function(err, info) {
      });
    }

    next();
  });
};
