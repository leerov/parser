const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(cookieParser());

app.post("/api/list", (req, res) => {
    const { domain, data } = req.body;

    // Проверяем наличие необходимых данных
    if (!domain || !Array.isArray(data)) {
        return res.status(400).json({
            success: false,
            message: "Поле 'domain' и массив 'data' обязательны",
        });
    }

    const filePath = path.join(__dirname, `${domain}.json`);

    // Читаем существующий файл, если он есть
    let existingData = [];
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        existingData = JSON.parse(fileContent);
    }

    // Логика для фильтрации новых элементов
    const newItems = data.filter(newItem => {
        // Сравниваем объекты через JSON-строки
        return !existingData.some(existingItem => JSON.stringify(existingItem) === JSON.stringify(newItem));
    });

    // Добавляем только уникальные элементы
    if (newItems.length > 0) {
        const updatedData = [...existingData, ...newItems];
        fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), "utf-8");
        console.log(`Добавлено ${newItems.length} новых элементов.`);
    } else {
        console.log("Нет новых элементов для добавления.");
    }

    // Возвращаем ответ клиенту
    res.status(200).json({
        success: true,
        message: "Данные успешно обработаны",
        addedItems: newItems,
    });
});

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
