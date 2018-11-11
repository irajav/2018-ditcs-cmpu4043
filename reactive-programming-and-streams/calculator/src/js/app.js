import {Observable} from 'rxjs/Rx';

var Rx = require('rxjs/Rx');


function calculator() {

    const CALC_CONTAINER = "calc-container";
    const CALC = "calculator";
    const CALC_TEXT = "textfield";
    const CALC_BUTTON = "button";
    const CALC_ITEM = "calc-item";


    var calcStyle = {
        "calc-container":
        {
            "display": "inline-flex",
            "flex-flow": "row wrap",
            "margin-left":"25px",
            "margin-right":"10px"

        },

        "calculator": 
        {
            "width": "350px",
            "height": "300px",
            "position": "relative",
            "background-color":"#F0EEEE",
            "border": "2px solid black",
            "border-radius": "10px"
        },

        "textfield":
        {

            "font-size": "200%",
            "text-align": "right",
            "border-radius":"5px",
            "margin-top":"10px",
            "margin-bottom":"15px",
            "margin-left": "15px",
            "width":"310px",
            "height":"50px"
        },

        "button": 
        {
            "font-size": "100%",
            "border-radius": "7px",
            "width": "70px",
            "background-color":"#A6A4A4",
            "font-weight":"bold"
        },

        "calc-item": 
        {        
            "text-align": "center",
            "padding": ".5em",
            "font-size": "1em",
            "margin": "0 5px 5px 0",
            "height":"30px",
            "margin-top":"5px"
        }
    };
    // displays the textfield
    var dispTextfield;

    var btns = [
        '(', ')', '±', '÷', '7', '8', '9',
        'x', '4', '5', '6', '-', '1', '2',
        '3', '+', '0', '.', 'C', '='
    ];

    var keys = [
        '(', ')', 'I', '/', '7', '8', '9',
        '*', '4', '5', '6', '-', '1', '2',
        '3', '+', '0', '.', 'C', '='
    ];
    
    var ops = [
        '±', '÷', '-', '*', '+', '.', 'C', '=', '/'
    ];

    function getStyle(id) {
        if (calcStyle.hasOwnProperty(id)) {
            return calcStyle[id];
        }
        return null;
    }
    function setStyle(element, styleId) {
        var style = getStyle(styleId);
        for (var index in style) {
            if (style.hasOwnProperty(index)) {
                element.style[index] = style[index];
            }
        }
    }

    function setAttributes(element, attributes) {
        for (var index in attributes) {
            if (attributes.hasOwnProperty(index)) {
                element.setAttribute(index, attributes[index]);
            }
        }
    }

    function createElement(tag, styleIds, attributes) {
        var element = document.createElement(tag);
        setStyle(element, styleIds);
        setAttributes(element, attributes);
        return element;
    }

    this.generateCalculator = function (parentElement) 
    {
        var calculatorContainer = createElement("div", CALC, { "id": "calculator" });
        dispTextfield = createElement("input", CALC_TEXT, { "type": "text", "placeholder": "0", "disabled": "" });
        var flexContainer = createElement("div", CALC_CONTAINER, { "class": "calc-container" });

        parentElement.appendChild(calculatorContainer);
        calculatorContainer.appendChild(dispTextfield);
        calculatorContainer.appendChild(flexContainer);


        var keyDowns = Rx.Observable.fromEvent(document, 'keypress').map(resolveKey);

        var buttonEvents = generateButtons(keyDowns, flexContainer);

        var stream = Rx.Observable
            .merge(keyDowns);

        for (var index in buttonEvents) {
            stream = stream.merge(buttonEvents[index]);
        }

        stream
            .subscribe(function (e) {
                try {
                    handleSymbolEvent(e);
                } catch (e) {
                    console.log("invalid operation");
                }
            });

    };

    function resolveKey(event) {
        var keyChar = String.fromCharCode(event.charCode);
        keyChar = keyChar.toUpperCase();
        return keyChar;
    }

    function handleSymbolEvent(symbol) {
        if (isValidButtonSymbol(symbol) || isValidKeyboardSymbol(symbol)) {
            switch (symbol) {
                case 'x':
                    addOperatorToDisplay('*');;
                    break;
                case '÷':
                    addOperatorToDisplay('/');;
                    break;                            
                case '=':
                    evaluateDisplay();
                    break;
                case 'C':
                    resetDisplay();
                    break;
                case 'I':
                case '±':
                    inverseDisplay();
                    break;
                default:
                    if (isOperator(symbol)) {
                        addOperatorToDisplay(symbol);
                    } else {
                        addNumberToDisplay(symbol);
                    }
                    break;
            }
        }
    }

    function generateButtons(eventContainer, parentElement) {
        var evnts = new Array();

        for (var index in btns) {
            var element = createElement("button", CALC_BUTTON, { "class": "calc-item" });
            setStyle(element, CALC_ITEM);
            element.innerHTML = btns[index];
            var evnt = assignButtonFunctionality(element);
            evnts.push(evnt);
            parentElement.appendChild(element);
        }
        return evnts;
    }

    function assignButtonFunctionality(button) {

        var value = button.innerHTML.toString();

        if (!isValidButtonSymbol(value)) {
            console.log("invalid symbol: " + value);
            return;
        }
        var buttonEvent = Rx.Observable.fromEvent(button, 'click').map(function () { return value; });
        return buttonEvent;
    }

    function addOperatorToDisplay(operator) {
        var lastChar = dispTextfield.value[dispTextfield.value.length - 1];

        if (!isOperator(lastChar)) {
            dispTextfield.value += operator;
        }
    }
    function addNumberToDisplay(number) {
        dispTextfield.value += number;
    }

    function isOperator(character) {
        return ops.indexOf(character) !== -1;
    }
    function isValidButtonSymbol(symbol) {
        return btns.indexOf(symbol) !== -1;
    }
    function isValidKeyboardSymbol(symbol) {
        return keys.indexOf(symbol) !== -1;
    }
    function resetDisplay() {
        dispTextfield.value = '';
    }
    function evaluateDisplay() {
        var value = parseEquation(dispTextfield.value);
        dispTextfield.value = value;
    }
    function inverseDisplay() {
        var inversed = "-(" + dispTextfield.value + ")";
        dispTextfield.value = inversed;
    }
    // Takes and equation and solves it.
    function parseEquation(inputString) {
        var equation = inputString;

        while (true) {
            var withinBrackets = subStringWithinBrackets(equation);
            if (withinBrackets[0].length > 0) {
                var evaluatedWithin = parseEquation(withinBrackets[0]);
                equation = replaceBetween(equation, withinBrackets[1] - 1, withinBrackets[2] + 1, evaluatedWithin);
            } else {
               
                break;
            }
        }

        var evaluatedEquation = eval(equation, 0, equation.length - 1);
        return evaluatedEquation;
    }

    function subStringWithinBrackets(string) {
        var startIndex = string.indexOf('(') + 1;
        var endIndex = 0;
        var openBracketCount = 0;

        for (var i = startIndex; i < string.length; i++) {
            if (string[i] === '(') {
                openBracketCount++;
            }
            else if (string[i] === ')') {
                if (openBracketCount > 0) {
                    openBracketCount--;
                } else {
                    endIndex = i;
                    break;
                }
            }
        }
        var substring = string.substring(startIndex, endIndex);
        return [substring, startIndex, endIndex];
    }

    function replaceBetween(string, start, end, replaceWith) {
        return string.substring(0, start) + replaceWith + string.substring(end);
    }
}

(function () {

    var calc = new calculator();
    var body = document.querySelector('body');
    calc.generateCalculator(body);
})();