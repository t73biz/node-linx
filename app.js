var app		= require('express')(),
	routes	= require('./routes'),
	server	= require('http').createServer(app),
	io		= require('socket.io').listen(server),
	path	= require('path'),
	request = require('request'),
	jsdom	= require('jsdom');

app.configure(
	function()
	{
		app.set('port', process.env.PORT || 3000);
		app.set('views', __dirname + '/views');
		app.set('view engine', 'jade');
		app.use(app.router);
	}
);

app.get('/', routes.index);

server.listen(
	app.get('port'),
	function()
	{
		console.log("Express server listening on port " + app.get('port'));
	}
);

io.sockets.on(
	'connection',
	function (socket)
	{
		socket.emit(
			'hello',
			{
				hello: 'The Linx Browser is ready.<br />Type in a fully qualified domain name to retrieve.'
			}
		);
		socket.on(
			'page-request',
			function (data)
			{
				request(
					{
						uri : data.host
					},
					function (error, response, body)
					{
						if (error)
						{
							console.log('Error when contacting: ' + data.host);
							console.log(error);
						}
						else
						{
							socket.emit(
								'page-response',
								{
									response : parse(body)
								}
							);
	  					}
					}
				);
			}
		);
	}
);

var parse = function(body)
{
	var content = '';

	jsdom.env({
		html	: body,
		scripts : ['http://code.jquery.com/jquery-1.8.1.min.js'],
		done	: function (error, window)
				{
					if(error)
					{
						console.log(error);
					}
					else
					{
						var $ = window.jQuery;
						$('img, select, input, button, iframe, script').remove();
						content = $('body').html();
						return content;
					}
				}
	});
}
