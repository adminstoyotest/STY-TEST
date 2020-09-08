(function () {
  window.onpageshow = function () {
    if (window.theme.showPageTransition) {
      var pageTransition = document.querySelector('.PageTransition');

      if (pageTransition) {
        pageTransition.style.visibility = 'visible';
        pageTransition.style.opacity = '0';
      }
    }

    // When the page is loaded from the cache, we have to reload the cart content
    document.documentElement.dispatchEvent(
      new CustomEvent('cart:refresh', {
        bubbles: true,
      })
    );
  };

  // load zendesk with delay
  window.setTimeout(function () {
    var ua = navigator.userAgent.toLowerCase(),
      platform = navigator.platform.toLowerCase();
    (platformName = ua.match(/ip(?:ad|od|hone)/)
      ? 'ios'
      : (ua.match(/(?:webos|android)/) ||
          platform.match(/mac|win|linux/) || ['other'])[0]),
      (isMobile = /ios|android|webos/.test(platformName));
    if (!isMobile) {
      var script = document.createElement('script');
      script.id = 'ze-snippet';
      script.src =
        'https://static.zdassets.com/ekr/snippet.js?key=38b07d28-2e17-490c-9e60-28b322259c2e';
      document.head.appendChild(script);
    }
  }, 5000);

  // ADD TO CART PIXEL
  var addToCartSent = false;
  document.addEventListener('product:added', function (e) {
    if (addToCartSent) {
      return false;
    }
    fbq('track', 'StoyoAddToCart', {
      value: (e.detail.variant.price / 100).toFixed(2),
      quantity: e.detail.quantity,
      content_name: e.detail.variant.name,
      currency: Shopify.currency.active,
    });
    addToCartSent = true;
  });

  // URL for each image in the gallery
  var hash = window.location.hash
    .substr(1)
    .split('&')
    .reduce(function (result, item) {
      var parts = item.split('=');
      result[parts[0]] = parts[1];
      return result;
    }, {});

  if (hash.mediaId) {
    var thumbnails = document.querySelectorAll(
      '#aava-product-thumbnails a[data-media-id]'
    );
    for (var i = 0; i < thumbnails.length; i++) {
      var thumb = thumbnails[i];
      var dataMediaId = thumb.getAttribute('data-media-id');
      if (hash.mediaId === dataMediaId) {
        window.flickityInstance.select(i, false, true);
        break;
      }
    }
  }

  var thumbnailsWrapper = document.getElementById('aava-product-thumbnails');
  if (thumbnailsWrapper) {
    thumbnailsWrapper.addEventListener('click', function (evt) {
      var parent = evt.target.parentNode;
      if (parent.tagName === 'A') {
        var mediaId = parent.getAttribute('data-media-id');
        window.location.hash = 'mediaId=' + mediaId;
      }
    });
  }

  // CUSTOM COLOR NAMES IN THE TITLE
  document.addEventListener(
    'change',
    function (evt) {
      if (evt.target.classList.contains('ColorSwatch__Radio')) {
        var productId = evt.target.getAttribute('data-product-id');
        var label = document.getElementById('aava-color-prefix-' + productId);
        var altTitle = event.target.value.split('|')[1];
        if (label) {
          label.innerHTML = altTitle ? altTitle : '';
        }
      }
    },
    false
  );

  // Switch between preorder/normal variant
  var productInfo = document.getElementById('aava-product-info');
  if (productInfo) {
    document.addEventListener('variant:changed', (e) => {
      if (typeof window.aavaPreorderPresets === 'object') {
        var date = document.getElementById('variant-release-date');
        productInfo.classList.remove('aava-product--is-preorder');
        var color = e.detail.variant.option2.toLowerCase().replace(/\s/g, '');
        var colorPreset = window.aavaPreorderPresets.color
          .toLowerCase()
          .replace(/\s/g, '')
          .split(',');
        var releaseDates = window.aavaPreorderPresets.dates.split('|');
        var index = colorPreset.indexOf(color);
        if (index > -1) {
          productInfo.classList.add('aava-product--is-preorder');
          date.innerHTML =
            '<span>Release date</span>: <span>' +
            releaseDates[index] +
            '</span>';
        }
      }
    });
  }
})();

(function () {
  var $shippingDiv = document.getElementById('aava-shipping-date');
  var $banner = document.getElementById('aava-banner');
  document.addEventListener('variant:changed', (e) => {
    var variantId = e.detail.variant.id;
    var shippingDate = aavaVariantShippingDates[variantId];

    if (shippingDate) {
      $banner.classList.add('isShipping');
      $shippingDiv.innerHTML = "Shipping Starts: " + shippingDate;
    } else {
      $banner.classList.remove('isShipping');
    }

    var shippingFormInput = document.querySelector(
      'input[name="properties[Shipping starts]"]'
    );

    if (shippingFormInput) {
      if (shippingDate) {
        shippingFormInput.value = shippingDate;
      } else {
        shippingFormInput.value = '';
      }
    }
  });
})();

(function () {
  var $select = document.getElementById('aava-gallery-select');
  var $imgs = document.querySelectorAll(
    '.Product__SlideshowNavScroller a > img'
  );
  var $alts = Array.from($imgs).map(function (img) {
    return img.alt;
  });

  if (!$select) {
    return null;
  }

  var $uniq = $alts
    .map(function (alt) {
      var split = alt.split('_');
      return {
        modelName: split[0],
        params: split[1] || '',
        value: alt,
      };
    })
    .reduce(function (arr, itm) {
      var hasElm = arr.some(function (i) {
        return i.modelName === itm.modelName;
      });
      if (hasElm) {
        return arr;
      }
      return arr.concat(itm);
    }, []);

  $uniq.forEach(function (itm, i) {
    var input = document.createElement('input');
    input.setAttribute('class', i === 0 ? 'selectopt' : '');
    input.setAttribute('name', 'gallery');
    input.setAttribute('type', 'radio');
    input.setAttribute('id', 'opt' + i);
    input.checked = i === 0;
    input.dataset.alt = itm.value;

    var label = document.createElement('label');
    label.setAttribute('for', 'opt' + i);
    label.setAttribute('class', 'option');
    label.innerHTML =
      '<span>' + itm.modelName + '</span><span>' + itm.params + '</span>';

    $select.appendChild(input);
    $select.appendChild(label);
  });

  $select.querySelectorAll("input[type='radio']").forEach(function (radio) {
    radio.addEventListener(
      'change',
      function (evt) {
        var $val = $select.querySelector("input[type='radio']:checked").dataset
          .alt;
        $alts.some(function (alt, i) {
          if (alt === $val) {
            window.flickityInstance.select(i, false, true);
            return true;
          }
          return false;
        });
      },
      false
    );
  });

  document.addEventListener('variant:changed', function (evt) {
    Array.from($select.querySelectorAll("input[type='radio']")).some(function (
      radio
    ) {
      if (
        radio.dataset.alt.split('|', 1)[0] ===
        evt.detail.variant.featured_image.alt.split('|', 1)[0]
      ) {
        radio.checked = true;
      }
    });
  });

  window.flickityInstance.on('select', function () {
    var alt = $alts[window.flickityInstance.selectedIndex];
    if (alt) {
      Array.from($select.querySelectorAll("input[type='radio']")).some(
        function (radio) {
          if (radio.dataset.alt.split('|', 1)[0] === alt.split('|', 1)[0]) {
            radio.checked = true;
          }
        }
      );
    }
  });
})();

(function () {
  var $elm = document.getElementById('aava-hero-carousel');
  if ($elm) {
    var slider = new Flickity($elm, {
      autoPlay: 4000,
      pauseAutoPlayOnHover: false,
      contain: true,
      setGallerySize: false,
      pageDots: false,
      ImagesLoaded: true,
      prevNextButtons: false,
      wrapAround: true,
    });
  }
})();
