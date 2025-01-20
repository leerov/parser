// ==UserScript==
// @name         Universal Scraper with Dynamic Settings (Manual Start)
// @namespace    http://tampermonkey.net/
// @version      0.1.5
// @description  Universal scraper with dynamic settings, field management, and manual start
// @author       Leerov
// @match        *://*/*  
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @homepageURL  https://github.com/leerov/parser
// @updateURL    https://raw.githubusercontent.com/leerov/parser/main/parser.user.js
// @downloadURL  https://raw.githubusercontent.com/leerov/parser/main/parser.user.js
// ==/UserScript==

(function() {
    'use strict';

    const nextPageSelectorKey = "nextPageSelector";
    const defaultNextPageSelector = ".pager .next a";
    const savedNextPageSelector = GM_getValue(nextPageSelectorKey, defaultNextPageSelector);
    const savedFields = GM_getValue("scraperFields", []);
    const apiUrl = GM_getValue("apiUrl", "http://localhost:3000/api/list");

    function runJob() {
        const data = [];

        document.querySelectorAll(savedFields.length > 0 ? savedFields[0].selector : "").forEach(element => {
            const item = {};
            savedFields.forEach(field => {
                const value = field.attribute
                    ? element.querySelector(field.selector)?.getAttribute(field.attribute)
                    : element.querySelector(field.selector)?.innerText.trim();

                if (value) item[field.name] = value;
            });

            if (Object.keys(item).length) data.push(item);
        });

        const domain = window.location.hostname;

        GM_xmlhttpRequest({
            method: "POST",
            url: apiUrl,
            data: JSON.stringify({ domain, data }),
            headers: { "Content-Type": "application/json" },
            onload: function(response) {
                try {
                    const serverResponse = JSON.parse(response.response);
                    if (serverResponse.success) {
                        console.log("Данные успешно отправлены.");
                        const nextButton = document.querySelector(savedNextPageSelector);
                        nextButton ? nextButton.click() : console.log("Кнопка следующей страницы не найдена.");
                    } else {
                        console.error("Ошибка сервера:", serverResponse.message);
                    }
                } catch (err) {
                    console.error("Ошибка обработки ответа сервера:", err);
                }
            },
            onerror: function(err) {
                console.error("Ошибка запроса:", err);
            }
        });
    }

    function showSettings() {
        const settingsHTML = `
            <div id="scraper-settings">
                <h2>Настройки</h2>
                <h3>JSON-конфигурация</h3>
                <textarea id="json-config" style="width: 100%; height: 300px; font-family: monospace; white-space: pre-wrap; padding: 10px;"></textarea><br>
                <button id="save-settings">Сохранить</button>
                <button id="close-settings">Закрыть</button>
            </div>
        `;
        
        const settingsDiv = document.createElement("div");
        settingsDiv.innerHTML = settingsHTML;
        document.body.appendChild(settingsDiv);

        GM_addStyle(`
            #scraper-settings {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border: 1px solid black;
                padding: 10px;
                z-index: 10000;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                width: 400px;
            }
            #scraper-settings input, #scraper-settings button, #json-config {
                width: 100%;
                margin-bottom: 10px;
            }
            #json-config {
                font-size: 14px;
                line-height: 1.5;
                border: 1px solid #ccc;
                padding: 8px;
            }
            #scraper-settings button {
                padding: 10px;
                margin-top: 10px;
                background-color: #28a745;
                color: white;
                border: none;
                cursor: pointer;
            }
            #scraper-settings button:hover {
                background-color: #218838;
            }
        `);

        const config = {
            nextPageSelector: savedNextPageSelector,
            apiUrl: apiUrl,
            fields: savedFields
        };

        document.getElementById("json-config").value = JSON.stringify(config, null, 4);

        document.getElementById("save-settings").addEventListener("click", () => {
            try {
                const newConfig = JSON.parse(document.getElementById("json-config").value);

                GM_setValue(nextPageSelectorKey, newConfig.nextPageSelector);
                GM_setValue("apiUrl", newConfig.apiUrl);
                GM_setValue("scraperFields", newConfig.fields);

                alert("Настройки сохранены!");
            } catch (e) {
                alert("Ошибка в формате JSON: " + e.message);
            }
        });

        document.getElementById("close-settings").addEventListener("click", () => {
            settingsDiv.remove();
        });
    }

    function showParseButton() {
        const parseButton = document.createElement("button");
        parseButton.innerText = "Начать парсинг";
        parseButton.style.position = "fixed";
        parseButton.style.bottom = "20px";
        parseButton.style.right = "20px";
        parseButton.style.padding = "10px";
        parseButton.style.backgroundColor = "#28a745";
        parseButton.style.color = "white";
        parseButton.style.border = "none";
        parseButton.style.cursor = "pointer";
        parseButton.style.zIndex = "10000";
        document.body.appendChild(parseButton);

        parseButton.addEventListener("click", runJob);
    }

    GM_registerMenuCommand("Открыть настройки", showSettings);
    showParseButton();
})();
