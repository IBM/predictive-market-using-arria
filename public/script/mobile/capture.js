class Capture {
  constructor() {
    this.root = document.querySelector( '#capture' );
  }

  hide() {
    this.root.parentElement.style.marginLeft = ( 0 - window.innerWidth ) + 'px';    
  }

  show() {
    this.root.parentElement.style.marginLeft = '0px';        
  }
}
