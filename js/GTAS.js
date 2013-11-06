var options = JSON.parse(localStorage.getItem("options"));
var icontitle = "ON";
var timecount = 2000;
var timer;
var recognition = new webkitSpeechRecognition();

function setOptions(opt) {
	localStorage.setItem("options", JSON.stringify(opt));
	options = JSON.parse(localStorage.getItem("options"));
}
function onBrowserActionClicked (tab) {
	// change icon tooltip
	if (tab.url.indexOf("translate.google") >= 0) {
		if (options.playback) {
			icontitle = "OFF";
			options.playback = false;
			if (timer != null && timer != undefined) {
				clearTimeout(timer);
			}
		} else {
			icontitle = "ON";
			options.playback = true;
			if (timer != null && timer != undefined) {
				clearTimeout(timer);
			}
		}
		chrome.browserAction.setBadgeText(
		{
			text: icontitle,
		    tabId: tab.id
		});
		localStorage.setItem("options", JSON.stringify(options));
		options = JSON.parse(localStorage.getItem("options"));
	}
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
    		playback_hotkeys: "ctrl + alt + 83",
        	audioinput: false,
        	audioinput_hotkeys: "ctrl + alt + 65"
		}

		localStorage.setItem("options", JSON.stringify(options));
		options = JSON.parse(localStorage.getItem("options"));
	}
})();


chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		if (sender.tab.url.indexOf("translate.google") >= 0) {
			if (request.method == undefined) {
				timer = request.timer;
				if (icontitle == "ON") {
					console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
					if (request.lang != "") {
						var URL = "https://translate.google.com/translate_tts?ie=" + request.charset + "&tl=" + request.lang
						+ "&total=l&idx=0&q=" + request.text;
						var audio = new Audio(URL);
						audio.play();
						timeount = 2000 + (5000 * parseFloat(options.interval/100));
						sendResponse({timecount: timecount,
							playback: options.playback, playback_hotkeys: options.playback_hotkeys,
							audioinput: options.audioinput, audioinput_hotkeys: options.audioinput_hotkeys,
							icontitle: icontitle, recognition: recognition});
					}
				}
			} else if (request.method == "playback_keydown") {
				timer = request.timer;
				onBrowserActionClicked(sender.tab);
				sendResponse({timecount: timecount,
					playback: options.playback, playback_hotkeys: options.playback_hotkeys,
					audioinput: options.audioinput, audioinput_hotkeys: options.audioinput_hotkeys,
					icontitle: icontitle, recognition: recognition});
			} else if (request.method == "audioinput_keydown") {
				timer = request.timer;
//				onBrowserActionClicked(sender.tab);
				sendResponse({timecount: timecount,
					playback: options.playback, playback_hotkeys: options.playback_hotkeys,
					audioinput: options.audioinput, audioinput_hotkeys: options.audioinput_hotkeys,
					icontitle: icontitle, recognition: recognition});
			}
		}
	}
);

chrome.runtime.onMessage.addListener(function (res, sender, sendResponse) {
	if (sender.tab.url.indexOf("translate.google") >= 0) {
		var tab = sender.tab;
		
		// change icon tooltip
		setPlayback(tab);
	
		// set click destination
		if (!chrome.browserAction.onClicked.hasListener(onBrowserActionClicked)) {
		  chrome.browserAction.onClicked.addListener(onBrowserActionClicked);
		}
		if (icontitle == "ON") {
			timeount = 2000 + (5000 * parseFloat(options.interval/100));
		}
		sendResponse({timecount: timecount,
			playback: options.playback, playback_hotkeys: options.playback_hotkeys,
			audioinput: options.audioinput, audioinput_hotkeys: options.audioinput_hotkeys,
			icontitle: icontitle, recognition: recognition});

	}
});
