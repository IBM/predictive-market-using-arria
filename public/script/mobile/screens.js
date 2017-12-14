class Screens {
  constructor() {
    this.root = document.querySelector( '#screens' );
    this.capture = new Capture();
    this.results = new Results();    
  }

  show( index ) {
    TweenMax.to( this.root, 0.60, {
      marginLeft: 0 - ( index * this.root.clientWidth )
    } );
  }
}

Screens.CAPTURE = 0;
Screens.RESULTS = 1;
