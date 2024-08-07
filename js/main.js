class Game {
  constructor() {
    this.init();
  }

  init() {
    // variables
    this.pl1 = null;
    this.pl2 = null;
    this.turn = false;
    this.gameplay = new Array(9).fill(null);
    this.threes = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    this.winner = null;
    this.scores = [0, 0];

    // dom
    this.player1 = document.getElementById("pl1");
    this.player2 = document.getElementById("pl2");
    this.plot = document.getElementsByClassName("tile");
    this.winnerMessage = document.getElementById("winMessageContainer");
    this.scoreP1 = document.getElementById("scoreX");
    this.scoreP2 = document.getElementById("score0");
    this.rest = document.getElementById("restart");
    this.res = document.getElementById("reset");
    this.chPl = document.getElementById("chPlayer");
    this.bubble = document.querySelectorAll(".turn");

    // start the game
    this.start();
  }

  initEvents() {
    Array.from(this.plot).forEach((tile, i) => {
      tile.addEventListener("click", () => this.makemove(i));
    });
    this.rest.addEventListener("click", this.restart.bind(this));
    this.res.addEventListener("click", this.reset.bind(this));
    this.chPl.addEventListener("click", this.changePlayer.bind(this));
  }

  checkStatus() {
    for (let i = 0; i < this.threes.length; i++) {
      const values = new Array(3)
        .fill(0)
        .map((_, idx) => this.gameplay[this.threes[i][idx]]);
      if (values[0] != null && values.every((v) => v == values[0])) {
        this.colorize(this.threes[i]);
        this.winner = this.turn ? this.pl1 : this.pl2;
        this.winnerMessage.innerText = `Winner is: ${this.winner}`;
        this.scores[this.turn ? 0 : 1]++;
        (this.turn ? this.scoreP1 : this.scoreP2).innerText =
          this.scores[this.turn ? 0 : 1].toString();
        this.setScores();
        this.showButtons(true);
      }
    }
    if (this.winner == null && this.gameplay.every((e) => e != null)) {
      this.winner = "NOBODY";
      this.winnerMessage.innerText = `Winner is: ${this.winner}`;
      this.showButtons(true);
    }
    this.changeTurn(this.winner != null);
  }

  makemove(tile) {
    if (this.plot[tile].innerText == "" && this.winner == null) {
      const char = this.turn ? "X" : "O";
      this.plot[tile].classList.add("flip-animation");
      this.plot[tile].classList.add("clicked");
      setTimeout(() => {
        this.plot[tile].innerText = char;
      }, 500);
      this.plot[tile].addEventListener(
        "animationend",
        () => this.plot[tile].classList.remove("flip-animation"),
        { once: true }
      );
      this.gameplay[tile] = char;
      this.checkStatus();
    }
  }

  getScores() {
    const match = `game:${this.pl1.toLowerCase()},${this.pl2.toLowerCase()}`;
    const revMatch = `game:${this.pl2.toLowerCase()},${this.pl1.toLowerCase()}`;
    if (localStorage.getItem(match) || localStorage.getItem(revMatch)) {
      if (localStorage.getItem(revMatch)) {
        const tempData = localStorage.getItem(revMatch).split(":").reverse();
        this.scores[0] = +tempData[0];
        this.scores[1] = +tempData[1];
        localStorage.removeItem(revMatch);
        localStorage.setItem(match, `${this.scores[0]}:${this.scores[1]}`);
      } else {
        const tempData = localStorage.getItem(match).split(":");
        [this.scores[0], this.scores[1]] = [+tempData[0], +tempData[1]];
      }
      this.scoreP1.innerText = this.scores[0].toString();
      this.scoreP2.innerText = this.scores[1].toString();
    }
  }

  setScores() {
    const match = `game:${this.pl1.toLowerCase()},${this.pl2.toLowerCase()}`;
    localStorage.setItem(match, `${this.scores[0]}:${this.scores[1]}`);
  }

  colorize(line = null) {
    if (line == null) {
      for (let i = 0; i < 9; i++) {
        this.plot[i].classList.remove("highlight");
      }
    } else {
      for (let i = 0; i < 3; i++) {
        this.plot[line[i]].classList.add("highlight");
      }
    }
  }

  changeTurn(disable = false) {
    this.turn = !this.turn;
    if (disable) {
      // THIS HIDES DOT AT ALL IF GAME IS DONE
      (!this.turn ? this.bubble[0] : this.bubble[1]).style.visibility =
        "hidden";
    } else {
      // THIS FLIPS THE DOT
      (this.turn ? this.bubble[0] : this.bubble[1]).style.visibility =
        "visible";
      (!this.turn ? this.bubble[0] : this.bubble[1]).style.visibility =
        "hidden";
    }
  }

  changePlayer() {
    this.enterNames();
    this.getScores();
    this.reset();
  }

  showButtons(show) {
    this.rest.style.display = show ? "inline-block" : "none";
    this.res.style.display = show ? "inline-block" : "none";
    this.chPl.style.display = show ? "inline-block" : "none";
  }

  restart() {
    this.colorize(); // uncolorization
    this.changeTurn();
    this.winner = null;
    this.winnerMessage.innerText = "";
    for (let i = 0; i < 9; i++) {
      this.plot[i].innerText = "";
      this.gameplay[i] = null;
      this.plot[i].classList.remove("clicked");
    }
    this.showButtons(false);
  }

  reset() {
    this.colorize(); // uncolorization
    this.scores = [0, 0];
    this.scoreP1.innerText = "0";
    this.scoreP2.innerText = "0";
    this.setScores();
    this.restart();
  }

  start() {
    this.enterNames();
    this.initEvents();
    this.getScores();
    this.changeTurn();
  }

  enterNames() {
    const isAlphabetic = (char) => {
      const code = char.charCodeAt(0);
      return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
    };

    const validName = (name) =>
      name.length < 20 && [...name].every((l) => isAlphabetic(l));

    while (true) {
      this.pl1 = prompt("Please enter PLAYER1 name");
      if (!validName(this.pl1)) {
        alert(
          "Seems like Player1 name is either too long or has some other characters"
        );
        continue;
      }
      break;
    }
    while (true) {
      this.pl2 = prompt("Please enter PLAYER2 name");
      if (!validName(this.pl2)) {
        alert(
          "Seems like Player2 name is either too long or has some other characters"
        );
        continue;
      }
      break;
    }
    this.player1.innerText = this.pl1 + " as X";
    this.player2.innerText = this.pl2 + " as O";
  }
}

const game = new Game();
