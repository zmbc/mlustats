/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */
var path = require('path');
var pkgJSON = require(path.resolve('package.json'));
var winston = require('winston');
require('winston-mail').Mail;
module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the production        *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  // models: {
  //   connection: 'someMysqlServer'
  // },

  /***************************************************************************
   * Set the port in the production environment to 80                        *
   ***************************************************************************/

  // port: 80,

  /***************************************************************************
   * Set the log level in production environment to "silent"                 *
   ***************************************************************************/

    log: {
      level: 'silent',
      transports: [
        {
          module: require('winston-daily-rotate-file'),
          config: {
            dirname: path.resolve('logs'),
            datePattern: '.yyyy-MM-dd.log',
            filename: pkgJSON.name,
            prettyPrint: true,
            timestamp: true,
            level: 'silly'
          }
        },
        {
          module: winston.transports.Mail,
          config: {
            level: 'warn',
            to: 'zmbc@uw.edu',
            host: 'smtp.gmail.com',
            port: 465,
            ssl: true,
            username: process.env.GMAIL_USERNAME,
            password: process.env.GMAIL_PASSWORD
          }
        }
      ]
   }

};
