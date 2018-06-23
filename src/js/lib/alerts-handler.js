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

  static dismissAlert(alertID) {
    const alert = document.getElementById(alertID);
    alert.style.opacity = '0';
    setTimeout(function() {
      alert.style.display = 'none';
    }, 600);
  }

  static renderAlertBanner({ container = DEFAULT_CONTAINER, type, text }) {
    const bannerId = new Date().getUTCMilliseconds().toString();

    const _closeBtn = document.createElement('span');
    _closeBtn.classList.add('closebtn');
    _closeBtn.innerHTML = '&times';
    _closeBtn.setAttribute('onClick', `Alert.dismissAlert(${bannerId})`);

    const _text = document.createElement('strong');
    _text.innerHTML = text;

    const _banner = document.createElement('div');
    _banner.classList.add('alert');
    _banner.setAttribute('id', bannerId);
    _banner.classList.add(type);
    _banner.append(_closeBtn);
    _banner.append(_text);

    const _container = document.getElementById(container);
    _container.append(_banner);

    setTimeout(function() {
      Alert.dismissAlert(bannerId);
    }, 2000);
  }
}
