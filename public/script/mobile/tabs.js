class Tabs {
  constructor() {
    this.selectedIndex = 0;

    this.root = document.querySelector( '#tabs' );
    
    this.buttons = this.root.querySelectorAll( 'button' );
    
    for( var b = 0; b < this.buttons.length; b++ ) {
      this.buttons[b].addEventListener( 'touchstart', evt => this.doChange( evt ) );
    }

    this.indicator = this.root.querySelector( '.indicator' );    
    this.indicator.style.width = ( this.root.clientWidth / this.buttons.length ) + 'px';    
  }

  doChange( evt ) {
    for( var b = 0; b < this.buttons.length; b++ ) {
      if( this.buttons[b] == evt.target ) {
        if( !this.buttons[b].classList.contains( 'selected' ) ) {
          this.buttons[b].classList.add( 'selected' );
          this.indicator.style.left = ( this.root.clientWidth / this.buttons.length ) * b;

          this.root.dispatchEvent( new CustomEvent( Tabs.CHANGE, {
            detail: {
              currentIndex: this.selectedIndex,
              selectedIndex: b,
              label: this.buttons[b].innerHTML.trim()
            }
          } ) );

          this.selectedIndex = b;
        }
      } else {
        this.buttons[b].classList.remove( 'selected' );
      }
    }
  }
}

Tabs.CHANGE = 'event_tabs_change';
