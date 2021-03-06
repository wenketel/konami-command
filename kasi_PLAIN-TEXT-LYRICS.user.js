// ==UserScript==
// @name         kasi. PLAIN TEXT LYRICS 歌詞コピー 純文本歌詞
// @version      2014.0321.1712
// @description  music.goo.ne.jp, lyrics.gyao.yahoo.co.jp, kasi-time.com, lyric.kget.jp, petitlyrics.com, utamap.com, uta-net.com, utaten.com
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/kasi_PLAIN-TEXT-LYRICS.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/kasi_PLAIN-TEXT-LYRICS.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @grant        none
// @include      http*://*uta-net.com/movie/*/
// @include      http*://*uta-net.com/song/*/
// @include      http*://petitlyrics.com/kashi/*
// @include      http://*utamap.com/*.php?surl=*
// @include      http://lyrics.gyao.yahoo.co.jp/ly/*
// @include      http://music.goo.ne.jp/lyric/*
// @include      http://rio.yahooapis.jp/RioWebService/V2/*
// @include      http://utaten.com/lyric/*
// @include      http://www.kasi-time.com/item-*.html
// @include      http://www.kget.jp/lyric/*
// @run-at       document-end
// ==/UserScript==
(function(){"use strict";
	var DEBUG = false;
	var kasimasin = {
		"music.goo": {
			"na": "goo音楽",
			"init": function(start) {
				if (start) {
					var jsonurl = /\/sp\/lyric\/print_json\.php\?[^']+/;
					document.querySelector("head").addEventListener("DOMNodeInserted", function(e) {
						var src;
						if (this.lastChild.tagName == "SCRIPT" && (src = this.lastChild.getAttribute("src")) && src.match(jsonurl)) {
							this.removeChild(this.lastChild);
							db("json call prevented");
						}
					}, false);
					var scripts = document.querySelectorAll("div#main script[type='text/javascript']:not([src])");
					for (var s=0; s<scripts.length; s++) {
						var url = scripts[s].innerText.match(jsonurl);
						if (url) {
							kasimasin.kasi_url = ""+url;
							break;
						}
					}
					machine();
				}
			},
			"kabe_css": "div#lyric_canvas",
			"xhr_machine": function(xhr) {
				var json = xhr.responseText.match(/draw\((\[\".+\"\])\);/);
				if (json && (json = eval(json[1])) && typeof json == "object" && json != null && json.length > 0) {
					var kasi = "";
					for (var k=0; k < json.length; k++) {
						kasi += json[k];
					}
					gogogo(kasi);
				}
				else { gogogo(null, "json"); }
			},
		},
		"lyrics.gyao": {
			"na": "GyaO!歌詞",
			"clean_url": "http://lyrics.gyao.yahoo.co.jp/ly/%uta%",
			"kabe_css": "div.lyrics_detail > div.inner",
			"kabe_keep": true,
			"uta_re": /\/ly\/([^/]+)\/?$/,
			"kasi_url": "http://rio.yahooapis.jp/RioWebService/V2/getLyrics?appid=7vOgnk6xg64IDggn6YEl3IQxmbj1qqkQzTpAx5nGwl9HnfPX3tZksE.oYhEw3zA-&lyrics_id=%uta%&results=1&multi_htmlspecialchars_flag=1",
			"kasi_url_fix": [/(\?|&)multi_htmlspecialchars_flag=[01]/, ""],
			"direct_machine": function(e) {
				var iframe = document.createElement("iframe");
				iframe.setAttribute("src", kasimasin.kasi_url);
				iframe.style.setProperty("height", "600px");
				iframe.style.setProperty("width", "100%");
				gogogo(iframe);
				mati.appendChild(document.createTextNode(" ↓ PLEASE CLICK ↓"));
			},
		},
		"rio.yahooapis": {
			"na": "ギャオ歌詞API",
			"direct_machine": function(e) {
				var alrt = "";
				var tmp = document.querySelector("ResultSet > Result > Title"); if (tmp) { alrt += tmp.textContent+" / "; }
				tmp = document.querySelector("ResultSet > Result > ArtistName"); if (tmp) { alrt += tmp.textContent+"\n\n"; }
				tmp = document.querySelector("ResultSet > Result > WriterName"); if (tmp) { alrt += "作詞："+tmp.textContent+"\n"; }
				tmp = document.querySelector("ResultSet > Result > ComposerName"); if (tmp) { alrt += "作曲："+tmp.textContent+"\n"; }
				tmp = document.querySelector("ResultSet > Result > Lyrics"); if (tmp) { alrt += "\n"+tmp.textContent.replace(/\<br\>/gi, "\n"); }
				document.addEventListener("click", function(e) { alert(alrt); }, false);
				alert(alrt);
			},
		},
		"kasi-time": {
			"na": "歌詞タイム",
			"kabe_css": "div.mainkashi",
			"kabe_keep": true,
			"init": function(start) {
				if (start) {
					machine();
				}
			},
			"direct_machine": function(e) {
				if (kabe) {
					gogogo();
				}
			},
		},
		"kget": {
			"na": "歌詞ＧＥＴ",
			"kabe_css": "div#lyric-trunk",
			"kabe_keep": true,
			"direct_machine": function(e) {
				if (kabe) {
					gogogo();
				}
			},
		},
		"petitlyrics": {
			"na": "プチリリ",
			"clean_url": "https://petitlyrics.com/kashi/%uta%",
			"uta_re": /\/kashi\/(\d+)\/?$/,
			"direct_machine": function(e) {
				if (kabe) {
					document.body.style.removeProperty("cursor");
					kasimasin.submachine();
					kabe.addEventListener("DOMNodeInserted", kasimasin.submachine, false);
				}
			},
			"kabe_css": "div#lyrics_window",
			"kabe_keep": true,
			"submachine": function(e) {
				gogogo();
			},
		},
		"utamap": {
			"na": "うたまっぷ",
			"clean_url": "http://www.utamap.com/showkasi.php?surl=%uta%",
			"init": function(start) {
				if (start) { machine(); }
			},
			"kabe_css": "object#showkasi,canvas#canvas2",
			"uta_re": /surl=(.+)&?.*$/,
			"kasi_url": "/phpflash/flashfalsephp.php?unum=%uta%",
			"xhr_overrideMimeType": "text/xml; charset=utf-8",
			"xhr_machine": function(xhr) {
				gogogo(xhr.responseText.replace(/^test1=[0-9]+&test2=/, ""));
			},
		},
		"uta-net": {
			"na": "歌ネット",
			"clean_url": "https://uta-net.com/song/%uta%/",
			"init": function(start) {
				if (start) { machine(); }
			},
			"kabe_css": "object#showkasi",
			"uta_re": /\/(\d+)\/$/,
			"kasi_css": ["object#showkasi > embed", "src"],
			"xhr_responseType": "arraybuffer",
			"xhr_machine": function(xhr) {
				var kara = abHexSearch(xhr.response, "FF0000");
				var made = abHexSearch(xhr.response, "00", kara+12);
				if (kara>-1 && made>-1) {
					ab2str(xhr.response, gogogo, kara+12, made);
				} else {
					gogogo(null, kara+"〜"+made);
				}
			},
		},
		"utaten": {
			"na": "UtaTen",
			"kabe_css": "div#lyric_frame",
			"uta_re": /lyric\/([^/?]+)(?:\?|$)/,
			"kasi_url": "/lyric/load_text.php?LID=%uta%",
			"xhr_overrideMimeType": "text/xml; charset=Shift_JIS",
			"xhr_machine": function(xhr) {
				gogogo(xhr.responseText.replace(/^(.|\n|\r)+\n\n|\t.+|(\s|\n)+$/g, ""));
			},
		},
	};
	var kabe, mati;
	var doko = location.href.match(/^https?:\/\/(?:www\.)?(music\.goo|lyrics\.gyao|rio\.yahooapis|kasi-time|kget|petitlyrics|utamap|uta-net|utaten)/);
	var userjs_name = "PLAIN TEXT LYRICS 歌詞コピー 純文本歌詞";
	var iti = true;
	if (document.head) {
		document.head.appendChild(document.createElement("style")).setAttribute("type", "text/css");
		var j2ss = document.styleSheets[document.styleSheets.length-1];
		j2ss.insertRule("*{-moz-user-select:text!important;-webkit-user-select:text!important;}", j2ss.cssRules.length);
	}
	if (doko) {
		doko = doko[1];
		kasimasin = kasimasin[doko];
		if (kasimasin.na) { userjs_name = kasimasin.na+" "+userjs_name; }
		db(userjs_name+"\n"+location.href);
		var url;
		if (kasimasin.uta_re && (url = location.href.match(kasimasin.uta_re))) {
			kasimasin.uta = url[1];
		}
		if (kasimasin.clean_url && (url = kasimasin.clean_url.replace(/%uta%/g, kasimasin.uta)) && url != location.href) {
			location.href = url;
		}
		else {
			if (kasimasin.init) { kasimasin.init(true); }
			else { machine(); }
		}
	}
	function machine() {
		if (iti) {
			if (kasimasin.kabe_css) { kabe = document.querySelector(kasimasin.kabe_css); }
			if (kasimasin.init) { kasimasin.init(false); }
			if (kabe) {
				/*var kb = kabe.cloneNode(true);
				kabe.parentNode.replaceChild(kb, kabe);
				kabe = kb;*/
				kabe.style.setProperty("-moz-user-select", "text", "important");
				kabe.style.setProperty("-webkit-user-select", "text", "important");
				kabe.style.setProperty("cursor", "text", "important");
				var blocks = [
					"contextmenu",
					"drag",
					"dragend",
					"dragenter",
					"dragleave",
					"dragover",
					"dragstart",
					"drop",
					"keydown",
					"keypress",
					"keyup",
					"mousedown",
					"mouseup",
					"selectstart"
				];
				blocks.forEach(function(event){
					document.body.addEventListener(event, function(e) {
						e.cancelBubble = true;
						if (e.stopPropagation) e.stopPropagation();
						return true;
					}, true);
				});
				mati = document.createElement("div");
				mati.appendChild(document.createTextNode(userjs_name+" "));
				mati.appendChild(document.createElement("strong")).appendChild(document.createTextNode("PLEASE WAIT"));
				mati.style.setProperty("margin", "16px 0 0 0");
				kabe.parentNode.insertBefore(mati, kabe);
			}
			if (kasimasin.kasi_url || kasimasin.kasi_css) {
				var url;
				if (kasimasin.kasi_url) {
					if (kasimasin.kasi_url.match(/%uta%/) && kasimasin.uta) {
						url = kasimasin.kasi_url.replace(/%uta%/g, kasimasin.uta);
					}
					else { url = kasimasin.kasi_url; }
					iti = false;
				}
				else if (kasimasin.kasi_css && kasimasin.kasi_css.length == 2 && (url = document.querySelector(kasimasin.kasi_css[0]))) {
					url = url.getAttribute(kasimasin.kasi_css[1]);
					iti = false
				}
				if (url) { iti = false; }
				else { return; }
				if (kasimasin.kasi_url_suffix) { url += kasimasin.kasi_url_suffix.replace(/%random%/, (""+Math.random()).substr(2)); }
				if (kasimasin.kasi_url_fix && kasimasin.kasi_url_fix.length == 2) { url = url.replace(kasimasin.kasi_url_fix[0], kasimasin.kasi_url_fix[1]); }
				if (url) {
					kasimasin.kasi_url = url;
				}
			}
			if (kasimasin.xhr_machine) {
				var xhr = new XMLHttpRequest();
				xhr.onload = function(e) {
					db(xhr.response);
					if (this.status > 199 && this.status < 400) { kasimasin.xhr_machine(this); } else { this.onerror(e); }
				};
				xhr.onerror = function (e) {
					gogogo(null, this.status);
				};
				xhr.open("get", url, true);
				if (kasimasin.xhr_responseType) { xhr.responseType = kasimasin.xhr_responseType; }
				if (kasimasin.xhr_overrideMimeType) { xhr.overrideMimeType(kasimasin.xhr_overrideMimeType); }
				xhr.send(null);
				db(kasimasin.na+"\n"+url);
			}
			else if (kasimasin.direct_machine) {
				kasimasin.direct_machine();
			}
		}
	}
	function gogogo(kasi, err) {
		var ka = typeof kasi=="string"?document.createElement("pre").appendChild(document.createTextNode(kasi)).parentNode:kasi;
		mati.style.setProperty("color", err?"red":"green");
		mati.querySelector("strong").replaceChild(document.createTextNode(err?"ERROR エラー （"+err+"）":"OK"), mati.querySelector("strong").firstChild);
		if (DEBUG) {
			mati.style.setProperty("cursor", "pointer");
			mati.addEventListener("click", function(e) { iti = true; machine(); }, false);
		}
		if (err == null) {
			var div;
			if (ka) {
				div = document.createElement("div");
				div.appendChild(ka);
				kabe.parentNode.insertBefore(div, kabe);
			}
			else { div = kabe; }
			div.style.setProperty("text-align", "left");
			div.style.setProperty("color", "#030");
			div.style.setProperty("background", "#efe");
			div.style.setProperty("padding", "8px");
		}
		if (kasimasin.kabe_keep == null || kasimasin.kabe_keep == false || err) {
			kabe.style.setProperty("display", "none");
		}
	}
	/*BINARY MACHINE*/
	function d2h(d) { return d.toString(16).toUpperCase(); }
	function h2d(h) { return parseInt(h, 16); }
	function abHexSearch(pAb, hq, pFrom, pTo) {
		var ab = new Uint8Array(pAb);
		var hqlen = hq.length/2;
		var from = (pFrom && pFrom > 0 && pFrom + hqlen < ab.byteLength)? pFrom : 0;
		var to = (pTo && pTo >= from && pTo <= ab.byteLength)? pTo : ab.byteLength;
		for (var i=from; i<to; i++) {
			for (var j=0; j<hqlen; j=j+2) {
				if (ab[i+j] != h2d(hq.substr(j,2))) { break; }
				if (j == hqlen - 1) { return i; }
			}
		}
		return -1;
	}
	function ab2str(ab, callback, from, to) {
		var offset = from?from:0;
		var length = to?to-offset:null;
	    var b = new Blob([new Uint8Array(ab, offset, length)]);
	    var f = new FileReader();
	    f.onload = function(e) {
	        callback(e.target.result)
	    }
	    f.readAsText(b);
	}
	function db(inf) {
		if (DEBUG) { console.log(inf); }
	}
})();