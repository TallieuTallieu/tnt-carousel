/*

tnt-carousel
------------

Author: Rein Van Oyen <rein@tnt.be>
Website: http://www.tnt.be
Repo: http://github.com/reinvanoyen/tnt-carousel
Issues: http://github.com/reinvanoyen/tnt-carousel/issues

*/

"use strict";

var extend = function( defaults, options ) {

	var extended = {};
	var prop;
	for( prop in defaults ) {

		if( Object.prototype.hasOwnProperty.call( defaults, prop ) ) {
			extended[ prop ] = defaults[ prop ];
		}
	}
	for( prop in options ) {

		if( Object.prototype.hasOwnProperty.call( options, prop ) ) {
			extended[ prop ] = options[ prop ];
		}
	}
	return extended;
};

var removeElement = function( element ) {

	element && element.parentNode && element.parentNode.removeChild( element );
};

var loadImages = function( _images, callback ) {

	var amountLoaded = 0,
		amountToLoad = _images.length
	;

	if( amountToLoad === 0 ) {
		callback();
	}

	for( var i = 0; i < _images.length; i++ ) {

		var image = new Image();

		image.onload = function() {

			amountLoaded++;

			if( amountLoaded === amountToLoad ) {
				callback();
			}
		}

		image.src = _images[ i ].getAttribute( 'src' );
	}
};

var Carousel = function( element, options ) {

	options = options || {};

	var DEFAULT_OPTIONS = {
		autoplay: false,
		autoplayInterval: 4000,
		touchSwipe: true,
		mouseSwipe: true,
		keyEvents: false,
		arrowButtons: true,
		arrowButtonsContainer: null,
		previousArrowClass: 'carousel-prev-button',
		nextArrowClass: 'carousel-next-button',
		inactiveArrowClass: 'hide',
		loadedClass: 'loaded',
		activeSlideClass: 'active',
		edgeFriction: .1
	};

	this.options = extend( DEFAULT_OPTIONS, options );
	this.eventqueue = {};

	this._element = element;
	this._slides = this._element.children;

	this.amountOfSlides = this._slides.length;

	this.activeSlideIndex = 0;
	this.translateX = 0;
	this.dragDistanceX = 0;
	this.dragDistanceY = 0;
	this.dragDuration = 0;
	this.isBuilt = false;

	var that = this;

	if( this.amountOfSlides > 0 ) {

		loadImages( this._element.getElementsByTagName( 'img' ), function() {
			that.build();
		} );
	}
};

Carousel.prototype.on = function( event_name, callback ) {

	if( typeof this.eventqueue[ event_name ] == 'undefined' ) {

		this.eventqueue[ event_name ] = [];
	}

	this.eventqueue[ event_name ].push( callback );
};

Carousel.prototype.trigger = function( event_name, event ) {

	if( typeof this.eventqueue[ event_name ] != 'undefined' ) {

		this.eventqueue[ event_name ].forEach( function( e ) {

			e( event );
		} );
	}
};

Carousel.prototype.build = function() {

	if( ! this.isBuilt ) {

		this._wrap = document.createElement( 'div' );
		this._element.parentElement.insertBefore( this._wrap, this._element );
		this._wrap.appendChild( this._element );

		this._element.classList.add( this.options.loadedClass );
		this._firstSlide = this._slides[ 0 ];

		if( this.options.arrowButtons ) {

			this._prevButton = document.createElement( 'button' );
			this._prevButton.setAttribute('type', 'button');
			this._prevButton.setAttribute('aria-label', 'previous');
			this._prevButton.classList.add( this.options.previousArrowClass );
			
			this._nextButton = document.createElement( 'button' );
			this._nextButton.setAttribute('type', 'button');
			this._nextButton.setAttribute('aria-label', 'next');
			this._nextButton.classList.add( this.options.nextArrowClass );

			if( ! this.options.arrowButtonsContainer ) {

				this._wrap.appendChild( this._prevButton );
				this._wrap.appendChild( this._nextButton );
			} else {

				this.options.arrowButtonsContainer.appendChild(this._prevButton);
				this.options.arrowButtonsContainer.appendChild(this._nextButton);
			}
		}

		this.refresh();
		this.bindEvents();

		if( this.options.autoplay ) {
			this.play();
		}

		this.isBuilt = true;
	}
};

Carousel.prototype.destroy = function() {

	if( this.isBuilt ) {

		this.unbindEvents();
		this.pause();

		this._wrap.parentElement.appendChild( this._element );
		removeElement( this._wrap );

		this._element.removeAttribute( 'style' );
		this._element.classList.remove( this.options.loadedClass );

		if( this.options.arrowButtons ) {

			removeElement( this._prevButton );
			removeElement( this._nextButton );
		}

		for( var i = 0; i < this._slides.length; i++ ) {
			this._slides[ i ].removeAttribute( 'style' );
			this._slides[ i ].classList.remove( this.options.activeSlideClass );
		}

		this.isBuilt = false;
	}
};

Carousel.prototype.bindEvents = function() {

	var that = this;

	var originalTranslateX,
		startPosX, startPosY,
		startTime,
		dragRatio,
		isDragging
	;

	function refresh( e ) {
		that.refresh();
	}

	function nextArrowClick( e ) {
		that.pause();
		that.goToNext();
		e.preventDefault();
	}

	function prevArrowClick( e ) {
		that.pause();
		that.goToPrevious();
    e.preventDefault();
	}

	function keyDown( e ) {
		if( e.keyCode === 37 ) {
			that.pause();
			that.goToPrevious();
		}
		else if( e.keyCode === 39 ) {
			that.pause();
			that.goToNext();
		}
	}

	function dragStart( e ) {

		isDragging = true;

		var event = e;

		if( e.changedTouches ) {
			event = e.changedTouches[ 0 ];
		}

		originalTranslateX = that.translateX;
		startPosX = event.clientX;
		startPosY = event.clientY;
		startTime = Date.now();
		that.setTransition( 'none' );
	}

	function dragMove( e ) {

		if( isDragging ) {

			var event = e;

			if( e.changedTouches ) {

				event = e.changedTouches[ 0 ];
			}

			that.dragDistanceX = event.clientX - startPosX;
			that.dragDistanceY = event.clientY - startPosY;
			that.setTranslateX( originalTranslateX + ( that.dragDistanceX ) );

			if( Math.abs( that.dragDistanceX ) > 0 ) {

				dragRatio = Math.abs( that.dragDistanceY ) / Math.abs( that.dragDistanceX ) || 0;
			}

			if( dragRatio > 0 && dragRatio < 1 || e.type === 'mousemove' ) {

				e.preventDefault();
			}
		}
	}

	function dragEnd( e ) {

		isDragging = false;
		dragRatio = 0;
		that.setTransition( '' );
		that.setTransitionTimingFunction( '' );
		that.dragDuration = ( Date.now() - startTime );
		that.adjustScrollPosition();
		that.dragDistanceX = 0;
		that.dragDistanceY = 0;
		that.dragDuration = 0;
	}

	window.addEventListener( 'resize', refresh );

	if( this.options.touchSwipe ) {

		this._wrap.addEventListener( 'touchstart', dragStart );
		this._wrap.addEventListener( 'touchmove', dragMove );
		this._wrap.addEventListener( 'touchend', dragEnd );
	}

	if( this.options.mouseSwipe ) {

		this._wrap.addEventListener( 'mousedown', dragStart );
		this._wrap.addEventListener( 'mousemove', dragMove );
		this._wrap.addEventListener( 'mouseup', dragEnd );
	}

	if( this.options.keyEvents ) {
		document.addEventListener( 'keydown', keyDown );
	}

	if( this.options.arrowButtons ) {

		this._prevButton.addEventListener( 'click', prevArrowClick );
		this._nextButton.addEventListener( 'click', nextArrowClick );
	}

	Carousel.prototype.unbindEvents = function() {

		window.removeEventListener( 'resize', reset );
		document.removeEventListener( 'keydown', keyDown );

		that._wrap.removeEventListener( 'touchstart', dragStart );
		that._wrap.removeEventListener( 'touchmove', dragMove );
		that._wrap.removeEventListener( 'touchend', dragEnd );

		that._wrap.removeEventListener( 'mousedown', dragStart );
		that._wrap.removeEventListener( 'mousemove', dragMove );
		that._wrap.removeEventListener( 'mouseup', dragEnd );

		if( that.options.arrowButtons ) {
			that._prevButton.removeEventListener( 'click', prevArrowClick );
			that._nextButton.addEventListener( 'click', nextArrowClick );
		}
	};
};

Carousel.prototype.setTransition = function( transition ) {

	this._element.style.transition = transition;

	this._element.style.MozTransition = transition;
	this._element.style.webkitTransition = transition;
	this._element.style.msTransition = transition;
	this._element.style.OTransition = transition;
};

Carousel.prototype.setTransitionTimingFunction = function( easing ) {

	this._element.style.transitionTimingFunction = easing;

	this._element.style.MozTransitionTimingFunction = easing;
	this._element.style.webkitTransitionTimingFunction = easing;
	this._element.style.msTransitionTimingFunction = easing;
	this._element.style.OTransitionTimingFunction = easing;
};

Carousel.prototype.setTransitionDuration = function( n ) {

	this._element.style.transitionDuration = n + 'ms';

	this._element.style.MozTransitionDuration = n + 'ms';
	this._element.style.webkitTransitionDuration = n + 'ms';
	this._element.style.msTransitionDuration = n + 'ms';
	this._element.style.OTransitionDuration = n + 'ms';
};

Carousel.prototype.setTranslateX = function( n ) {

	this.translateX = n;

	this._element.style.transform = 'translate3d('+this.translateX+'px, 0, 0)';

	this._element.style.MozTransform = 'translateX('+this.translateX+'px)';
	this._element.style.webkitTransform = 'translate3d('+this.translateX+'px, 0, 0)';
	this._element.style.msTransform = 'translateX('+this.translateX+'px)';
	this._element.style.OTransform = 'translateX('+this.translateX+'px)';
};

Carousel.prototype.adjustScrollPosition = function() {

	var absoluteDistance = Math.abs( this.dragDistanceX );

	if( absoluteDistance > ( this.slideWidth * this.options.edgeFriction ) ) {

		var speed = ( this.dragDuration / absoluteDistance );
	
		this.setTransitionDuration( speed * 200 );

		var amountOfSlidesDragged = Math.ceil( absoluteDistance / this.slideWidth );

		if( this.dragDistanceX < 0 ) {
			if( this.isOnRightEdge ) {
				this.goTo( this.amountOfSlides - 1 );
			}
			else {
				this.goTo( this.activeSlideIndex + amountOfSlidesDragged );
			}
		}

		if( this.dragDistanceX > 0 ) {
			if( this.isOnLeftEdge ) {
				this.goTo( 0 );
			} else {
				this.goTo( this.activeSlideIndex - amountOfSlidesDragged );
			}
		}
	} else {
		this.goTo( this.activeSlideIndex );
	}
};

Carousel.prototype.refresh = function() {

	for( var i = 0; i < this._slides.length; i++ ) {
		this._slides[ i ].removeAttribute( 'style' );
	}

	this._wrap.removeAttribute( 'style' );
	this._element.removeAttribute( 'style' );

	this.elementWidth = this._element.offsetWidth;
	this.slideWidth = this._firstSlide.offsetWidth;
	this.slideHeight = this._firstSlide.offsetHeight;

	this.amountVisible = Math.round( this.elementWidth / this.slideWidth );

	this.totalWidth = ( this.amountOfSlides * this.slideWidth );

	this._wrap.style.width = this.elementWidth + 'px';
	this._wrap.style.position = 'relative';
	this._wrap.style.overflow = 'hidden';
	this._wrap.style.height = this.slideHeight + 'px';

	this._element.style.width = this.totalWidth + 'px';

	for( var i = 0; i < this._slides.length; i++ ) {

		this._slides[ i ].style.float = 'left';
		this._slides[ i ].style.width = this.slideWidth + 'px';
	}

	this.refreshState();
};

Carousel.prototype.refreshState = function() {

	var translateX = Math.max( -( this.activeSlideIndex * this.slideWidth ), -( this.totalWidth - this.elementWidth ) );
	translateX = Math.min( 0, translateX );

	this.setTranslateX( translateX );

	for( var i = 0; i < this._slides.length; i++ ) {
		this._slides[ i ].classList.remove( this.options.activeSlideClass );
	}

	this._slides[ this.activeSlideIndex ].classList.add( this.options.activeSlideClass );
	this.isOnLeftEdge = ( this.activeSlideIndex === 0 );
	this.isOnRightEdge = ( ( this.amountOfSlides - this.activeSlideIndex ) <= this.amountVisible );

	this.refreshButtons();
};

Carousel.prototype.refreshButtons = function() {

	if( this.options.arrowButtons ) {

		this._prevButton.classList.remove('hide');
		this._nextButton.classList.remove('hide');

		if( this.isOnLeftEdge ) {
			this._prevButton.classList.add('hide');
		}

		if( this.isOnRightEdge ) {
			this._nextButton.classList.add('hide');
		}
	}
};

Carousel.prototype.goToNext = function() {

	this.goTo( this.activeSlideIndex + 1 );
};

Carousel.prototype.goToPrevious = function() {

	this.goTo( this.activeSlideIndex - 1 );
};

Carousel.prototype.goTo = function( n ) {

	if( n >= 0 && n < this.amountOfSlides ) {

		this.activeSlideIndex = n;
		this.refreshState();
	}

	if( n < 0 ) {
		this.goTo( this.amountOfSlides - 1 );
		return;
	}

	if( n >= this.amountOfSlides ) {
		this.goTo( 0 );
		return;
	}

	this.trigger( 'goTo', {
		index: n
	} );
};

Carousel.prototype.play = function() {

	var that = this;

	this.playInterval = setInterval( function() {

		that.goToNext();
	}, this.options.autoplayInterval );
};

Carousel.prototype.pause = function() {

	clearInterval( this.playInterval );
};

module.exports = Carousel;