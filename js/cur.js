function initCur(){

    const CBRF_COURSEAPI_URL = "https://www.cbr-xml-daily.ru/daily_json.js";
    let newRates = {}; //Объект со всем курсами
    let favorite = {}
    const rootId = "currencyCalc";
    const currency = "currency";
    let defaultCurrencyCode = "RUB";
    let defaultСalculatedCurrency = "USD";

    checkStorage();

    function checkStorage() {
        if (localStorage.getItem('lastGettedRatesDate') == new Date().getDate()) {
            console.log('достаем курсы валют локально');
            getFromLocal();
            initView();
        } else if (localStorage.getItem('lastGettedRatesDate') != new Date().getDate() ||
            localStorage.getItem('lastGettedRatesDate') === null) {
            sendXMLHttpRequest(CBRF_COURSEAPI_URL);
            console.log('обновляем курсы валют по сети');
        };
    };

    function sendXMLHttpRequest(url) {
        console.log("отправляем запрос на " + url);
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 0) {
                console.error('Ошибка CORS. Статус: ' + this.status);
            } else if (this.readyState == 4 && this.status == 200) {
                saveToLocal(xhr.responseText);
                initView();
            }
        };
        xhr.send();
    }

    function saveToLocal(response) {
        localStorage.removeItem('lastGettedRatesDate');
        localStorage.removeItem('lastGettedRates');
        localStorage.setItem("lastGettedRates", response);
        localStorage.setItem("lastGettedRatesDate", new Date().getDate());
        newRates = JSON.parse(response);
    }

    function getFromLocal() {
        newRates = JSON.parse(localStorage.getItem("lastGettedRates"));
        favorite = localStorage.getItem('Favorite')?JSON.parse(localStorage.getItem('Favorite')):{};
    }

    function initView() {
        let calc = document.getElementById(rootId);
        let cur = document.getElementById(currency)
        if (calc){
            generateCalcView(calc);
        }
        if (cur){
            generateCur(cur)
        }
    }

    function generateCalcView() {
        let rootEl = document.getElementById(rootId);
        console.log(rootEl)
        let divEl = document.createElement('div');
        divEl.classList.add('row');
        divEl.classList.add('currencyRow');
        addNewCurrency(divEl);
        rootEl.appendChild(divEl);
        let lastdivEl = document.createElement('div');
        lastdivEl.classList.add('row');
        lastdivEl.classList.add('currencyRow');
        addFinalCurrency(lastdivEl);
        rootEl.appendChild(lastdivEl);
    }

    function addNewCurrency(containerEl) {
        let inputEl = document.createElement('input');
        inputEl.setAttribute('type', 'number');
        inputEl.id="input_cur"
        inputEl.dataset.curCode = defaultСalculatedCurrency;
        inputEl.value = "0";
        inputEl.addEventListener('input', recalculateInputValues);
        let leftdivEl = document.createElement('div');
        leftdivEl.classList.add('col-2');
        leftdivEl.appendChild(inputEl);
        containerEl.appendChild(leftdivEl);
        let rightdivEl = document.createElement('div');
        rightdivEl.classList.add('col-6');

        containerEl.appendChild(rightdivEl);
        rightdivEl.appendChild(generateCurrencySelect(defaultСalculatedCurrency));

    }

    function addFinalCurrency(containerEl) {
        //последняя валюта в списке
        let inputEl = document.createElement('input');
        inputEl.setAttribute('type', 'number');
        inputEl.setAttribute('id', 'finalCurrency');
        inputEl.dataset.curCode = defaultCurrencyCode;
        inputEl.value = "0";
        inputEl.addEventListener('input', recalculateInputValues);
        let leftdivEl = document.createElement('div');
        leftdivEl.classList.add('col-2');
        leftdivEl.appendChild(inputEl);
        containerEl.appendChild(leftdivEl);
        let rightdivEl = document.createElement('div');
        rightdivEl.classList.add('col-6');
        containerEl.appendChild(rightdivEl);
        let labelEl = document.createElement('span');
        labelEl.innerText = "Российский рубль";
        rightdivEl.appendChild(labelEl);
        addButton()

    }

    function addButton(){
        let select = document.getElementById("select_cur");
        let oldButton = document.getElementById("button");
        oldButton?oldButton.remove():null;
        let button=document.createElement('button');
        console.log(button)
        button.id="button"
        console.log(select)
        if (!favorite[select.value]){
            button.append("Добавить в избранное")
            button.addEventListener("click", addFavorite)
        }else {
            button.append("Удалить из избранного")
            button.addEventListener("click", delFavorite)
        }
        select.after(button);
    }


    function generateCurrencySelect(selectedValue) {

        let selectEl = document.createElement('select');
        selectEl.id = "select_cur"


        for (let key in favorite) {
            let optionEl = new Option(favorite[key].Name, favorite[key].CharCode);
            selectEl.add(optionEl);
        }

        selectEl.add(document.createElement("optgroup"))


        for (let key in newRates.Valute) {
            if (!favorite[key]){
            let optionEl = new Option(newRates.Valute[key].Name, newRates.Valute[key].CharCode);
            selectEl.add(optionEl);
            if (newRates.Valute[key].CharCode == selectedValue) optionEl.selected = true;}
        }
        !!Object.keys(favorite).length?selectEl.options[0].selected=true:null;
        selectEl.addEventListener('input', chaingeInputCurrency);
        return selectEl;
    }


    function addFavorite(){
    let select = document.getElementById("select_cur")
        console.log(favorite)
        favorite[select.value]=newRates.Valute[select.value]
        localStorage.setItem("Favorite", JSON.stringify(favorite));
        updateSelect(select.value)
        addButton();
    }

    function delFavorite(){
        let select = document.getElementById("select_cur")
        delete favorite[select.value]
        localStorage.setItem("Favorite", JSON.stringify(favorite));
        updateSelect(select.value)
        addButton();

    }

    function updateSelect (selectedValue){
        let select = document.getElementById("select_cur")
        console.log(select)
        select.innerHTML=""

        for (let key in favorite) {
            let optionEl = new Option(favorite[key].Name, favorite[key].CharCode);
            select.add(optionEl);
            if (newRates.Valute[key].CharCode == selectedValue) optionEl.selected = true;
        }

        select.add(document.createElement("optgroup"))

        for (let key in newRates.Valute) {
            if (!favorite[key]){
                let optionEl = new Option(newRates.Valute[key].Name, newRates.Valute[key].CharCode);
                select.add(optionEl);
                if (newRates.Valute[key].CharCode == selectedValue) optionEl.selected = true;}
        }
    }



    function chaingeInputCurrency(event) {
        console.log(event.target)
        let input_cur = document.getElementById("input_cur")
        input_cur.dataset.curCode=event.target.value
        addButton()
        recalculateInputValues(input_cur);
    }

    function recalculateInputValues(event) {

        let chaingedCurrencyEl = event.target?event.target:event;  //инпут который изменили
        let chaingedCurrencyValue = parseFloat(chaingedCurrencyEl.value); //значение инпута который изменили
        let chaingedCurrencyCode = chaingedCurrencyEl.dataset.curCode; //валюта инпута который изменили

        if (chaingedCurrencyValue == 0 || isNaN(chaingedCurrencyValue)) {
            console.log('значение равно 0');
            return;
        }

        if (chaingedCurrencyCode == defaultCurrencyCode) {
            console.log('изменили значение рубля');
            recalculateAllCurrency();
        } else {
            console.log('изменили значение валюты');
            let courseOfChaingedCurrency = newRates.Valute[event.target?event.target.dataset.curCode:event.dataset.curCode].Value;
            let nominal = newRates.Valute[event.target?event.target.dataset.curCode:event.dataset.curCode].Nominal;
            document.getElementById('finalCurrency').value = chaingedCurrencyValue/nominal * courseOfChaingedCurrency;
        }
    }

    function recalculateAllCurrency() {
        console.log('пересчитаем все инпуты');
        let allCurrencyInputs = document.querySelectorAll("[data-cur-code]");
        let defaultCurrencyValue = document.getElementById('finalCurrency').value;

        for (let i = 0; i < allCurrencyInputs.length; i++) {
            if (allCurrencyInputs[i].dataset.curCode == defaultCurrencyCode) break;
            let courseOfСurrentInput = newRates.Valute[allCurrencyInputs[i].dataset.curCode].Value;
            let nominal = newRates.Valute[allCurrencyInputs[i].dataset.curCode].Nominal;
            allCurrencyInputs[i].value = defaultCurrencyValue / courseOfСurrentInput * nominal;
        };
    };

    function generateCur(el){
        let ol = document.createElement('ol');
        for (let key in newRates.Valute) {
            let cur = document.createElement('li');
            cur.append(`${newRates.Valute[key].Nominal}₽ = ${newRates.Valute[key].Value} ${newRates.Valute[key].Name}`)

            ol.append(cur)
        }
        el.append(ol)

    }


}







