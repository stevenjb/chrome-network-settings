/**
 * Listens for the app launching then creates the window.
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */

// var initialContent = 'network_list.html';
var initialContent = 'network_summary.html';
var winId = 'main';
var winBounds = { width: 600, height: 400 };
var networkLimit = 10;

chrome.app.runtime.onLaunched.addListener(function() {
  initApp();
});

function initApp(func) {
  createWindow();
  initNetworkState();
}

// Returns translation for 'text'
function getText(text, args) {
  var res = text;
  if (!args)
    return res;
  for (var i = 0; i < args.length; ++i) {
    var key = '%' + (i + 1);
    res = res.replace(key, args[i]);
  }
  return res;
}

function log(msg) {
  console.log(msg);
}

function assert(condition, message) {
  if (condition)
    return;
  throw message || 'Assertion Failed';
}

// Window management

function createWindow() {
  var params = { id: winId, bounds: winBounds };
  var bgWindow = this;
  chrome.app.window.create(
    'frame.html',
    params,
    function(appWin) {
      log('Created: ' + appWin.id);
      appWin.contentWindow.bgWindow = bgWindow;
      appWin.contentWindow.addEventListener('load', frameLoaded);
    });
};

function getAppWin() {
  return chrome.app.window.get(winId);
}

function getWin() {
  var appWin = getAppWin();
  return appWin.contentWindow;
}

function frameLoaded() {
  log('frameLoaded');
  var win = getWin();
  win.removeEventListener('load', frameLoaded);
  setContent(initialContent);
}

function setContent(html) {
  log('setContent: ' + html);

  networkList.unInit();
  networkSummary.unInit();

  var win = getWin();
  var content = win.document.querySelector('#content');
  //content.contentWindow.addEventListener('load', contentLoaded);
  content.onload = contentLoaded;
  content.srcName = html;  // For readability
  content.src = 'views/' + html;
}

var previousView;

function contentLoaded() {
  var win = getWin();
  var content = win.document.querySelector('#content');
  log('contentLoaded: ' + content.srcName);
  if (content.srcName == 'network_summary.html') {
    previousView = content.srcName;
    networkSummaryLoaded();
  } else if (content.srcName == 'network_list.html') {
    previousView = content.srcName;
    networkListLoaded();
  } else if (content.srcName == 'network_details.html') {
    networkDetailsLoaded();
  }
}

function getContent() {
  var win = getWin();
  var content = win.document.querySelector('#content');
  return content;
}

// networkState

function initNetworkState() {
  networkState.init();
  networkState.addObserver(this);
}

function onNetworkStateChanged() {
  log('onNetworkStateChanged');
}

// NetworkSummary

function showNetworkSummary() {
  setContent('network_summary.html');
}

function networkSummaryLoaded() {
  log('networkSummaryLoaded');
  var content = getContent();
  networkSummary.init(this, content.contentWindow);
}

// NetworkList

var networkListType;

function showNetworkList(networkType) {
  networkListType = networkType;
  setContent('network_list.html');
}

function closeDetails() {
  if (previousView)
    setContent(previousView);
  else
    setContent(initialContent);
}

function networkListLoaded() {
  log('networkListLoaded: ' + networkListType);
  var content = getContent();
  networkList.init(this, content.contentWindow, networkListType);
}

// NetworkDetails

var networkDetailsNetworkId;

function showNetwork(networkId, from) {
  log('showNetwork: ' + networkId);
  networkDetails.init(this);

  networkDetailsNetworkId = networkId;
  setContent('network_details.html');
}

function networkDetailsLoaded() {
  var content = getContent();
  networkDetails.setContentWindow(content.contentWindow);
  networkDetails.setNetworkId(networkDetailsNetworkId);
}
