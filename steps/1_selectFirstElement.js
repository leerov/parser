window.selectFirstElement = () => {
    return new Promise((resolve) => {
        console.log("Выбор первого элемента...");

        let selectedElement = null;

        const highlightElement = (element) => {
            if (element) {
                element.style.outline = "2px solid red";
                element.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
            }
        };

        const removeHighlight = (element) => {
            if (element) {
                element.style.outline = "";
                element.style.backgroundColor = "";
            }
        };

        const handleMouseOver = (event) => {
            if (event.target !== selectedElement) {
                highlightElement(event.target);
            }
        };

        const handleMouseOut = (event) => {
            if (event.target !== selectedElement) {
                removeHighlight(event.target);
            }
        };

        const handleClick = (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (selectedElement) {
                removeHighlight(selectedElement);
            }

            selectedElement = event.target;
            highlightElement(selectedElement);

            console.log("Выбран элемент:", selectedElement);
            showConfirmationModal();
        };

        const showConfirmationModal = () => {
            // Создание модального окна
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

            const message = document.createElement('p');
            message.textContent = 'Подтвердить выбор этого элемента?';

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

                // Убираем обработчики событий
                document.removeEventListener("mouseover", handleMouseOver);
                document.removeEventListener("mouseout", handleMouseOut);
                document.removeEventListener("click", handleClick);

                // Удаляем модальное окно
                modal.remove();

                // Возвращаем выбранный элемент через Promise
                resolve(selectedElement);
            });

            cancelButton.addEventListener('click', () => {
                console.log("Выбор отменён");
                removeHighlight(selectedElement);
                selectedElement = null;

                // Удаляем модальное окно
                modal.remove();
            });

            modalContent.append(message, confirmButton, cancelButton);
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
        };

        document.addEventListener("mouseover", handleMouseOver);
        document.addEventListener("mouseout", handleMouseOut);
        document.addEventListener("click", handleClick);
    });
};
