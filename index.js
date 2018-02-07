/*
* License: MIT
* Author: Pedro J. Martínez <hello@mrtz.es><github.com/pmrt>
* Description: A3Player Ads Remover Bookmarklet. -
* 			   Just a tiny script for removing ads from a3player.
*/
(function(window, document) {
	var MESSAGE_PREFIX = '[A3PlayerAdRemover]: ';
	var PLAY_BUTTON_CLASS_NAME = "Zm5fcmVnaXN0cm9fbGluaw==";
	var LOOP_MAX_ATTEMPTS = 100;
	var removeAdsIfPlayerExists = loop(
		removeAds,
		playerExists,
		function err() {
			log("Video element detected successfully but player object couldn't be found.");
		}
	);
	var destroyAdPlayerIfAddSessionExists = loop(
		destroyAdPlayer,
		adSessionExists,
		function err() {
			log("No ad session found.");
		},
		function done() {
			log("Injection successful. Ads have been removed.");
		}
	);

	function log(msg) {
		console.log('%c' + MESSAGE_PREFIX + msg, 'color: #333;background-color: #8373F0');
	}

	function playerExists() {
		return typeof window.player !== "undefined";
	}

	function adSessionExists() {
		return typeof window.player.adPlayer._session !== "undefined";
	}

	function loop(fn, exitCondFn, errFn, doneFn) {
		var t, c = 0;
		var resultLoop = function() {
			if ( c++ >= LOOP_MAX_ATTEMPTS + 1 ) {
				clearInterval(t);
				if (errFn) errFn();
				return;
			}
			if (exitCondFn()) {
				clearInterval(t);
				fn();
				if (doneFn) doneFn();
				return;
			}
			t = setTimeout(resultLoop, 50);
		}
		return resultLoop;
	}

	function destroyAdPlayer() {
		var player = window.player;
		player.adPlayer.destroy();
		if (player.paused()) {
			player.play();
		}
	}

	function removeAds(){
		var player = window.player;
		player.ready(destroyAdPlayerIfAddSessionExists);
	};

	function init(){
		if (playerExists()) return removeAds();
		var playEl, playEls = document.getElementsByClassName(atob(PLAY_BUTTON_CLASS_NAME));
		if (playEls.length === 0) return;
		playEl = playEls[0];
		playEl.addEventListener('click', removeAdsIfPlayerExists); 
	}

	if (document.readyState === "complete") {
		init();
	} else {
		window.onload = init;
	}

})(window, document);
