// ==UserScript==
// @name         Parser by Leerov
// @namespace    http://tampermonkey.net/
// @version      0.1.11
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

(function () {
  "use strict";

  const defaultConfig = {
      nextPageSelector: "",
      apiUrl: "http://localhost:3000/api/list",
      fields: [{ name: "src", selector: "a", attribute: "src" }],
      isParsing: false // Добавлено поле для статуса парсинга
  };

  const domain = window.location.hostname;
  const settingsKey = `scraperSettings_${domain}`;
  const savedConfig = GM_getValue(settingsKey, null) || defaultConfig;

  function main() {
      if (savedConfig.isParsing) {
          console.log("Парсинг уже запущен.");
          return;
      }
      savedConfig.isParsing = true; // Устанавливаем статус парсинга
      GM_setValue(settingsKey, savedConfig); // Сохраняем статус

      const data = [];

      document.querySelectorAll(savedConfig.fields[0].selector).forEach((element) => {
        console.log("Обрабатываем элемент:", element);
        const item = {};
        savedConfig.fields.forEach((field) => {
            const value = field.attribute
                ? element.querySelector(field.selector)?.getAttribute(field.attribute)
                : element.querySelector(field.selector)?.innerText.trim();
    
            console.log(`Значение для ${field.name}:`, value); // Отладочное сообщение
    
            if (value) item[field.name] = value;
        });
    
        if (Object.keys(item).length) data.push(item);
    });
    

      if (data.length === 0) {
          console.error("Нет данных для отправки.");
          savedConfig.isParsing = false; // Сбрасываем статус парсинга
          GM_setValue(settingsKey, savedConfig); // Сохраняем статус
          return;
      }

      GM_xmlhttpRequest({
          method: "POST",
          url: savedConfig.apiUrl,
          data: JSON.stringify({ domain, data }),
          headers: { "Content-Type": "application/json" },
          onload: function (response) {
              try {
                  const serverResponse = JSON.parse(response.response);
                  if (serverResponse.success) {
                      console.log("Данные успешно отправлены.");
                      const nextButton = document.querySelector(
                          savedConfig.nextPageSelector
                      );
                      nextButton
                          ? nextButton.click()
                      : console.log("Кнопка следующей страницы не найдена.");
                  } else {
                      console.error("Ошибка сервера:", serverResponse.message);
                  }
              } catch (err) {
                  console.error("Ошибка обработки ответа сервера:", err);
              } finally {
                  savedConfig.isParsing = false; // Сбрасываем статус парсинга
                  GM_setValue(settingsKey, savedConfig); // Сохраняем статус
              }
          },
          onerror: function (err) {
              console.error("Ошибка запроса:", err);
              savedConfig.isParsing = false; // Сбрасываем статус парсинга
              GM_setValue(settingsKey, savedConfig); // Сохраняем статус
          },
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

      document.getElementById("json-config").value = JSON.stringify(
          savedConfig,
          null,
          4
      );

      document.getElementById("save-settings").addEventListener("click", () => {
          try {
              const newConfig = JSON.parse(
                  document.getElementById("json-config").value
              );
              GM_setValue(settingsKey, newConfig);
              alert("Настройки сохранены!");
          } catch (e) {
              alert("Ошибка в формате JSON: " + e.message);
          }
      });

      document.getElementById("close-settings").addEventListener("click", () => {
          settingsDiv.remove();
      });
  }

  function showStartButton() {
      const startButton = document.createElement("button");
      startButton.innerText = "Настройки";
      startButton.style.position = "fixed";
      startButton.style.bottom = "20px";
      startButton.style.right = "20px";
      startButton.style.padding = "10px";
      startButton.style.backgroundColor = "#007bff";
      startButton.style.color = "white";
      startButton.style.border = "none";
      startButton.style.cursor = "pointer";
      startButton.style.zIndex = "10000";
      document.body.appendChild(startButton);

      startButton.addEventListener("click", showSettings);
  }

  GM_registerMenuCommand("Открыть настройки", showSettings);
  showStartButton(); // Показываем кнопку для открытия настроек

  // Если парсинг уже запущен, можно отобразить соответствующее сообщение
  if (savedConfig.isParsing) {
      console.log("Парсинг уже запущен.");
  }
})();


