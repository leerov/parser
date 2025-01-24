// ==UserScript==
// @name         Parser by Leerov
// @icon         https://raw.githubusercontent.com/leerov/parser/main/icon.svg
// @namespace    http://tampermonkey.net/
// @version      0.3.14
// @description  Modularized universal scraper with external step files
// @author       Leerov
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @homepageURL  https://github.com/leerov/parser
// @updateURL    https://raw.githubusercontent.com/leerov/parser/main/main.user.js
// @downloadURL  https://raw.githubusercontent.com/leerov/parser/main/main.user.js
// @require      https://raw.githubusercontent.com/leerov/parser/main/util/addExcludeClassRecursively.js
// @require      https://raw.githubusercontent.com/leerov/parser/main/steps/selectElement.js
// @require      https://raw.githubusercontent.com/leerov/parser/main/steps/chooseData.js

// ==/UserScript==

(function () {
    'use strict';

    const steps = [
        "Выбрать первый элемент",
        "Выбрать второй элемент",
        "Выбрать информацию для сохранения",
        "Выбрать кнопку следующий элемент",
        "Проверить доступность сайта",
        "Проверить конфигурацию",
        "Начать парсинг"
    ];

    const domain = window.location.hostname;
    const savedConfig = GM_getValue(`${domain}_config`, {
        domain,
        currentStep: 0,
        steps: steps.map((step, index) => ({
            stepIndex: index,
            info: step,
            result: null
        }))
    });

    let currentStep = savedConfig.currentStep;

    const saveConfiguration = (result) => {
        let config = GM_getValue(`${domain}_config`, {
            domain,
            currentStep: 0,
            steps: steps.map((step, index) => ({
                stepIndex: index,
                info: step,
                result: null
            }))
        });
    
        if (!config.steps || !Array.isArray(config.steps)) {
            console.error('Ошибка: свойство steps не определено или не является массивом');
            return;
        }
    
        if (currentStep >= 0 && currentStep < config.steps.length) {
            config.steps[currentStep].result = result;
    
            GM_setValue(`${domain}_config`, {
                ...config,
                currentStep
            });
        } else {
            console.error('Ошибка: currentStep выходит за пределы массива steps');
        }
    };
    

    const createStepBar = (stepIndex) => {
        const stepBar = document.createElement('div');
        Object.assign(stepBar.style, {
            position: 'fixed',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)',
            backgroundColor: '#333',
            color: '#fff',
            padding: '10px 20px',
            zIndex: '9999',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.5)',
            transition: 'top 0.3s'
        });

        const stepNumber = document.createElement('span');
        stepNumber.textContent = `Шаг ${stepIndex + 1} из ${steps.length}`;

        const stepTitle = document.createElement('span');
        stepTitle.textContent = steps[stepIndex];

        const actionButton = document.createElement('button');
        actionButton.innerHTML = '▶';
        Object.assign(actionButton.style, {
            width: '40px',
            height: '40px',
            backgroundColor: 'green',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        });

        actionButton.addEventListener('click', async () => {
            const stepFunction = window[`step${currentStep}`];

            if (typeof stepFunction === 'function') {
                try {
                    const result = await stepFunction();
                    if (result !== null) {
                        saveConfiguration(result);
                        currentStep++;

                        if (currentStep < steps.length) {
                            stepBar.remove();
                            createStepBar(currentStep);
                        } else {
                            alert('Парсинг завершён!');
                            stepBar.remove();
                            GM_setValue(`${domain}_config`, null);
                        }
                    } else {
                        alert('Результат шага пустой! Попробуйте снова.');
                    }
                } catch (error) {
                    console.error('Ошибка выполнения шага:', error);
                    alert('Произошла ошибка. Проверьте консоль.');
                }
            } else {
                alert('Функция для текущего шага не найдена!');
            }
        });

        stepBar.append(stepNumber, stepTitle, actionButton);
        document.body.insertBefore(stepBar, document.body.firstChild);

        stepBar.addEventListener('mouseenter', () => {
            stepBar.style.top = '0';
        });

        stepBar.addEventListener('mouseleave', () => {
            stepBar.style.top = '-40px';
        });



        addExcludeClassRecursively(stepBar);
    };

    window.step0 = () => selectElement("Выбрать первый элемент");
    window.step1 = () => selectElement("Выбрать второй элемент");
    window.step2 = () => chooseData("Выбор информации для парсинга");
    

    createStepBar(currentStep);
})();
