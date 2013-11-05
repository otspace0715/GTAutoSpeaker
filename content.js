// ==UserScript==
// @name           GT Auto Speaker
// @description    Text-to-speech automatic of Google Translate Site.
// @version        1.0.0
// @date           2013-10-25
// @author         Osamu Tanaka
// @namespace      http://code.google.com/p/google-translate-auto-speaker/
// @include        http://translate.google.com/*
// @include        http://translate.google.co.jp/*
// @include        https://translate.google.com/*
// @include        https://translate.google.co.jp/*
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
}
speaker = function(response) {
	setResponse(response);
	if (begin.length > 0) {
		chrome.extension.sendRequest({lang: lang, charset: document.charset, text: begin}, function(response) {
			setResponse(response);
		});
		begin = "";
	}
	startTimer(response);
};

$(function() {
	chrome.runtime.sendMessage({text: begin},function(response) {
		startTimer(response);
	});
});

document.addEventListener("keydown", function (e)
{
	if((e.keyCode == playback_code) && e.ctrlKey == playback_ctrl && e.shiftKey == playback_shift && e.altKey == playback_alt)
	{
		chrome.extension.sendRequest({method: "playback_keydown"}, function(response) {
			setResponse(response);
			startTimer(response);
		});
		return false;
	}
}, false);
