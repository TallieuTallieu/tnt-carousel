!function t(e,i,s){function n(r,a){if(!i[r]){if(!e[r]){var h="function"==typeof require&&require;if(!a&&h)return h(r,!0);if(o)return o(r,!0);var l=new Error("Cannot find module '"+r+"'");throw l.code="MODULE_NOT_FOUND",l}var d=i[r]={exports:{}};e[r][0].call(d.exports,function(t){var i=e[r][1][t];return n(i?i:t)},d,d.exports,t,e,i,s)}return i[r].exports}for(var o="function"==typeof require&&require,r=0;r<s.length;r++)n(s[r]);return n}({1:[function(t,e,i){"use strict";var s=t("../src/Carousel.js");new s(document.querySelector(".carousel"),{mouseSwipe:!1})},{"../src/Carousel.js":2}],2:[function(t,e,i){"use strict";var s=function(t,e){var i,s={};for(i in t)Object.prototype.hasOwnProperty.call(t,i)&&(s[i]=t[i]);for(i in e)Object.prototype.hasOwnProperty.call(e,i)&&(s[i]=e[i]);return s},n=function(t){t&&t.parentNode&&t.parentNode.removeChild(t)},o=function(t,e){var i=0,s=t.length;0===s&&e();for(var n=0;n<t.length;n++){var o=new Image;o.onload=function(){i++,i===s&&e()},o.src=t[n].getAttribute("src")}},r=function(t,e){e=e||{};var i={autoplay:!1,autoplayInterval:4e3,touchSwipe:!0,mouseSwipe:!0,keyEvents:!1,arrowButtons:!0,arrowButtonsContainer:null,previousArrowClass:"carousel-prev-button",nextArrowClass:"carousel-next-button",inactiveArrowClass:"hide",loadedClass:"loaded",activeSlideClass:"active",edgeFriction:.1};this.options=s(i,e),this.eventqueue={},this._element=t,this._slides=this._element.children,this.amountOfSlides=this._slides.length,this.activeSlideIndex=0,this.translateX=0,this.dragDistanceX=0,this.dragDistanceY=0,this.dragDuration=0,this.isBuilt=!1;var n=this;this.amountOfSlides>0&&o(this._element.getElementsByTagName("img"),function(){n.build()})};r.prototype.on=function(t,e){"undefined"==typeof this.eventqueue[t]&&(this.eventqueue[t]=[]),this.eventqueue[t].push(e)},r.prototype.trigger=function(t,e){"undefined"!=typeof this.eventqueue[t]&&this.eventqueue[t].forEach(function(t){t(e)})},r.prototype.build=function(){this.isBuilt||(this._wrap=document.createElement("div"),this._element.parentElement.insertBefore(this._wrap,this._element),this._wrap.appendChild(this._element),this._element.classList.add(this.options.loadedClass),this._firstSlide=this._slides[0],this.options.arrowButtons&&(this._prevButton=document.createElement("button"),this._prevButton.classList.add(this.options.previousArrowClass),this._nextButton=document.createElement("button"),this._nextButton.classList.add(this.options.nextArrowClass),this.options.arrowButtonsContainer?(this.options.arrowButtonsContainer.appendChild(this._prevButton),this.options.arrowButtonsContainer.appendChild(this._nextButton)):(this._wrap.appendChild(this._prevButton),this._wrap.appendChild(this._nextButton))),this.refresh(),this.bindEvents(),this.options.autoplay&&this.play(),this.isBuilt=!0)},r.prototype.destroy=function(){if(this.isBuilt){this._element.removeAttribute("style"),this._element.classList.remove(this.options.loadedClass),this.options.arrowButtons&&(n(this._prevButton),n(this._nextButton));for(var t=0;t<this._slides.length;t++)this._slides[t].removeAttribute("style"),this._slides[t].classList.remove(this.options.activeSlideClass);this.pause(),this.unbindEvents(),this.isBuilt=!1}},r.prototype.bindEvents=function(){var t,e,i,s,n,o,r=this,a=function(t){r.refresh()},h=function(t){r.pause(),r.goToNext()},l=function(t){r.pause(),r.goToPrevious()},d=function(t){37===t.keyCode?(r.pause(),r.goToPrevious()):39===t.keyCode&&(r.pause(),r.goToNext())},u=function(n){o=!0;var a=n;n.changedTouches&&(a=n.changedTouches[0]),t=r.translateX,e=a.clientX,i=a.clientY,s=Date.now(),r.setTransition("none")},p=function(s){if(o){var a=s;s.changedTouches&&(a=s.changedTouches[0]),r.dragDistanceX=a.clientX-e,r.dragDistanceY=a.clientY-i,r.setTranslateX(t+r.dragDistanceX),Math.abs(r.dragDistanceX)>0&&(n=Math.abs(r.dragDistanceY)/Math.abs(r.dragDistanceX)||0),(n>0&&1>n||"mousemove"===s.type)&&s.preventDefault()}},c=function(t){o=!1,n=0,r.setTransition(""),r.setTransitionTimingFunction(""),r.dragDuration=Date.now()-s,r.adjustScrollPosition(),r.dragDistanceX=0,r.dragDistanceY=0,r.dragDuration=0};window.addEventListener("resize",a),this.options.touchSwipe&&(this._wrap.addEventListener("touchstart",u),this._wrap.addEventListener("touchmove",p),this._wrap.addEventListener("touchend",c)),this.options.mouseSwipe&&(this._wrap.addEventListener("mousedown",u),this._wrap.addEventListener("mousemove",p),this._wrap.addEventListener("mouseup",c)),this.options.keyEvents&&document.addEventListener("keydown",d),this.options.arrowButtons&&(this._prevButton.addEventListener("click",l),this._nextButton.addEventListener("click",h))},r.prototype.unbindEvents=function(){window.removeEventListener("resize"),document.removeEventListener("keydown")},r.prototype.setTransition=function(t){this._element.style.transition=t,this._element.style.MozTransition=t,this._element.style.webkitTransition=t,this._element.style.msTransition=t,this._element.style.OTransition=t},r.prototype.setTransitionTimingFunction=function(t){this._element.style.transitionTimingFunction=t,this._element.style.MozTransitionTimingFunction=t,this._element.style.webkitTransitionTimingFunction=t,this._element.style.msTransitionTimingFunction=t,this._element.style.OTransitionTimingFunction=t},r.prototype.setTransitionDuration=function(t){this._element.style.transitionDuration=t+"ms",this._element.style.MozTransitionDuration=t+"ms",this._element.style.webkitTransitionDuration=t+"ms",this._element.style.msTransitionDuration=t+"ms",this._element.style.OTransitionDuration=t+"ms"},r.prototype.setTranslateX=function(t){this.translateX=t,this._element.style.transform="translate3d("+this.translateX+"px, 0, 0)",this._element.style.MozTransform="translateX("+this.translateX+"px)",this._element.style.webkitTransform="translate3d("+this.translateX+"px, 0, 0)",this._element.style.msTransform="translateX("+this.translateX+"px)",this._element.style.OTransform="translateX("+this.translateX+"px)"},r.prototype.adjustScrollPosition=function(){var t=Math.abs(this.dragDistanceX);if(t>this.slideWidth*this.options.edgeFriction){var e=this.dragDuration/t;this.setTransitionDuration(200*e);var i=Math.ceil(t/this.slideWidth);this.dragDistanceX<0&&(this.isOnRightEdge?this.goTo(this.amountOfSlides-1):this.goTo(this.activeSlideIndex+i)),this.dragDistanceX>0&&(this.isOnLeftEdge?this.goTo(0):this.goTo(this.activeSlideIndex-i))}else this.goTo(this.activeSlideIndex)},r.prototype.refresh=function(){var t=this;t.activeSlideIndex=0;for(var e=0;e<t._slides.length;e++)t._slides[e].removeAttribute("style");t._wrap.removeAttribute("style"),t._element.removeAttribute("style"),t.elementWidth=t._element.offsetWidth,t.slideWidth=t._firstSlide.offsetWidth,t.slideHeight=t._firstSlide.offsetHeight,t.amountVisible=Math.round(t.elementWidth/t.slideWidth),t.totalWidth=t.amountOfSlides*t.slideWidth,t._wrap.style.width=t.elementWidth+"px",t._wrap.style.position="relative",t._wrap.style.overflow="hidden",t._wrap.style.height=t.slideHeight+"px",t._element.style.width=t.totalWidth+"px";for(var e=0;e<t._slides.length;e++)t._slides[e].style["float"]="left",t._slides[e].style.width=t.slideWidth+"px";t.refreshState()},r.prototype.refreshState=function(){for(var t=0;t<this._slides.length;t++)this._slides[t].classList.remove(this.options.activeSlideClass);this._slides[this.activeSlideIndex].classList.add(this.options.activeSlideClass),this.isOnLeftEdge=0===this.activeSlideIndex,this.isOnRightEdge=this.amountOfSlides-this.activeSlideIndex<=this.amountVisible,this.refreshButtons()},r.prototype.refreshButtons=function(){this.options.arrowButtons&&(this._prevButton.classList.remove("hide"),this._nextButton.classList.remove("hide"),this.isOnLeftEdge&&this._prevButton.classList.add("hide"),this.isOnRightEdge&&this._nextButton.classList.add("hide"))},r.prototype.goToNext=function(){this.goTo(this.activeSlideIndex+1)},r.prototype.goToPrevious=function(){this.goTo(this.activeSlideIndex-1)},r.prototype.goTo=function(t){if(t>=0&&t<this.amountOfSlides){this.activeSlideIndex=t;var e=Math.max(-(this.activeSlideIndex*this.slideWidth),-(this.totalWidth-this.elementWidth));e=Math.min(0,e),this.setTranslateX(e),this.refreshState()}return 0>t?void this.goTo(this.amountOfSlides-1):t>=this.amountOfSlides?void this.goTo(0):void this.trigger("goTo",{index:t})},r.prototype.play=function(){var t=this;this.playInterval=setInterval(function(){t.goToNext()},this.options.autoplayInterval)},r.prototype.pause=function(){clearInterval(this.playInterval)},e.exports=r},{}]},{},[1]);