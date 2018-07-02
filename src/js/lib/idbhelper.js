let dbPromise = idb.open('restaurants-review-db', 1, upgradeDb => {
  let restaurantsStore = upgradeDb.createObjectStore('restaurants', {
    keyPath: 'id'
  });
  let reviewsStore = upgradeDb.createObjectStore('reviews', { keyPath: 'id' });
  let actionsStore = upgradeDb.createObjectStore('actions', { keyPath: 'id' });
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

  static getActions() {
    return dbPromise
      .then(db => {
        const tx = db.transaction('actions');
        const store = tx.objectStore('actions');
        return store.getAll();
      })
      .catch(err => console.log(err));
  }

  static addAction(type, body) {
    const id = getUID();
    const action = { id, type, body };
    return dbPromise.then(db => {
      const tx = db.transaction('actions', 'readwrite');
      const store = tx.objectStore('actions');
      tx.objectStore('actions').put(action);
      return tx.complete;
    });
  }

  static deleteAction(key) {
    return dbPromise
      .then(db => {
        const tx = db.transaction('actions', 'readwrite');
        tx.objectStore('actions').delete(key);
        return tx.complete;
      })
      .catch(err => console.log(err));
  }

  static setAction(key, type, body) {
    const action = { type, body };
    return dbPromise
      .then(db => {
        const tx = db.transaction('actions', 'readwrite');
        tx.objectStore('actions').put(action, key);
        return tx.complete;
      })
      .catch(err => console.log(err));
  }
}

function getUID() {
  return new Date().getUTCMilliseconds();
}
