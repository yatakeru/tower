//[1]変数と配列
var SIZE = 72;  //マスの大きさ

var tmr = 0;  //カウント
var idx = 0;  //ゲームの進行状況の管理 ０：タイトル １：プレイ中 ２：ゲームオーバー ３：シーズンクリア ４：エンディング
var season = 0;
var gtime = 0;

//敵の変数
var EMAX = 100;
var emy_X = new Array(EMAX);    //最初の場所が配列に入っておりそこにマスの半分を足している;  //4*SIZE + SIZE/2;  //敵のキャンバス上の座標。
var emy_Y = new Array(EMAX);  //8*SIZE + SIZE/2;
var emy_d = new Array(EMAX);  //2;  //敵の向き 1=上 2=下 3=左 4=右
var emy_s = new Array(EMAX);  //4;  //敵の歩く速さ;  //4;  //敵の歩く速さ
var emy_t = new Array(EMAX);  //一マスを移動するフレーム数
var emy_life = new Array(EMAX);
var emy_species = new Array(EMAX);  //スライム等の画像シートの切る場所を指定。０:スライム,１:ゴースト,２:スケルトン。値の違いで歩くスピードにも変化をつける
var emy_dmg = new Array(EMAX);

var ESET_X = [0, 4, 10, 14];        //敵の出現場所
var ESET_Y = [1, 0, 0, 1];

var XP = [0, 0, 0,-1, 1];       //敵の移動方向
var YP = [0,-1, 1, 0, 0];
var CHR_ANIMA = [0, 1, 0, 2];   //敵のアニメーション


//城の変数
var castle_x = 0;
var castle_y = 0;
var damege = 0;

//カードの変数
var CARD_MAX = 4;
var CARD_NAME = ["warrior", "priest", "archer", "witch"];
var CARD_RADIUS = [108, 108, 144, 180];
var CADR_SPEED = [1, 6, 2, 3];
var CARD_LIFE = [200, 80, 160, 120];
var CARD_CURE = [0, 1, 0, 0];   //値が１のキャラクターは回復能力がある
var card_power = [0, 0, 0, 0];
var sel_card = 0;     //どのカードを選択しているかを保持する
var FLASH = ["#2040ff", "#4080ff", "#80c0ff", "#c0e0ff", "#80c0ff", "#4080ff"];//明滅色

var troop = new Array(12);
var tr_dir = new Array(12);
var tr_life = new Array(12);
for (var y = 0; y < 12; y++) {
  troop[y] = new Array(15);
  tr_dir[y] = new Array(15);
  tr_life[y] = new Array(15);
}

//ステージ
var stage = [
  [0,0,0,0,2,0,0,0,0,0,2,0,0,0,0],
  [4,2,0,0,4,4,2,0,0,2,3,0,0,2,3],
  [0,2,0,0,0,0,2,0,0,2,0,0,0,2,0],
  [0,2,0,0,0,0,2,0,0,2,0,0,0,2,0],
  [0,4,4,2,0,2,3,0,0,4,2,0,0,2,0],
  [0,0,0,2,0,2,0,0,0,0,4,2,0,2,0],
  [0,2,3,3,0,4,4,2,0,0,0,2,0,2,0],
  [0,2,0,0,0,0,0,2,0,0,2,3,0,2,0],
  [0,2,0,0,0,0,0,2,0,0,2,0,0,2,0],
  [0,2,0,0,0,0,0,2,0,0,2,0,0,2,0],
  [0,4,4,4,4,4,4,5,3,3,3,3,3,3,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

var arrow = ["", "↑","↓","←","→","C"];    //フィールドに描く矢印




//[2]関数
function drawBG() {
  fill("navy");     //画面全体をネイビーにする
  drawImg(0, 0, 0); //フィールドを描く
  lineW(1);         //ラインを一ミリにする
  for (var y = 0; y < 12; y++) {
    for (var x = 0; x < 15; x++) {
      var cx = x*SIZE;          //７２ドットずつ並べる
      var cy = y*SIZE;
      if (stage[y][x] > 0) {
        setAlp(50);//透明度を変化させる
        fRect(cx+1, cy+1, SIZE-3, SIZE-3, "#4000c0");
        setAlp(100);
        sRect(cx+1, cy+1, SIZE-3, SIZE-3, "#4060ff");
        fText(arrow[stage[y][x]], cx + SIZE/2, cy + SIZE/2, 30, "cyan");    //左上から、マスの大きさの半分、右と下に行った所に矢印を書いている。
      }
      var n = troop[y][x];
      if (n > 0) {
        var a = 3;  //動かなくなる画像に固定する
        var lif = tr_life[y][x];
        if (lif > 0) a = CHR_ANIMA[int(tmr/4)%4];
        drawSoldier(cx, cy, n, tr_dir[y][x], a);
        fText(lif, cx + SIZE/2, cy+56, 24, "white");
      }
    }
    for (var i = 0; i < 4; i++) {//黄色の丸を書く
      var cx = ESET_X[i]*SIZE + SIZE/2;
      var cy = ESET_Y[i]*SIZE + SIZE/2;
      sCir(cx, cy, 30, "yellow");
    }
  }
}

function drawCard() {
  drawImg(3, 0, 864);
  lineW(6);
  for (var i = 0; i < CARD_MAX; i++) {
    var x = 270*i;
    var y = 864;
    var c = "#0040c0";
    fText(CARD_NAME[i], x+135, y+320, 36, "white");
    setAlp(50);
    if (card_power[i] < 100)
      fRect(x, y, 270, 400, "black");
    else
      c = FLASH[tmr%6];
    fRect(x+34, y+349, 202, 18, "black");
    fRect(x+35, y+350, card_power[i]*2, 16, c);
    if (i == sel_card) sRect(x+3, y+3, 270-6, 400-6, "cyan");
    setAlp(100);
  }
}

function drawSoldier(x, y, n, d, a) {
  var sx = (n-1)*288 + a*72;
  var sy = (d-1)*72;
  drawImgTS(4, sx, sy, 72, 72, x , y, 72, 72);
  lineW(1);
  sCir(x + SIZE/2, y + SIZE/2, CARD_RADIUS[n-1], "cyan");
}

function setEnemy() {   //seasonによってシーズンが進むごとに歩くスピードや体力が大きくなる
  var r = rnd(4);
  var sp = rnd(3);
  console.log(sp);
  for (var i = 0; i < EMAX; i++) {
    if (emy_life[i] == 0) {
      emy_X[i] = ESET_X[r]*SIZE + SIZE/2;    //最初の場所が配列に入っておりそこにマスの半分を足している
      emy_Y[i] = ESET_Y[r]*SIZE + SIZE/2;
      emy_d[i] = 0;                  //一番最初は画像を消している。
      emy_s[i] = 1+sp + int(season/2);    //4;  //歩く速さ608章よりランダム性（ｓｐ）に変更された。
      emy_t[i] = 0;
      emy_life[i] = 1 + season*2 + sp*3;
      emy_species[i] = sp;
      emy_dmg[i] = 0;
      break;            //ここでブレイクを入れないと最初の段階でまだ使ってない配列の中身にも代入してしまう。一匹ずつ行いたい。
    }
  }
}


function moveEnemy() {
  for (var i = 0; i < EMAX; i++) {
    if (emy_life[i] > 0) {
      var d = stage[int(emy_Y[i]/SIZE)][int(emy_X[i]/SIZE)];
      if (emy_t[i] == 0) {
        if (d == 5) {
          castle_x = castle_x + rnd(11)-5;
          castle_y = castle_y + rnd(11)-5;
          damege  = damege + emy_life[i];
          emy_life[i] = 0;
        }
        else {
          emy_d[i] = d;    //向き
          emy_t[i] = int(SIZE/emy_s[i]);
        }
      }
      if (emy_t[i] > 0) {
        emy_X[i] += emy_s[i]*XP[emy_d[i]];
        emy_Y[i] += emy_s[i]*YP[emy_d[i]];
        
      emy_t[i]--;

      }
      var sx = emy_species[i]*216 + CHR_ANIMA[int(tmr/4)%4]*72;  //画像の切り出す位置を定義
      var sy = (emy_d[i]-1)*72 + (season-1)*288;    //シーズンによって画像の切り出し位置を変える
      drawImgTS(1, sx, sy, 72, 72, emy_X[i] - SIZE/2, emy_Y[i] - SIZE/2, 72, 72);
      fText(emy_life[i], emy_X[i], emy_Y[i]-48, 24, "white");
      if (emy_dmg[i] > 0) {
        emy_dmg[i]--;
        if (emy_dmg[i]%2 == 1) fCir(emy_X[i], emy_Y[i], int(SIZE*0.6), "white");
        if (emy_dmg[i] == 0) emy_life[i]--;
      }
    }
  }
}

function action() {
  for (var y = 0; y < 12; y++) {
    for (var x = 0; x < 15; x++) {
      var n = troop[y][x];
      var l = tr_life[y][x];
    if (n > 0 && l > 0 && tmr%CADR_SPEED[n-1] == 0) {
      var a = attack(x, y, n);
      if (a == true) 
        tr_life[y][x]--;
      else if (CARD_CURE[n-1] > 0)    //そこにいるキャラクターが神官なら
        recover(x, y, n);
    }
    }
  }
}

function attack(x, y, n) {
  var cx = x*SIZE + SIZE/2;
  var cy = y*SIZE + SIZE/2;
  lineW(10);
  for (var i = 0; i < EMAX; i++) {
    if (emy_life[i] > 0 && emy_dmg[i] == 0) {
      if (getDis(emy_X[i], emy_Y[i], cx, cy) <= CARD_RADIUS[n-1]) {
        line(emy_X[i], emy_Y[i], cx ,cy, "white");
        emy_dmg[i] = 2;
        if (emy_Y[i] < cy) tr_dir[y][x] = 1;
        if (emy_Y[i] > cy) tr_dir[y][x] = 2;
        if (emy_X[i] < cx) tr_dir[y][x] = 3;
        if (emy_X[i] > cx) tr_dir[y][x] = 4;
        return true;
      }
    }
  }
  return false;
}

function recover(x, y, n) {
  var d = 1+rnd(4);
  var tx = x+XP[d];
  var ty = y+YP[d];
  if (0 <= tx && tx < 15 && 0 <= ty && ty < 12) {
    var tr = troop[ty][tx];
    if (tr > 0) {
      if (tr_life[ty][tx] < CARD_LIFE[tr-1]) {
        tr_life[ty][tx] += CARD_CURE[n-1];    //１回復
        if (tr_life[ty][tx] > CARD_LIFE[tr-1]) tr_life[ty][tx] = CARD_LIFE[tr-1];
        tr_dir[y][x] = d;
        lineW(8);
        sCir(tx*SIZE + SIZE/2, ty*SIZE + SIZE/2, int(SIZE*0.5), "blue");  //回復相手に青色の円を描く
      }
    }
  }
}

function initVar() {
  var i, x, y;
  for (i = 0; i < EMAX; i++) emy_life[i] = 0;
  for (i = 0; i < CARD_MAX; i++) card_power[i] = 90;
  for (y = 0; y < 12; y++) {
    for (x = 0; x < 15; x++) {
      troop[y][x] = 0;
      tr_dir[y][x] = 1;
      tr_life[y][x] = 0;
    }
  }
  damege = 0;
  gtime = 3*60*30;  //３分×６０秒×３０フレーム
  loadImg(0, "image/bg" + season + ".png");
}

//起動時の処理
function setup() {
  canvasSize(1080, 1264);
  var IMG = ["bg1", "enemy", "castle", "card", "soldier", "mcircle"];
  for (var i = 0; i < IMG.length; i++) loadImg(i, "image/" + IMG[i] + ".png");
  var SND = ["battle", "win", "lose", "victory"];
  for (var i = 0; i < SND.length; i++) loadSound(i, "sound/" + SND[i] + ".m4a");
}

//メインループ
function mainloop() {
  tmr++;
  if (idx > 0) drawBG();
  drawCard();

  switch(idx) {
    case 0:   //タイトル画面
      fRect(0, 0, 1080, 864, "black");
      drawImgR(5, 540, 400, tmr); //drawImgR(画像番号, 左上のX, 左上のY, 回転角)
      fText("Tower Deffence", 540, 280, 50, "skyblue");
      fText("Saint Quartet", 540, 400, 120, "white");
      if (tmr%60 < 30) fText("Click to start!", 540, 754, 50, "skyblue");
      if (tapC > 0) {
        season = 1;
        initVar();
        idx = 1;
        tmr = 0;
      }
    break;

    case 1:
      if (tmr == 1) playBgm(0);
      if (tmr < 90) fText("SEASON " + season + " START", 540, 400, 60, "white");
      if (tmr%10 < 5) card_power[rnd(CARD_MAX)] += 1;
      if (tapC == 1 && tapY > 864) {
        tapC = 0;
        var c = int(tapX/270);
        if (0 <= c && c < CARD_MAX) sel_card = c;
      }
      var x = int(tapX/SIZE);
      var y = int(tapY/SIZE);
      if (0 <= x && x < 15 && 0 <= y && y < 12) {
        var cx = x*SIZE + SIZE/2;
        var cy = y*SIZE + SIZE/2;
        if (card_power[sel_card] >= 100) {  //どこに置くか選ぶときに攻撃範囲を青の円で示す
          setAlp(50);
          fCir(cx, cy, CARD_RADIUS[sel_card], "cyan");
          drawSoldier(cx - SIZE/2, cy - SIZE/2, sel_card+1, 1, 0);
          setAlp(100);
        }
            var n = troop[y][x];
        if (n > 0) {    //攻撃範囲を表示
          lineW(3);
          sCir(cx, cy, CARD_RADIUS[n-1], "cyan");
        }
        if (tapC == 1) {
          tapC = 0;
          if (n == 0 && stage[y][x] == 0) {   //兵がいなくステージの敵の道以外なら
            if(card_power[sel_card]>= 100) {
              troop[y][x] = sel_card+1;
              tr_life[y][x] = CARD_LIFE[sel_card];
              card_power[sel_card] = 0;
            }
          }
          if (n > 0) {      //そこに兵がいるのなら
            card_power[n-1] += 50;    //カードパワーを半分プラス
            troop[y][x] = 0;    //兵を無くす
          }
        }
      }
      for (var i = 0; i < CARD_MAX; i++) {
        if (card_power[i] > 100) card_power[i] = 100; //魔力が上限を超えないように制限
      }
      action();
      if (gtime > 30*10 && gtime%45 == 0) setEnemy(); //１．５秒に一回
      if (gtime > 30*10 && gtime < 30*60 && gtime%10 == 0) setEnemy();  //総攻撃 １秒に３回 残り１０秒になると敵は出てこなくなる
      castle_x = 7*SIZE;
      castle_y = 10*SIZE;
      moveEnemy();
      var cp = 0;
      if (damege >= 30) cp = 1;
      if (damege >= 60) cp = 2;
      if (damege >= 90) cp = 3;
      drawImgTS(2, cp*96, 0, 96, 96, castle_x-12, castle_y-24, 96, 96);
      fText("DMG" + damege, 540, 820, 30, "white");
      gtime--;  //タイマーの値を減らす
      fText("TIME " + int(gtime/30/60) + ":" + digit0(int(gtime/30)%60, 2), 920, 30, 40, "white");
      if (damege >= 100) {  //城を壊される
        idx = 2;
        tmr = 0;
      }
      if (gtime == 0) { //シーズンクリア
        idx = 3;
        tmr = 0;
      }
    break;

    case 2: //ゲームオーバー
      if (tmr == 1) stopBgm();
      if (tmr == 2) playSE(2);
      fText("GAME OVER", 540, 360, 60, "red");
      if (tmr > 30*10) idx = 0;
    break;

    case 3: //シーズンクリア
      if (tmr == 1) stopBgm();
      if (tmr == 2) playSE(1);
      fText("SEASON CLEAR", 540, 360, 60, "cyan");
      if (tmr > 30*8) {
        if (season == 4) {
          idx = 4;
          tmr = 0;
        }
        else {
          season++;
          initVar();
          idx = 1;
          tmr = 0;
        }
      }
    break;

    case 4: //エンディング
      if (tmr == 1) playSE(3);
      fText("ALL SEASON CLEAR", 540, 360, 60, "pink");
      if (tmr > 30*12) {
        idx = 0;
        tmr = 0;
      }
    break;
  }
 
}