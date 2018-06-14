let dbPromise = idb.open('restaurants-review-db', 1, upgradeDb => {
  let store = upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
});

class IDBHelper {
  static refreshRestaurants(restaurants = []) {
    dbPromise.then(function(db) {
      const tx = db.transaction('restaurants', 'readwrite');
      const store = tx.objectStore('restaurants');
      restaurants.map(restaurant => {
        tx.objectStore('restaurants').put(restaurant);
      });
      return tx.complete;
    });
  }

  static getRestaurants() {
    return dbPromise
      .then(function(db) {
        const tx = db.transaction('restaurants');
        const store = tx.objectStore('restaurants');
        return store.getAll();
      })
      .catch(err => console.log(err));
  }
}
