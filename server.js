const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const winston = require('winston');
const app = express();
const port = 3000;


const logFilePath = path.join(__dirname, 'server_logs.txt');


const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
        new winston.transports.File({
            filename: logFilePath,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.simple()
            ),
        }),
    ],
});


app.use((req, res, next) => {
    const logEntry = `${new Date().toISOString()} - ${req.method} ${req.url} - Body: ${JSON.stringify(req.body)}\n`;

    
    fs.appendFile(logFilePath, logEntry, err => {
        if (err) {
            logger.error('Ошибка записи в лог-файл', err);
        }
    });

    next(); 
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(
    express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 })
);
app.use(cookieParser());

app.post('/api/list', async (req, res) => {
    try {
        const { domain, data } = req.body;

        
        if (!domain || !Array.isArray(data)) {
            return res.status(400).json({
                success: false,
                message: "Поле 'domain' и массив 'data' обязательны",
            });
        }

        const filePath = path.join(__dirname, `${domain}.json`);

        
        let existingData = [];
        if (fs.existsSync(filePath)) {
            const fileContent = await fs.promises.readFile(filePath, 'utf-8');
            existingData = JSON.parse(fileContent);
        }

        
        const newItems = data.filter(newItem => {
            return !existingData.some(existingItem => _.isEqual(existingItem, newItem));
        });

        
        if (newItems.length > 0) {
            const updatedData = [...existingData, ...newItems];

            await fs.promises.writeFile(filePath, JSON.stringify(updatedData, null, 2), 'utf-8');
            logger.info(`Добавлено ${newItems.length} новых элементов.`);
        } else {
            logger.info('Нет новых элементов для добавления.');
        }

        
        res.status(200).json({
            success: true,
            message: 'Данные успешно обработаны',
            addedItems: newItems,
        });
    } catch (error) {
        logger.error('Ошибка на сервере:', error);

        
        res.status(500).json({
            success: false,
            message: 'Произошла ошибка на сервере',
            error: error.message,
        });
    }
});

app.listen(port, () => {
    logger.info(`Сервер запущен на порту ${port}`);
});
