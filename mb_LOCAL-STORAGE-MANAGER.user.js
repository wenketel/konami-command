// ==UserScript==
// @name         mb. LOCAL STORAGE MANAGER
// @description  musicbrainz.org: Read, write, edit and delete key/values from your mb local storage (in About menu)
// @version      2014.9.30.1727
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_LOCAL-STORAGE-MANAGER.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/mb_LOCAL-STORAGE-MANAGER.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @grant        none
// @include      http*://*musicbrainz.org/*
// @run-at       document-end
// ==/UserScript==
(function () {
	var userjs = "jesus2099userjs126475";
	var lsm, lskeys;
	var j2set = document.querySelector("div#header-menu li.about > ul > li.jesus2099");
	if (!j2set && (j2set = document.querySelector("div#header-menu li.about > ul"))) {
		j2set = j2set.appendChild(document.createElement("li"));
		j2set.className = "jesus2099 separator";
	}
	if (j2set) {
		var li = document.createElement("li");
		li.className = "jesus2099";
		addAfter(li, j2set).appendChild(createA("Local storage manager\u00ae", function(e){
			this.parentNode.parentNode.style.removeProperty("left");
			if (lsm) {
				unloadLS()
			}
			else {
				lskeys = [];
				lsm = document.getElementById("page");
				lsm = lsm.insertBefore(document.createElement("div"), lsm.firstChild);
				lsm.setAttribute("id", userjs+"lsm");
				lsm.appendChild(document.createElement("h2")).appendChild(concat([
					"Local storage manager (",
					createA("new", function(e) {
						loadLS();
						var key = prompt("Type new key name");
						if (key) {
							if (lskeys.indexOf(key) == -1 || confirm("THIS KEY ALREADY EXISTS\nDo you want to replace it\u00a0?\n\n\u201c"+key+"\u201d\u00a0:\n"+localStorage.getItem(key))) {
								var newValue = prompt("Type value for key \u201c"+key+"\u201d");
								if (newValue) {
									localStorage.setItem(key, newValue);
									loadLS();
								}
							}
						}
					}, "Add a new key"),
					"/",
					createA("reload", function(e) { loadLS(); }, "Browse all local storage keys"),
					"/",
					createA("clear", function(e) {
						loadLS();
						if (!e.shiftKey) { alert("SHIFT+CLICK\n\nIn order to avoid GRO\u00df MALHEUR,\nyou must hold down shift key\nif you really really want to erase\nall your local storage for this website."); return true; }
						if (confirm("Are you sure you want to clear all those keys\nfrom your local storage memory\nfor this website?\nYOU CANNOT UNDO THIS ACTION.")) {
							localStorage.clear();
							loadLS();
						} 
					}, "Clear all local storage keys"),
					"/",
					createA("close", function(e) { unloadLS(); }, "Close local storage manager"),
					")"
				]));
				document.addEventListener("storage", function(e) { loadLS(); }, false);/*does never trigger btw*/
				loadLS();
				lsm.parentNode.scrollIntoView();
			}
		}));
	}
	function unloadLS() {
		lsm.parentNode.removeChild(lsm);
		lsm = null;
		lskeys = null;
	}
	function loadLS() {
		var keylist = document.createElement("table");
		keylist.setAttribute("cellspacing", "0");
		keylist.setAttribute("cellpadding", "0");
		keylist.style.setProperty("border", "2px dashed red");
		keylist.style.setProperty("background-color", "#eee");
		keylist.style.setProperty("padding", "8px");
		keylist.style.setProperty("margin", "8px");
		lskeys = [];
		for (var ls=0; ls<localStorage.length; ls++) {
			lskeys.push(localStorage.key(ls));
		}
		lskeys.sort();
		addRow(keylist, ["#", "Key", "Content", "\u00a0", "Size (characters)"], "th");
		var size = 0;
		for (var k=0; k<lskeys.length; k++) {
			var key = lskeys[k];
			var content = localStorage.getItem(key);
			size += content.length;
			var tr = addRow(keylist, [
				(k+1)+".\u00a0",
				document.createElement("code").appendChild(document.createTextNode(key)).parentNode,
				content.length>64||content.match(/(\n|\r)/)?content.substr(0, 64)+(content.length>64?"\u2026":""):content,
				concat([
					" ",
					createA(
						"\u00d7",
						function(e) {
							stop(e);
							var item = this.getAttribute("title").match(/^remove (.+)$/)[1];
							if (confirm("Do you want to remove following item?\n"+item)) {
								localStorage.removeItem(item);
							}
							loadLS();
						},
						"remove "+key
					),
				]),
				content.length+""
			]);
			tr.setAttribute("title", "edit "+key);
			tr.addEventListener("click", function(e){
				function coolstuff(t,z,s,b,o) {
					var truc = document.getElementsByTagName("body")[0].appendChild(document.createElement(t));
					truc.style.setProperty("position", "fixed");
					truc.style.setProperty("z-index", z);
					truc.style.setProperty("top", (100-s)/2+"%");
					truc.style.setProperty("left", (100-s)/2+"%");
					truc.style.setProperty("width", s+"%");
					truc.style.setProperty("height", s+"%");
					if (b) { truc.style.setProperty("background-color", b); }
					if (o) { truc.style.setProperty("opacity", o); }
					return truc;
				}
				var bidule = coolstuff("div", "50", 100, "black", ".6");
				bidule.setAttribute("title", this.getAttribute("title").match(/^edit (.+)$/)[1]);
				bidule.addEventListener("click", function(e) {
					this.nextSibling.setAttribute("disabled", "disabled");
					var item = this.getAttribute("title");
					var oval = localStorage.getItem(item);
					var nval = this.nextSibling.value;
					if (oval != nval && confirm("Do you want to save following item?\n"+item)) {
						localStorage.setItem(item, nval);
					}
					this.parentNode.removeChild(this.nextSibling);
					this.parentNode.removeChild(this);
					loadLS();
				}, false);
				bidule = coolstuff("textarea", "55", 80);
				bidule.addEventListener("keypress", function(e) {
					if (e.keyCode == 27) { this.previousSibling.click(); }
				}, false);
				bidule.appendChild(document.createTextNode(localStorage.getItem(this.getAttribute("title").match(/^edit (.+)$/)[1])));
				bidule.setAttribute("title", "press ESC to close");
				bidule.select();
			}, false);
		}
		addRow(keylist, ["\u00a0", "\u00a0", "\u00a0", "\u00a0", size+""]);
		var lsm = document.getElementById(userjs+"lsm");
		var lsmkeys = lsm.querySelector("table");
		if (lsmkeys) { lsm.replaceChild(keylist, lsmkeys); }
		else { lsm.appendChild(keylist); }
	}
	function decorate(event, tr, over) {
		tr.style.setProperty("text-shadow", over?"1px 2px 2px #999":"none");
		tr.style.setProperty("background-color", over?"white":"transparent");
	}
	function addRow(table, cells, type) {
		var tr = table.appendChild(document.createElement("tr"));
		if (type == "ev") { tr.className = "ev"; }
		tr.addEventListener("mouseover", function(e){decorate(e,this,true);}, false);
		tr.addEventListener("mouseout", function(e){decorate(e,this,false);}, false);
		tr.style.setProperty("cursor", type=="th"?"default":"pointer");
		for (var cell=0; cell<cells.length; cell++) {
			var td = tr.appendChild(document.createElement(type=="th"?"th":"td"));
			td.style.setProperty("padding", "0 4px");
			td.appendChild(typeof cells[cell]=="string"?document.createTextNode(cells[cell]):cells[cell]);
		}
		return tr;
	}
	function concat(tstuff) {
		var concats = document.createDocumentFragment();
		var stuff = tstuff;
		if (typeof stuff != "object" || !stuff.length) {
			stuff = [stuff];
		}
		for (var thisStuff=0; thisStuff<stuff.length; thisStuff++) {
			concats.appendChild(typeof stuff[thisStuff]=="string"?document.createTextNode(stuff[thisStuff]):stuff[thisStuff]);
		}
		return concats;
	}
	function createA(text, link, title) {
		var a = document.createElement("a");
		if (link && typeof link == "string") {
			a.setAttribute("href", link);
		}
		else {
			if (link && typeof link == "function") {
				a.addEventListener("click", link, false);
			}
			a.style.setProperty("cursor", "pointer");
		}
		if (title){ a.setAttribute("title", title); }
		a.appendChild(document.createTextNode(text));
		return a;
	}
	function addAfter(n, e) {
		if (n && e && e.parentNode) {
			if (e.nextSibling) { return e.parentNode.insertBefore(n, e.nextSibling); }
			else { return e.parentNode.appendChild(n); }
		} else { return null; }
	}
	function stop(e) {
		e.cancelBubble = true;
		if (e.stopPropagation) e.stopPropagation();
		e.preventDefault();
		return false;
	}
})();