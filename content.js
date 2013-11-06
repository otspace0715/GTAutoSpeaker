// ==UserScript==
// @name           GT Auto Speaker
// @description    Automatic Text-to-speech of Google Translate Site.
// @version        1.0.0
// @date           2013-10-25
// @author         Osamu Tanaka
// @namespace      https://github.com/otspace0715/GTAutoSpeaker.git
// @include        http://translate.google.*/*
// @include        https://translate.google.*/*
// ==/UserScript==
var begin = "";
var lang = "";
var timecount = 2000;
var timer;
var playback_hotkeys;
var playback_code;
var playback_ctrl;
var playback_shift;
var playback_alt;
var audioinput_hotkeys;
var audioinput_code;
var audioinput_ctrl;
var audioinput_shift;
var audioinput_alt;

//音声認識
var recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;

recognition.onresult = function(event) {
    var length = event.results.length;
	if (length > 0) {

        var recogStr = event.results[length-1][0].transcript;

		console.log(recogStr);
	}
    var wx = 800;
    var wy = 400;
    var x = (screen.width  - wx) / 2;
    var y = (screen.height - wy) / 2;
    var win = window.open("https://translate.google.com/#ja/en/" + encodeURI(recogStr), "GT Auto Speaker", 'width=' + wx + ', height=' + wy + ', left=' + x + ', top=' + y + ' ');
    win.focus();
//    $("#gt-res-listen",win.document).click();
};

recognition.onstart = function(event) {
//    $("#msg").empty();
//    $("#msg").append("start");
};

recognition.onspeechstart = function(event) {
};

recognition.onend = function(event) {
//    $("#msg").empty();
//    $("#msg").append("end");
//	console.log("end");
//    recognition.start();
};

recognition.onerror = function(event) {
//    $("#msg").empty();
//    $("#msg").append("error");
};

document.addEventListener('DOMNodeInserted',
	function(){
		if( event.target.parentNode.id === 'result_box'){
			var val = event.target.parentNode.textContent.replace(/\s/g,"+");
			lang = $(event.target.parentNode).attr("lang");
			if (val.indexOf(begin) <= 0) {
				begin = val;
			}
		} 
	},
false);

startTimer = function(response) {
	setResponse(response);
	if (timer != null && timer != undefined) {
		clearTimeout(timer);
	}
	timer = setTimeout(function() { speaker(response) }, timecount);
}

setResponse = function(response) {
	timecount = response.timecount;
	playback_hotkeys = response.playback_hotkeys;
	playback_ctrl = /ctrl/.test(playback_hotkeys);
	playback_shift = /shift/.test(playback_hotkeys);
	playback_alt = /alt/.test(playback_hotkeys);
	playback_code = playback_hotkeys.substr(playback_hotkeys.lastIndexOf('+') + 2);
	audioinput_hotkeys = response.audioinput_hotkeys;
	audioinput_ctrl = /ctrl/.test(audioinput_hotkeys);
	audioinput_shift = /shift/.test(audioinput_hotkeys);
	audioinput_alt = /alt/.test(audioinput_hotkeys);
	audioinput_code = audioinput_hotkeys.substr(audioinput_hotkeys.lastIndexOf('+') + 2);
}
speaker = function(response) {
	setResponse(response);
	if (begin.length > 0) {
		chrome.extension.sendRequest({timer: timer, lang: lang, charset: document.charset, text: begin}, function(response) {
			setResponse(response);
		});
		begin = "";
	}
	startTimer(response);
};

$(function() {
//	if (!recognition.started) {
//		recognition.started = true;
//		recognition.start();
//	}
	chrome.runtime.sendMessage({text: begin, recognition: recognition},function(response) {
		startTimer(response);
	});
});

document.addEventListener("keydown", function (e)
{
	if((e.keyCode == playback_code) && e.ctrlKey == playback_ctrl && e.shiftKey == playback_shift && e.altKey == playback_alt)
	{
		chrome.extension.sendRequest({method: "playback_keydown", timer: timer}, function(response) {
			if (response.icontitle == "ON") {
				startTimer(response);
			}
		});
		return false;
	}
	if((e.keyCode == audioinput_code) && e.ctrlKey == audioinput_ctrl && e.shiftKey == audioinput_shift && e.altKey == audioinput_alt)
	{
		chrome.extension.sendRequest({method: "audioinput_keydown", timer: timer}, function(response) {
			if (response.icontitle == "ON") {
				startTimer(response);
			}
		});
		return false;
	}
}, false);
