var argv = require('yargs')
  .usage('Usage: ngrok-shell -p [port]')
  .help('help')
  .alias('help', 'h')
  .option('port', {
        alias: 'p',
        demand: true,
        describe: 'HTTP Server Port.',
        type: 'number'
    })
  .option('email', {
        alias: 'e',
        demand: false,
        describe: 'Notification Email.',
        type: 'string'
    })
  .option('webhook', {
        alias: 'w',
        demand: false,
        describe: 'Callback URL.',
        type: 'string'
    })
  .example('ngrok-shell -p 9090', 'Execute server on the selected port')
  .example('ngrok-shell -p 9090 -e my-email@gmail.com', 'Execute server and send the ngrok URL to the given email address')
  .example('ngrok-shell -p 9090 -w http://website.com/post', 'Set a webHook URL to call back once the ngrok URL is generated')
  .epilogue('@Author: Rocco Musolino - github.com/roccomuso/ngrok-shell - @Copyright 2016')
  .argv;

//console.log(argv);

module.exports = argv;