var currentAngle = 0;
(function () {
  var rotatingSlider = function (selector, options) {
    // debugger;
    function initSingleSlider($el, options) {
      var $slider, $rotaters,
        $handle, $handleItems,
        numOfItems,
        angle,
        prefix = ".slider3d__",
        handlePrefix = prefix + "handle__",
        rotating = false;

      var defaultOptions = {
        xRotation: false,
        speed: 1100,
        dragSpeedCoef: 0.7,
        handleSpeedCoef: 6,
        easing: "ease",
        persMult: 1.6,
        handlePersMult: 3,
        scrollRotation: true,
        keysRotation: true,
        globalDragRotation: false,
        withControls: true,
        handleAndGlobalDrag: false,
        allowDragDuringAnim: false,
        allowScrollDuringAnim: false,
        allowKeysDuringAnim: false,
        allowControlsDuringAnim: false
      };

      var __opts = $.extend(defaultOptions, options);

      var axis = (__opts.xRotation) ? "Y" : "X";
      // var axis = (__opts.xRotation) ? "X" : "Y";
      var angleMult = (__opts.xRotation) ? 1 : -1;

      function handleActiveItem() {
        if (!__opts.withControls) return;
        $handleItems.removeClass("active");
        var a = currentAngle % 360 / angle;
        if (a < 0) a = numOfItems + a;
        if (a > 0) a = a + 1;
        if (!a) a = 1;
        $handleItems.eq(a - 1).addClass("active");
      };

      function rotateSlider(delta) {
        $('.arrow').addClass('d-none');
        var newAngle = currentAngle + delta * angle;

        $rotaters.css({
          "transform": "rotate" + axis + "(" + (newAngle * angleMult * -1) + "deg)",
          "transition": "transform " + __opts.speed / 1000 + "s " + __opts.easing
        });
        currentAngle = newAngle;

        setTimeout(function () {
          $rotaters.css("transition", "transform 0s");
          handleActiveItem();
          rotating = false;
        }, __opts.speed);

        return false;
      }

      function navigateUp() {
        rotateSlider(-1);
      };

      function navigateDown() {
        rotateSlider(1);
      };

      function scrollHandler(e) {
        if (rotating && !__opts.allowScrolluringAnim) return;
        rotating = true;
        var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
        if (delta > 0) {
          navigateUp();
        } else if (delta < 0) {
          navigateDown();
        }
      };

      function keydownHandler(e) {
        if (rotating && !__opts.allowKeysDuringAnim) return;
        rotating = true;
        if (e.which === 38) {
          navigateUp();
        } else if (e.which === 40) {
          navigateDown();
        }
      }

      function dragRotationHandler(e) {
        if (rotating && !__opts.allowDragDuringAnim) return;
        rotating = true;
        $slider.addClass("no-select");

        var startVal;
        if (__opts.xRotation) {
          startVal = e.pageX || e.originalEvent.touches[0].pageX;
        } else {
          startVal = e.pageY || e.originalEvent.touches[0].pageY;
        }
        var sliderS = (__opts.xRotation) ? $slider.width() : $slider.height();
        var deltaVal = 0;
        var newAngle;
        var angleDelta;
        var isHandle = $(this).hasClass("js-handle");
        var rotationCoef;
        if (isHandle) {
          rotationCoef = __opts.handleSpeedCoef;
        } else {
          rotationCoef = __opts.dragSpeedCoef;
        }

        if (__opts.scrollRotation) {
          $slider.off("mousewheel DOMMouseScroll", scrollHandler);
        }

        $(document).on("mousemove touchmove", function (e) {
          var val;
          if (__opts.xRotation) {
            val = e.pageX || e.originalEvent.touches[0].pageX;
          } else {
            val = e.pageY || e.originalEvent.touches[0].pageY;
          }
          deltaVal = (startVal - val) / sliderS * rotationCoef;
          newAngle = currentAngle + deltaVal * angle;
          angleDelta = newAngle - currentAngle;

          $rotaters.css("transform", "rotate" + axis + "(" + (newAngle * angleMult * -1) + "deg)");
        });

        $(document).on("mouseup touchend", function (e) {
          $(document).off("mousemove touchmove mouseup touchend");
          $slider.removeClass("no-select");

          if (!deltaVal) {
            rotating = false;
            if (__opts.scrollRotation) {
              $slider.on("mousewheel DOMMouseScroll", scrollHandler);
            }
            return;
          }

          var slidesRotated = Math.round(angleDelta / angle);
          rotateSlider(slidesRotated);
          deltaVal = 0;

          setTimeout(function () {
            if (__opts.scrollRotation) {
              $slider.on("mousewheel DOMMouseScroll", scrollHandler);
            }
          }, __opts.speed);
        });

      };

      function initControls() {
        var $controls = $(prefix + "controls");
        $handle = $(prefix + "handle", $slider);
        var $handleInner = $(handlePrefix + "inner", $handle);
        $handleItems = $(handlePrefix + "item", $handle);
        var s = (__opts.xRotation) ? $handle.width() : $handle.height();
        var pers = s * __opts.handlePersMult;
        var depth = s / 2 / Math.tan(angle / 2 * Math.PI / 180);

        $slider.addClass("with-controls");
        $handle.css({
          "-webkit-perspective": pers + "px",
          "perspective": pers + "px"
        })
          .addClass("js-handle");
        $handleInner.css("transform", "translateZ(-" + depth + "px)");

        if (__opts.xRotation) $controls.addClass("m--xAxis");

        $handleItems.each(function (index) {
          $(this).css("transform", "rotate" + axis + "(" + (index * angle * angleMult) + "deg) translateZ(" + depth + "px)");
        });

        $rotaters = $(prefix + "rotater, " + handlePrefix + "rotater", $slider);

        $handle.on("mousedown touchstart", dragRotationHandler);

        $(document).on("click", ".slider3d__control", function () {
          if (rotating && !__opts.allowControlsDuringAnim) return;
          rotating = true;
          if ($(this).hasClass("m--up")) {
            navigateUp();
          } else {
            navigateDown();
          }
        });
      };

      function initSlider($el) {
        // debugger;
        $slider = $el;
        var $wrapper = $(prefix + "wrapper", $slider);
        var $inner = $(prefix + "inner", $slider);
        var $items = $(prefix + "item", $slider);
        numOfItems = $items.length;
        angle = 360 / numOfItems;
        var s = (__opts.xRotation) ? $slider.width() : $slider.height();
        var pers = (s * __opts.persMult);
        var depth = s / 2 / Math.tan(angle / 2 * Math.PI / 180);

        if (numOfItems > 18) {
          $wrapper.css({
            "-webkit-perspective": "50px",
            "perspective": "50px"
          });
        } else if (numOfItems > 14) {
          $wrapper.css({
            "-webkit-perspective": "90px",
            "perspective": "90px"
          });
        } else if (numOfItems > 9) {
          $wrapper.css({
            "-webkit-perspective": "115px",
            "perspective": "115px"
          });
        } else if (numOfItems > 7) {
          $wrapper.css({
            "-webkit-perspective": "150px",
            "perspective": "130px"
          });
        } else if (numOfItems > 6) {
          $wrapper.css({
            "-webkit-perspective": "390px",
            "perspective": "390px"
          });
        } else if (numOfItems > 5) {
          $wrapper.css({
            "-webkit-perspective": "420px",
            "perspective": "420px"
          });
        } else if (numOfItems > 4) {
          $wrapper.css({
            "-webkit-perspective": "450px",
            "perspective": "450px"
          });
        } else {
          $wrapper.css({
            "-webkit-perspective": pers + "px",
            "perspective": pers + "px"
          });
        }

        $inner.css("transform", "translateZ(-" + depth + "px)");

        $items.each(function (index) {
          $(this).css("transform", "rotate" + axis + "(" + (index * angle * angleMult) + "deg) translateZ(" + depth + "px)");
        });

        $slider.addClass("slider-ready");

        $rotaters = $(prefix + "rotater", $slider);

        if (__opts.scrollRotation) {
          $slider.on("mousewheel DOMMouseScroll", scrollHandler);
        }
        if (__opts.keysRotation) {
          if (!$slider.attr("tabindex")) {
            $slider.attr("tabindex", 1);
          }
          $slider.on("keydown", keydownHandler);
        }
        if (__opts.globalDragRotation) {
          $slider.on("mousedown touchstart", dragRotationHandler);
        }
        if (__opts.withControls) {
          initControls();
        }
      };

      initSlider($el);

    }

    function globalInit() {
      $(selector).each(function () {
        initSingleSlider($(this), options);
      });
    };

    function debounce(func, wait, immediate) {
      var timeout;
      return function () {
        var context = this, args = arguments;
        var later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    };

    // var resizeFn = debounce(function () {
    //   globalInit();
    // }, 100);

    //$(window).on("resize", resizeFn);

    globalInit();

  };
  setTimeout(function () {
    window.rotatingSlider = rotatingSlider;
  }, 500);
}());

$(document).ready(function () {
  setTimeout(function () {
    rotatingSlider("body", { xRotation: false, globalDragRotation: true });
  }, 500);

  // $('.play-icon').on('click', function (e) {
  //   debugger;
  //   var previousVideo;
  //   if (document.getElementById('previousVideo')) {
  //     previousVideo = document.getElementById('previousVideo');
  //     previousVideo.pause();
  //     previousVideo.removeAttribute('id');
  //   }
  //   var currentNode = e.target.parentElement.parentElement.parentElement;
  //   var siblingNode = e.target.parentElement.parentElement.parentElement.nextElementSibling;
  //   siblingNode.setAttribute('id', 'previousVideo');
  //   $(currentNode).addClass('d-none');
  //   $(siblingNode).removeClass('d-none');
  //   siblingNode.play();
  // });

  // $('video').on('pause', function (e) {
  //   debugger;
  //   if($(this).is('paused')) {
  //     $(this).addClass('d-none');
  //     $(this).find('.itemTarget').addClass('d-none');

  //   }

  // });

  $('.slider3d__item').not('.detail').on('click', function (e) {debugger
    debugger;
    var video = $(this).find('video').get(0);

    if (video.paused) {

      var previousVideo;
      if (document.getElementById('previousVideo')) {
        previousVideo = document.getElementById('previousVideo');

        $('#previousVideo').addClass('d-none');
        $('#previousVideo').siblings().removeClass('d-none');
        previousVideo.removeAttribute('id');
        previousVideo.pause();
      }

      $(this).find('video').removeClass('d-none');
      $(this).find('video').attr('id', 'previousVideo');
      $(this).find('.itemTarget').addClass('d-none');

      video.play();
    } else {
      $(this).find('video').addClass('d-none');
      $(this).find('video').removeAttr('id');
      $(this).find('.itemTarget').removeClass('d-none');
      video.pause();
    }
    return false;
  });

  // $('.target').click(function (e) {
  //   var player = $(this);
  //   if (player[0].paused == false) {
  //     $(this).addClass('d-none');
  //     $(this).siblings().removeClass('d-none');
  //   }
  // });


  // $('.detaileTitle, .detailsCredits').on('click', function (e) {debugger
  //   var previousVideo;
  //   if (document.getElementById('previousVideo')) {
  //     previousVideo = document.getElementById('previousVideo');
  //     previousVideo.pause();
  //     previousVideo.removeAttribute('id');
  //   }
  //   var currentNode = $(this).parent().parent();
  //   var siblingNode = $(this).parent().parent().siblings();
  //   siblingNode[1].setAttribute('id', 'previousVideo');
  //   $(currentNode).addClass('d-none');
  //   $(siblingNode[1]).removeClass('d-none');
  //   siblingNode[1].play();
  // })
  // $('.dataToggleUL').click(function (e) {
  //   if ($(this).siblings().attr('class') == 'd-none') {
  //     $(this).siblings().removeClass('d-none');
  //   } else {
  //     $(this).siblings().addClass('d-none');
  //   }
  // });

  $('li').click(function (e) {
    if ($(this)[0].childElementCount == 2) {
      var id = $(this).attr('data-Id');
      var style = $($('.slider3d__item')[id]).attr('style');
      var roAngle = (style.split('X')[1]).split(' ')[0];
      var newData = roAngle.replace(/^\D+|\D+$/g, '');
      currentAngle = parseInt(newData);
      $('.slider3d__rotater').css({
        "transform": "rotate" + 'X' + "(" + parseInt(newData) + "deg)",
        "transition": "transform " + 1.1 + "s ease 0s"
      });
    };
  })
});

