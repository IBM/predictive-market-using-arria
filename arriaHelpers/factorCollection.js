"use strict";

// class to help summarise the key factor data (meta, vcv and changes)
// factors should be unique on id and tenor
// they are reported by group for arria
class FactorCollection {
    constructor(shockedFactorId){
        this._factors = {};
        this._shockedFactorId = shockedFactorId;

        
    }

    get shockedFactorId() {
        return this._shockedFactorId;
    }

    set shockedFactorId(shockedFactorId){
        this._shockedFactorId = shockedFactorId;
    }

    // split the id from the correl file (id(Ttenor)) into id and tenor
    static convertFromCorrelId(correlId){
        let split = correlId.split('(T');
        if (split.length == 1){
            return [correlId, null];
        } else {
            return [split[0], split[1].slice(0,-1)];
        }

    }   

    // add a factor to the collection
    setFactor(group, factorId, name, categories={}){
        var tenor = categories.tenor || null;
        var factor = {"group":group, "id":factorId, "name": name, "correlation":0, "variance":0, "covariance": 0,
        "scenarioChange":0, "tenor":tenor, "categories":categories};
        (this._factors[factorId] || (this._factors[factorId] = {}))[tenor]= factor;
    }

    getFactorClone(factorId, tenor=null){
        return JSON.parse(JSON.stringify(this._factors[factorId, tenor]));
    }

    // remove factor from the collection
    deleteFactor(factorId, tenor=null){
        delete this._factors[factorId][tenor];
    }

    // check if factor in collection
    hasFactor(factorId, tenor = null){
        if (tenor){
            return factorId in this._factors && tenor in this._factors[factorId];           
        } else {
            return factorId in this._factors
        }
    }

    // check if factor has tenor
    factorHasTenor (factorId){
        for (let tenor in this._factors[factorId]){
            if (tenor != null){
                return true;
            }
        }
        return false;
    };

    getFactorCategoryValue(categoryKey, factorId, tenor = null){
        return this._factors[factorId][tenor].categories[categoryKey];
    }

    getFactorName(factorId, tenor = null){
        return this._factors[factorId][tenor].name;
    }

    getFactorGroup(factorId, tenor = null){
        return this._factors[factorId][tenor].group;
    }

    // gen for set of factor ids formatted as they are in the vcv file
    getCorrelFactorIds (){
        let ids = [];
        for (let factor of this._factorGenerator()){
            if (factor.tenor != null){
                    ids.push(factor.id +'(T' + factor.tenor + ')');
            } else {
                ids.push(factor.id);
            }
        }
        return ids;
    }

    // set factor values...
    setScenarioChange (scenarioChange, factorId, tenor=null){
        this._factors[factorId][tenor].scenarioChange = scenarioChange;
    }

    setCorrelation (correlation, factorId, tenor=null){
        this._factors[factorId][tenor].correlation = correlation;
    }

    setVariance (variance, factorId, tenor=null){
        this._factors[factorId][tenor].variance = variance;
    }

    setCovariance (covariance, factorId, tenor=null){
        this._factors[factorId][tenor].covariance = covariance;
    }


    // get the values
    getScenarioChange (factorId, tenor=null){
        return this._factors[factorId][tenor].scenarioChange;
    }

    getCorrelation (factorId, tenor=null){
        return this._factors[factorId][tenor].correlation;
    }

    getVariance (factorId, tenor=null){
        return this._factors[factorId][tenor].variance;
    }

    getCovariance (factorId, tenor=null){
        return this._factors[factorId][tenor].covariance;
    }

    // get average values
    getAvgScenarioChange (group, aggregation, detail = false){
        return this._getAvgOfField(group, aggregation, 'scenarioChange', detail);
    }

    getAvgCorrelation (group, aggregation, detail = false){
        return this._getAvgOfField(group, aggregation, 'correlation', detail);
    }

    // helper function see if factor matches for each key/val pair
    _matchingCategories(categoriesIn, factorCategories){
        for (let key in categoriesIn.keys()){
            if (factorCategories[key] != categoriesIn[key]){
                return false;
            }
        }
        return true;
    }

    // helper function - average the values of the given field for matching factors
    _getAvgOfField(group, aggregation, field, detail=false){
        var sum = 0.0;
        var count = 0;
        var out = [];
        var invalidField = false;
        for (let tenors in factors.values()){
            for (let factor in tenors.values()){
                if (factor.group == group){
                    matching = _matchingCategories(aggregation, factor.categories);
                    if (!(aggregation) || matching){
                        let fieldValue = parseFloat(factor[field]);
                        if (isNan(fieldValue)){
                            sum+= fieldValue;
                            count ++;
                        } else {
                            invalidField = True;
                        }
                    }
                    if (detail){
                        out.push(factor);
                    }
                }
            }
        }
        if (detail){
            return out;
        }
        if (flag){
            return NaN;
        }
        return sum/ count;

    }

    * _factorGenerator() {
        for (let id in this._factors){
            for (let tenor in this._factors[id]){
                yield this._factors[id][tenor];
            }
        }

    };

    factorGroupIds(filteringGroup){
        let ids = [];
        for (let factor of this._factorGenerator()){
            if (factor.group == filteringGroup) {
                ids.push([factor.id, factor.tenor]);
            }
        }
        return ids;
    }

    calculateCorrelation(){
        let shockedFactorSD = Math.sqrt(this.getVariance(this._shockedFactorId));
        for (var factor of this._factorGenerator()){
            if (shockedFactorSD * Math.sqrt(factor['variance']) != 0){
                factor['correlation'] = factor['covariance'] / (shockedFactorSD * Math.sqrt(factor['variance']));
            }   
        }
    }
}









module.exports =FactorCollection;
