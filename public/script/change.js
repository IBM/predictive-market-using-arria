class Change {
  constructor() {
    this.root = document.querySelector( '#change' );
    this.list = this.root.querySelector( '.list' );
    this.template = this.root.querySelector( '.row.template' );
  }

  clear() {
    var rows = null;

    if( touch ) {
      rows = this.list.children;
    } else {
      rows = this.root.querySelectorAll( '.row:not( .template )' );
    }

    for( var r = 0; r < rows.length; r++ ) {
      rows[r].remove();
    }
  }

  set conditions( data ) {
    this.clear();

    for( var d = 0; d < data.length; d++ ) {
      let row = this.template.cloneNode( true );
      let shift = ( data[d].stressed * 100 ) - 100;

      row.classList.remove( 'template' );
      row.children[0].innerHTML = data[d].risk;      
      row.children[1].innerHTML = shift.toFixed( 2 );

      if( shift > 0 ) {
        row.children[1].style.color = 'green';
      } else if( shift < 0 ) {
        row.children[1].style.color = 'red';
      }

      if( touch ) {
        this.list.appendChild( row );
      } else {
        this.root.appendChild( row );
      }
    }
  }
}
