class Progress {
  constructor( minimum, maximum, current ) {
    this.root = document.querySelector( '#progress' );
    this.minimum = minimum;
    this.maximum = maximum;
    this.current = current;
  }

  set current( value ) {
    this.root.setAttribute( 'data-current', value );
    this.root.style.width = ( ( value / this.maximum ) * 100 ) + '%';

    if( value == this.maximum ) {
      this.root.style.height = 0;
    }
  }

  get current() {
    return parseInt( this.root.getAttribute( 'data-current' ) );
  }

  hide() {
    this.root.style.height = '0';
  }

  show() {
    this.root.style.height = '2px';
  }
}
