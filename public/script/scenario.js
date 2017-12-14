class Scenario {
  constructor() {
    // Reference to root element
    // Not initially visible
    // Position off screen
    this.root = document.querySelector( '#scenario' );

    if( touch ) {
      this.root.style.bottom = ( 0 - this.root.clientHeight ) + 'px';
      this.root.style.display = 'none';
      this.root.style.visibility = 'visible';
    }
    
    this.portfolio = this.root.querySelector( '#portfolio' );
    this.portfolio.addEventListener( 'change', evt => this.doValidate( evt ) );
    this.portfolio.addEventListener( 'focus', evt => this.doFocus( evt ) );
    this.portfolio.addEventListener( 'blur', evt => this.doBlur( evt ) );    

    this.shock = this.root.querySelector( '#shock' );
    this.shock.addEventListener( 'keyup', evt => this.doValidate( evt ) );    
    this.shock.addEventListener( 'change', evt => this.doValidate( evt ) );  
    this.shock.addEventListener( 'focus', evt => this.doFocus( evt ) );
    this.shock.addEventListener( 'blur', evt => this.doBlur( evt ) );        

    this.direction = this.root.querySelector( '#direction' );
    this.direction.addEventListener( 'change', evt => this.doValidate( evt ) );    
    this.direction.addEventListener( 'focus', evt => this.doFocus( evt ) );
    this.direction.addEventListener( 'blur', evt => this.doBlur( evt ) );        

    this.risk = this.root.querySelector( '#risk' );
    this.risk.addEventListener( 'change', evt => this.doValidate( evt ) );    
    this.risk.addEventListener( 'focus', evt => this.doFocus( evt ) );
    this.risk.addEventListener( 'blur', evt => this.doBlur( evt ) );            

    this.submit = this.root.querySelector( 'button' );
    this.submit.addEventListener( touch ? 'touchstart' : 'click', evt => this.doAnalyze( evt ) );
  }

  show() {
    this.root.style.display = 'flex';
    TweenMax.to( this.root, 0.60, {
      bottom: 0
    } );
  }

  set loading( value ) {
    if( value ) {
      this.submit.classList.add( 'loading' );
      this.submit.classList.remove( 'valid' );
    } else {
      this.submit.classList.remove( 'loading' );
      this.submit.classList.add( 'valid' );      
    }
  }

  get loading() {
    return this.submit.classList.contains( 'loading' );
  }

  set portfolios( options ) {
    while( this.portfolio.children.length > 1 ) {
      this.portfolio.children[1].remove();
    }

    for( var p = 0; p < options.length; p++ ) {
      let option = document.createElement( 'option' );

      option.setAttribute( 'data-timestamp', options[p].timestamp );
      option.innerHTML = options[p].name;
      this.portfolio.appendChild( option );
    }
  }

  set risks( options ) {
    while( this.risk.children.length > 1 ) {
      this.risk.children[1].remove();
    }

    for( var r = 0; r < options.length; r++ ) {
      let keys = Object.keys( options[r] );
      let option = document.createElement( 'option' );

      option.setAttribute( 'data-key', keys[0] );
      option.innerHTML = options[r][keys[0]]
      this.risk.appendChild( option );
    }
  }  

  get risks() {
    var results = [];

    for( var r = 1; r < this.risk.children.length; r++ ) {
      let option = new Object();

      option[this.risk.children[r].getAttribute( 'data-key' )] = this.risk.children[r].innerHTML.trim();
      results.push( option );
    }

    return results;
  }

  doAnalyze( evt ) {
    // Do not submit form
    evt.preventDefault();

    // Debug
    console.log( 'Analyze.' );

    // Validate
    if( this.submit.classList.contains( 'valid' ) ) {
      let actual = 1.0;
      let risk = parseFloat( this.shock.value.trim() );

      if( this.direction.selectedIndex == Scenario.RISE ) {
        actual = actual + ( risk / 100 );
      } else {
        actual = actual - ( risk / 100 );        
      }
  
      // Emit
      this.root.dispatchEvent( new CustomEvent( Scenario.ANALYZE, {
        detail: {
          portfolio: this.portfolio.value.trim(),
          shock: risk,
          actual: actual,          
          direction: this.direction.selectedIndex,
          risk: this.risk.value.trim(),
          factor: this.risk.options[this.risk.selectedIndex].getAttribute( 'data-key' )
        }
      } ) );
    }    
  }

  doBlur( evt ) {
    evt.target.parentElement.children[0].children[0].classList.remove( 'active' );
  }

  doFocus( evt ) {
    evt.target.parentElement.children[0].children[0].classList.add( 'active' );
  }  

  doValidate( evt ) {
    var portfolio = false;
    var shock = false;
    var direction = false;
    var risk = false;

    if( this.portfolio.selectedIndex > 0 ) {
      this.portfolio.classList.add( 'valid' );
      portfolio = true;            
    } else {
      this.portfolio.classList.remove( 'valid' );
    }

    if( this.shock.value.trim().length > 0 ) {
      shock = true;
    }

    if( this.direction.selectedIndex > 0 ) {
      this.direction.classList.add( 'valid' );
      direction = true;            
    } else {
      this.direction.classList.remove( 'valid' );
    }

    if( this.risk.selectedIndex > 0 ) {
      this.risk.classList.add( 'valid' );
      risk = true;            
    } else {
      this.risk.classList.remove( 'valid' );
    }

    if( portfolio && shock && direction && risk ) {
      this.submit.classList.add( 'valid' );
    } else {
      this.submit.classList.remove( 'valid' );
    }
  }
}

Scenario.ANALYZE = 'event_scenario_analyze';
Scenario.FALL = 2;
Scenario.RISE = 1;
