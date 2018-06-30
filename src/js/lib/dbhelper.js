/**
 * Common database helper functions.
 */

class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    fetch(`${DBHelper.DATABASE_URL}/restaurants`)
      .catch(err => {
        console.log(err, 'connectivity error, serving restaurants from cache');
        IDBHelper.getRestaurants().then(localRestaurants => {
          callback(null, localRestaurants);
        });
      })
      .then(res => res.json())
      .then(restaurants => {
        IDBHelper.refreshRestaurants(restaurants);
      })
      .then(() => {
        IDBHelper.getRestaurants().then(localRestaurants => {
          callback(null, localRestaurants);
        });
      })
      .catch(err => {
        console.log('Requesting restaurants failed', err);
        callback(err);
      });
  }

  /**
   * Fetch All Reviews from a given Restaurant ID
   */
  static fetchReviews(restaurantID, callback) {
    const URL = `${
      DBHelper.DATABASE_URL
    }/reviews/?restaurant_id=${restaurantID}`;
    fetch(URL)
      .catch(err => {
        console.log(err, 'connectivity error, serving reviews from cache');
        IDBHelper.getReviews().then(localReviews => {
          const filteredReviews = localReviews.filter(
            r => r.restaurant_id == restaurantID
          );
          callback(null, filteredReviews);
        });
      })
      .then(res => res.json())
      .then(reviews => {
        IDBHelper.refreshReviews(reviews);
      })
      .then(() => {
        IDBHelper.getReviews().then(localReviews => {
          const filteredReviews = localReviews.filter(
            r => r.restaurant_id == restaurantID
          );
          callback(null, filteredReviews);
        });
      })
      .catch(err => {
        console.log('Requesting reviews failed', err);
        callback(err);
      });
  }

  static postReview(_body) {
    const URL = `${DBHelper.DATABASE_URL}/reviews/`;

    return fetch(URL, {
      method: 'POST',
      body: JSON.stringify(_body),
      headers: {
        'content-type': 'application/json'
      }
    })
      .catch(err => {
        console.log('youre offline! no new review added');
        return IDBHelper.addAction('REVIEW', _body)
          .then(() => ({ isOffline: true }))
          .catch(err => {
            console.log(err);
            return new Error(err);
          });
      })
      .then(res => {
        console.log('new review added');
        return res;
      });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant);
        } else {
          // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        );
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return `/img/w600_${restaurant.photograph}.webp`;
  }
  /**
   * Restaurant image alt text.
   */
  static getImageAlt(restaurant) {
    return (
      restaurant.image_description ||
      `The inside of the restaurant ${restaurant.name}`
    );
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }
}
