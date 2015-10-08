/*

TNT CAROUSEL
------------

Author: Rein Van Oyen <rein@tnt.be>
Website: http://www.tnt.be
Repo: http://github.com/ReinVO/tnt-carousel
Issues: http://github.com/ReinVO/tnt-carousel/issues

*/

"use strict";

var $ = require( 'jquery' );
var utils = require( './utils.js' );

var Carousel = function( $element, options ) {

	var that = this;

	this.options = {
		autoplay: false,
		playInterval: 4000,
		touchEvents: true,
		arrowButtons: true,
		previousArrowClass: 'carousel-prev-button',
		nextArrowClass: 'carousel-next-button',
		loadedClass: 'loaded',
		activeSlideClass: 'active',
		thresshold: .1
	};

	$.extend( this.options, options );

	this.$element = $element;
	this.$slides = this.$element.children();
	this.$images = this.$element.find( 'img' );

	this.amountOfSlides = this.$slides.length;
	this.activeSlideIndex = 0;
	this.translateX = 0;
	this.dragDistance = 0;
	this.dragDuration = 0;

	utils.loadImages( this.$images, function() {
		that.build();
	} );
};

Carousel.prototype.build = function() {

	this.$wrap = this.$element.wrap( '<div>' ).parent();

	this.$element.addClass( this.options.loadedClass );

	this.$firstSlide = this.$slides.eq( 0 );

	if( this.options.arrowButtons ) {

		this.$prevButton = $( '<button>' )
			.addClass( this.options.previousArrowClass )
			.appendTo( this.$wrap )
		;

		this.$nextButton = $( '<button>' )
			.addClass( this.options.nextArrowClass )
			.appendTo( this.$wrap )
		;
	}

	this.refresh();
	this.bindEvents();

	if( this.options.autoplay ) {
		this.play();
	}
};

Carousel.prototype.destroy = function() {

	this.$element.unwrap();
	this.$element.removeClass( this.options.loadedClass );

	this.$slides.removeAttr( 'style' );
	this.$element.removeAttr( 'style' );

	if( this.options.arrowButtons ) {

		this.$prevButton.remove();
		this.$nextButton.remove();
	}

	this.$slides.removeClass( this.options.activeSlideClass );

	this.pause();
	this.unbindEvents();
};

Carousel.prototype.bindEvents = function() {

	var that = this;

	$( window ).resize( function() {
		that.refresh();
	} );

	if( this.options.arrowButtons ) {

		this.$prevButton.click( function() {
			that.goToPrevious();
			that.pause();
		} );

		this.$nextButton.click( function() {
			that.goToNext();
			that.pause();
		} );
	}

	$( document ).keydown( function( e ) {
		if( e.keyCode === 37 ) {
			that.goToPrevious();
			that.pause();
		}
		else if( e.keyCode === 39 ) {
			that.goToNext();
			that.pause();
		}
	} );

	if( this.options.touchEvents ) {

		var originalTranslateX,
			startPosX,
			startTime
		;

		this.$wrap.bind( 'touchstart', function( e ) {
			var event = e.originalEvent.changedTouches[ 0 ];
			originalTranslateX = that.translateX;
			startPosX = event.clientX;
			startTime = Date.now();
			that.setTransitionTimingFunction( 'ease' );
		} );

		this.$wrap.bind( 'touchmove', function( e ) {
			var event = e.originalEvent.changedTouches[ 0 ];
			that.dragDistance = event.clientX - startPosX;
			that.setTranslateX( originalTranslateX + ( that.dragDistance ) );
			e.preventDefault();
		} );

		this.$wrap.bind( 'touchend', function( e ) {
			that.setTransitionTimingFunction( '' );
			that.dragDuration = ( Date.now() - startTime );
			that.adjustScrollPosition();
			that.dragDistance = 0;
			that.dragDuration = 0;
		} );
	}
};

Carousel.prototype.unbindEvents = function() {

	$( window ).unbind( 'resize' );
	$( document ).unbind( 'keydown' );

};

Carousel.prototype.setTransitionTimingFunction = function( easing ) {
	this.$element.css( {
		'transition-timing-function': easing,
		'-moz-transition-timing-function': easing,
		'-webkit-transition-timing-function': easing
	} );
};

Carousel.prototype.setTransitionDuration = function( n ) {

	this.$element.css( {
		'transition-duration': n + 'ms',
		'-moz-transition-duration': n + 'ms',
		'-webkit-transition-duration': n + 'ms'
	} );
};

Carousel.prototype.setTranslateX = function( n ) {

	this.translateX = n;
	this.$element.css( {
		'transform': 'translate3d( ' + this.translateX + 'px, 0, 0 )',
		'-moz-transform': 'translate3d( ' + this.translateX + 'px, 0, 0 )',
		'-webkit-transform': 'translate3d( ' + this.translateX + 'px, 0, 0 )'
	} );
};

Carousel.prototype.adjustScrollPosition = function() {

	var absoluteDistance = Math.abs( this.dragDistance );

	if( absoluteDistance >  ( this.slideWidth * this.options.thresshold ) ) {

		var speed = ( this.dragDuration / absoluteDistance );
	
		this.setTransitionDuration( speed * 1000 );

		var amountOfSlidesDragged = Math.ceil( absoluteDistance / this.slideWidth );

		if( this.dragDistance < 0 ) {
			if( this.isOnRightEdge ) {
				this.goTo( this.amountOfSlides - 1 );
			}
			else {
				this.goTo( this.activeSlideIndex + amountOfSlidesDragged );
			}
		}

		if( this.dragDistance > 0 ) {
			if( this.isOnLeftEdge ) {
				this.goTo( 0 );
			}
			else {
				this.goTo( this.activeSlideIndex - amountOfSlidesDragged );
			}
		}
	}
	else {
		this.goTo( this.activeSlideIndex );
	}
};

Carousel.prototype.refresh = function() {

	this.activeSlideIndex = 0;

	this.$wrap.removeAttr( 'style' );
	this.$slides.removeAttr( 'style' );
	this.$element.removeAttr( 'style' );

	this.elementWidth = this.$element[0].getBoundingClientRect().width;
	this.slideWidth = this.$firstSlide[0].getBoundingClientRect().width;
	this.slideHeight = this.$firstSlide[0].getBoundingClientRect().height;

	this.$wrap.css( {
		position: 'relative',
		overflow: 'hidden',
		height: this.slideHeight
	} );

	this.amountVisible = Math.ceil( this.elementWidth / this.slideWidth );

	this.totalWidth = ( this.amountOfSlides * this.slideWidth );

	this.$element.css( {
		width: this.totalWidth
	} );

	this.$slides.css( {
		float: 'left',
		width: this.slideWidth
	} );

	this.$wrap.css( {
		width: this.elementWidth
	} );

	this.refreshState();
};

Carousel.prototype.refreshState = function() {

	this.$slides
		.removeClass( this.options.activeSlideClass )
		.eq( this.activeSlideIndex )
		.addClass( this.options.activeSlideClass )
	;

	this.isOnLeftEdge = ( this.activeSlideIndex === 0 );
	
	var restSlides = this.amountOfSlides - this.activeSlideIndex;
	this.isOnRightEdge = ( restSlides <= this.amountVisible );

	this.refreshButtons();
};

Carousel.prototype.refreshButtons = function() {

	if( this.options.arrowButtons ) {

		this.$prevButton.removeClass( 'hide' );
		this.$nextButton.removeClass( 'hide' );

		if( this.isOnLeftEdge ) {
			this.$prevButton.addClass( 'hide' );
		}

		if( this.isOnRightEdge ) {
			this.$nextButton.addClass( 'hide' );
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

		var translateX = Math.max( -( this.activeSlideIndex * this.slideWidth ), -( this.totalWidth - this.elementWidth ) );
		translateX = Math.min( 0, translateX );
		
		this.setTranslateX( translateX );
		this.refreshState();
	}

	if( n < 0 ) {
		this.goTo( 0 );
	}

	if( n >= this.amountOfSlides ) {
		this.goTo( this.amountOfSlides - 1 );
	}
};

Carousel.prototype.play = function() {

	var that = this;

	this.playInterval = setInterval( function() {

		that.goToNext();

	}, this.options.playInterval );

};

Carousel.prototype.pause = function() {

	clearInterval( this.playInterval );

};

module.exports = Carousel;