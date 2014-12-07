var xBoard = 0;
var oBoard = 0;
var begin = true;
var context;
var width, height;
var dAlpha = 0.05;
var cAlphaO = 0;
var cAlphaX = 0;
var timerO;
var timerX;
var timerClear;
var winCount = 0;
var loseCount = 0;
var loseText = ["LOSE", "LOSED AGAIN", "STOP LOSING", "OMG", "I CAN'T", "WHY"];
var winText = ["WIN", "WINNER", "CHAMPION", "SWAG", "R U CHEATING", "CHEATER", "STOP HACKING"];



function paintBoard() {
    var board = document.getElementById('board');



    width = board.width;
    height = board.height;
    context = board.getContext('2d');

    context.beginPath();
    context.strokeStyle = '#FFFFFF';
    context.lineWidth = 10;

    context.moveTo((width / 3), 0);
    context.lineTo((width / 3), height);

    context.moveTo((width / 3) * 2, 0);
    context.lineTo((width / 3) * 2, height);

    context.moveTo(0, (height / 3));
    context.lineTo(width, (height / 3));

    context.moveTo(0, (height / 3) * 2);
    context.lineTo(width, (height / 3) * 2);

    context.stroke();
    context.closePath();

    if (begin) {
        var ini = Math.abs(Math.floor(Math.random() * 9 - 0.1));
        markBit(1 << ini, 'O');
        begin = false;
    } else {
        begin = true;
    }
}

function checkWinner(board) {

    var result = false;

    if (((board | 0x1C0) === board) || ((board | 0x38) === board) ||
            ((board | 0x7) === board) || ((board | 0x124) === board) ||
            ((board | 0x92) === board) || ((board | 0x49) === board) ||
            ((board | 0x111) === board) || ((board | 0x54) === board)) {

        result = true;
    }
    return result;
}

function paintX(x, y) {

    //background
    context.fillStyle = 'blue';
    context.fillRect(width / 3 * x + 5, height / 3 * y + 5, width / 3 - 10, height / 3 - 10);

    //foreground

    context.beginPath();

    context.strokeStyle = 'rgba(255, 255, 255, ' + cAlphaX + ')';
    context.lineWidth = 27;

    var offsetX = (width / 3) * 0.1;
    var offsetY = (height / 3) * 0.1;

    var beginX = x * (width / 3) + offsetX + 15;
    var beginY = y * (height / 3) + offsetY + 13;

    var endX = (x + 1) * (width / 3) - offsetX * 2;
    var endY = (y + 1) * (height / 3) - offsetY * 2;

    context.moveTo(beginX, beginY);
    context.lineTo(endX, endY);

    context.moveTo(beginX, endY);
    context.lineTo(endX, beginY);

    context.stroke();
    context.closePath();

    cAlphaX += dAlpha;
    if (cAlphaX >= 1) {
        clearInterval(timerX);

    }
}

function paintO(x, y) {

    //background
    context.fillStyle = 'red';
    context.fillRect(width / 3 * x + 5, height / 3 * y + 5, width / 3 - 10, height / 3 - 10);

    //foreground
    context.beginPath();

    context.strokeStyle = 'rgba(255, 255, 255, ' + cAlphaO + ')';
    context.lineWidth = 27;

    var offsetX = (width / 3) * 0.1;
    var offsetY = (height / 3) * 0.1;

    var beginX = x * (width / 3) + offsetX + 15;
    var beginY = y * (height / 3) + offsetY + 13;

    var endX = (x + 1) * (width / 3) - offsetX * 2;
    var endY = (y + 1) * (height / 3) - offsetY * 2;

    context.arc(beginX + ((endX - beginX) / 2), beginY + ((endY - beginY) / 2), (endX - beginX) / 2, 0, Math.PI * 2, true);

    context.stroke();
    context.closePath();

    cAlphaO += dAlpha;
    if (cAlphaO >= 1) {
        clearInterval(timerO);

        enableInput();
    }
}

function clickHandler(e) {

    var y = Math.floor(e.clientY / (height / 3));
    var x = Math.floor(e.clientX / (width / 3));

    var bit = (1 << x + (y * 3));

    if (isEmpty(xBoard, oBoard, bit)) {

        markBit(bit, 'X');
        disableInput();

        if (!checkNobody()) {
            if (checkWinner(xBoard)) {
                document.getElementById("result").innerHTML = winText[winCount];
                if (winCount !== winCount.length - 1) {
                    winCount++;
                    loseCount = 0;
                }
                else {
                    winCount = 0;
                }
                document.getElementById("messageBoard").style.display = 'block';
                disableInput();

                //restart();

            } else {

                setTimeout(function () {
                    play();
                    if (!checkNobody()) {

                        if (checkWinner(oBoard)) {
                            document.getElementById("result").innerHTML = loseText[loseCount];
                            if (loseCount !== loseText.length - 1) {
                                loseCount++;
                                winCount = 0;
                            }
                            else {
                                loseCount = 0;
                            }
                            document.getElementById("messageBoard").style.display = 'block';
                            disableInput();

                            //restart();
                        }
                    }
                }, Math.random() * 250 + 500);

            }
        }
    }
}

function checkNobody() {
    if ((xBoard | oBoard) === 0x1FF) {
        document.getElementById("result").innerHTML = "TIE";
        document.getElementById("messageBoard").style.display = 'block';
        //winCount = 0;
        //loseCount = 0;
        disableInput();

        //restart();
        return true;
    }
    return false;
}

function restart() {


    //clearInterval(timerClear);
    context.clearRect(0, 0, width, height);
    context.globalAlpha = 1;
    xBoard = 0;
    oBoard = 0;
    document.getElementById("messageBoard").style.display = 'none';
    paintBoard();
    enableInput();


}

function isEmpty(xBoard, oBoard, bit) {
    return (((xBoard & bit) === 0) && ((oBoard & bit) === 0));
}

function simulate(oBoard, xBoard) {

    var ratio = 0;

    var bit = 0;
    for (var i = 0; i < 9; i++) {

        var cBit = 1 << i;

        if (isEmpty(xBoard, oBoard, cBit)) {

            if (checkWinner(oBoard | cBit)) {
                bit = cBit;
                break;
            } else if (checkWinner(xBoard | cBit)) {
                bit = cBit;
            }
        }
    }

    if (bit === 0) {
        for (var i = 0; i < 9; i++) {
            var cBit = 1 << i;

            if (isEmpty(xBoard, oBoard, cBit)) {
                var result = think(oBoard, xBoard, 'X', 0, 1);
                if (ratio === 0 || ratio < result) {
                    ratio = result;
                    bit = cBit;
                }
            }
        }
    }
    return bit;
}

function think(oBoard, xBoard, player, bit, ratio) {

    if (player === 'O') {
        oBoard = oBoard | bit;
    } else {
        xBoard = xBoard | bit;
    }

    if (checkWinner(oBoard)) {
        ratio *= 1.1;
        return ratio;

    } else if (checkWinner(xBoard)) {

        ratio *= 0.7;
        return ratio;

    } else {
        var best = 0;
        ratio *= 0.6;

        for (var i = 0; i < 9; i++) {

            if (isEmpty(xBoard, oBoard, 1 << i)) {

                var newRatio = think(oBoard, xBoard, player === 'O' ? 'X' : 'O', 1 << i, ratio);

                if (best === 0 || best < newRatio) {
                    best = newRatio;
                }
            }
        }

        return best;
    }
}

function markBit(markBit, player) {

    var bit = 1;
    var posX = 0, posY = 0;

    while ((markBit & bit) === 0) {
        bit = bit << 1;
        posX++;
        if (posX > 2) {
            posX = 0;
            posY++;
        }
    }

    if (player === 'O') {
        oBoard = oBoard | bit;
        cAlphaO = 0;
        timerO = setInterval(function () {
            requestAnimationFrame(function () {
                paintO(posX, posY);
            });
        }, 7);
    } else {
        xBoard = xBoard | bit;
        cAlphaX = 0;
        timerX = setInterval(function () {
            requestAnimationFrame(function () {
                paintX(posX, posY);
            });
        }, 7);

    }
}

function play() {
    var bestBit = simulate(oBoard, xBoard);
    markBit(bestBit, 'O');

}

function disableInput() {
    document.getElementById("board").onclick = null;
}

function enableInput() {
    document.getElementById("board").onclick = function () {
        clickHandler(event);
    };
}

