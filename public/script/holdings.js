class Holdings {
  constructor() {
    this.root = document.querySelector( '#holdings' );
    this.root.classList.add( 'holdings_table' );
    this.body = this.root.querySelector( 'tbody' );
    this.columns = this.body.children[0];
  }

  set data( holdings ) {
    // Remove existing
    while( this.body.children.length > 1 ) {
      this.body.children[1].remove();
    }

    // Group by sector
    holdings = holdings.groupBy( 'sectorName' );

    // Totals
    let portfolio = {value: 0, pnl: 0};
    let company_summary = {};
    let sector_summary = {};
    let company = null;    

    // Calculate totals
    for( let sector in holdings ) {
      // Sort by company name
      holdings[sector] = holdings[sector].sort( ( a, b ) => {
        if( a.sector > b.sector ) return 1;
        if( a.sector < b.sector ) return -1;
        return 0;
      } );

      // Seed sector summary values
      sector_summary[sector] = {value: 0, pnl: 0};

      // Iterate holding in sector
      for( let h = 0; h < holdings[sector].length; h++ ) {
        // Additional values
        holdings[sector][h].base_value = holdings[sector][h].quantity * holdings[sector][h].base;
        holdings[sector][h].pnl = holdings[sector][h].quantity * ( holdings[sector][h].predicted - holdings[sector][h].base );

        // Company
        if( company == null || company != holdings[sector][h].companyName ) {
          company = holdings[sector][h].companyName;        
          company_summary[company] = {value: 0, pnl: 0};          
        }

        company_summary[company].value += holdings[sector][h].base_value;
        company_summary[company].pnl += holdings[sector][h].pnl;  

        // Sector
        sector_summary[sector].value += holdings[sector][h].base_value;
        sector_summary[sector].pnl += holdings[sector][h].pnl;      

        // Portfolio
        portfolio.value += holdings[sector][h].base_value;
        portfolio.pnl += holdings[sector][h].pnl;
      }            
    }

    // Totals complete
    // Rendering

    let company_row = null;
    let holding_row = null;
    let sector_row = null;
    let format = {minimumFractionDigits: 2, maximumFractionDigits: 2};

    company = null;

    // Build table
    for( let sector in holdings ) {
      // Sector grouping
      sector_row = this.columns.cloneNode( true );
      sector_row.classList.add( 'sector' );
      sector_row.setAttribute( 'data-mode', 'flex' );
      sector_row.addEventListener( 'click', evt => this.doSectorClick( evt ) );
      this.body.appendChild( sector_row );

      // Holdings for given sector
      for( var h = 0; h < holdings[sector].length; h++ ) {
        // Company line item        
        if( company == null || company != holdings[sector][h].companyName ) {
          company = holdings[sector][h].companyName;

          company_row = this.columns.cloneNode( true );    
          company_row.classList.add( 'company' );
          company_row.setAttribute( 'data-sector', sector );          
          company_row.children[0].innerHTML = company;
          company_row.children[3].innerHTML = company_summary[company].value.toLocaleString( undefined, format );
          company_row.children[4].innerHTML = ( ( company_summary[company].value / portfolio.value ) * 100 ).toLocaleString( undefined, format );          
          company_row.children[5].innerHTML = company_summary[company].pnl.toLocaleString( undefined, format );                
          // company_row.children[6].innerHTML = ( ( company_summary[company].pnl / company_summary[company].value ) * 100 ).toLocaleString( undefined, format );                          
          // company_row.children[7].innerHTML = ( ( company_summary[company].pnl / portfolio.pnl ) * 100 ).toLocaleString( undefined, format );                                    
          // company_row.children[8].innerHTML = ( ( company_summary[company].pnl / sector_summary[sector].pnl ) * 100 ).toLocaleString( undefined, format );                                              
          this.body.appendChild( company_row );
        }

        // Holding line item
        holding_row = this.columns.cloneNode( true );
        holding_row.setAttribute( 'data-sector', sector );
        holding_row.children[0].innerHTML = holdings[sector][h].companyName;
        holding_row.children[1].innerHTML = holdings[sector][h].quantity;
        holding_row.children[2].innerHTML = holdings[sector][h].base.toLocaleString( undefined, format );
        holding_row.children[3].innerHTML = holdings[sector][h].base_value.toLocaleString( undefined, format );                        
        holding_row.children[4].innerHTML = ( ( holdings[sector][h].base_value / portfolio.value ) * 100 ).toLocaleString( undefined, format );
        holding_row.children[5].innerHTML = holdings[sector][h].pnl.toLocaleString( undefined, format );
        // holding_row.children[6].innerHTML = ( ( holdings[sector][h].pnl / holdings[sector][h].base_value ) * 100 ).toLocaleString( undefined, format );        
        // holding_row.children[7].innerHTML = ( ( holdings[sector][h].pnl / portfolio.pnl ) * 100 ).toLocaleString( undefined, format );        
        // holding_row.children[8].innerHTML = ( ( holdings[sector][h].pnl / company_summary[company].pnl ) * 100 ).toLocaleString( undefined, format );                
        this.body.appendChild( holding_row );
      }

      // Sector line item
      sector_row.children[0].innerHTML = sector;      
      sector_row.children[3].innerHTML = sector_summary[sector].value.toLocaleString( undefined, format );
      sector_row.children[4].innerHTML = ( ( sector_summary[sector].value / portfolio.value ) * 100 ).toLocaleString( undefined, format );
      sector_row.children[5].innerHTML = sector_summary[sector].pnl.toLocaleString( undefined, format );                              
      // sector_row.children[6].innerHTML = ( ( sector_summary[sector].pnl / sector_summary[sector].value ) * 100 ).toLocaleString( undefined, format );                                    
      // sector_row.children[7].innerHTML = ( ( sector_summary[sector].pnl / portfolio.pnl ) * 100 ).toLocaleString( undefined, format );                                          
      // sector_row.children[8].innerHTML = ( ( sector_summary[sector].pnl / portfolio.pnl ) * 100 ).toLocaleString( undefined, format );                                                
    }

    // Portfolio line item
    this.columns.children[3].innerHTML = portfolio.value.toLocaleString( undefined, format );
    this.columns.children[4].innerHTML = ( ( portfolio.value / portfolio.value ) * 100 ).toLocaleString( undefined, format );
    this.columns.children[5].innerHTML = portfolio.pnl.toLocaleString( undefined, format );                                  
    // this.columns.children[6].innerHTML = ( ( portfolio.pnl / portfolio.value ) * 100 ).toLocaleString( undefined, format );                                      
    // this.columns.children[7].innerHTML = ( ( portfolio.pnl / portfolio.pnl ) * 100 ).toLocaleString( undefined, format );                                          
    // this.columns.children[8].innerHTML = ( ( portfolio.pnl / portfolio.pnl ) * 100 ).toLocaleString( undefined, format );                                              
  }

  parseValue( value ) {
    let parts = value.split( ' ' );
    return parseFloat( parts[0] );
  }  

  doSectorClick( evt ) {
    var rows = this.root.querySelectorAll( '[data-sector=\"' + evt.target.parentNode.children[0].innerHTML.trim() + '\"]' );
    var mode = null;

    if( evt.target.parentNode.getAttribute( 'data-mode' ) == 'flex' ) {
      evt.target.parentNode.classList.add( 'closed' );          
      mode = 'none';
    } else {
      mode = 'flex';
      evt.target.parentNode.classList.remove( 'closed' );                
    }

    evt.target.parentNode.setAttribute( 'data-mode', mode );

    for( var r = 0; r < rows.length; r++ ) {
        rows[r].style.display = mode;
    }
  }
}

// https://www.consolelog.io/group-by-in-javascript
Array.prototype.groupBy = function( prop ) {
  return this.reduce( function( groups, item ) {
    var val = item[prop];
    groups[val] = groups[val] || [];
    groups[val].push( item );
    return groups;
  }, {} );
}
