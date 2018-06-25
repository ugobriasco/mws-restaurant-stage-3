let dbPromise = idb.open('restaurants-review-db', 1, upgradeDb => {
  let restaurantsStore = upgradeDb.createObjectStore('restaurants', {
    keyPath: 'id'
  });
  let reviewsStore = upgradeDb.createObjectStore('reviews', { keyPath: 'id' });
});

class IDBHelper {
  static refreshRestaurants(restaurants = []) {
    dbPromise.then(db => {
      const tx = db.transaction('restaurants', 'readwrite');
      const store = tx.objectStore('restaurants');
      restaurants.map(restaurant => {
        tx.objectStore('restaurants').put(restaurant);
      });
      return tx.complete;
    });
  }

  static refreshReviews(reviews = []) {
    dbPromise.then(db => {
      const tx = db.transaction('reviews', 'readwrite');
      const store = tx.objectStore('reviews');
      reviews.map(review => {
        tx.objectStore('reviews').put(review);
      });
      return tx.complete;
    });
  }

  static getReviews() {
    return dbPromise
      .then(db => {
        const tx = db.transaction('reviews');
        const store = tx.objectStore('reviews');
        return store.getAll();
      })
      .catch(err => console.log(err));
  }

  static getRestaurants() {
    return dbPromise
      .then(db => {
        const tx = db.transaction('restaurants');
        const store = tx.objectStore('restaurants');
        return store.getAll();
      })
      .catch(err => console.log(err));
  }
}
