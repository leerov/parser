// ==UserScript==
// @name         Parser by Leerov
// @icon         https://raw.githubusercontent.com/leerov/parser/main/icon.svg
// @namespace    http://tampermonkey.net/
// @version      0.2.13
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
// @require      https://raw.githubusercontent.com/leerov/parser/main/steps/1_selectFirstElement.js
// @require      https://raw.githubusercontent.com/leerov/parser/main/steps/2_selectSecondElement.js
// @require      https://raw.githubusercontent.com/leerov/parser/main/steps/3_selectInfoToSave.js
// @require      https://raw.githubusercontent.com/leerov/parser/main/steps/4_selectNextElementButton.js
// @require      https://raw.githubusercontent.com/leerov/parser/main/steps/5_checkSiteAvailability.js
// @require      https://raw.githubusercontent.com/leerov/parser/main/steps/6_checkConfiguration.js
// @require      https://raw.githubusercontent.com/leerov/parser/main/steps/7_startParsing.js
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
    const savedConfig = GM_getValue(`${domain}_config`, null);
    let currentStep = savedConfig?.currentStep || 0;

    const stepFunctions = {
        selectFirstElement: window.selectFirstElement,
        selectSecondElement: window.selectSecondElement,
        selectInfoToSave: window.selectInfoToSave,
        selectNextElementButton: window.selectNextElementButton,
        checkSiteAvailability: window.checkSiteAvailability,
        checkConfiguration: window.checkConfiguration,
        startParsing: window.startParsing
    };

    const saveConfiguration = (result) => {
        const stepsData = savedConfig?.steps || steps.map((step, index) => ({
            stepIndex: index,
            info: step,
            result: null
        }));

        // Сохраняем результат текущего шага
        stepsData[currentStep].result = result;

        GM_setValue(`${domain}_config`, {
            domain,
            currentStep,
            steps: stepsData
        });
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
            const currentFunction = Object.values(stepFunctions)[currentStep];

            if (currentFunction) {
                try {
                    const result = await currentFunction();
                    saveConfiguration(result);
                } catch (error) {
                    console.error("Ошибка выполнения шага:", error);
                    alert("Произошла ошибка. Проверьте консоль.");
                    return;
                }
            }

            currentStep++;
            if (currentStep < steps.length) {
                stepBar.remove();
                createStepBar(currentStep);
            } else {
                alert('Парсинг завершен!');
                stepBar.remove();
                GM_setValue(`${domain}_config`, null);
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
        function addExcludeClassRecursively(element) {
            element.classList.add('exclude-from-selection');
            element.querySelectorAll('*').forEach(addExcludeClassRecursively);
        }

        addExcludeClassRecursively(stepBar);

    };
    createStepBar(currentStep);

})();
