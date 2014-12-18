/**
 * Listens for the app launching then creates the window.
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */

var initialContent = 'network_list.html';
var winId = 'main';
var winBounds = { width: 600, height: 400 };
var networkLimit = 10;

chrome.app.runtime.onLaunched.addListener(function() {
  createWindow();
});

// Returns translation for 'text'
function getText(text, args) {
  var res = text;
  if (!args)
    return res;
  for (var i = 0; i < args.length; ++i)
    res += args[i];
  return res;
}

function log(msg) {
  console.log(msg);
}

// Window management

function createWindow(func) {
  var params = { id: winId, bounds: winBounds };
  var bgWindow = this;
  chrome.app.window.create(
    'frame.html',
    params,
    function(appWin) {
      log('Created: ' + appWin.id)
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
  var win = getWin();
  var content = win.document.querySelector('#content');
  //content.contentWindow.addEventListener('load', contentLoaded);
  content.onload = contentLoaded;
  content.srcName = html;  // For readability
  content.src = html;
}

function contentLoaded() {
  var win = getWin();
  var content = win.document.querySelector('#content');
  log('contentLoaded: ' + content.srcName);
  if (content.srcName == 'network_list.html')
    networkListLoaded();
  else if (content.srcName == 'network_details.html')
    networkLoaded();
}

function getContent() {
  var win = getWin();
  var content = win.document.querySelector('#content');
  return content;
}

// NetworkList

function showNetworkList() {
  setContent('network_list.html');
}

function networkListLoaded() {
  log('networkListLoaded');
  var content = getContent();
  networkList.init(this, content.contentWindow, getText('Network List'));
  chrome.networkingPrivate.getNetworks(
    {"networkType": "All", "visible": true, "limit": networkLimit},
    onNetworksLoaded);
}

function onNetworksLoaded(networks) {
  networkList.setNetworks(networks);
}

// NetworkDetails

var networkDetailsNetwork;

function showNetwork(network) {
  log('showNetwork: ' + network['Name']);
  networkDetailsNetwork = network;
  setContent('network_details.html');
}

function networkLoaded() {
  var content = getContent();
  networkDetails.init(this, content.contentWindow, networkDetailsNetwork);
}
