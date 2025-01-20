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
    const { domain, list } = req.body;

    if (!domain || !list) {
        return res.status(400).json({
            success: false,
            message: "Домен и список обязательны",
        });
    }

    const filePath = path.join(__dirname, `${domain}.json`);

    // Читаем существующий файл, если он есть
    let existingData = [];
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath);
        existingData = JSON.parse(fileContent);
    }

    // Фильтруем новые элементы
    const newItems = list.filter(item => !existingData.includes(item));

    // Записываем только новые элементы в файл
    if (newItems.length > 0) {
        const updatedData = [...existingData, ...newItems];
        fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
    }

    res.status(200).json({
        success: true,
        message: "Успешно отправлено",
        data: newItems,
    });
});

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
