require('dotenv').config();

var cfenv = require( 'cfenv' );
var express = require( 'express' );
var jsonfile = require( 'jsonfile' );
var parser = require( 'body-parser' );
var request = require( 'request' );

var vcapServices = require('vcap_services');

// Bluemix
var env = cfenv.getAppEnv();
var config ={};

config = jsonfile.readFileSync( __dirname + '/config.bluemix.json' );

//arria narrative credentials
var arriaCredentials = vcapServices.getCredentials('user-provided');
config.arria.key = arriaCredentials.api_key||process.env.CRED_ARRIA_NATURAL_LANGUAGE_GENERATION_KEY;
config.arria.url = arriaCredentials.api_url||process.env.CRED_ARRIA_NATURAL_LANGUAGE_GENERATION_URL;

//investment portfolio credentials
var portfolioCredentials = vcapServices.getCredentials('fss-scenario-analytics-service');
config.portfolio.url = portfolioCredentials.url||process.env.CRED_PORTFOLIO_URL;
if (portfolioCredentials.reader) {
	config.portfolio.reader.userid = portfolioCredentials.reader.userid;
	config.portfolio.reader.password = portfolioCredentials.reader.password;
} else {
	config.portfolio.reader.userid = process.env.CRED_PORTFOLIO_USERID_R;
	config.portfolio.reader.password = process.env.CRED_PORTFOLIO_PWD_R;
}

if (portfolioCredentials.writer) {
	config.portfolio.writer.userid = portfolioCredentials.writer.userid;
	config.portfolio.writer.password = portfolioCredentials.writer.password;
} else {
	config.portfolio.writer.userid = process.env.CRED_PORTFOLIO_USERID_W;
	config.portfolio.writer.password = process.env.CRED_PORTFOLIO_PWD_W;
}

//simulated instrument analytics credentials
var instrumentCredentials = vcapServices.getCredentials('fss-scenario-analytics-service');
config.instrument.url = instrumentCredentials.uri||process.env.CRED_SIMULATED_INSTRUMENT_ANALYTICS_URL;
config.instrument.token = instrumentCredentials.accessToken||process.env.CRED_SIMULATED_INSTRUMENT_ANALYTICS_ACCESSTOKEN;

//predictive scenario credentials
var predictiveCredentials = vcapServices.getCredentials('fss-predictive-scenario-analytics-service');
config.predictive.url = predictiveCredentials.uri||process.env.CRED_PREDICTIVE_MARKET_SCENARIO_URL;
config.predictive.token = predictiveCredentials.accessToken||process.env.CRED_PREDICTIVE_MARKET_SCENARIO_ACCESSTOKEN;

console.log(JSON.stringify(config));


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
