var RandomColor = require('just.randomcolor');

module.exports = function(Project) {
  Project.beforeRemote('create', function(context, user, next) {
    var req = context.req;
    if(req.body.color == null) {
      var color = new RandomColor();
      req.body.color = color.toHex().value;
    }
    next();
  });
};
