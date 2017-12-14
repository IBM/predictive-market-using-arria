class Prospectus {
  constructor() {
    model.addEventListener( Model.LOGIN, evt => this.doValidate( evt ) );    
    model.addEventListener( Model.PORTFOLIO, evt => this.doPortfolio( evt ) );
    model.addEventListener( Model.RISK, evt => this.doRisk( evt ) );    
    model.addEventListener( Model.ANALYZE, evt => this.doReport( evt ) );        

    this.capture = new Capture();
    this.report = new Report();
    this.change = new Change();
    this.table = new DataTable();

    this.results = new Results();    
    this.results.root.addEventListener( Results.BACK, evt => this.doBack( evt ) );

    // create the login but hide it straight away...
    // the form is also opacity 0 in css
    this.login = new Login();
    this.login.root.addEventListener( Login.VALIDATE, evt => this.doLogin( evt ) );
    this.login.root.addEventListener( Login.HIDDEN, evt => this.doLoginHidden( evt ) );
    this.login.hide();
    model.portfolio();

    this.scenario = new Scenario();
    this.scenario.root.addEventListener( Scenario.ANALYZE, evt => this.doAnalyze( evt ) );

    this.narrative = new Narrative();
  }

  doAnalyze( evt ) {
    this.scenario.loading = true;
    model.analyze(
      evt.detail.portfolio,
      evt.detail.factor,
      evt.detail.actual
    );
  }

  doBack( evt ) {
    this.capture.show();
  }

  doLogin( evt ) {
    model.login( evt.detail.email, evt.detail.password );
  }

  doReport( evt ) {
    console.log( evt );

    var arriaNarrative = evt;
    this.narrative.content =arriaNarrative;

    this.scenario.loading = false;
    this.change.conditions = evt.conditions.slice( 0 );
    this.capture.hide();        
  }

  doRisk( evt ) {
    this.scenario.risks = evt;
  }

  doLoginHidden( evt ) {
    this.scenario.show();    
  }

  doPortfolio( evt ) {
    model.risk();
    this.scenario.portfolios = evt.portfolios;
  }

  doValidate( evt ) {
    if( evt.success ) {
      model.portfolio();
      this.login.hide();
    }
  }
}

let touch = ( 'ontouchstart' in document.documentElement ) ? true : false;
let app = new Prospectus();
