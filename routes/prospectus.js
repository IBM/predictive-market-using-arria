var backoff = require('promise-retry');
var express = require('express');
var fs = require('fs-extra');
var randomstring = require('randomstring');
var request = require('request-promise');
var jsonfile = require('jsonfile');
var arriaRequestBuilder = require('../arriaHelpers/arriaRequestBuilder');

// Router
var router = express.Router();

// Generate text content
router.post('/arria', function(req, res) {
  console.log('getting narrative');

  var csv = req.body.model;
  var keyFactorsReadStream = fs.createReadStream('factors.csv');
  var modelReadStream = fs.createReadStream(csv);
  var vcvReadStream = fs.createReadStream('vcv.csv');
  var scenarioDef = {
    inputRiskFactorId: req.body.factor,
    inputRiskFactorName: req.body.risk,
    inputMagnitudePercentage: req.body.shock
  };

  arriaRequestBuilder.makeExtract(keyFactorsReadStream, modelReadStream, vcvReadStream, scenarioDef, req.body.holdings).then(
    function(extract) {
      fs.unlink(csv);
      console.log(extract);
      console.log('sending extract to arria...');
      request({
        method: 'POST',
        url: req.config.arria.url,
        headers: {
          'content-type': 'application/json',
          'x-api-key': req.config.arria.key
        },
        body: extract,
        json: true
      }).then(function(body) {
        res.json(body);
      }).catch(function(err) {
        console.log(err);
      });
    }).fail(function(err) {
    console.log(err);
  });


});

// List holdings
router.get('/holdings', function(req, res) {
  console.log('get holdings');
  request({
    method: 'GET',
    url: req.config.portfolio.url + 'api/v1/portfolios/' + req.query.portfolio + '/holdings',
    auth: {
      username: req.config.portfolio.reader.userid,
      password: req.config.portfolio.reader.password
    },
    headers: {
      'Content-Type': 'application/json'
    },
    qs: {
      latest: 'true'
    },
  }).then(function(body) {
    res.send(body);
  }).catch(function(err) {
    console.log(err);
  });
});

// Create holdings
router.post('/holdings', function(req, res) {
  fs.readFile('holdings.kevin.json', 'utf8')
    .then(function(body) {
      var data = JSON.parse(body);
      return request({
        method: 'POST',
        url: req.config.portfolio.url + 'api/v1/portfolios/' + req.body.portfolio + '/holdings',
        auth: {
          username: req.config.portfolio.writer.userid,
          password: req.config.portfolio.writer.password
        },
        json: {
          timestamp: data.timestamp,
          holdings: data.holdings
        }
      });
    }).then(function(body) {
      res.send(body);
    }).catch(function(err) {
      console.log(err);
    });
});

// Delete holdings
router.delete('/holdings', function(req, res) {
  request({
    method: 'GET',
    url: req.config.portfolio.url + 'api/v1/portfolios/' + req.query.portfolio + '/holdings',
    auth: {
      username: req.config.portfolio.reader.userid,
      password: req.config.portfolio.reader.password
    }
  }).then(function(body) {
    var data = JSON.parse(body);
    var url =
      req.config.portfolio.url +
      'api/v1/portfolios/' +
      req.query.portfolio +
      '/holdings/' +
      data.holdings[0].timestamp +
      '?rev=' +
      data.holdings[0]._rev;

    return request({
      method: 'DELETE',
      url: url,
      auth: {
        username: req.config.portfolio.writer.userid,
        password: req.config.portfolio.writer.password
      }
    });
  }).then(function(body) {
    res.send(body);
  }).catch(function(err) {
    console.log(err);
  });
});

router.post('/instrument', function(req, res) {
  console.log('simulate instruments');
  var instruments = [];

  for (var h = 0; h < req.body.holdings.length; h++) {
    instruments.push(req.body.holdings[h].instrumentId);
  }

  request({
    method: 'POST',
    url: req.config.instrument.url + 'api/v1/scenario/instruments',
    headers: {
      'X-IBM-Access-Token': req.config.instrument.token
    },
    formData: {
      scenario_file: fs.createReadStream(req.body.model),
      instruments: instruments.join(',')
    }
  }).then(function(body) {
    console.log('updating holdings');
    let data = JSON.parse(body);

    for (var h = 0; h < req.body.holdings.length; h++) {
      for (var i = 0; i < data.length; i++) {
        if (req.body.holdings[h].instrumentId == data[i].instrument) {
          let parts = data[i].values[0]['THEO/Price'].split(' ');

          req.body.holdings[h].currency = parts[1].trim();

          if (data[i].scenario.indexOf('Base') >= 0) {
            req.body.holdings[h].base = parseFloat(parts[0].trim());
          } else {
            req.body.holdings[h].predicted = parseFloat(parts[0].trim());
          }
        }
      }
    }

    return fs.readFile(req.body.model, 'utf8');
  }).then(function(data) {
    console.log('getting factor changes');
    let rows = data.split('\n');
    var cells = null;
    var conditions = [];

    for (var r = 1; r < rows.length; r++) {
      let cells = rows[r].split(',');

      if (cells.length > 14) {
        let condition = {
          risk: cells[5],
          factor: cells[5],
          stressed: parseFloat(cells[13])
        };

        for (var f = 0; f < router.risk.length; f++) {
          if (router.risk[f][condition.factor] && condition.stressed != 1) {
            condition.risk = router.risk[f][condition.factor];
            conditions.push(condition);
          }
        }
      }
    }

    res.json({
      holdings: req.body.holdings,
      conditions: conditions,
      model: req.body.model
    });
  }).catch(function(err) {
    console.log(err);
  });
});

// Login
router.post('/login', function(req, res) {
  console.log('try login');
  var success = false;

  if (req.config.login.email == req.body.email && req.config.login.password == req.body.password) {
    success = true;
  }

  res.json({
    success: success
  });
});

// List portfolios
router.get('/portfolio', function(req, res) {
  console.log('get portfolios');
  var hash = null;

  // Request token
  request({
    method: 'GET',
    url: req.config.portfolio.url + 'api/v1/portfolios',
    auth: {
      username: req.config.portfolio.reader.userid,
      password: req.config.portfolio.reader.password
    },
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(function(body) {
    console.log(body);
    res.send(body);
  }).catch(function(err) {
    console.log(err);
  });
});

// Create portfolio
router.post('/portfolio', function(req, res) {
  var hash = null;

  // Request token
  request({
    method: 'POST',
    url: req.config.portfolio.url + 'api/v1/portfolios',
    auth: {
      username: req.config.portfolio.writer.userid,
      password: req.config.portfolio.writer.password
    },
    json: {
      name: 'Retirement Portfolio',
      timestamp: '2017-02-22T19:53:56.830Z',
      closed: false,
      data: {
        manager: 'Will Smith'
      }
    }
  }).then(function(body) {
    res.send(body);
  }).catch(function(err) {
    console.log(err);
  });
});

// Generate predictive model
router.post('/predict', function(req, res) {
  console.log('create scenario');
  let csv = null;

  backoff(function(retry, count) {
    return request({
      method: 'POST',
      url: req.config.predictive.url + 'api/v1/scenario/generate_predictive',
      headers: {
        'X-IBM-Access-Token': req.config.predictive.token
      },
      json: {
        market_change: {
          risk_factor: req.body.risk,
          shock: req.body.shock
        }
      }
    }).catch(retry);
  }).then(function(body) {
    csv = randomstring.generate() + '.csv';
    return fs.writeFile(csv, body);
  }).then(function(body) {
    res.json({
      model: csv
    });
  }).catch(function(err) {
    console.log(err);
  });
});

// List risk factors
router.get('/risk', function(req, res) {
  res.json(router.risk);
});

router.risk = [
  {CX_EQI_SPDJ_USA500_BMK_USD_LargeCap_Price: 'S&P 500 Index'},
  {CX_EQI_NYSE_USA_BMK_USD_LargeCap_Price: 'NYSE MKT Composite Index'},
  {CX_EQI_NASD_USAComposite_BMK_USD_LargeCap_Price: 'NASDAQ Composite Index'},
  {CX_EQI_NYSE_CAC40_BMK_EUR_LargeCap_Price: 'CAC 40 Index'},
  {CX_EQI_NIKK_Asia_BMK_JPY_LargeCap_Price:	'Nikkei 225 Index'},
  {CX_EQI_HSNG_Asia_BMK_HKD_LargeCap_Price:	'Hang Seng Index'},
  {CX_EQI_FTSE_UK_BMK_GBP_LargeCap_Price:	'FTSE 100 Index'},
  {CX_FXC_EUR_USD_Spot: 'EUR/USD FX rate'},
  {CX_FXC_JPY_USD_Spot: 'JPY/USD FX rate'},
  {CX_FXC_CAD_USD_Spot: 'CAD/USD FX rate'},
  {CX_FXC_GBP_USD_Spot: 'GBP/USD  FX rate'},
  {CX_COS_EN_BrentCrude_IFEU: 'Spot Price of Brent Crude Oil'},
  {CX_COS_EN_WTICrude_IFEU: 'Spot Price of WTI Crude Oil'},
  {CX_COS_ME_Gold_XCEC: 'Spot Price of Gold'}
];

// Export
module.exports = router;
