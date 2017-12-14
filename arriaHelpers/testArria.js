"use strict";

var arriaRequestBuilder = require('./arriaRequestBuilder');
var fs = require( 'fs-extra' );
var path = require('path');
var request = require( 'request-promise' );
var jsonfile = require( 'jsonfile' );

var config = jsonfile.readFileSync( path.resolve(__dirname ,'../config.json' ));

var scenarioDef = {};
scenarioDef.inputRiskFactorId = 'CX_EQI_SPDJ_USA_BMK_USD_LargeCap_Price';
scenarioDef.inputRiskFactorName = 'S&P 500';
scenarioDef.inputMagnitudePercentage = '1.1';
var keyFactorsReadStream = fs.createReadStream(path.resolve(__dirname, 'factors.sample.csv'));
var modelReadStream = fs.createReadStream(path.resolve(__dirname, 'model.sample.csv'));
var vcvReadStream = fs.createReadStream(path.resolve(__dirname, 'vcv.sample.csv'));
var holdings = jsonfile.readFileSync( path.resolve(__dirname , 'arriaHoldings.json' ));

arriaRequestBuilder.makeExtract(keyFactorsReadStream, modelReadStream, vcvReadStream, scenarioDef, holdings).then(
    function(extract){
        console.log('sending extract to arria...');
        request( {
            method: 'POST',
            url: config.arria.url,
            headers: {
                'content-type': 'application/json',
                'x-api-key': config.arria.key   
            },
            body: extract,
            json: true
          } ).then( function( body ) {
            console.log( body );
          } ).catch( function( err ) {
            console.log( err );
          } );
    }).fail(function(err){
        console.log('fail')
    });


console.log('main');
