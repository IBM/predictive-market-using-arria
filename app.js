var cfenv = require( 'cfenv' );
var express = require( 'express' );
var jsonfile = require( 'jsonfile' );
var parser = require( 'body-parser' );
var request = require( 'request' );


// Bluemix
var env = cfenv.getAppEnv();
var config ={};
// if running locally
if (env.isLocal){
	console.log('running locally');
	// External configuration
	config = jsonfile.readFileSync( __dirname + '/config.json' );
	
} else {
	console.log('running in bluemix');
	config = jsonfile.readFileSync( __dirname + '/config.bluemix.json' );
	let vcap = env.services;
	//console.log(JSON.stringify(config));
	config.arria.key = vcap["user-provided"][0]["credentials"]["api_key"];
	config.arria.url = vcap["user-provided"][0]["credentials"]["api_url"];

	config.portfolio.url = vcap["fss-portfolio-service"][0]["credentials"]["url"];
	config.portfolio.reader.userid = vcap["fss-portfolio-service"][0]["credentials"]["reader"]["userid"];
	config.portfolio.reader.password = vcap["fss-portfolio-service"][0]["credentials"]["reader"]["password"];
	config.portfolio.writer.userid = vcap["fss-portfolio-service"][0]["credentials"]["writer"]["userid"];
	config.portfolio.writer.password = vcap["fss-portfolio-service"][0]["credentials"]["writer"]["password"];

	config.instrument.url = vcap["fss-scenario-analytics-service"][0]["credentials"]["uri"];
	config.instrument.token = vcap["fss-scenario-analytics-service"][0]["credentials"]["accessToken"];

	config.predictive.url =vcap["fss-predictive-scenario-analytics-service"][0]["credentials"]["uri"];
	config.predictive.token =vcap["fss-predictive-scenario-analytics-service"][0]["credentials"]["accessToken"];

	console.log(JSON.stringify(config));
}


// Application
var app = express();

// Middleware
app.use( parser.json() );
app.use( parser.urlencoded( { 
	extended: false 
} ) );

// Per-request actions
app.use( function( req, res, next ) {	
	// Configuration
	req.config = config;
	
	// Just keep swimming
	next();
} );

// Static for main files
app.use( '/', express.static( 'public' ) );

// Routes
app.use( '/api', require( './routes/prospectus' ) );



// Listen
var server = app.listen( env.port, env.bind, function() {
	// Debug
	console.log( 'Started on: ' + env.port );
} );
