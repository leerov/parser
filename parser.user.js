// ==UserScript==
// @name         Universal Scraper with Dynamic Settings
// @namespace    http://tampermonkey.net/
// @version      0.1.3
// @description  Universal scraper with dynamic settings, field management, and import/export functionality
// @author       Leerov
// @match        https://books.toscrape.com/catalogue/category/books_1/*
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

    // === Изначально определенное поле: селектор для кнопки следующей страницы ===
    const nextPageSelectorKey = "nextPageSelector";
    const defaultNextPageSelector = ".pager .next a"; // Значение по умолчанию
    const savedNextPageSelector = GM_getValue(nextPageSelectorKey, defaultNextPageSelector);

    // === Загрузка сохраненных полей и селекторов из настроек ===
    const savedFields = GM_getValue("scraperFields", []); // Список полей (по умолчанию пустой)

    // === URL для отправки данных (можно настроить через GUI) ===
    const apiUrl = GM_getValue("apiUrl", "http://localhost:3000/api/list");

    // === Функция для выполнения основного процесса сбора данных ===
    function runJob() {
        const data = [];

        // Сбор данных с использованием настроенных полей
        savedFields.forEach(field => {
            document.querySelectorAll(field.selector).forEach(element => {
                data.push({
                    field: field.name,
                    value: field.attribute
                        ? element.getAttribute(field.attribute)
                        : element.innerText.trim()
                });
            });
        });

        const domain = window.location.hostname;

        // Отправка данных на сервер
        GM_xmlhttpRequest({
            method: "POST",
            url: apiUrl,
            data: JSON.stringify({ domain: domain, data: data }),
            headers: {
                "Content-Type": "application/json",
            },
            onload: function(response) {
                try {
                    const serverResponse = JSON.parse(response.response);

                    if (serverResponse.success) {
                        console.log("Данные успешно отправлены. Переход на следующую страницу...");
                        const nextButton = document.querySelector(savedNextPageSelector);
                        if (nextButton) {
                            nextButton.click();
                        } else {
                            console.log("Кнопка следующей страницы не найдена.");
                        }
                    } else {
                        console.error("Сервер вернул ошибку:", serverResponse.message || "Неизвестная ошибка.");
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

    // === Функция для отображения GUI настроек ===
    function showSettings() {
        const settingsHTML = `
            <div id="scraper-settings">
                <h2>Настройки скрипта</h2>
                <label>Селектор кнопки следующей страницы: 
                    <input type="text" id="nextPageSelector" value="${savedNextPageSelector}">
                </label><br>
                <label>API URL: 
                    <input type="text" id="apiUrl" value="${apiUrl}">
                </label><br>
                <h3>Поля для сбора данных:</h3>
                <div id="fields-list">
                    ${savedFields.map((field, index) => `
                        <div class="field-row" data-index="${index}">
                            <input type="text" class="field-name" value="${field.name}" placeholder="Название поля">
                            <input type="text" class="field-selector" value="${field.selector}" placeholder="CSS-селектор">
                            <input type="text" class="field-attribute" value="${field.attribute || ''}" placeholder="Атрибут (опционально)">
                            <button class="remove-field">Удалить</button>
                        </div>
                    `).join("")}
                </div>
                <button id="add-field">Добавить поле</button><br>
                <button id="save-settings">Сохранить настройки</button>
                <button id="export-settings">Экспортировать настройки</button>
                <button id="import-settings">Импортировать настройки</button>
                <button id="close-settings">Закрыть</button>
                <textarea id="settings-import-export" placeholder="Экспортированные настройки"></textarea>
            </div>
        `;

        // Добавляем настройки на страницу
        const settingsDiv = document.createElement("div");
        settingsDiv.innerHTML = settingsHTML;
        document.body.appendChild(settingsDiv);

        // Стили для GUI
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
            #scraper-settings input {
                width: calc(100% - 20px);
                margin: 5px 0;
            }
            #scraper-settings button {
                margin-top: 10px;
                margin-right: 5px;
                padding: 5px 10px;
                cursor: pointer;
            }
            .field-row {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }
            .field-row input {
                margin-right: 5px;
                flex: 1;
            }
            .remove-field {
                background: red;
                color: white;
                border: none;
                padding: 5px;
            }
            #settings-import-export {
                width: 100%;
                height: 100px;
                margin-top: 10px;
            }
        `);

        // Добавление нового поля
        document.getElementById("add-field").addEventListener("click", () => {
            const fieldsList = document.getElementById("fields-list");
            const fieldIndex = fieldsList.children.length;
            const fieldRowHTML = `
                <div class="field-row" data-index="${fieldIndex}">
                    <input type="text" class="field-name" placeholder="Название поля">
                    <input type="text" class="field-selector" placeholder="CSS-селектор">
                    <input type="text" class="field-attribute" placeholder="Атрибут (опционально)">
                    <button class="remove-field">Удалить</button>
                </div>
            `;
            fieldsList.insertAdjacentHTML("beforeend", fieldRowHTML);
            attachRemoveFieldListeners();
        });

        // Сохранение настроек
        document.getElementById("save-settings").addEventListener("click", () => {
            const nextPageSelector = document.getElementById("nextPageSelector").value;
            const apiUrl = document.getElementById("apiUrl").value;
            const fields = Array.from(document.querySelectorAll("#fields-list .field-row")).map(row => ({
                name: row.querySelector(".field-name").value,
                selector: row.querySelector(".field-selector").value,
                attribute: row.querySelector(".field-attribute").value || null
            }));

            GM_setValue(nextPageSelectorKey, nextPageSelector);
            GM_setValue("apiUrl", apiUrl);
            GM_setValue("scraperFields", fields);

            alert("Настройки сохранены!");
        });

        // Экспорт настроек
        document.getElementById("export-settings").addEventListener("click", () => {
            const exportData = JSON.stringify({
                nextPageSelector: GM_getValue(nextPageSelectorKey),
                apiUrl: GM_getValue("apiUrl"),
                fields: GM_getValue("scraperFields")
            });
            document.getElementById("settings-import-export").value = exportData;
        });

        // Импорт настроек
        document.getElementById("import-settings").addEventListener("click", () => {
            const importData = JSON.parse(document.getElementById("settings-import-export").value);
            GM_setValue(nextPageSelectorKey, importData.nextPageSelector);
            GM_setValue("apiUrl", importData.apiUrl);
            GM_setValue("scraperFields", importData.fields);
            alert("Настройки импортированы! Перезагрузите страницу.");
        });

        // Закрытие окна настроек
        document.getElementById("close-settings").addEventListener("click", () => {
            settingsDiv.remove();
        });

        // Удаление поля
        function attachRemoveFieldListeners() {
            document.querySelectorAll(".remove-field").forEach(button => {
                button.addEventListener("click", (e) => {
                    e.target.closest(".field-row").remove();
                });
            });
        }
        attachRemoveFieldListeners();
    }

    // === Регистрация команды в меню Tampermonkey ===
    GM_registerMenuCommand("Открыть настройки", showSettings);

    // Запуск задачи
    runJob();
})();
