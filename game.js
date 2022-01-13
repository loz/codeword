class WordCode { 
  constructor(words = []) {
    var params = new URLSearchParams(window.location.search);
    this.seed = params.get("seed");
    this.words = words;
    this.reset();
  }

  reset() {
    if(this.idx != undefined) {
      this.seed = this.idx;
    }
    this.randomWord()
    this.over = false;

    this.guessed = [];     
    this.current = 0;
    this.scored = [];
    this.right = [];
    this.close = [];
    this.wrong = [];
  }

  randomWord(seed) {
    var len = this.words.length;
    if(this.seed == undefined) {
      this.seed = Math.floor(Math.random() * len);
    }
    var r = Math.abs(Math.sin((this.seed)/len));
    this.idx = Math.floor(r * len);
    console.log(this.seed, this.idx);
    this.word = this.words[this.idx];
  }

  clue(guess){
    if(this.word.length != guess.length) {
      return "Invalid Length";
    }
    if(!this.words.includes(guess)) {
      return "Invalid Word"
    }
    var response = [];
    for (var l=0; l<this.word.length; l++) {
      if(guess[l] == this.word[l]) {
        response.push(2);
        this.right.push(guess[l]);
      } else {
        var lidx = this.word.indexOf(guess[l]);
        if(lidx != -1) {
          response.push(1);
          this.close.push(guess[l]);
        } else {
          response.push(0);
          this.wrong.push(guess[l]);
        }          
      }
    }
    return response;
  };

  render_guesses() {
    var guesses = document.createElement("table");
    for(var g=0; g<6; g++) {
      var word = this.guessed[g]
      var score = this.scored[g]

      if (word == undefined) {
        word = " ";
      }
      if(score == undefined) {
        score = [-1, -1, -1, -1, -1]; //NoScore
      }
      word = word.toUpperCase();
      var row = document.createElement("tr");
      for(var c=0; c<5; c++) {
        var cell = document.createElement("td");
        if(score[c] == 0) {
          cell.className = 'wrong';
        }else if(score[c] == 1) {
          cell.className = 'close';
        }else if(score[c] == 2) {
          cell.className = 'right';
        }
        var letter = word[c]
        cell.textContent = letter
        row.appendChild(cell);
      }
      guesses.appendChild(row);
    }
    var board = document.getElementById("game");
    board.replaceChildren(guesses)
  };

  type(letter) {
    if(this.guessed[this.current] == undefined) {
      this.guessed[this.current] = "";
    }

    if(this.guessed[this.current].length < 5) {
      this.guessed[this.current] += letter;
    }
    this.render();
  }

  backspace() {
    if(this.guessed[this.current] == undefined) {
      this.guessed[this.current] = "";
    }
    var len = this.guessed[this.current].length; 
    if(len > 0) {
      this.guessed[this.current] = this.guessed[this.current].slice(0, len-1);
    }
    this.render();
  }

  submit() {
    if(this.guessed[this.current] == undefined) {
      this.guessed[this.current] = "";
    }
    var word = this.guessed[this.current];
    if(word.length < 5) {
      return;
    }
    if(!this.validWord(word)) {
      alert('Not Valid Word!');
      return;
    }
    var score = this.clue(word);
    this.scored.push(score);
    this.current += 1
    this.render();
    if(word == this.word) {
      this.endscreen();
    } else {
      if(this.current == 6) {
        this.endscreen();
      }
    }
  }

  handle_keyboard(e, _this) {
    var letter = e.target.textContent;
    _this.type(letter);
  }

  validWord(word) {
    return self.words.includes(word);
  }

  handle_del(_this) {
    _this.backspace();
  }

  handle_sub(_this) {
    _this.submit();
  }


  endscreen() {
    var notice = document.createElement("div");
    notice.className = "notice";
    notice.innerHTML = "<div><p>This word was: <a href='https://www.collinsdictionary.com/dictionary/english/" + this.word + "' target='_new'>" + this.word + "</a></p></div>";
    var kbd = document.getElementById("keyboard");
    var restart = document.createElement("button");
    restart.className="action";
    restart.textContent = "Try a new puzzle";
    var share = document.createElement("div");
    share.innerHTML = "<a href='?seed="+ this.seed + "'>Puzzle Link</a>";
    var _this = this;
    restart.addEventListener("click", function() { _this.seed = _this.nothing; _this.reset(); _this.render(); });
    notice.appendChild(restart);
    notice.appendChild(share);
    kbd.replaceChildren(notice);
  }

  handle_rst(_this) {
    _this.endscreen();
  }

  render_keyboard() {
    var keyboard = document.createElement("div")
    var _this = this;
    var keys = [
     ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
     ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
     ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];
    for(var row in keys) {
      var krow = document.createElement("div");
      for(var k in keys[row]) {
        var kbtn = document.createElement("button");
        kbtn.addEventListener('click', function(e) { _this.handle_keyboard(e, _this)} )
        var letter = keys[row][k];
        kbtn.textContent = letter;
        if(this.wrong.includes(letter)) {
          kbtn.className = 'wrong';
        } else if (this.right.includes(letter)) {
          kbtn.className = 'right';
        } else if (this.close.includes(letter)) {
          kbtn.className = 'close';
        }
        krow.appendChild(kbtn);
      }
      keyboard.append(krow);
    }
    var krow = document.createElement("div");
    var sub = document.createElement("button");
    sub.textContent = "Submit";
    sub.className = 'action';
    sub.addEventListener('click', function(e) { _this.handle_sub(_this)} )
    var bak = document.createElement("button");
    bak.textContent = "[DEL]"; 
    bak.className = 'action';
    bak.addEventListener('click', function(e) { _this.handle_del(_this)} )
    krow.appendChild(sub);
    krow.appendChild(bak);
    keyboard.append(krow);
    krow = document.createElement("div");
    var rst = document.createElement("button");
    rst.textContent = "Give Up"; 
    rst.className = 'action';
    rst.addEventListener('click', function(e) { _this.handle_rst(_this)} )
    krow.appendChild(rst);
    keyboard.append(krow);

    var board = document.getElementById("keyboard");
    board.replaceChildren(keyboard)
  }

  attachKeyboard() {
    var _this = this;
    document.addEventListener('keydown', function(e) {
      if(e.key == "Backspace") {
        _this.backspace();
      } else if(e.key == "Enter") {
        _this.submit();
      } else if(e.key.length == 1 && e.key != ' ') {
        _this.type(e.key);
      }
    });
  }

  gameOver() {
    if(this.over) {
      this.endscreen();
    }
  }

  render() {
    this.render_guesses();
    this.render_keyboard();
    this.gameOver();
  }

  init() {
    this.attachKeyboard();
    this.render();
  }
};
