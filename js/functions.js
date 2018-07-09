$(function() {
  $.ajax({
    url: 'https://www.cellularoutfitter.com/products.json',
    method: 'GET',
    dataType: 'json',
    success: function(data) {
      var products = data.products;
      var priceTags = [];
      var productColors = [];

      // Get filter tags
      $.each(products, function(i, product) {
        var tags = product.tags;

        $.each(tags, function(i, tag) {
          if (tag.toLowerCase().indexOf('price') > -1) {
            priceTags.push(tag);
          } else if (tag.toLowerCase().indexOf('color') > -1) {
            productColors.push(tag);
          }
        })
      })

      // Append filters to DOM
      appendFilters(priceTags, '.price-filter');
      appendFilters(productColors, '.color-filter');

      // Filter product list if filter is present
      if (location.search.indexOf('filter') > -1) {
        products = filterProducts(products);
      }

      // Sort product list
      if (location.search.indexOf('sort_by') > -1) {
        products = sortProducts(products);
      }

      // Append products to DOM
      $.each(products, function(i, product) {
        appendProducts(product);
      })

      // Apply any existing filter choices
      if (location.search.indexOf('filter') > -1) {
        displayExistingFilters();
      }

      // Apply exisitng sort by choice
      if (location.search.indexOf('sort_by') > -1) {
        selectExistingSortOption();
      }
    }
  })

  // Handle filter selection
  $('.filter-option-wrapper').on('change', 'input', function() {
    var $this = $(this);

    if ($this.attr('checked')) {
      removeFilter($this);
      return false;
    }

    if (location.search.indexOf('filter') > -1) {
      location.href = location.search.indexOf('sort_by') > -1 ?
                      location.href.split('&sort_by=')[0] + '+' + $(this).val() + '&sort_by=' + location.href.split('&sort_by=')[1] :
                      location.href + '+' + $(this).val();
    } else {
      location.href = location.search.indexOf('sort_by') > -1 ?
                      location.href.split('?')[0] + '?filter=' + $(this).val() + '&' + location.href.split('?')[1] :
                      location.href = location.href + '?filter=' + $(this).val()
    }
  })

  // Handle sort by selection
  $('.product-wrapper').on('change', '.sort-by-select', function() {
    if (location.search.indexOf('sort_by') > -1) {
      location.href = location.href.split('sort_by=')[0] + 'sort_by=' + $(this).val();
    } else {
      location.href = location.search.indexOf('filter') > -1 ?
                      location.href + '&sort_by=' + $(this).val() :
                      location.href + '?sort_by=' + $(this).val()
    }
  })

})

function appendFilters(array, element) {
  var uniqueArray = array.filter(function(tag, j) {
    return array.indexOf(tag) == j;
  })

  $.each(uniqueArray, function(i, value) {
    $(element).append(
      '<div> \
        <input type="checkbox" name="' + value + '"value="' + value + '"> \
        <label for=' + value + '>' + value.split(':')[1] + '</> \
      </div>'
    )
  })
}

function filterProducts(products) {
  var filters = location.search.split('filter=')[1].split('&')[0].replace(/%20/g, ' ').split('+');

  $.each(filters, function(i, filter) {
    products = products.filter(function(product, i) {
      return jQuery.inArray(filter, product.tags) !== -1;
    })
  })

  return products;
}

function sortProducts(products) {
  var sortByChoice = location.search.split('sort_by=')[1];

  if (sortByChoice == 'price-low-to-high') {
    products = products.sort(function(a, b) {
      return a.variants[0].price - b.variants[0].price;
    })
  } else {
    products = products.sort(function(a, b) {
      return b.variants[0].price - a.variants[0].price;
    })
  }

  return products;
}

function appendProducts(product) {
  var productTitle = product.title.length < 70 ? product.title : jQuery.trim(product.title).substring(0, 70).split(" ").slice(0, -1).join(" ") + "...";
  var productImage = product.images.length ? product.images[0].src : 'https://screenshotlayer.com/images/assets/placeholder.png';
  var productPrice = product.variants[0].price;
  var productComparePrice = product.variants[0].compare_at_price;

  $('.product-wrapper').append(
    '<div class="col-md-3 col-sm-4 col-xs-6 product-container-outer"> \
      <div class="product-container"> \
        <a href="#"> \
          <p class="product-title">' + productTitle + '</p> \
        </a> \
        <div class="product-image-wrapper"> \
          <a href="#"> \
            <img src="' + productImage + '" alt="' + productTitle + '" class="product-featured-image"/> \
          </a> \
        </div> \
        <p class="product-compare-at-price">Retail Price: $' + productComparePrice + '</p> \
        <p class="product-price">Wholesale Price: $' + productPrice + '</p> \
        <button class="btn btn-primary">More Info</button> \
      </div> \
    </div>'
  )
}

function displayExistingFilters() {
  var filterQuery = location.search.split('filter=')[1].split('&sort_by')[0];
  var filterQueries = filterQuery.split('+');

  $('input[type="checkbox"]').each(function() {
    var $this = $(this);
    $.each(filterQueries, function(i, query) {
      if ($this.val() == query) {
        $this.attr('checked', true);
      }
    })

  })
}

function selectExistingSortOption() {
  var sortByQuery = location.search.split('sort_by=')[1];

  $('.sort-by-select option').each(function() {
    if ($(this).val() == sortByQuery) {
      $(this).attr('selected', true);
    }
  })
}

function removeFilter($this) {
  var filterQuery = location.search.split('filter=')[1].split('&sort_by')[0];
  var filterQueries = filterQuery.split('+');

  $.each(filterQueries, function(i, query) {
    if (query == $this.val()) {
      filterQueries.splice(i, 1);
    }
  })

  filterQueries = filterQueries.join('+');

  location.href = filterQueries.length ?
                  location.href.replace('filter=' + filterQuery, 'filter=' + filterQueries) :
                  location.href.replace('filter=' + filterQuery, '').replace('&', '');
}
