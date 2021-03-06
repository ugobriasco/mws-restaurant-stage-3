let restaurant;
let reviews;
var map;

document.addEventListener('DOMContentLoaded', () => {
  DBHelper.checkConnectivity();
  initToggleFavorite();
  getReviews();
});

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = callback => {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) {
    // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    IDBHelper.getRestaurants().then(res => {
      restaurant = res.filter(r => r.id == id);
      self.restaurant = restaurant[0];
      fillRestaurantHTML();
    });

    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.alt = DBHelper.getImageAlt(restaurant);
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (
  operatingHours = self.restaurant.operating_hours
) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    if (!document.getElementById(key)) {
      const row = document.createElement('tr');
      row.setAttribute('id', key);
      const day = document.createElement('td');
      day.innerHTML = key;
      row.appendChild(day);
      const time = document.createElement('td');
      time.innerHTML = operatingHours[key];
      row.appendChild(time);
      hours.appendChild(row);
    }
  }
};

const getReviews = () => {
  const restaurantID = getParameterByName('id');

  const offlinePromise = DBHelper.fetchOfflineReviews()
    .then(() => IDBHelper.getActions())
    .then(actions => {
      return actions
        .filter(
          a => a.type === 'REVIEW' && a.body.restaurant_id == restaurantID
        )
        .map(a => a.body);
    });

  const onlinePromise = DBHelper.fetchReviews(restaurantID).then(reviews => {
    return reviews.sort((a, b) => a.id < b.id);
  });

  return Promise.all([offlinePromise, onlinePromise])
    .then(allReviews => allReviews[0].concat(allReviews[1]))
    .then(allReviews => fillReviewsHTML(allReviews));
};
/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (reviews = []) => {
  const container = document.getElementById('reviews-container');
  const reviewsList = document.getElementById('reviews-list');

  if (!document.getElementById('section-review-title')) {
    const title = document.createElement('h3');
    title.setAttribute('id', 'section-review-title');
    title.innerHTML = 'Reviews';
    container.appendChild(title);
  }

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }

  while (reviewsList.firstChild) {
    reviewsList.removeChild(reviewsList.firstChild);
  }

  reviews.forEach(review => reviewsList.appendChild(createReviewHTML(review)));

  return container.appendChild(reviewsList);
};

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = review => {
  const li = document.createElement('li');
  li.setAttribute('id', `review-${review.id}`);

  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');

  const formattedDate = review.updatedAt
    ? formatDate(review.updatedAt)
    : 'This review is still offline and will be published as son as possible';

  date.innerHTML = formattedDate;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);
  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');

  const li = document.createElement('li');

  const a = document.createElement('a');
  a.setAttribute('href', '#');
  a.setAttribute('aria', 'page');
  a.setAttribute('class', 'current-page');
  a.innerHTML = restaurant.name;

  breadcrumb.appendChild(li);
  li.appendChild(a);
};

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

// Reviews
function openForm() {
  const elm = document.getElementById('floating-form');
  if (elm.classList.contains('expand')) return;
  elm.classList.add('expand');
}

function closeForm() {
  const elm = document.getElementById('floating-form');
  if (!elm.classList.contains('expand')) return;
  elm.classList.remove('expand');
}

function toggleForm() {
  const elm = document.getElementById('floating-form');
  if (elm.classList.contains('expand')) {
    return elm.classList.remove('expand');
  } else {
    elm.classList.add('expand');
  }
}

function handleSubmit() {
  const body = {
    restaurant_id: parseInt(getParameterByName('id')),
    name: document.getElementById('name').value,
    rating: getRating(),
    comments: document.getElementById('comments').value
  };

  if (body.name === '') {
    Alert.throwDanger(
      'Noone likes anonymous reviews. Please enter your name before submitting your evaluation'
    );
    return;
  }

  DBHelper.submitReview(body).then(res => {
    toggleForm();
    document.getElementById('add-review-form').reset();
    if (res.isOffline) {
      Alert.throwWarning(
        'You are offline! Your review will be submitted later'
      );
      return getReviews();
    } else {
      Alert.throwSuccess('Your review was published!');
      return getReviews();
    }
  });
}

function getFavorite() {
  const restaurant_id = getParameterByName('id');
  return IDBHelper.getActions().then(actions =>
    actions.filter(
      a => a.type === 'FAVORITE' && a.body.restaurant_id === restaurant_id
    )
  );
}

function initToggleFavorite() {
  const ctaStr = document.getElementById('favorite-cta-string');

  getFavorite().then(arr => {
    if (arr.length > 0) {
      ctaStr.innerHTML = isFavoriteMessage(true);
      document
        .getElementById('toggle-favorite')
        .setAttribute('checked', 'true');
    } else {
      ctaStr.innerHTML = isFavoriteMessage(false);
    }
  });
}

function toggleFavorite() {
  const restaurant_id = getParameterByName('id');
  const ctaStr = document.getElementById('favorite-cta-string');
  getFavorite().then(arr => {
    if (arr.length > 0) {
      ctaStr.innerHTML = isFavoriteMessage(false);
      return IDBHelper.deleteAction(arr[0].id);
    } else {
      ctaStr.innerHTML = isFavoriteMessage(true);
      return IDBHelper.addAction('FAVORITE', {
        restaurant_id,
        is_favorite: 'true'
      });
    }
  });
}

function isFavoriteMessage(isFavorite) {
  const didFavorite = 'This restaurant is marked as favorite';
  const willFavorite = 'Make this restaurant your favorite!';
  return isFavorite ? didFavorite : willFavorite;
}

function getRating() {
  const radio = document.getElementById('rating').elements;
  let review = 0;
  for (let i = 0; i < radio.length; i++) {
    if (radio[i].checked) {
      review = rating.elements[i].value;
      break;
    }
  }
  return review;
}

function formatDate(unix_timestamp) {
  return new Date(unix_timestamp).toUTCString();
}
