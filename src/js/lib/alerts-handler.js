const TYPES_AVALIABLE = ['info', 'success', 'warning'];
const DEFAULT_CONTAINER = 'alert-container';

class Alert {
  static throwInfo(text) {
    Alert.renderAlertBanner({
      type: 'info',
      text
    });
  }

  static throwSuccess(text) {
    Alert.renderAlertBanner({
      type: 'success',
      text
    });
  }

  static throwWarning(text) {
    Alert.renderAlertBanner({
      type: 'warning',
      text
    });
  }

  static throwDanger(text) {
    Alert.renderAlertBanner({
      type: 'danger',
      text
    });
  }
  static renderAlertBanner({ container = DEFAULT_CONTAINER, type, text }) {
    const _closeBtn = document.createElement('span');
    _closeBtn.classList.add('closebtn');
    _closeBtn.innerHTML = '&times';

    const _text = document.createElement('strong');
    _text.innerHTML = text;

    const _banner = document.createElement('div');
    _banner.classList.add('alert');
    _banner.classList.add(type);
    _banner.append(_closeBtn);
    _banner.append(_text);

    const _container = document.getElementById(container);
    _container.append(_banner);
  }
}

function closeBanner() {
  const close = document.getElementsByClassName('closebtn');
  for (let i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.style.opacity = '0';
      setTimeout(function() {
        div.style.display = 'none';
      }, 600);
    };
  }
}
