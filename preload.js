const { ipcRenderer } = require('electron')

let focused = true

window.addEventListener('focus', function () {
  focused = true
});

window.addEventListener('blur', function () {
  focused = false
});

function notifyCallback() {
  ipcRenderer.send('notification')
}

const handler = {
  construct(target, args) {
    notifyCallback(...args);
    if (!focused)
      return new target(...args);
    return null;
  }
};

const ProxifiedNotification = new Proxy(Notification, handler);

window.Notification = ProxifiedNotification;

document.addEventListener("DOMContentLoaded", function () {
  var windowTopBar = document.createElement('div')
  windowTopBar.style.width = "100%"
  windowTopBar.style.height = "68px"
  windowTopBar.style.backgroundColor = "transparent"
  windowTopBar.style.position = "absolute"
  windowTopBar.style.top = windowTopBar.style.left = 0
  windowTopBar.style.webkitAppRegion = "drag"
  document.body.appendChild(windowTopBar)
});

