window.selectFirstElement = () => {
    return new Promise((resolve) => {
        console.log("Выбор первого элемента...");

        let selectedElement = null;

        const highlightElement = (element) => {
            element.style.outline = "2px solid red";
            element.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
        };

        const removeHighlight = (element) => {
            element.style.outline = "";
            element.style.backgroundColor = "";
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

            // Убираем обработчики после выбора
            document.removeEventListener("mouseover", handleMouseOver);
            document.removeEventListener("mouseout", handleMouseOut);
            document.removeEventListener("click", handleClick);

            // Возвращаем выбранный элемент через Promise
            resolve(selectedElement);
        };

        document.addEventListener("mouseover", handleMouseOver);
        document.addEventListener("mouseout", handleMouseOut);
        document.addEventListener("click", handleClick);
    });
};
