// https://scoxtch.io/tutorials/lazy-loading-images-for-performance-using-intersection-observer

const options = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const fetchImage = url => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = resolve;
    image.onerror = reject;
  });
};

const loadImage = image => {
  const src = image.dataset.src;
  fetchImage(src).then(() => {
    image.src = src;
  });
};

const handleIntersection = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.intersectionRatio > 0) {
      //console.log(entry.intersectionRatio);
      loadImage(entry.target);
    }
  });
};
