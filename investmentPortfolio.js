var request = require( 'request-promise' );
var fs = require( 'fs-extra' );
require('dotenv').config();


READER_USER_ID = process.env.CRED_PORTFOLIO_USERID_R;
READER_PASSWORD = process.env.CRED_PORTFOLIO_PWD_R;
WRITER_USER_ID = process.env.CRED_PORTFOLIO_USERID_W;
WRITER_PASSWORD = process.env.CRED_PORTFOLIO_PWD_W;

/*
READER_USER_ID = ""
READER_PASSWORD = ""
WRITER_USER_ID = ""
WRITER_PASSWORD = ""
*/

BASE_URL = "https://investment-portfolio.mybluemix.net/"


function getPortfolio() {
  //get portoflios
  console.log('get portfolios');
  var hash = null;

  // Request
  request( {
    method: 'GET',
    url: BASE_URL + 'api/v1/portfolios',
    auth: {
      username: READER_USER_ID,
      password: READER_PASSWORD
    },
    headers: {
      'Content-Type': 'application/json'
    }
  } ).then( function( body ) {
    console.log(body);
    return body;
  } ).catch( function( err ) {
    console.log( err );
  } );
}

function getPortfolioHoldings(portfolio) {
  //get holdings for the portfolio
  console.log('get holdings');
  request( {
    method: 'GET',
    url: BASE_URL + 'api/v1/portfolios/' + portfolio + '/holdings',
    auth: {
      username: READER_USER_ID,
      password: READER_PASSWORD
    },
    headers: {
      'Content-Type': 'application/json'
    },
    qs: { latest: 'true' },
  } ).then( function( body ) {
    console.log( body );
    return body;
  } ).catch( function( err ) {
    console.log( err );
  } );
}


function loadPortfolio(portfolioName) {
  //load portfolio
  console.log('load portfolios');
  var hash = null;
  var timeStamp = +new Date

  // Request
  request( {
    method: 'POST',
    url: BASE_URL + 'api/v1/portfolios/',
    auth: {
      username: WRITER_USER_ID,
      password: WRITER_PASSWORD
    },
    json: {
      timestamp: timeStamp,
      name: portfolioName,
      closed: false,
      data: {
        manager: 'Will Smith'
      }
    }
  } ).then( function( body ) {
    console.log(body);
  } ).catch( function( err ) {
    console.log( err );
  } );

}

function loadPortfolioHoldings(portfolio, holdingsJsonFile) {
  //load holdings into portfolo
  var timeStamp = +new Date

  fs.readFile( holdingsJsonFile, 'utf8' )
  .then( function( body ) {
    var data = JSON.parse( body );
    return request( {
      method: 'POST',
      url: BASE_URL + 'api/v1/portfolios/' + portfolio + '/holdings',
      auth: {
        username: WRITER_USER_ID,
        password: WRITER_PASSWORD
      },
      json: {
        timestamp: timeStamp,
        holdings: data.holdings
      }
    } );
  } ).then( function( body ) {
    console.log(body);
  } ).catch( function( err ) {
    console.log( err );
  } );
}

//get command-line args
const args = process.argv

//perfrom call based on command-line args
if (args[2]) {
  if (args[2] == '-l' ) {
    //load
    if(args[3]) {
      //get portfolio name
      var portfolioName = args[3];
      if(args[4]) {
        if (args[4] == '-h') {
          if(args[5]) {
            //load holdings
            var holdingsJsonFile = args[5];

            fs.exists(holdingsJsonFile, function(exists) {
              if (exists) {
                loadPortfolioHoldings(portfolioName, holdingsJsonFile);
              } else {
                console.log(holdingsJsonFile + ": no such file");
              }
            });
          }
        } else {
          console.log ('Try -h')
        }
      } else {
        //load portfolio
        console.log("load p " + portfolioName);
        loadPortfolio(portfolioName);
      }
    }
    else {
      console.log('Enter portfolio name')
    }
  } else if (args[2] == '-g' ) {
    //get
    if(args[3]) {
      portfolioName = args[3];
      getPortfolioHoldings(portfolioName);
    }
    else {
      getPortfolio();
    }

  } else if (args[2] == '-d' ) {
    deleteAllPortfolioHoldings();
  } else {
    console.log('Try -l or -g')
  }
}  else {
  console.log('sTry -l or -g')
}
