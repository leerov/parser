// ==UserScript==
// @name         Book Scraper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Скрапинг данных о книгах с Books to Scrape
// @author       Вы
// @match        https://books.toscrape.com/catalogue/category/books_1/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

function runJob() {
    var data = [];

    document.querySelectorAll(".product_pod").forEach(function(product) {
        var title = product.querySelector("h3 a");
        var image = product.querySelector("img");
        var price = product.querySelector(".price_color");

        data.push({
            image: image && image.getAttribute("src"),
            price: price && price.innerText,
            title: title && title.getAttribute("title"),
            url: title && title.getAttribute("href"),
        });
    });

    // Получаем домен сайта
    var domain = window.location.hostname;

    GM_xmlhttpRequest({
        method: "POST",
        url: "http://localhost:3000/api/list",
        data: JSON.stringify({ domain: domain, list: data }),
        headers: {
            "Content-Type": "application/json",
        },
        onload: function(response) {
            console.log("Ответ:", JSON.parse(response.response));
            setTimeout(() => {
                const nextButton = document.querySelector(".pager .next a");
                if (nextButton) {
                    nextButton.click();
                }
            }, 10000);
        },
    });
}

runJob();
