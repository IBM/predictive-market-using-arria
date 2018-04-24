"use strict";

var Q = require('q');
var FactorCollection = require('./factorCollection.js');
//var parse = require('csv-parse');
var csv = require('fast-csv');
//var linereader = require('line-by-line');




// load the key factors return promise
function loadKeyFactors(factorsFileReadStream, factors){
    console.log('Loading key factors definitions for Arria');
    var deferred = Q.defer();
    csv
    .fromStream(factorsFileReadStream, {headers:true, strictColumnHandling:false})
    .on("data", function(row){
        //console.log(row);
        let categories = {};
        switch(row['CATEGORY'].toLowerCase()){
            case 'index':
                categories.region = row['REGION'];
                break;
            case 'credit spread':
                categories.sector = row['SECTOR'];
                categories.rating = row['RATING'];
                categories.tenor = row['TENOR'];
                break;
            case 'rates':
                categories.tenor = row['TENOR'];
                break;
            case 'macroeconomic':
                break;
            case 'fx':
                categories['baseCurrency'] = row['FACTOR_NAME'].split('/')[1].split(' ')[0]
                categories['targetCurrency'] =row['FACTOR_NAME'].split('/')[0]
                break;
        }
        factors.setFactor(row['CATEGORY'],row['FACTOR_ID'], row['FACTOR_NAME'],  categories);
    })
    .on("end", function(){
        console.log("done");
        deferred.resolve(factors);
    });

    return deferred.promise;
}


// load the scenario changes to the factor collection
function loadScenarioValues(modelReadStream, factors){
    var deferred = Q.defer();
    var lineNumber = 0;
    var inSecondSet = false;
    var findingTerm = false;
    var factorName;
    console.log('Loading Predictive Scenario Values for Arria')
    csv
    .fromStream(modelReadStream)
    .on("data", function(row){
        lineNumber ++;
        // skip to the second scenario set that has the changes
        if (!inSecondSet && lineNumber > 2 && row[2].length > 0){
            inSecondSet = true;
        }
        if (inSecondSet){
            // see if this is start of factor detail (if factor has tenors changes are listed on subsequent lines)
            if (row.length > 5 && row[5].length >0) {
                findingTerm = false;
                factorName = row[5];
                // see if this factor is in the collection and if the file gives it by tenor
                if (factors.hasFactor(factorName)){
                    if ( row[13] == 'Term'){
                        findingTerm = true;
                    }
                    else{
                        //console.log('set:' + factorName + ':' + row[13])
                        factors.setScenarioChange(row[13],factorName);
                    }
                }
            }
            else if (row.length > 14 && findingTerm && factors.hasFactor(factorName, row[13])){
                 //console.log('set:' + factorName + ':' + row[13] + ':' + row[14])
                 factors.setScenarioChange(row[14], factorName, row[13]);   
            }
            
        }
    })
    .on("end", function(){
        console.log("done");
        deferred.resolve(factors);
    });
    return deferred.promise;
}




function loadVcvValues(vcvReadStream, factors){
    var deferred = Q.defer();
    let correlIds = factors.getCorrelFactorIds();
    console.log('Load vcv data for Arria');
    csv
    .fromStream(vcvReadStream)
    .on("data", function(row){
        // check factors are in key factors
        if (correlIds.includes(row[0]) && correlIds.includes(row[1])){
            // see if variance
            if (row[0] == row[1]){
                let ids = FactorCollection.convertFromCorrelId(row[0])
                factors.setVariance(parseFloat(row[2]), ids[0], ids[1]);
                if (row[0] == factors.shockedFactorId){
                    factors.setCovariance(parseFloat(row[2]), factors.shockedFactorId);
                }
            } // else correl 
            else {
                if (row.slice(0,2).includes(factors.shockedFactorId)){
                    let otherFactor = (row[0] == factors.shockedFactorId) ? row[1] : row[0];
                    let ids = FactorCollection.convertFromCorrelId(otherFactor)
                    factors.setCovariance(parseFloat(row[2]), ids[0], ids[1]);
                }
            }
        }
    })
    .on("end", function(){
        // calculate the correlations from the covars/vars
        console.log("calculating correlations");
        factors.calculateCorrelation();
        console.log("done");
        deferred.resolve(factors);
    });
    return deferred.promise;
}


function extractFactorData(factors, out={}){
    console.log('Exporting correlations');
    out.correlations = createCorrelations(factors);
    console.log('Exporting impacted categories');
    out.impactedCategories =  createScenarioChanges(factors);
    return out;
}



// create the sets of correlation data
function createCorrelations(factors){
    let out = [];
    let entry; 
    
    entry = createCorrelationsGroup(factors, 'Index', {'regionName':'region'  });
    out.push(entry);

    entry = createCorrelationsGroup(factors, 'Credit Spread', { 'sectorName':'sector', 'ratingName':'rating',
                                                                        'tenorName':'tenor' });
    out.push(entry);

    entry = createCorrelationsGroup(factors, 'Rates', {'tenorName':'tenor'});
    out.push(entry);

    entry = createCorrelationsGroup(factors, 'FX', { 'baseCurrency': 'baseCurrency',
                                            'targetCurrency': 'targetCurrency'  });
    out.push(entry);

    entry = createCorrelationsGroup(factors, 'Macroeconomic', { });
    out.push(entry);

    return out;
}


// create the sets of correlation data
function createScenarioChanges(factors){
    let out = [];
    let entry; 
    
    entry = createScenarioChangesGroup(factors, 'Index', {'regionName':'region'  });
    out.push(entry);

    entry = createScenarioChangesGroup(factors, 'Credit Spread', { 'sectorName':'sector', 'ratingName':'rating',
                                                                        'tenorName':'tenor' });
    out.push(entry);

    entry = createScenarioChangesGroup(factors, 'Rates', {'tenorName':'tenor'});
    out.push(entry);

    entry = createScenarioChangesGroup(factors, 'FX', { 'baseCurrency': 'baseCurrency', 
                                                        'targetCurrency': 'targetCurrency'});
    out.push(entry);

    entry = createScenarioChangesGroup(factors, 'Macroeconomic', { });
    out.push(entry);

    return out;
}

// create an output of correlations for a given data group
function createCorrelationsGroup(factors, group, details ){
    var corr = {};

    corr.category = group;
    corr.correlationValue = 0;
    corr.all = [];

    let ids = factors.factorGroupIds(group);
    for (let i = 0; i< ids.length; i++){
        let item = {};
        let factorId = ids[i][0];
        let tenor = ids[i][1];
        item.correlationValue = factors.getCorrelation(factorId, tenor);
        item.factorName = factors.getFactorName(factorId, tenor);
        item.factorId = factorId;

        for (let key in details){
            item[key] =  factors.getFactorCategoryValue(details[key], factorId, tenor)
        }

        corr.all.push(item);
    }
    return corr;
}


// create an output of scenario changes for a given data group
function createScenarioChangesGroup(factors, group, details ){
    var changes = {};

    changes.category = group;
    changes.valuePercentageChange = 0;
    changes.all = [];

    let ids = factors.factorGroupIds(group);
    for (let i = 0; i< ids.length; i++){
        let item = {};
        let factorId = ids[i][0];
        let tenor = ids[i][1];
        item.valuePercentageChange = factors.getScenarioChange(factorId, tenor);
        item.factorName = factors.getFactorName(factorId, tenor);
        item.factorId = factorId;

        for (let key in details){
            item[key] =  factors.getFactorCategoryValue(details[key], factorId, tenor)
        }

        changes.all.push(item);
    }
    return changes;
}


function prepareHoldingData(holdings, out){
    console.log('Extract holdings for arria');
    out.assets = [];
    for( let h = 0; h < holdings.length; h++ ) {
        out.assets.push( {
          instrumentName: holdings[h].asset,
          issuerName: holdings[h].companyName,
          sectorName: holdings[h].sectorName,
          assetName: holdings[h].class,
          quantity: holdings[h].quantity,
          currentValue: holdings[h].base,
          predictedValue: holdings[h].predicted,
          currency: holdings[h].currency
        } );
      }

}


function prepareScenarioDefData(scenarioDef, out){
    console.log('Extract scenario definition for arria');
    out.scenario = {
        inputRiskFactorId: scenarioDef.inputRiskFactorId,
        inputRiskFactorName: scenarioDef.inputRiskFactorName,
        inputMagnitudePercentage: scenarioDef.inputMagnitudePercentage
      };
}

function makeExtract(keyFactorsReadStream, modelReadStream, vcvReadStream, scenarioDef, holdings =[]){
    var defer = Q.defer();
    var factors = new FactorCollection(scenarioDef.inputRiskFactorId);
    var extract = {};
    
    prepareHoldingData(holdings, extract);
    
    prepareScenarioDefData(scenarioDef, extract);
    loadKeyFactors(keyFactorsReadStream, factors).then(function(factors){ 
        // this should be present but issue with service so just add manually for now..
        if (factors.hasFactor(scenarioDef.inputRiskFactorId)){
            factors.setScenarioChange(scenarioDef.inputMagnitudePercentage, scenarioDef.inputRiskFactorId);
        }
        // can run the scenario and vcv load together
        return Q.all([loadScenarioValues(modelReadStream, factors), loadVcvValues(vcvReadStream, factors)]);
    }).then(function(results) {
        extractFactorData(results[0],extract);
        console.log(extract);
        defer.resolve(extract)   
    } );
    
    return defer.promise;
}



module.exports = {  
                makeExtract:makeExtract
                    };

// load vcv

// load scenario changes

// extract