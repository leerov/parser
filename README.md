# Parser by Leerov


[![Install the script](https://img.shields.io/badge/Setup%20script-%23008000?style=for-the-badge&link=https%3A%2F%2Fraw.githubusercontent.com%2Fleerov%2Fparser%2Frefs%2Fheads%2Fmain%2Fmain.user.js)](https://raw.githubusercontent.com/leerov/parser/refs/heads/main/main.user.js)
[![Tamper Monkey](https://img.shields.io/badge/tampermonkey-%2300485B.svg?style=for-the-badge&logo=tampermonkey&logoColor=white)](https://www.tampermonkey.net/)
[![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)


---


## 💡 Overview
Parser by Leerov is a modular script designed for website parsing using external step files. Key features include:


- A visual step panel.
- Domain processing support.
- Configuration saving.
- A Node.js server for data storage and analysis.


---


## 🔧 Features


```markdown
- **Modularity:** each step is loaded independently.
- **Tampermonkey script:** easy browser integration.
- **Logging:** uses Winston for seamless analysis.
- **Auto-save:** parsing results are saved to local JSON files.
```


---


## 🔄 Installation


### 1. Install dependencies
```bash
npm install express cors cookie-parser lodash winston
```


### 2. Start the server
```bash
node server.js
```


### 3. Load the script into Tampermonkey

1. Open [this link](https://raw.githubusercontent.com/leerov/parser/refs/heads/main/main.user.js).
2. Install the script via Tampermonkey.


---


## ⚙️ Usage


1. Open any website you want to parse.
2. Click on the widget at the top of the website to select steps.
3. Follow the step-by-step instructions to perform parsing.


---


## 📊 Data Storage


- Parsing data is saved in JSON files corresponding to the domain.
- File location: root directory of the server.


---


## ✏️ Contributing


1. Fork this repository.
2. Create a new branch (suggestion: `git checkout -b feature/new-feature`).
3. Make your changes.
4. Submit a Pull Request.



---


## 🚀 Roadmap


- [ ] Implementation of element selection
- [ ] Automatic data detection
- [ ] Parsing testing


---


## 🎨 Screenshots



![Step Panel]()


![Logs Example]()


---


## 🛠️ Support


If you have any questions, check the [Issues](https://github.com/leerov/parser/issues) section.


---


## 🚀 Author


**Leerov**  
[My GitHub](https://github.com/leerov)  
