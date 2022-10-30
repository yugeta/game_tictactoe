(function(){
  var LIB  = function(){};

  LIB.prototype.event = function(target, mode, func , flg){
    flg = (flg) ? flg : false;
    if (target.addEventListener){target.addEventListener(mode, func, flg)}
    else{target.attachEvent('on' + mode, function(){func.call(target , window.event)})}
  };

  LIB.prototype.construct = function(){
    switch(document.readyState){
      case "complete"    : new MAIN();break;
      case "interactive" : this.event(window , "DOMContentLoaded" , (function(){new MAIN()}).bind(this));break;
      default            : this.event(window , "load"             , (function(){new MAIN()}).bind(this));break;
    }
  };

  var MAIN = function(){

    this.mode = "";

    // 棋譜格納用のバッファ
    this.buffer = [];

    // 先手、後手のターンフラグ
    this.turn = null;

    this.drawBase();
    this.setEvent();
    this.startDecide();
  };

  MAIN.prototype.drawBase = function(){
    var ctx = document.getElementById("mycanvas").getContext("2d");

    // 背景
    ctx.fillStyle = "#14bdac";
    ctx.fillRect(0,0,400,200);
    
    // 枠線
    ctx.strokeStyle = "#0da192";
    ctx.lineWidth = 6;

    ctx.beginPath();
    ctx.moveTo(170,20);
    ctx.lineTo(170,180);
    ctx.stroke();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(230,20);
    ctx.lineTo(230,180);
    ctx.stroke();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(120,70);
    ctx.lineTo(280,70);
    ctx.stroke();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(120,130);
    ctx.lineTo(280,130);
    ctx.stroke();
    ctx.fill();

  };

  MAIN.prototype.setEvent = function(){
    var ctx = document.getElementById("mycanvas");
    new LIB().event(ctx , "click" , (function(e){this.clickCtx(e)}).bind(this));
    new LIB().event(ctx , "mousemove" , (function(e){this.mouseMoveCtx(e)}).bind(this));
  };

  // 先手、後手を決めるダイアログ表示
  MAIN.prototype.startDecide = function(mode){

    this.mode_dialog = typeof mode === "undefined" ? null : mode;

    this.makeDialog(
      {
        color_bg     : "rgb(250, 148, 47)",
        color_stroke : "rgb(255, 127, 0)"
      },
      ["選択してください。"]
    );
    
    // 先攻
    var col1 = this.mode_dialog === 0 ? "red" : "gray";
    this.makeDialog(
      {
        color_bg  : col1,
        color_txt : "white",
        alitn     : "left",
        margin    : 0,
        padding   : "5px",
        width     : "80px",
        height    : "40px",
        textSize  : "20px",
        x         : "100px",
        y         : "100px"
      },
      ["先攻"]
    );

    // 後攻
    var col2 = this.mode_dialog === 1 ? "red" : "gray";
    this.makeDialog(
      {
        color_bg  : col2,
        color_txt : "white",
        alitn     : "left",
        margin    : 0,
        padding   : "5px",
        width     : "80px",
        height    : "40px",
        textSize  : "20px",
        x         : "220px",
        y         : "100px"
      },
      ["後攻"]
    );

    this.mode = "dialog_start";
  };

  var __dialogOptions = {
    color_bg  : "red",
    color_txt : "",
    color_stroke : "transparent",
    strokeWidth : 0,

    align     : "center", // [ left , center , right ]
    valign    : "middle", // [ top , middle , bottom ]
    width     : "70%",  // % or px *数値のみの場合はpx
    height    : "60%",  // % or px *数値のみの場合はpx
    margin    : "10px", // 全ての方向に対して一律指定 : %指定の場合はwidthに対しての% or px *数値のみの場合はpx
    padding   : "10px", // 全ての方向に対して一律指定 : %指定の場合はwidthに対しての% or px *数値のみの場合はpx
    radius    : "8px",

    textAlign : "center",
    textFont  : "sans-serif",
    textColor : "white",
    textBase  : "top",
    textWeight: "bold",
    textSize  : "16px",

    x         : 0,  // 自動設定
    y         : 0,  // 自動設定
    tx        : 0,  // 自動設定
    ty        : 0,  // 自動設定

    $:0
  }
  
  // ダイアログの表示
  // options : __dialogOptions is default
  // texts   : array strings of text-line
  MAIN.prototype.makeDialog = function(options , texts){
    options = this.setOptions(__dialogOptions , options);
    options = this.dialogOptions_adjust(options);

    var canvas = document.getElementById("mycanvas");
    var ctx = canvas.getContext("2d");

    // dialog描画
    ctx.fillStyle = options.color_bg;
    ctx.strokeStyle = options.color_stroke;
    ctx.lineWidth = options.strokeWidth;

    if(options.radius === 0){
      ctx.fillRect(options.x , options.y , options.width , options.height);
    }
    else{
      var w = options.width;
      var h = options.height;
      var x = options.x;
      var y = options.y;
      var r = options.radius;
      ctx.beginPath();
      ctx.moveTo(x,y + r);
      ctx.arc(x+r , y+h-r , r , Math.PI , Math.PI*0.5 , true);
      ctx.arc(x+w-r , y+h-r , r , Math.PI*0.5,0 , 1);
      ctx.arc(x+w-r , y+r , r , 0 , Math.PI*1.5 , 1);
      ctx.arc(x+r , y+r , r , Math.PI*1.5 , Math.PI , 1);   
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    }
    
    // 文字
    ctx.fillStyle = options.textColor;
    ctx.font      = options.textWeight +" "+ options.textSize +"px "+ options.textFont;
    ctx.textAlign = options.textAlign;
    ctx.textBaseline = options.textBase;
    for(var i=0; i<texts.length; i++){
      ctx.fillText(texts[i], options.tx, options.ty + (i * options.textSize + 4) , options.width);
    }
  
  }

  // @px,@%を数値に変換する
  MAIN.prototype.px_per2num = function(data , max){
    if(String(data).match(/^([0-9]+?)%$/)){
      var num = Number(RegExp.$1);
      num = num <= 100 ? num : 100;
      return parseInt(max * (num / 100));
    }
    else if(String(data).match(/^([0-9]+?)px$/)){
      return Number(String(data).replace("px",""));
    }
    else{
      return Number(data);
    }
  };

  MAIN.prototype.dialogOptions_adjust = function(options){
    var canvas = document.getElementById("mycanvas");

    // サイズ処理
    options.width = this.px_per2num(options.width , canvas.offsetWidth);
    options.height = this.px_per2num(options.height , canvas.offsetHeight);
    options.margin = this.px_per2num(options.margin , canvas.offsetWidth);
    options.padding = this.px_per2num(options.padding , canvas.offsetWidth);
    options.textSize = Number(String(options.textSize).replace("px",""));
    options.radius = this.px_per2num(options.radius , canvas.offsetWidth);
    if(options.x === 0){
      switch(options.align){
        case "left":
          options.x = options.margin;
          break;
        case "right":
          options.x = canvas.offsetWidth - (options.width + options.margin);
          break;
        case "center":
        default:
          options.x = (canvas.offsetWidth / 2) - (options.width / 2);
          break;
      }
    }
    else{
      options.x = this.px_per2num(options.x , canvas.offsetWidth);
    }
    if(options.y === 0){
      switch(options.valign){
        case "top":
          optinos.y = options.margin;
          break;
        case "bottom":
          options.y = canvas.offsetHeight - (options.height + options.margin);
          break;
        case "middle":
        default:
          options.y = (canvas.offsetHeight / 2) - (options.height / 2);
          break;
      }
    }
    else{
      options.y = this.px_per2num(options.y , canvas.offsetHeight);
    }
    
    // text情報
    options.ty = options.y + options.padding;
    switch(options.textAlign){
      case "left":
        options.tx = options.x + options.padding;
        break;
      case "right":
        options.tx = canvas.offsetWidth - options.x - options.padding;
        break;
      case "center":
      default:
        options.tx = options.x + (options.width / 2);
        break;
    }

    return options;
  };

  MAIN.prototype.dialog_start = function(e){
    var canvas = e.currentTarget;
    var x = e.clientX - canvas.getBoundingClientRect().left;
    var y = e.clientY - canvas.getBoundingClientRect().top;

    // 先攻エリア
    if(this.check_pos[0](x,y) === true
    && this.mode_dialog !== 1){
      this.clearCTX();
      this.drawBase();
      this.startDecide(0);
    }

    // 後攻エリア
    else if(this.check_pos[1](x,y)
    && this.mode_dialog !== 0){
      this.clearCTX();
      this.drawBase();
      this.startDecide(1);
    }

    // 戻す
    else if(this.mode_dialog !== null){
      this.clearCTX();
      this.drawBase();
      this.startDecide(null);
    }
  };

  // デフォルトoption設定に指定するoptionを上書きする処理（データ1階層のみ対応）
  MAIN.prototype.setOptions = function(baseOption , newOptions){
    newOptions = newOptions ? newOptions : {};
    var res = JSON.parse(JSON.stringify(baseOption));
    for (var i in newOptions) {res[i] = newOptions[i];}
    return res;
  };


  // ユーザーの番（先手）
  MAIN.prototype.clickCtx = function(e){
    switch(this.mode){
      case "dialog_start":
        this.clickStartDecide(e);
        break;

      case "oncemore":
        this.clickOncemore(e);
        break;

      default:
        this.putMark(e);
    }
  };

  // ボタンの座標判定
  // [0] : 先攻ボタン
  // [1] : 後攻ボタン
  // [2] : もう一回ボタン
  MAIN.prototype.check_pos = [
    function(x,y){
      if(x >= 100 && x <= 180
      && y >= 100 && y <= 140){
        return true;
      }
      else{
        return false;
      }
    },
    function(x,y){
      if(x >= 220 && x <= 300
        && y >= 100 && y <= 140){
        return true;
      }
      else{
        return false;
      }
    },
    function(x,y){
      if(x >= 140 && x <= 260
        && y >= 100 && y <= 140){
        return true;
      }
      else{
        return false;
      }
    }
  ];

  MAIN.prototype.clickStartDecide = function(e){

    var canvas = e.currentTarget;
    var x = e.clientX - canvas.getBoundingClientRect().left;
    var y = e.clientY - canvas.getBoundingClientRect().top;

    // 座標判定
    if(this.check_pos[0](x,y) === false
    && this.check_pos[1](x,y) === false){return;}

    this.clearCTX();
    this.drawBase();
    this.mode = null;
    
    // 先攻
    if(this.check_pos[0](x,y) === true){
      this.turn = 0;
    }
    // 後攻
    else{
      this.turn = 1;
      this.turnComputer();
    }
  };

  MAIN.prototype.clickOncemore = function(e){
    var canvas = e.currentTarget;
    var x = e.clientX - canvas.getBoundingClientRect().left;
    var y = e.clientY - canvas.getBoundingClientRect().top;

    // 座標判定
    if(this.check_pos[2](x,y) === false){return;}

    // フラグリセット
    this.buffer = [];
    this.finish_mode = null;

    // スタート画面
    this.clearCTX();
    this.drawBase();
    this.startDecide(null);
  };

  MAIN.prototype.putMark = function(e){
    if(this.turn !== 0){return;}
    var canvas = e.currentTarget;

    // canvas内のクリックされた座標
    var posX = e.clientX - canvas.getBoundingClientRect().left;
    var posY = e.clientY - canvas.getBoundingClientRect().top;

    // 座標から枠判定 [1-9]
    var cell = this.checkCell(posX , posY);
    if(!cell){return;}

    // バッファに登録（登録済みのセルの場合は、処理しない）
    if(this.containNum(cell)){return;}
    
    this.buffer.push({
      mark : 0,
      num  : cell
    });

    // 記号を表示する
    this.drawBuffer();

    // 判定
    if(this.judgement()){return;}

    this.turn = 1;

    // 打つ手が無くなったら終了
    if(this.buffer.length >= 9){
      this.draw();
      this.finish();
      return;
    }

    // 続けてコンピュータの手
    var time = this.getRandomTime(1000);
    setTimeout((function(){this.turnComputer();}).bind(this) , time);
  }

  MAIN.prototype.mouseMoveCtx = function(e){
    switch(this.mode){
      case "dialog_start":
        this.dialog_start(e);
        break;

      case "oncemore":
        this.mouseover_oncemore(e);
        break;
    }
  };

  MAIN.prototype.getRandomTime = function(max_time){
    return Math.floor(Math.random() * max_time);
  };

  MAIN.prototype.cell = {
    x : [118,177,236],
    y : [18,76,134],
    size : 47
  }

  MAIN.prototype.checkCell = function(posX , posY){
    var cnt  = 1;
    for(var i=0; i<this.cell.y.length; i++){
      for(var j=0; j<this.cell.x.length; j++){
        if(this.cell.x[j] <= posX && posX <= this.cell.x[j] + this.cell.size
        &&  this.cell.y[i] <= posY && posY <=  this.cell.y[i] + this.cell.size){
          return cnt;
        }
        cnt++;
      }
    }
    return null;
  };

  MAIN.prototype.clearCTX = function(){
    var canvas = document.getElementById("mycanvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  MAIN.prototype.drawBuffer = function(){

    // 描画をクリアする
    this.clearCTX();

    // 基盤を表示
    this.drawBase();

    // バッファ全ての座標を指定
    for(var i=0; i<this.buffer.length; i++){
      var num = this.buffer[i].num;
      // 奇数番
      if(i % 2 === 0){
        this.drawMark_0(num);
      }
      // 偶数
      else{
        this.drawMark_1(num);
      }
    }
  };

  // player-mark @ [0:○ , 1:×]
  MAIN.prototype.drawMark_0 = function(cell){
    var ctx = document.getElementById("mycanvas").getContext("2d");
    var x = y = null , r=16;
    var offset = 24;
    var x = this.cell.x[(function(cell){var a = cell % 3 - 1;return a < 0 ? 2 : a})(cell)] + offset;
    var y = this.cell.y[parseInt((cell-1) / 3 , 10)] + offset;

    if(x === null && y === null){return;}

    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.arc(x,y,r, 0/180*Math.PI , 360/180*Math.PI);
    ctx.stroke();
  };

  // com-mark @ [0:○ , 1:×]
  MAIN.prototype.drawMark_1 = function(cell){
    var ctx = document.getElementById("mycanvas").getContext("2d");

    var size1 = 8,
        size2 = 38;
    var x = this.cell.x[(function(cell){var a = cell % 3 - 1;return a < 0 ? 2 : a})(cell)];
    var y = this.cell.y[parseInt((cell-1) / 3 , 10)];
    var x1 = x + size1;
    var y1 = y + size1;
    var x2 = x + size2;
    var y2 = y + size2;

    if(x1 === null && y1 === null
    && x2 === null && y2 === null){return;}

    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(x1,y2);
    ctx.lineTo(x2,y1);
    ctx.stroke();
    ctx.fill();
  };

  MAIN.prototype.turnComputer = function(){
    if(this.turn !== 1){return;}

    // 打つ手が無くなったら終了
    if(this.buffer.length >= 9){return;}

    // 現在の盤から、空きセルを検索
    var emptyCells = this.getEmptyCells();
    var cellNum = null;
    // 場所を決める（２手目判定）
    cellNum = this.argo_2();
    // 自分リーチの時に終了させる
    if(!cellNum){
      cellNum = this.getComReach(emptyCells);
    }
    // 相手がリーチの時に阻止する
    if(!cellNum){
      cellNum = this.getUserReach(emptyCells);
    }
    // それ以外の場所
    if(!cellNum){
      cellNum = this.getComPlace(emptyCells);
    }
    
    this.buffer.push({
      mark : 1,
      num  : cellNum
    });

    // 記号を表示する
    this.drawBuffer();

    this.turn = 0;

    // 判定
    if(this.judgement()){return;}

    // 打つ手が無くなったら終了
    if(this.buffer.length >= 9){
      this.draw();
      this.finish();
    }
  };

  MAIN.prototype.getEmptyCells = function(){
    var arr = [];
    for(var i=1; i<=9; i++){
      if(this.containNum(i)){continue;}
      arr.push(i);
    }
    return arr;
  }

  MAIN.prototype.containNum = function(num){
    for(var i in this.buffer){
      if(this.buffer[i].num === num){
        return this.buffer[i];
      }
    }
  };
  MAIN.prototype.containNum_player = function(mark , num){
    for(var i in this.buffer){
      if(this.buffer[i].mark === mark && this.buffer[i].num === num){
        return this.buffer[i];
      }
    }
  };

  MAIN.prototype.getComPlace = function(emptyCells){
    var num = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[num];
  }

  MAIN.prototype.finish = function(){
    console.log("Finish !");
    
  };

  // mark @ 対象のコマ（マーク）[0:○ , 1:×] : int
  // return @ ３つ並んだら並んでいるマーク（0:○ , 1:×）:int を返す , それ以外はnull
  MAIN.prototype.judgement = function(){
    if(this.buffer.length < 3){return 0;}
    
    // プレイヤーの勝ち
    if(this.judgement_player(0)){
      return this.win(0);
    }
    // コンピュータの勝ち
    else if(this.judgement_player(1)){
      return this.win(1);
    }
    return 0;
  }

  MAIN.prototype.judgement_player = function(mark){
    // 横一列判定
    for(var i in win_pattern){
      // [0-2]
      var cnt = 0;
      for(var j in win_pattern[i]){
        var res = this.containNum(win_pattern[i][j])
        // bufferに含まれていなければ、NG
        if(!res){break;}
        // 違うプレイヤーであれば、NG
        if(res.mark !== mark){break;}
        cnt += 1;
      }
      if(cnt >= 3){
        return true;
      }
    }
    return false;
  }
  // 勝ち配列
  var win_pattern = [
    [1,2,3],
    [4,5,6],
    [7,8,9],

    [1,4,7],
    [2,5,8],
    [3,6,9],

    [1,5,9],
    [3,5,7]
  ];

  MAIN.prototype.win = function(mark,mouseover){
    if(mark !== 0 && mark !== 1){return null;}
    var user = mark === 0 ? "あなた" : "コンピュータ";
    var text = user + "の勝ち";

    this.finish_mode = mark;

    this.makeDialog(
      {
        color_bg  : "orange",
        color_txt : "white",
        alitn     : "left",
        margin    : 0,
        padding   : "5px",
        width     : "70%",
        height    : "100px",
        textSize  : "20px"
      },
      [text]
    );

    this.oncemore(mouseover);

    return 1;
  };

  MAIN.prototype.draw = function(mouseover){

    this.finish_mode = 2;

    this.makeDialog(
      {
        color_bg  : "orange",
        color_txt : "white",
        alitn     : "left",
        margin    : 0,
        padding   : "5px",
        width     : "70%",
        height    : "100px",
        textSize  : "20px"
      },
      ["引き分け"]
    );

    this.oncemore(mouseover);

    return 1;
  }

  MAIN.prototype.oncemore = function(mouseover){

    var color = !mouseover ? "gray" : "red";

    this.makeDialog(
      {
        color_bg  : color,
        color_txt : "white",
        alitn     : "left",
        margin    : 0,
        padding   : "5px",
        width     : "120px",
        height    : "40px",
        textSize  : "20px",
        y         : "100px"
      },
      ["もう1回やる"]
    );

    this.mode = "oncemore";

    return 1;
  }

  MAIN.prototype.mouseover_oncemore = function(e){
    var canvas = e.currentTarget;
    var x = e.clientX - canvas.getBoundingClientRect().left;
    var y = e.clientY - canvas.getBoundingClientRect().top;

    if(this.check_pos[2](x,y) === true){
      if(this.finish_mode === 0){
        this.win(0 , "on");
      }
      else if(this.finish_mode === 1){
        this.win(1 , "on");
      }
      else if(this.finish_mode === 2){
        this.draw("on");
      }
    }
    else{
      if(this.finish_mode === 0){
        this.win(0);
      }
      else if(this.finish_mode === 1){
        this.win(1);
      }
      else if(this.finish_mode === 2){
        this.draw();
      }
    }
  };

  // コンピュータが２手目の判定
  MAIN.prototype.argo_2 = function(){
    if(this.buffer.length != 1){return;}
    for(var i=0; i<__argo2_data.length; i++){
      for(var j=0; j<__argo2_data[i][0].length; j++){
        if(this.buffer[0].num === __argo2_data[i][0][j]){
          var lists = __argo2_data[i][1];
          var lists = this.excludeLists(lists , [this.buffer[0].num]);
          return this.getComPlace(lists);
        }
      }
    }
  };

  // ２手目の状態の時に１手目が置いたコマによって次に置くマス（置いてはいけないマス以外）
  // ※１手目と重複するマスは除外する
  var __argo2_data = [
    [[1,3,7,9] , [1,2,3,4,6,7,8,9]],
    [[5] , [2,4,6,8]],
    [[2] , [4,6,7,9]],
    [[4] , [2,3,8,9]],
    [[6] , [1,2,7,8]],
    [[8] , [1,3,4,6]]
  ];

  // リスト内に指定データ（複数）が含まれていると除外する
  MAIN.prototype.excludeLists = function(lists_base , nums){
    if(!nums || !nums.length){return lists;}
    var lists = JSON.parse(JSON.stringify(lists_base));
    for(var i=0; i<nums.length; i++){
      var a = lists.indexOf(nums[i])
      if(a !== -1){
        lists.splice(a,1);
      }
    }
    return lists;
  };
  
  
  MAIN.prototype.getComReach = function(emptyLists){
    var lists = this.checkReach(emptyLists , 1);
    if(!lists){return;}
    return this.getComPlace(lists);
  };
  MAIN.prototype.getUserReach = function(emptyLists){
    var lists = this.checkReach(emptyLists , 0);
    if(!lists){return;}
    return this.getComPlace(lists);
  };

  
  // リーチ箇所を特定して、終了するマスを一覧で返す
  MAIN.prototype.checkReach = function(emptyLists , mark){
    if(this.buffer.length < 3){return;}
    var fixes = [];
    for(var i=0; i<win_pattern.length; i++){
      var flg = [];
      for(var j=0; j<win_pattern[i].length; j++){
        if(this.containNum_player(mark , win_pattern[i][j])){
          flg.push(win_pattern[i][j])
        }
      }
      if(flg.length === 2){
        var nums = this.excludeLists(win_pattern[i] , flg);
        if(!this.containNum(nums[0])){
          fixes.push(nums[0]);
        }
      }
    }
    return fixes;
  };

  

  new LIB().construct();
})();
