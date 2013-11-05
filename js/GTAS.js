var options = JSON.parse(localStorage.getItem("options"));
var icontitle = "ON";
var timecount = 2000;

function setOptions(opt) {
	localStorage.setItem("options", JSON.stringify(opt));
	options = JSON.parse(localStorage.getItem("options"));
}
function onBrowserActionClicked (tab) {
	// change icon tooltip
	if (options.playback) {
		icontitle = "OFF";
		options.playback = false;
	} else {
		icontitle = "ON";
		options.playback = true;
	}
	chrome.browserAction.setBadgeText(
	{
		text: icontitle,
	    tabId: tab.id
	});
	localStorage.setItem("options", JSON.stringify(options));
	options = JSON.parse(localStorage.getItem("options"));
}

function setPlayback(tab) {
	// change icon tooltip
	if (options.playback) {
		icontitle = "ON";
	} else {
		icontitle = "OFF";
	}
	chrome.browserAction.setBadgeText(
	{
		text: icontitle,
	    tabId: tab.id
	});
}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Get current version
 * ---------------------------------------------------------------------------------------------------------------------
*/
function getVersion()
{
    var details = chrome.app.getDetails();
    return details.version;
}

/*
 * ---------------------------------------------------------------------------------------------------------------------
 * Set default options
 * ---------------------------------------------------------------------------------------------------------------------
*/
(function(){
	if(options == null || options.version === undefined || options.version != getVersion())
	{
	  	options =
		{
            version: getVersion(),
    		interval: 0,
    		playback: false,
    		playback_hotkeys: "ctrl + alt + 83"
		}

		localStorage.setItem("options", JSON.stringify(options));
		options = JSON.parse(localStorage.getItem("options"));
	}
})();


chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		if (request.method == undefined) {
			if (icontitle == "ON") {
				console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
				if (request.lang != "") {
					var URL = "https://translate.google.com/translate_tts?ie=" + request.charset + "&tl=" + request.lang
					+ "&total=l&idx=0&q=" + request.text;
					var audio = new Audio(URL);
					audio.play();
					timeount = 2000 + (5000 * parseFloat(options.interval/100));
					sendResponse({timecount: timecount, playback: options.playback, playback_hotkeys: options.playback_hotkeys});
				}
			}
		} else if (request.method == "playback_keydown") {
			onBrowserActionClicked(sender.tab);
		}
	}
);

chrome.runtime.onMessage.addListener(function (res, sender, sendResponse) {
	var tab = sender.tab;
	
	// change icon tooltip
	setPlayback(tab);

	// set click destination
	if (!chrome.browserAction.onClicked.hasListener(onBrowserActionClicked)) {
	  chrome.browserAction.onClicked.addListener(onBrowserActionClicked);
	}
	timeount = 2000 + (5000 * parseFloat(options.interval/100));
	sendResponse({timecount: timecount, playback: options.playback, playback_hotkeys: options.playback_hotkeys });

});

