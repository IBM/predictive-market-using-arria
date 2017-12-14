class Login {
  constructor() {
    this.root = document.querySelector( '#login' );

    this.email = document.querySelector( '#email' );
    this.email.addEventListener( 'keyup', evt => this.doValidate( evt ) );
    this.email.addEventListener( 'focus', evt => this.doFocus( evt ) );
    this.email.addEventListener( 'blur', evt => this.doBlur( evt ) );    
    
    this.password = document.querySelector( '#password' );    
    this.password.addEventListener( 'keyup', evt => this.doValidate( evt ) );    
    this.password.addEventListener( 'focus', evt => this.doFocus( evt ) );
    this.password.addEventListener( 'blur', evt => this.doBlur( evt ) );    
    
    this.submit = this.root.querySelector( 'button' );
    this.submit.addEventListener( touch ? 'touchstart' : 'click', evt => this.doLogin( evt ) );
  }

  hide() {
    if( touch ) {
      TweenMax.to( this.root, 0.60, {
        bottom: 0 - this.root.clientHeight,
        onComplete: this.onHidden,
        onCompleteParams: [this.root]
      } );    
    } else {
      TweenMax.to( this.root, 0.60, {
        marginTop: 0 - window.innerHeight
      } );
    }
  }

  doBlur( evt ) {
    evt.target.parentElement.children[0].children[0].classList.remove( 'active' );
  }

  doFocus( evt ) {
    evt.target.parentElement.children[0].children[0].classList.add( 'active' );
  }

  doLogin( evt ) {
    // Do not submit form
    evt.preventDefault();

    // Validate
    if( this.submit.classList.contains( 'valid' ) ) {
      // Debug
      console.log( 'Login.' );

      // Login
      this.root.dispatchEvent( new CustomEvent( Login.VALIDATE, {
        detail: {
          email: this.email.value.trim(),
          password: this.password.value.trim()
        }
      } ) );
    }
  }

  doValidate( evt ) {
    var email = false;
    var password = false;

    if( this.email.value.trim().length > 0 ) {
      email = true;
    }
    
    if( this.password.value.trim().length > 0 ) {
      password = true;
    }
    
    if( email && password ) {
      this.submit.classList.add( 'valid' );
    } else {
      this.submit.classList.remove( 'valid' );
    }
  }  

  onHidden( element ) {
    element.style.display = 'none';
    element.dispatchEvent( new CustomEvent( Login.HIDDEN ) );
  }
}

Login.HIDDEN = 'event_login_hidden';
Login.VALIDATE = 'event_login_validate';
