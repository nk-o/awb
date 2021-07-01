/*!
 * Name    : Advanced WordPress Backgrounds
 * Author  : nK https://nkdev.info
 */

import { throttle } from 'throttle-debounce';

// variables
const {
    AWBData,
    objectFitImages,
} = window;
const $ = window.jQuery;
const $wnd = $( window );
const $doc = $( document );

// Thanks https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser/9851769
/* eslint-disable */
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/g.test(navigator.userAgent || navigator.vendor || window.opera);
const isIE = /*@cc_on!@*/false || !!document.documentMode;
const isEdge = !isIE && !!window.StyleMedia;
const isFirefox = typeof InstallTrigger !== 'undefined';
const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
const isChrome = !!window.chrome && !!window.chrome.webstore;
const isOpera = (!!window.opr && !!window.opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
const isTwentyTwenty = $( '#twentytwenty-style-css, #twenty-twenty-style-css, #twenty-twenty-one-style-css' ).length;
/* eslint-enable */

let wndW = 0;
let wndH = 0;
function getWndSize() {
    wndW = $wnd.width();
    wndH = $wnd.height();
}
getWndSize();
$wnd.on( 'resize load orientationchange', getWndSize );

// enable object-fit
if ( 'undefined' !== typeof objectFitImages ) {
    objectFitImages( '.jarallax-img' );
}

// disable parallax/video on some devices.
let disableParallax = false;
let disableVideo = false;

if ( AWBData.settings && AWBData.settings.disable_parallax && AWBData.settings.disable_parallax.length ) {
    AWBData.settings.disable_parallax.forEach( ( device ) => {
        if ( disableParallax ) {
            return;
        }

        switch ( device ) {
        case 'everywhere':
            disableParallax = true;
            break;
        case 'mobile':
            disableParallax = isMobile;
            break;
        case 'ie':
            disableParallax = isIE;
            break;
        case 'edge':
            disableParallax = isEdge;
            break;
        case 'firefox':
            disableParallax = isFirefox;
            break;
        case 'safari':
            disableParallax = isSafari;
            break;
        case 'chrome':
            disableParallax = isChrome;
            break;
        case 'opera':
            disableParallax = isOpera;
            break;
        // no default
        }
    } );
}
if ( AWBData.settings && AWBData.settings.disable_video && AWBData.settings.disable_video.length ) {
    AWBData.settings.disable_video.forEach( ( device ) => {
        if ( disableVideo ) {
            return;
        }

        switch ( device ) {
        case 'everywhere':
            disableVideo = true;
            break;
        case 'mobile':
            disableVideo = isMobile;
            break;
        case 'ie':
            disableVideo = isIE;
            break;
        case 'edge':
            disableVideo = isEdge;
            break;
        case 'firefox':
            disableVideo = isFirefox;
            break;
        case 'safari':
            disableVideo = isSafari;
            break;
        case 'chrome':
            disableVideo = isChrome;
            break;
        case 'opera':
            disableVideo = isOpera;
            break;
        // no default
        }
    } );
}

/**
 * In Viewport checker
 * return visible percent from 0 to 1
 *
 * @param {Object} $item - jQuery object.
 * @param {Bool} returnRect - return array with result and rect.
 *
 * @return {Mixed} - in viewport flag.
 */
function isInViewport( $item, returnRect ) {
    const rect = $item[ 0 ].getBoundingClientRect();
    let result = 1;

    if ( 0 >= rect.right || rect.left >= wndW ) {
        result = 0;
    } else if ( 0 > rect.bottom && rect.top <= wndH ) {
        result = 0;
    } else {
        const beforeTopEnd = Math.max( 0, rect.height + rect.top );
        const beforeBottomEnd = Math.max( 0, rect.height - ( rect.top + rect.height - wndH ) );
        const afterTop = Math.max( 0, -rect.top );
        const beforeBottom = Math.max( 0, rect.top + rect.height - wndH );

        if ( rect.height < wndH ) {
            result = 1 - ( ( afterTop || beforeBottom ) / rect.height );
        } else if ( beforeTopEnd <= wndH ) {
            result = beforeTopEnd / wndH;
        } else if ( beforeBottomEnd <= wndH ) {
            result = beforeBottomEnd / wndH;
        }
        result = 0 > result ? 0 : result;
    }
    if ( returnRect ) {
        return [ result, rect ];
    }
    return result;
}

/**
 * Mouse Parallax
 */
let $parallaxMouseList = false;
let parallaxMouseTimeout;
let parallaxMouseFirstRun = 1;

// run parallax animation
function parallaxMouseRun( x, y, deviceOrientation ) {
    let data;
    let itemX;
    let itemY;
    $parallaxMouseList.each( function() {
        const $this = $( this );
        data = $this.data( 'awb-mouse-data' );

        // don't animate if block isn't in viewport
        if ( 'object' !== typeof data || ( ! data.is_in_viewport && ! ( deviceOrientation && parallaxMouseFirstRun ) ) ) {
            return;
        }

        // device acceleration calculate
        if ( deviceOrientation ) {
            itemX = -data.size * x;
            itemY = -data.size * y;

        // mouse calculate
        } else {
            itemX = ( data.rect.width - ( x - data.rect.left ) ) / data.rect.width;
            itemY = ( data.rect.height - ( y - data.rect.top ) ) / data.rect.height;
            if ( 1 < itemX || 0 > itemX || 1 < itemY || 0 > itemY ) {
                itemX = 0.5;
                itemY = 0.5;
            }
            itemX = data.size * ( itemX - 0.5 ) * 2;
            itemY = data.size * ( itemY - 0.5 ) * 2;
        }

        // if first run orientation on device, set default values without animation
        if ( deviceOrientation && parallaxMouseFirstRun ) {
            $this.css( {
                transform: `translateX(${ itemX }px) translateY(${ itemY }px) translateZ(0)`,
            } );
        } else {
            $this.css( {
                transition: `transform ${ deviceOrientation ? 2 : data.speed }s  cubic-bezier(.22, .63, .6, .88)`,
                transform: `translateX(${ itemX }px) translateY(${ itemY }px) translateZ(0)`,
            } );
        }
    } );
    parallaxMouseFirstRun = 0;
}
const throttledParallaxMouseRun = throttle( 200, ( x, y, deviceOrientation ) => {
    parallaxMouseRun( x, y, deviceOrientation );
} );

function parallaxMouseInit( force ) {
    function run() {
        const $newParallax = $( '.nk-awb .nk-awb-wrap.nk-awb-mouse-parallax' ).children( '.nk-awb-inner' );
        if ( $newParallax.length ) {
            // add new parallax blocks
            if ( $parallaxMouseList ) {
                $parallaxMouseList = $newParallax;

                // first init parallax
            } else {
                $parallaxMouseList = $newParallax;

                if ( isMobile && window.DeviceOrientationEvent ) {
                    $wnd.on( 'deviceorientation', ( event ) => {
                        throttledParallaxMouseRun( event.originalEvent.gamma / 90, event.originalEvent.beta / 180, true );
                    } );

                // no smooth on firefox
                } else {
                    $wnd.on( 'mousemove', ( event ) => {
                        throttledParallaxMouseRun( event.clientX, event.clientY );
                    } );
                }
            }
        }

        // update data for parallax blocks
        if ( $parallaxMouseList ) {
            $parallaxMouseList.each( function() {
                const $this = $( this );
                const $parent = $this.parent();
                const size = parseFloat( $parent.attr( 'data-awb-mouse-parallax-size' ) ) || 30;
                const speed = parseFloat( $parent.attr( 'data-awb-mouse-parallax-speed' ) ) || 10000;

                $this.data( 'awb-mouse-data', {
                    is_in_viewport: isInViewport( $parent ) ? $parent.is( ':visible' ) : 0,
                    rect: $parent[ 0 ].getBoundingClientRect(),
                    size,
                    speed: speed / 1000,
                } );
                $this.css( {
                    left: -size,
                    right: -size,
                    top: -size,
                    bottom: -size,
                } );
            } );
        }
    }

    // run force without timeout
    clearTimeout( parallaxMouseTimeout );
    if ( force ) {
        run();
    } else {
        parallaxMouseTimeout = setTimeout( parallaxMouseTimeout, 100 );
    }
}
$wnd.on( 'resize scroll orientationchange load', parallaxMouseInit );
setInterval( parallaxMouseInit, 3000 );

/**
 * Stretch Background
 */
function stretchAwb() {
    $( '.nk-awb:not(.wpb_column)' ).children( '.nk-awb-wrap[data-awb-stretch="true"]' ).each( function() {
        const $this = $( this );
        const rect = this.getBoundingClientRect();
        const { left } = rect;
        const right = wndW - rect.right;

        const ml = parseFloat( $this.css( 'margin-left' ) || 0 );
        const mr = parseFloat( $this.css( 'margin-right' ) || 0 );
        $this.css( {
            'margin-left': ml - left,
            'margin-right': mr - right,
        } );
    } );

    // column stretch
    $( '.nk-awb.wpb_column' ).children( '.nk-awb-wrap[data-awb-stretch="true"]' ).each( function() {
        const $this = $( this );
        const $row = $this.closest( '.vc_row' );
        const $col = $this.closest( '.wpb_column' );
        const rectAWB = this.getBoundingClientRect();
        const rectRow = $row[ 0 ].getBoundingClientRect();
        const rectCol = $col[ 0 ].getBoundingClientRect();
        const leftAWB = rectAWB.left;
        const rightAWB = wndW - rectAWB.right;
        const leftRow = rectRow.left + ( parseFloat( $row.css( 'padding-left' ) ) || 0 );
        const rightRow = wndW - rectRow.right + ( parseFloat( $row.css( 'padding-right' ) ) || 0 );
        const leftCol = rectCol.left;
        const rightCol = wndW - rectCol.right;
        const css = {
            'margin-left': 0,
            'margin-right': 0,
        };

        // We need to round numbers because in some situations the same blocks have different offsets, for example
        // Row right is 68
        // Col right is 68.015625
        // I don't know why :(
        if ( Math.round( leftRow ) === Math.round( leftCol ) ) {
            const ml = parseFloat( $this.css( 'margin-left' ) || 0 );
            css[ 'margin-left' ] = ml - leftAWB;
        }

        if ( Math.round( rightRow ) === Math.round( rightCol ) ) {
            const mr = parseFloat( $this.css( 'margin-right' ) || 0 );
            css[ 'margin-right' ] = mr - rightAWB;
        }

        $this.css( css );
    } );

    // Gutenberg stretch fallback
    if ( AWBData.settings.full_width_fallback ) {
        $( '.nk-awb.alignfull' ).each( function() {
            const $this = $( this ).children( '.nk-awb-wrap' );

            if ( ! $this[ 0 ] ) {
                return;
            }

            const rect = $this[ 0 ].getBoundingClientRect();
            const { left } = rect;
            const right = wndW - rect.right;
            const { bottom } = rect;

            const ml = parseFloat( $this.css( 'margin-left' ) || 0 );
            const mr = parseFloat( $this.css( 'margin-right' ) || 0 );
            const mb = parseFloat( $this.css( 'margin-bottom' ) || 0 );

            let changeLeft = ml - left;
            let changeRight = mr - right;
            let changeBottom = '';

            // Ghostkit column support
            if ( $this.closest( '.ghostkit-col' ).length ) {
                const $row = $this.closest( '.ghostkit-grid' );
                const $col = $this.closest( '.ghostkit-col' );
                const rectRow = $row[ 0 ].getBoundingClientRect();
                const rectCol = $col[ 0 ].getBoundingClientRect();
                const leftRow = rectRow.left;
                const rightRow = wndW - rectRow.right;
                const leftCol = rectCol.left;
                const rightCol = wndW - rectCol.right;
                const bottomCol = rectCol.bottom;

                // We need to round numbers because in some situations the same blocks has different offsets, for example
                // Row right is 68
                // Col right is 68.015625
                // I don't know why :(
                if ( Math.round( leftRow ) !== Math.round( leftCol ) ) {
                    changeLeft = leftCol - left + ml;
                }
                if ( Math.round( rightRow ) !== Math.round( rightCol ) ) {
                    changeRight = rightCol - right + mr;
                }

                changeBottom = mb - ( bottomCol - bottom );
            }

            $this.css( {
                'margin-left': changeLeft,
                'margin-right': changeRight,
                'margin-bottom': changeBottom,
            } );
        } );
    }
}

/**
 * Srcset fix with object-fit: cover.
 *
 * Reasons:
 *   https://wordpress.org/support/topic/awb-full-image-on-mobile-blurry/
 *   https://wordpress.org/support/topic/supplement-to-awb-full-image-on-mobile-blurry/
 */
function fixSrcsetAwb() {
    $( '.nk-awb .nk-awb-inner img' ).each( function() {
        const $img = $( this );

        if ( ! $img[ 0 ] ) {
            return;
        }

        const CSS = window.getComputedStyle( this, null );

        if ( CSS && CSS.objectFit && 'cover' === CSS.objectFit ) {
            const imgHeight = parseInt( this.getAttribute( 'height' ), 10 );
            const imgWidth = parseInt( this.getAttribute( 'width' ), 10 );

            if ( imgHeight ) {
                let calculatedWidth = this.clientWidth;

                if ( imgWidth / imgHeight > this.clientWidth / this.clientHeight ) {
                    calculatedWidth = parseInt( ( this.clientHeight * imgWidth ) / imgHeight, 10 );
                }

                this.setAttribute( 'sizes', `${ calculatedWidth }px` );
            }
        }
    } );
}

/**
 * Custom styles fallback if GhostKit plugin is not installed.
 */
let customStyles = '';
function maybeFallbackGhostkitStyles() {
    if ( window.GHOSTKIT ) {
        return;
    }

    const $blocksWithStyles = $( '.nk-awb[data-ghostkit-styles]' );

    if ( $blocksWithStyles.length ) {
        $blocksWithStyles.each( function() {
            customStyles += $( this ).attr( 'data-ghostkit-styles' );
            $( this ).removeAttr( 'data-ghostkit-styles' );
        } );

        let $style = $( '#ghostkit-awb-custom-css-inline-css' );
        if ( ! $style.length ) {
            $style = $( '<style id="ghostkit-awb-custom-css-inline-css">' ).appendTo( 'head' );
        }
        $style.html( customStyles );
    }
}

/**
 * Fix Jetpack Lazy Loading conflict.
 * Jetpack make image clone and our Jarallax stop working.
 */
$doc.on( 'jetpack-lazy-loaded-image', '.jarallax-img', ( e ) => {
    const $parent = $( e.target ).parent().parent();

    if ( $parent[ 0 ].jarallax && $parent[ 0 ].jarallax.image && $parent[ 0 ].jarallax.image.$item ) {
        $parent[ 0 ].jarallax.image.$item = e.target;
    }
} );

/**
 * Main AWB Init
 */
window.nkAwbInit = function() {
    // init mouse parallax
    const $newMousePrallax = $( '.nk-awb .nk-awb-wrap[data-awb-mouse-parallax-size]:not(.nk-awb-mouse-parallax)' );
    if ( $newMousePrallax.length ) {
        $newMousePrallax.addClass( 'nk-awb-mouse-parallax' );
        parallaxMouseInit( true );
    }

    // prepare vc_row
    $( '.nk-awb-after-vc_row' ).each( function() {
        const $this = $( this );
        let $vcClearfix = $this.prev( '.vc_clearfix' );
        $vcClearfix = $vcClearfix.length ? $vcClearfix : false;
        const $vcRow = ( $vcClearfix || $this ).prev( '.vc_row:not(.nk-awb)' );

        if ( $vcRow.length ) {
            const $children = $this.children( '.nk-awb-wrap' );

            // remove stretch option from AWB if stretch enabled on ROW
            if ( $vcRow.is( '[data-vc-full-width=true]' ) ) {
                $children.removeAttr( 'data-awb-stretch' );
            }

            // insert AWB in row
            $vcRow.addClass( 'nk-awb' );
            $vcRow.append( $children );
        }

        $this.remove();
    } );

    // prepare vc_column
    $( '.nk-awb-after-vc_column' ).each( function() {
        const $this = $( this );
        const $vcColumn = $this.prev( '.wpb_column:not(.nk-awb)' );
        const $vcRow = $vcColumn.closest( '.vc_row' );

        if ( $vcColumn.length ) {
            const $children = $this.children( '.nk-awb-wrap' );

            // remove stretch option from AWB if stretch enabled on ROW
            if ( $vcRow.is( '[data-vc-stretch-content=true]' ) ) {
                $children.removeAttr( 'data-awb-stretch' );
            }

            // insert AWB in row
            $vcColumn.addClass( 'nk-awb' );
            $vcColumn.append( $children );
        }

        $this.remove();
    } );

    // Ghostkit styles fallback
    maybeFallbackGhostkitStyles();

    // stretch
    stretchAwb();

    // fix srcset
    fixSrcsetAwb();

    // init jarallax
    if ( 'undefined' === typeof $.fn.jarallax ) {
        return;
    }

    $( '.nk-awb .nk-awb-wrap:not(.nk-awb-rendered)' ).each( function() {
        const $this = $( this ).addClass( 'nk-awb-rendered' );
        const type = $this.attr( 'data-awb-type' );
        const imageBgSize = $this.attr( 'data-awb-image-background-size' );
        const imageBgPosition = $this.attr( 'data-awb-image-background-position' );
        let video = false;
        let videoStartTime = 0;
        let videoEndTime = 0;
        let videoVolume = 0;
        let videoLoop = true;
        let videoAlwaysPlay = true;
        let videoMobile = false;
        let parallax = $this.attr( 'data-awb-parallax' );
        let parallaxSpeed = $this.attr( 'data-awb-parallax-speed' );
        let parallaxMobile = 'true' === $this.attr( 'data-awb-parallax-mobile' ) || '1' === $this.attr( 'data-awb-parallax-mobile' );

        // video type
        if ( 'yt_vm_video' === type || 'video' === type ) {
            video = $this.attr( 'data-awb-video' );
            videoStartTime = parseFloat( $this.attr( 'data-awb-video-start-time' ) ) || 0;
            videoEndTime = parseFloat( $this.attr( 'data-awb-video-end-time' ) ) || 0;
            videoVolume = parseFloat( $this.attr( 'data-awb-video-volume' ) ) || 0;
            videoLoop = 'false' !== $this.attr( 'data-awb-video-loop' );
            videoAlwaysPlay = 'true' === $this.attr( 'data-awb-video-always-play' );
            videoMobile = '1' === $this.attr( 'data-awb-video-mobile' ) || 'true' === $this.attr( 'data-awb-video-mobile' );

            // we need to enable parallax options to play videos
            // https://github.com/nk-crew/awb/issues/17
            if ( video && ! parallax && ! parallaxSpeed ) {
                parallax = 'scroll';
                parallaxSpeed = 1;
                parallaxMobile = videoMobile;
            }
        }

        // prevent if no parallax and no video
        if ( ! parallax && ! video ) {
            // we need to add object-fit manually, as we don't use Jarallax
            const objectSize = $this.attr( 'data-awb-image-background-size' ) || 'cover';
            const objectPosition = $this.attr( 'data-awb-image-background-position' ) || '50% 50%';

            $this.find( '.jarallax-img' ).css( {
                objectFit: objectSize,
                objectPosition,
                // support for plugin https://github.com/bfred-it/object-fit-images
                fontFamily: `object-fit: ${ objectSize }; object-position: ${ objectPosition };`,
            } );

            return;
        }

        const jarallaxParams = {
            type: parallax,
            speed: parallaxSpeed,
            disableParallax() {
                return disableParallax || ( parallaxMobile ? false : isMobile );
            },
            disableVideo() {
                return disableVideo || ( videoMobile ? false : isMobile );
            },
            imgSize: imageBgSize || 'cover',
            imgPosition: imageBgPosition || '50% 50%',
        };

        if ( 'pattern' === imageBgSize ) {
            jarallaxParams.imgSize = 'auto';
            jarallaxParams.imgRepeat = 'repeat';
        }

        if ( video ) {
            jarallaxParams.speed = parallax ? parallaxSpeed : 1;
            jarallaxParams.videoSrc = video;
            jarallaxParams.videoStartTime = videoStartTime;
            jarallaxParams.videoEndTime = videoEndTime;
            jarallaxParams.videoVolume = videoVolume;
            jarallaxParams.videoLoop = videoLoop;
            jarallaxParams.videoPlayOnlyVisible = ! videoAlwaysPlay;
        }

        const $inner = $this.children( '.nk-awb-inner' );
        const $pictureImg = $inner.find( 'picture .jarallax-img' );

        if ( $pictureImg.length ) {
            $pictureImg.removeClass( 'jarallax-img' );
            $pictureImg.closest( 'picture' ).addClass( 'jarallax-img' );
        }

        // Fix for TwentyTwenty and TwentyTwentyOne (using custom CSS) video styles conflict.
        // https://github.com/WordPress/twentytwenty/blob/master/assets/js/index.js#L294-L318
        // https://github.com/WordPress/twentytwentyone/blob/trunk/assets/js/responsive-embeds.js#L14-L30
        if ( isTwentyTwenty ) {
            jarallaxParams.onInit = function() {
                $inner.children().addClass( 'intrinsic-ignore' );
            };
        }

        $inner.jarallax( jarallaxParams );
    } );
};

// init awb.
$( document ).ready( () => {
    window.nkAwbInit();
} );
const throttledInitAwb = throttle( 200, () => {
    $( document ).ready( () => {
        window.nkAwbInit();
    } );
} );
if ( window.MutationObserver ) {
    new window.MutationObserver( throttledInitAwb )
        .observe( document.documentElement, {
            childList: true, subtree: true,
        } );
} else {
    $( document ).on( 'DOMContentLoaded DOMNodeInserted load', () => {
        throttledInitAwb();
    } );
}

// init stretch
$wnd.on( 'resize orientationchange load', throttle( 200, stretchAwb ) );
$wnd.on( 'resize orientationchange load', throttle( 200, fixSrcsetAwb ) );
