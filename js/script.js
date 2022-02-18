const board = document.querySelector("div.board");
const keyboard = document.querySelector("div.keyboard");
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const words = ["STAUB", "HOSEN", "MINUS", "STUHL", "MILCH", "GOLEM", "PROBE", "GENAU", "REGAL", "LAGER", "NAGEL", "BRUCH", "BENJI", "KNOPF", "FADEN", "MOTEL", "HILFE", "OPFER", "MONAT"];
let rows = [];
let gameover = true;

class Field {
    constructor(col, row) {
        this.row = row;
        this.col = col;
        this.correct_word = null;
        this.guessed_word = null;
        this.focusable = false;

        this.field = document.createElement("div");
        this.field.className = "field";
        this.field.setAttribute("col", this.col);
        this.field.setAttribute("row", this.row.index);
        this.row.append(this.field);
    }

    update() {
        if (this.focusable) {
            this.field.className = "field focus";
        } else {
            this.field.className = "field";
        }
    }

}

class Row {
    constructor(index, word) {
        this.index = index;
        this.word = word;
        this.active = index == 0;
        this.fields = [];
        this.correct = false;

        this.row = document.createElement("div");
        this.row.setAttribute("index", this.index);
        this.row.className = "row";
        board.append(this.row);

        for (let i = 0; i < word.length; i++) {
            let field = new Field(i, this.row);
            if (this.active) field.focusable = i == 0;
            else field.focusable = false;
            this.fields.push(field);
        }
    }

    update() {
        if (this.active) {
            this.row.className = "row active";
            this.fields[0].focusable = true;
            this.fields[0].update();
        } else {
            this.row.className = "row";
        }
    }

    check(word) {
        let thisrow = this;
        let i = 0;
        let counter = 0;
        let interval = setInterval(function () {
            if (i < thisrow.fields.length) {
                let field = thisrow.fields[i];
                let isInWord = false;

                for (let j = 0; j < word.length; j++) {
                    if (field.guessed_word == word.charAt(j)) isInWord = true;
                }

                if (field.guessed_word == word.charAt(field.col)) {
                    field.field.style.backgroundColor = "green";
                    field.field.style.color = "white";
                    counter++;
                } else if (isInWord) {
                    field.field.style.backgroundColor = "yellow";
                } else {
                    field.field.style.backgroundColor = "gray";
                    field.field.style.color = "white";
                }
                i++;
                
                if (counter == word.length) {
                    this.correct = true;
                    won(this);
                }
                else checkGameOver(this, word);
            } else {
                clearInterval(interval);
            }
        }, 200);
    }
}

function checkGameOver(row, word) {
    if (row.index >= 6) {
        gameover = true;
        console.log("Verloren");
        alert("Leider verloren. Das Wort war " + word);
    }
}

function won(row) {
    gameover = true;
    let i = 0;
    let interval = setInterval(function() {
        if (i < rows.length) {
            disappear(rows[i]);
            i++;
        } else {
            clearInterval(interval);
        }
    }, 20);
}

function disappear(row) {
    if (!row.correct) {
        let i = 10;
        let interval = setInterval(function () {
            if (i >= 0) {
                row.fields.forEach(f => {
                    f.field.style.opacity = i/10;
                });
                i--;
            } else {
                clearInterval(interval);
            }
        }, 20);
    }
}

function setup(word) {
    for (let i = 0; i < letters.length; i++) {
        let button = document.createElement("button");
        button.innerText = letters.charAt(i);
        button.className = "key";
        keyboard.append(button);
    
        button.addEventListener("click", function () {
            if (!gameover) setLetter(letters.charAt(i), word);
        });
    }

    let back = document.createElement("button");
    back.className = "key";
    keyboard.append(back);

    let icon = document.createElement("i");
    icon.className = "far fa-arrow-alt-circle-left";
    back.append(icon);

    back.addEventListener("click", function () {
        if (!gameover) goBack();
    });
}

function goBack() {
    let row = null;
    rows.forEach(r => {
        if (r.active) row = r;
    });

    let field = null;
    row.fields.forEach(f => {
        if (f.focusable) field = f;
    });

    if (field.col > 0) {
        field.focusable = false;
        let previous_field = row.fields[field.col - 1];
        previous_field.focusable = true;
        previous_field.guessed_word = null;
        previous_field.field.innerText = "";
        previous_field.update();
    }
    field.update();
}

function setLetter(letter, word) {
    let row = null;
    rows.forEach((r) => {
        if (r.active) row = r;
    });

    let field = null;
    let index = 0;
    row.fields.forEach((f, i) => {
        if (f.focusable) {
            field = f;
            index = i+1;
        }    
    });

    field.guessed_word = letter;
    field.field.innerText = letter;
    field.focusable = false;
    if (field.col < row.fields.length - 1) {
        row.fields[index].focusable = true;
        row.fields[index].update();                
    } else {
        row.check(word);
        row.active = false;
        row.update();
        if (row.index < rows.length - 1) {
            rows[row.index+1].active = true;
            rows[row.index+1].update();
        }
    }
    field.update();
        

}

function reset() {
    let b = document.querySelectorAll("div.board *");
    let k = document.querySelectorAll("div.keyboard *");

    
    b.forEach(bo => {
        bo.remove();
    });

    k.forEach(key => {
        key.remove();
    });
    rows = [];
}

function startGame() {
    reset();
    gameover = false;
    let word = words[Math.floor(Math.random()*words.length)];
    console.log(word);
    setup(word);
    for (let i = 0; i < 6; i++) {
        let row = new Row(i, word);
        row.update();
        rows.push(row);
    } 
}

startGame();