class Prospectus {
  constructor() {
    model.addEventListener( Model.LOGIN, evt => this.doValidate( evt ) );
    model.addEventListener( Model.PORTFOLIO, evt => this.doPortfolio( evt ) );
    model.addEventListener( Model.RISK, evt => this.doRisk( evt ) );
    model.addEventListener( Model.ARRIA, evt => this.doReport( evt ) );
    model.addEventListener( Model.PREDICT, evt => this.doPredict( evt ) );
    model.addEventListener( Model.HOLDINGS, evt => this.doHoldings( evt ) );
    model.addEventListener( Model.INSTRUMENT, evt => this.doInstrument( evt ) );        

    this.capture = document.querySelector( '#capture' );

    this.shelf = document.querySelector( '#shelf' );
    this.shelf.style.right = ( window.innerWidth - this.capture.clientWidth - Prospectus.OFFSET ) + 'px';

    // create the login but hide it straight away...
    // the form is also opacity 0 in css - to keep animation
    this.login = new Login();
    this.login.root.addEventListener( Login.VALIDATE, evt => this.doLogin( evt ) );
    this.login.hide();
    model.portfolio();

    this.scenario = new Scenario();
    this.scenario.root.addEventListener( Scenario.ANALYZE, evt => this.doAnalyze( evt ) );

    this.progress = new Progress( 0, 5, 1 );

    this.report = document.querySelector( '#report' );

    this.narrative = new Narrative();

    this.holdings = new Holdings();
    this.change = new Change();

    // ensure only positive numbers in the factor box
    this.shock = document.getElementById('shock');

    // Listen for input event on numInput.
    this.shock.onkeydown = function(e) {
        if(!((e.keyCode > 95 && e.keyCode < 106)
          || (e.keyCode > 47 && e.keyCode < 58) 
          || e.keyCode == 8)) {
            return false;
        }
    }
  }

  doAnalyze( evt ) {
    console.log( evt.detail );
    this.scenario.loading = true;
    this.progress.current = 1;
    this.progress.show();
    this.report.style.opacity = 0;
    model.analyze(
      evt.detail.portfolio,
      evt.detail.risk,
      evt.detail.factor,
      evt.detail.actual
    );    
  }

  doHoldings( evt ) {
    this.progress.current = 3;
  }

  doInstrument( evt ) {
    this.holdings.data = evt.holdings.slice( 0 );
    this.change.conditions = evt.conditions.slice( 0 );

    this.progress.current = 4;
  }

  doLogin( evt ) {
    console.log( evt.detail );
    model.login( evt.detail.email, evt.detail.password );
  }

  doPortfolio( evt ) {
    console.log( evt );
    model.risk();
    this.scenario.portfolios = evt.portfolios;
  }

  doPredict( evt ) {
    this.progress.current = 2;
  }

  doReport( evt ) {
    console.log( evt );
    
    var arriaNarrative = evt;
    this.narrative.content =arriaNarrative;

    this.scenario.loading = false;
    this.progress.current = 5;
    

    // TODO: Populate extract
    

    TweenMax.to( this.shelf, 0.80, {
      right: Prospectus.OFFSET,
      onComplete: this.onShelf,
      onCompleteParams: [this.report]
    } );
  }

  doRisk( evt ) {
    console.log( evt );
    this.scenario.risks = evt;
    this.login.hide( false );    
  }

  doValidate( evt ) {
    console.log( evt );
    if( evt.success ) {
      model.portfolio();
    }
  }

  onShelf( element ) {
    element.style.visibility = 'visible';
    element.style.opacity = 1.0;
  }
}

Prospectus.OFFSET = 125;

let touch = ( 'ontouchstart' in document.documentElement ) ? true : false;
let app = new Prospectus();
