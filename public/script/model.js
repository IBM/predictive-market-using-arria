class Model {
  constructor() {
    this.listeners = [];    

    this.doLoginLoad = this.doLoginLoad.bind( this );
    this.doPortfolioLoad = this.doPortfolioLoad.bind( this );    
    this.doRiskLoad = this.doRiskLoad.bind( this );        

    this.xhr = new XMLHttpRequest();
  }

  addEventListener( label, callback ) {
    this.listeners.push( {
      label: label,
      callback: callback
    } );
  }

  emit( label, evt ) {
    for( let h = 0; h < this.listeners.length; h++ ) {
      if( this.listeners[h].label == label ) {
        this.listeners[h].callback( evt );
      }
    }
  }

  analyze( portfolio, risk, factor, shock ) {
    console.log( portfolio );
    console.log( risk );
    console.log( factor );    
    console.log( shock );

    var csv = null;
    let holdings = null;

    fetch( API.PREDICT, {
      method: 'POST',
      headers: new Headers( {'Content-Type': 'application/json'} ),
      body: JSON.stringify( {
        risk: factor,
        shock: shock         
      } )
    } ).then( ( response ) => {
      return response.json();
    } ).then( ( data ) => {
      console.log( data );
      csv = data.model;
      this.emit( Model.PREDICT, data );
      return fetch( API.HOLDINGS + '?portfolio=' + portfolio, {
        method: 'GET'
      } );
    } ).then( ( response ) => {
      return response.json();
    } ).then( ( data ) => {
      console.log( data );
      this.emit( Model.HOLDINGS, data );
      return fetch( API.INSTRUMENT, {
        method: 'POST',
        headers: new Headers( {'Content-Type': 'application/json'} ),
        body: JSON.stringify( {
          holdings: data.holdings[0].holdings,
          model: csv
        } )
      } );
    } ).then( ( response ) => {
      return response.json();
    } ).then( ( data ) => {
      console.log( data );      
      this.emit( Model.INSTRUMENT, data );
      return fetch( API.ARRIA, {
        method: 'POST',
        headers: new Headers( {'Content-Type': 'application/json'} ),
        body: JSON.stringify( {
          holdings: data.holdings,
          conditions: data.conditions,
          risk: risk,
          factor: factor,
          shock: shock,
          model: csv
        } )
      } );
    } ).then( ( response ) => {
      return response.json();  
    } ).then( ( data ) => {
      console.log( data );
      this.emit( Model.ARRIA, data );
    } ).catch( function( err ) {
      console.log( err );
    } );
  }

  login( email, password ) {
    this.xhr.addEventListener( 'load', this.doLoginLoad );
    this.xhr.open( 'POST', API.LOGIN, true );
    this.xhr.setRequestHeader( 'Content-Type', 'application/json' );
    this.xhr.send( JSON.stringify( {
      email: email,
      password: password
    } ) );
  }

  portfolio() {
    this.xhr.addEventListener( 'load', this.doPortfolioLoad );
    this.xhr.open( 'GET', API.PORTFOLIO, true );
    this.xhr.send( null );    
  }

  risk() {
    this.xhr.addEventListener( 'load', this.doRiskLoad );
    this.xhr.open( 'GET', API.RISK, true );
    this.xhr.send( null );      
  }

  doLoginLoad( evt ) {
    let data = JSON.parse( this.xhr.responseText );
    this.emit( Model.LOGIN, data );
    this.xhr.removeEventListener( 'load', this.doLoginLoad );
  }

  doPortfolioLoad( evt ) {
    let data = JSON.parse( this.xhr.responseText );
    this.emit( Model.PORTFOLIO, data )
    console.log( data );
    this.xhr.removeEventListener( 'load', this.doPortfolioLoad );
  }

  doRiskLoad( evt ) {
    let data = JSON.parse( this.xhr.responseText );
    this.emit( Model.RISK, data )
    this.xhr.removeEventListener( 'load', this.doRiskLoad );
  }  
}

Model.ARRIA = 'event_model_arria';
Model.HOLDINGS = 'event_model_holdings';
Model.INSTRUMENT = 'event_model_instrument';
Model.LOGIN = 'event_model_login';
Model.PORTFOLIO = 'event_model_portfolio';
Model.PREDICT = 'event_model_predict';
Model.RISK = 'event_model_risk';

let model = new Model();
