class MathsCode { 
  constructor(sums = []) {
    var params = new URLSearchParams(window.location.search);
    this.seed = params.get("seed");
    this.sums = sums;
    this.reset();
  }

  reset() {
    if(this.idx != undefined) {
      this.seed = this.idx;
    }
    this.randomSum()
    this.over = false;

    this.guessed = [];     
    this.current = 0;
    this.scored = [];
    this.right = [];
    this.close = [];
    this.wrong = [];
  }

  randomSum(seed) {
    var len = this.sums.length;
    if(this.seed == undefined) {
      this.seed = Math.floor(Math.random() * len);
    }
    var r = Math.abs(Math.sin((this.seed)/len));
    this.idx = Math.floor(r * len);
    console.log(this.seed, this.idx);
    this.sum = this.sums[this.idx];
  }

  fact(n) {
    if(n <= 1) {
      return 1;
    } else {
      return n * this.fact(n-1);
    }
  }

  eval(str) {
    var pres = {
      'R':2,
      '*':1,
      '/':1,
      '+':0,
      '-':0
    };
    var stack = [];
    var ops = [];
    var syms = str.split("");
    var cur = "";
    for(var i in syms) {
      var s = syms[i];
      if(s == 'R') {
        ops.push(s);
      } else if(s == '+' || s == '-' || s == '*' || s == '/') {
        if(cur != "") {
          stack.push(cur*1);
        }
        if(ops.length > 0) {
          var op = ops.pop();
          if(pres[op] >= pres[s]) {
            stack.push(op);
          } else {
            ops.push(op);
          }
        }
        ops.push(s);
        cur = "";
      } else if (s == '!') {
        stack.push(this.fact(cur*1));
        cur = "";
      } else if (s == 'Q') {
        var n = cur * 1;
        stack.push(n*n);
        cur = "";
      } else {
        cur += s;
      }
    }
    if(cur != "") {
      stack.push(cur*1);
    }

    while(ops.length > 0) {
      stack.push(ops.pop());
    }
    return this.rpeval(stack);
  }

  rpeval(tokens) {
    var ops = {
     '+': function(a,b) { return a + b },
     '-': function(a,b) { return a - b },
     '*': function(a,b) { return a * b },
     '/': function(a,b) { return a / b },
    };
    var stack = []
    for(var t in tokens) {
      var token = tokens[t];
      if(token == 'R') {
        var left = stack.pop();
        stack.push(Math.sqrt(left));
      } else if(token == '+' || token == '-' || token == '*' || token == '/') {
        var right = stack.pop()
        var left = stack.pop();
        stack.push(ops[token](left, right));
      } else {
        stack.push(token);
      }
    }
    return stack[0];
  }

  balanced(sum) {
    var parts=sum.split('=');
    var left = parts[0];
    var right = parts[1];
    return this.eval(left) == this.eval(right);
  }

  clue(guess){
    if(this.sum.length != guess.length) {
      return "Invalid Length";
    }
    if(!this.balanced(guess)) {
      return "Invalid Sum"
    }
    var response = [];
    for (var l=0; l<this.sum.length; l++) {
      if(guess[l] == this.sum[l]) {
        response.push(2);
        this.right.push(guess[l]);
      } else {
        var lidx = this.sum.indexOf(guess[l]);
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
      var sum = this.guessed[g]
      var score = this.scored[g]

      if (sum == undefined) {
        sum = " ";
      }
      if(score == undefined) {
        score = [-1, -1, -1, -1, -1, -1, -1]; //NoScore
      }
      sum = sum.toUpperCase();
      var row = document.createElement("tr");
      for(var c=0; c<7; c++) {
        var cell = document.createElement("td");
        if(score[c] == 0) {
          cell.className = 'wrong';
        }else if(score[c] == 1) {
          cell.className = 'close';
        }else if(score[c] == 2) {
          cell.className = 'right';
        }
        var letter = sum[c]
        if (letter == 'Q') {
          letter = '²';
        } else if (letter == '/') {
          letter = '÷';
        } else if (letter == '*') {
          letter = '×';
        } else if (letter == 'R') {
          letter = '√';
        }
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

    if(this.guessed[this.current].length < 7) {
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
    var sum = this.guessed[this.current];
    if(sum.length < 5) {
      return;
    }
    if(!this.validSum(sum)) {
      alert('Not Valid Sum!');
      return;
    }
    var score = this.clue(sum);
    this.scored.push(score);
    this.current += 1
    this.render();
    if(sum == this.sum) {
      this.endscreen();
    } else {
      if(this.current == 6) {
        this.endscreen();
      }
    }
  }

  handle_keyboard(e, _this) {
    var letter = e.target.textContent;
    if (letter == 'x²') {
      letter = 'Q';
    } else if (letter == '÷') {
      letter = '/';
    } else if (letter == '×') {
      letter = '*';
    } else if (letter == '√') {
      letter = 'R';
    }
    _this.type(letter);
  }

  validSum(sum) {
    return this.balanced(sum);
  }

  handle_del(_this) {
    _this.backspace();
  }

  handle_sub(_this) {
    _this.submit();
  }

  clipboard() {
    var url = window.location.protocol + '//' + window.location.hostname + window.location.pathname + '?seed=' + this.seed;
    var score = this.current;
    var txt = "Mathsle " + url + ": " + score + "/6\n";
    for(var g=0; g<6; g++) {
      var score = this.scored[g]

      if(score != undefined) {
        var row = "";
        for(var c=0; c<7; c++) {
          var cell = document.createElement("td");
          if(score[c] == 0) {
            row += "⬜️";
          }else if(score[c] == 1) {
            row += "🟨";
          }else if(score[c] == 2) {
            row += "🟩";
          }
        }
        txt += row + '\n';
      }
    }
    navigator.clipboard.writeText(txt);
    console.log(txt);
  }

  encode(str) {
    str = str.replace('Q', '²');
    str = str.replace('R', '√');
    str = str.replace('/', '÷');
    str = str.replace('*', '×');
    return str;
  }

  endscreen() {
    var notice = document.createElement("div");
    notice.className = "notice";
    notice.innerHTML = "<div><p class='sum'>This sum was: " + this.encode(this.sum) + "</p></div>";
    var kbd = document.getElementById("keyboard");
    var restart = document.createElement("button");
    restart.className="action";
    restart.textContent = "Try a new puzzle";
    var share = document.createElement("div");
    share.innerHTML = "<a href='?seed="+ this.seed + "'>Puzzle Link</a>";
    var _this = this;
    restart.addEventListener("click", function() { _this.seed = _this.nothing; _this.reset(); _this.render(); });
    var copy = document.createElement("button");
    copy.className="action";
    copy.textContent = "Copy Sharable Link";
    copy.addEventListener("click", function() {
      _this.clipboard();
    });
    notice.appendChild(restart);
    notice.appendChild(share);
    notice.appendChild(copy);
    kbd.replaceChildren(notice);
  }

  handle_rst(_this) {
    _this.endscreen();
  }

  render_keyboard() {
    var keyboard = document.createElement("div")
    var _this = this;
    var keys = [
     ['7', '8', '9', '÷'],
     ['4', '5', '6', '×'],
     ['1', '2', '3', '-'],
     ['0', 'x²', '√', '+'],
     ['!', '=']

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
