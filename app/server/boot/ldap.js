module.exports = function(app) {
  if(app.get('ldap')) {
    var ldapConfig = app.get('ldap');

    var collaborator = app.models.collaborator;

    var ActiveDirectory = require('activedirectory');
    var config = { url: 'ldap://'+ldapConfig.host,
      baseDN: ldapConfig.basedn,
      username: ldapConfig.login,
      password: ldapConfig.password
    };


    var _ = require('underscore');
    var query = ldapConfig.ldapFilter;
    var opts = {
      includeMembership : 'all', // Optionally can use 'all'
      includeDeleted : false
    };

    var ad = new ActiveDirectory(config);
    ad.find(query, function(err, results) {
      if ((err) || (! results)) {
        console.log('ERROR: ' + JSON.stringify(err));
        return;
      }

      _.each(results.users, function(user) {
        if(user.mail) {
          collaborator.find({"where": {"email": user.mail}}, function (err, account) {
            if(account.length == 0) {
              var firstname = user.givenName;
              var lastname = user.cn.replace(firstname+" ", "");
              collaborator.create( {
                "email": user.mail,
                "lastName": firstname,
                "firstName": lastname,
                "name": user.displayName,
                "password": "12135465465"
              }, function(err, account) {
                console.log(account);
              });
            }
          });
        }
      });
    });
  }
};
