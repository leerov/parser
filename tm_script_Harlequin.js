// ==UserScript==
// @name         Internet Scraper
// @namespace    http://tampermonkey.net/
// @version      0.1.2
// @description  Scraper
// @author       Leerov
// @match        https://books.toscrape.com/catalogue/category/books_1/*
// @grant        GM_xmlhttpRequest
// @homepageURL  https://github.com/leerov/parser
// @updateURL    https://raw.githubusercontent.com/leerov/parser/main/tm_script_Harlequin.js
// @downloadURL  https://raw.githubusercontent.com/leerov/parser/main/tm_script_Harlequin.js
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
