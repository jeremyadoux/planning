module.exports = function(Collaborator) {
  Collaborator.beforeRemote('create', function(context, user, next) {
    var req = context.req;
    if(req.body.name == null) {
      req.body.name = req.body.lastName + " " + req.body.firstName;
    }
    next();
  });
};
