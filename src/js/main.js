let restaurants, neighborhoods, cuisines;
var map;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', event => {
  fetchNeighborhoods();
  fetchCuisines();
  DBHelper.fetchActions(); //sync offline cashed events
});

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  fetchRestaurants();
};

window._updateRestaurants = () => {
  updateRestaurants();
};

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  IDBHelper.getRestaurants()
    .then(res => {
      const neighborhoods = res.map((v, i) => res[i].neighborhood);
      return neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
    })
    .then(res => {
      self.neighborhoods = res;
      fillNeighborhoodsHTML();
    });
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) {
      // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  IDBHelper.getRestaurants()
    .then(res => {
      const cuisines = res.map((v, i) => res[i].cuisine_type);
      return cuisines.filter((v, i) => cuisines.indexOf(v) == i);
    })
    .then(res => {
      self.cuisines = res;
      fillCuisinesHTML();
    });

  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

const fetchRestaurants = () => {
  IDBHelper.getRestaurants().then(res => {
    self.restaurants = res;
    renderRestaurants(res);
  });
};

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  IDBHelper.getRestaurants(cuisine, neighborhood)
    .then(res => {
      let restaurants = res;
      if (cuisine != 'all') {
        restaurants = restaurants.filter(r => r.cuisine_type == cuisine);
      }
      if (neighborhood != 'all') {
        restaurants = restaurants.filter(r => r.neighborhood == neighborhood);
      }
      return restaurants;
    })
    .then(res => renderRestaurants(res));

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    (error, restaurants) => {
      if (error) {
        // Got an error!
        console.error(error);
      } else {
        renderRestaurants(restaurants);
      }
    }
  );
};

const renderRestaurants = restaurants => {
  resetRestaurants(restaurants);
  fillRestaurantsHTML();
  //lazy loader
  const images = document.querySelectorAll('.restaurant-img');
  const observer = new IntersectionObserver(handleIntersection, options);
  images.forEach(img => {
    observer.observe(img);
  });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = restaurants => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
  return;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = restaurant => {
  const dataSrc = document.createAttribute('data-src');
  dataSrc.value = DBHelper.imageUrlForRestaurant(restaurant);

  const imgPlaceholderSrc =
    'https://res.cloudinary.com/christekh/image/upload/c_scale,h_3,w_5/v1505391130/wynand-van-poortvliet-364366_gsvyby.jpg';
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = imgPlaceholderSrc;
  image.setAttributeNode(dataSrc);
  image.alt = DBHelper.getImageAlt(restaurant);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.setAttribute('aria-label', 'More details about' + restaurant.name);
  more.href = DBHelper.urlForRestaurant(restaurant);

  const li = document.createElement('li');

  li.append(name);
  li.append(image);
  li.append(neighborhood);
  li.append(address);
  li.append(more);
  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
};
