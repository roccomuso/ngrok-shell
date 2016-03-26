const notifier = require('node-notifier');
var ngrok = require('ngrok');
var args = require('./args-handler.js');


// TODO
// yargs:
// 		- port selection
// 		- email address (to notify ngrok URL)
//		or
//		- webhook URL  (to notify ngrok URL)


const PORT = 9090;

var app  = require('http').createServer(handler),
    url   = require('url'),
    fs    = require('fs'),
    spawn = require('child_process').spawn,
    io   = require('socket.io')(app);


var SOCKET_SERVER = 'http://localhost:'+PORT+'/';

function setupServer() {

	var shell_cmd = (process.platform == 'win32') ? 'cmd' : 'bash' ;

	io.on('connection', function (socket) {
		var log = function(s) {
			console.log(new Date()+" ["+socket.id+"]: "+s);
		};

		var bash = spawn(shell_cmd);
		log("shell launched, pid="+bash.pid);

		bash.stdout.on('data', function(data) {
			socket.emit('stdout', data.toString());
			console.log('# Output console: ',data.toString());
		});

		bash.stderr.on('data', function(data) {
			socket.emit('stderr', data);
		});

		bash.on('exit', function (code) {
			socket.emit('exit','--> done, exit code:'+code+'\n--> Refresh the page to start another session');
			log("bash pid="+bash.pid+" done");
		});

		// Handle new commands
		socket.on('message', function (data) {
			log('received: '+data);
			socket.emit('stdout', '$ '+data.toString()+'\n'); // echo back the command 

			bash.stdin.write(data);
			bash.stdin.write("\n");
		});

		// Handle special characters  
		socket.on('ctrl', function (data) {
			if(data.toString() == 'c') {
				log("received ctrl-c");
				socket.emit('stdout', '$ ^C\n');
				bash.kill('SIGKILL');
			}
			if(data.toString() == 'd') {
				log("received ctrl-d");
				socket.emit('stdout', '$ ^D\n');
	    	bash.stdin.end();
			}
			if(data.toString() == 'tab') {
				log("received tab");
				bash.stdin.write('\x09');
			}
		});

		socket.on('disconnect', function () {
			log("disconnected");
			bash.kill();
		});
	});
}

randomPath = '/';

// serve terminal.html if path match randomPath
function handler(req, resp){
	var uri = url.parse(req.url).pathname;
	if (uri != randomPath) {
		resp.writeHead(404, {'Content-Type':'text/html'});
		resp.end("<html><body><h1>404 - not found</h1></body></html>");
		return;
	}

	fs.readFile('terminal.html', 'binary',function(err, file){

	if (err) {
	  resp.writeHead(500, {'Content-Type':'text/plain'});
	  resp.end(err + "\n");
	  return;
	}
	file = file.replace('[SOCKET_URL]', SOCKET_SERVER); // ngrok url
	resp.writeHead(200);
	resp.write(file, 'binary');
	resp.end();

	});
 }

app.on('error', function (e) {
	if (e.code == 'EADDRINUSE') {
		console.log('Address in use, retrying...');
		setTimeout(function () {
			server.close();
			server.listen(PORT, HOST);
		}, 1000);
	}
});

app.on('listening', function () {
	console.log("Listening, browse to http://127.0.0.1:"+PORT+randomPath);
	setupServer();
});

app.listen(PORT);


// NGROK

//authtoken: 7BNbFLXaSj6Um7rpDtzZr_6VmcELFRnLiQX1T35EpQo

ngrok.connect(PORT, function (err, url) {
	if (err) return console.error(err);
	console.log(url);
	SOCKET_SERVER = url;
	//notifier.notify({title:'ngrok url', 'message':url});
});


