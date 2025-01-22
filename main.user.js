// ==UserScript==
// @name         Parser by Leerov
// @namespace    http://tampermonkey.net/
// @version      0.1.13
// @description  Modularized universal scraper with dynamic settings, field management, and manual start
// @author       Leerov
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @require      https://raw.githubusercontent.com/leerov/parser/main/settings.js
// @require      https://raw.githubusercontent.com/leerov/parser/main/parser.js
// @require      https://raw.githubusercontent.com/leerov/parser/main/ui.js
// ==/UserScript==


(function () {
    "use strict";

    if (Settings.isParsing()) {
        console.log("Парсинг включен.");
        Parser.start();
    } else {
        console.log("Парсинг выключен.");
    }

    GM_registerMenuCommand("Открыть настройки", UI.showSettings);
    GM_registerMenuCommand("Переключить парсинг", Settings.toggleParsing);
})();
