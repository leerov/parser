window.selectElement = () => {
    return new Promise((resolve) => {
        console.log("Ожидание выбора элемента...");

        let selectedElement = null;
        let isSelecting = false;

        const highlightElement = (element) => {
            if (!element.classList.contains('exclude-from-selection')) {
                element.style.outline = "2px solid red";
                element.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
            }
        };

        const removeHighlight = (element) => {
            if (!element.classList.contains('exclude-from-selection')) {
                element.style.outline = "";
                element.style.backgroundColor = "";
            }
        };

        const handleMouseOver = (event) => {
            if (isSelecting && event.target !== selectedElement) {
                highlightElement(event.target);
            }
        };

        const handleMouseOut = (event) => {
            if (isSelecting && event.target !== selectedElement) {
                removeHighlight(event.target);
            }
        };

        const handleClick = (event) => {
            if (!isSelecting) return;

            if (event.target.classList.contains("exclude-from-selection")) {
                console.log("Нажата кнопка запуска. Игнорируется.");
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            if (selectedElement) {
                removeHighlight(selectedElement);
            }

            selectedElement = event.target;
            highlightElement(selectedElement);

            console.log("Выбран элемент:", selectedElement);

            isSelecting = false;
            showConfirmationModal();
        };

        const showConfirmationModal = () => {
            if (!selectedElement) return;

            

            const modal = document.createElement('div');
            Object.assign(modal.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: '10000'
            });

            const modalContent = document.createElement('div');
            Object.assign(modalContent.style, {
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '10px',
                textAlign: 'center',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
            });

            const confirmButton = document.createElement('button');
            confirmButton.textContent = 'Подтвердить';
            Object.assign(confirmButton.style, {
                margin: '10px',
                padding: '10px 20px',
                backgroundColor: 'green',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
            });

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Отмена';
            Object.assign(cancelButton.style, {
                margin: '10px',
                padding: '10px 20px',
                backgroundColor: 'red',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
            });

            confirmButton.addEventListener('click', () => {
                console.log("Подтверждён элемент:", selectedElement);
                document.removeEventListener("mouseover", handleMouseOver);
                document.removeEventListener("mouseout", handleMouseOut);
                document.removeEventListener("click", handleClick);

                modal.remove();

                const elementXPath = generateXPath(selectedElement);
                resolve(elementXPath);
            });

            cancelButton.addEventListener('click', () => {
                console.log("Выбор отменён");
                removeHighlight(selectedElement);
                selectedElement = null;

                modal.remove();
            });

            modalContent.append(confirmButton, cancelButton);
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
        };

        const generateXPath = (element) => {
            if (element.id) {
                return `//*[@id="${element.id}"]`;
            }
            const parts = [];
            while (element && element.nodeType === Node.ELEMENT_NODE) {
                let sibling = element;
                let index = 1;
                while ((sibling = sibling.previousElementSibling)) {
                    if (sibling.nodeName === element.nodeName) {
                        index++;
                    }
                }
                const tagName = element.nodeName.toLowerCase();
                const part = index > 1 ? `${tagName}[${index}]` : tagName;
                parts.unshift(part);
                element = element.parentNode;
            }
            return `/${parts.join('/')}`;
        };

        const startSelecting = () => {
            console.log("Режим выбора элемента активирован.");
            isSelecting = true;

            document.addEventListener("mouseover", handleMouseOver);
            document.addEventListener("mouseout", handleMouseOut);
            document.addEventListener("click", handleClick);
        };

        startSelecting();
    });
};