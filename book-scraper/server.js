const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(cookieParser());

app.post("/api/list", (req, res) => {
    const list = req.body.list;
    console.log(list);
    res.status(200).json({
        success: true,
        message: "Успешно отправлено",
        data: list,
    });
});

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});