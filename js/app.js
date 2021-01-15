'use strict';
let ws = 123;
(function () {
    function init() {
        var router = new Router([
            new Route('calc', 'calc.html', true),
            new Route('currency', 'currency.html')
        ]);
    }
    init();
}());
