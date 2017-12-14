class Results {
  constructor() {
    this.root = document.querySelector( '#results' );
    this.content = this.root.querySelector( '.content' );

    this.back = this.root.querySelector( '.header > button' );
    this.back.addEventListener( 'touchstart', evt => this.doBack( evt ) );

    this.tabs = new Tabs();
    this.tabs.root.addEventListener( Tabs.CHANGE, evt => this.doTab( evt ) );
  }

  show( from, to, animate = true ) {
    let current = this.content.querySelector( 'div:nth-of-type( ' + ( from + 1 ) + ' )' );
    let selected = this.content.querySelector( 'div:nth-of-type( ' + ( to + 1 ) + ' )' );    
    let off = from < to ? ( 0 - window.innerWidth ) : window.innerWidth;

    if( from < to ) {
      selected.style.left = window.innerWidth + 'px';
    } else {
      selected.style.left = ( 0 - window.innerWidth ) + 'px';
    }

    if( animate ) {
      TweenMax.to( current, 0.60, { 
        left: off
      } );

      TweenMax.to( selected, 0.60, {
        left: 0
      } );      
    } else {
      current.style.left = off + 'px';
      selected.style.left = 0;
    }
  }

  doBack( evt ) {
    this.root.dispatchEvent( new CustomEvent( Results.BACK ) );
  }

  doTab( evt ) {
    this.show( evt.detail.currentIndex, evt.detail.selectedIndex );
  }
}

Results.BACK = 'event_results_back';
