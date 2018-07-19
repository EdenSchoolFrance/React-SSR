#!/usr/bin/env node

require('ignore-styles');
var Path    = require('path');
var program = require('commander');
var pjson   = require('../package.json');

var App;

program
  .version(pjson.version)
  .arguments('<file>')
  .option('-p, --port <port>', 'Specify the listen port', parseInt, process.env.PORT || 3000)
  .option('-b, --buildPath <path>', 'Specify the build path', process.env.BUILD_PATH || '/build')
  .option('-c, --babelConfigPath <path>', 'Specify the babel config file path (absolute)', Path.resolve(__dirname, '..', 'babel-config.js'))
  .action(function (file, cmd) {
    process.env.BUILD_PATH = cmd.buildPath;
    process.env.PORT = cmd.port;

    var config = require(Path.resolve(process.cwd(), cmd.babelConfigPath));

    console.log(config)

    require('babel-register')(config);

    app = require(Path.resolve(process.cwd(), file)).default;
  })
  .parse(process.argv);


if (!app) {
  console.error('no app given!');
  process.exit(1);
}


// Why don't I need http createServer
app.listen(program.port, ()=>{
  console.log(`App listening on port ${program.port}!`);
  app.emit('listening', program.port)
});

app.on('error', onError);

process.on('unhandledRejection', (reason, promise) => {
	console.log(reason, promise)
});

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  };

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}
