module.exports = function(Planning) {
  Planning.beforeRemote('create', function(context, user, next) {
    var req = context.req;

    for(var i = 0; i < req.body.length; i++) {
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
