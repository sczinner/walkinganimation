/*jshint esversion: 6 */

let chart, stats;
let inside_points, total_points;
let ctx, canvas;

class Sketch {
  constructor(canvas, ctx, fps) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.setFps(fps);
  }

  setFps(fps) {
    // set fps
    this.fps = fps || 60;
    // keep track of time to handle fps
    this.then = performance.now();
    // time between frames
    this.fps_interval = 1 / this.fps;
  }

  run() {
    // bootstrap the sketch
    this.setup();
    // anti alias
    this.ctx.imageSmoothingQuality = "high";
    this.timeDraw();
  }

  timeDraw() {
    // request another frame
    window.requestAnimationFrame(this.timeDraw.bind(this));
    let diff;
    diff = performance.now() - this.then;
    // if (diff < this.fps_interval) {
    // // not enough time has passed, so we request next frame and give up on this render
    //   return;
    // }
    // updated last frame rendered time
    this.then = performance.now();
    // now draw
    this.ctx.save();
    this.draw();
    this.ctx.restore();
  }

  background(color) {
    // reset background
    // reset canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
    // set background
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setup() {
    this.floorheight = 650;
    this.leglength=100;
    this.startx=150;

    var leg1={id:1, x1:this.startx, y1:this.floorheight-this.leglength,
       x2:this.startx,y2:this.floorheight,colour:"red"};
    var leg2={id:2, x1:this.startx, y1:this.floorheight-this.leglength,
        x2:this.startx,y2:this.floorheight,colour:"blue"};
    var floor={id:3, x1:0, y1:this.floorheight,
          x2:this.ctx.canvas.width,y2:this.floorheight,colour:"white"};

    this.bodylength=100;
    var body={id:4, x1:this.startx, y1:this.floorheight-this.leglength-this.bodylength,
             x2:this.startx,y2:this.floorheight-this.leglength,colour:"green"};

  this.armheight=75;//height from top of leg
  this.armlength=75;
   var arm1={id:5, x1:this.startx, y1:this.floorheight-this.leglength-this.armheight-this.armlength,
      x2:this.startx,y2:this.floorheight-this.armheight,colour:"red"};
      var arm2={id:6, x1:this.startx, y1:this.floorheight-this.leglength-this.armheight-this.armlength,
         x2:this.startx,y2:this.floorheight-this.armheight,colour:"blue"};

    this.headsize = 30;
    this.head = {id:7, x:this.startx,
      y:this.floorheight-this.leglength-this.bodylength-this.headsize,r:this.headsize,colour:"purple"}

    this.sticks = {floor:floor,leg1:leg1, leg2:leg2, body:body,arm1:arm1,arm2:arm2}

    this.leg1onground=true;
    this.legangle=0;///from -vertical (because +y is down)
    this.hinge = 20;
    this.leganglespeed=1;
    this.maxlegangle=20;
    this.direction=1;
  }



  draw() {
    this.background("black");

    for(var propt in this.sticks){
      this.drawStick(this.sticks[propt]);
    }
    //draw head
    this.solidCirc(this.head.x,this.head.y,this.head.r,this.head.colour)


    this.moveLegs();
    this.moveBody();
    this.moveArms();
    this.moveHead();

    if(this.sticks["leg1"].x1>this.ctx.canvas.width||this.sticks["leg1"].x1<0){
      this.changeDirection();
    }

    }

  changeDirection(){
    this.direction*=-1;
    var leg1=this.sticks["leg1"];
    this.sticks["leg1"]=this.sticks["leg2"];
    this.sticks["leg2"]=leg1;
  }
  drawStick(stick){
    this.drawLine(stick.x1,stick.y1,stick.x2,stick.y2,stick.colour);
  }
  moveHead(){
    this.head.x=this.sticks['leg1'].x1;

    this.head.y=this.sticks['leg1'].y1-this.bodylength-this.headsize;
  }

  moveArms(){
    //move arm opposite leg etc
    this.sticks['arm1'].x1=this.sticks['leg1'].x1;
    this.sticks['arm2'].x1=this.sticks['leg1'].x1;

    this.sticks['arm1'].y1=this.sticks['leg1'].y1-this.armheight;
    this.sticks['arm2'].y1=this.sticks['leg1'].y1-this.armheight;

    var armtolegratio = this.armlength/this.leglength

    var dx1 = (this.sticks['leg2'].x2-this.sticks['leg2'].x1)*armtolegratio
    var dy1 = (this.sticks['leg2'].y2-this.sticks['leg2'].y1)*armtolegratio
    this.sticks['arm1'].x2=this.sticks['arm1'].x1+dx1;
    this.sticks['arm1'].y2=this.sticks['arm1'].y1+dy1;;

    var dx2 = (this.sticks['leg1'].x2-this.sticks['leg1'].x1)*armtolegratio
    var dy2 = (this.sticks['leg1'].y2-this.sticks['leg1'].y1)*armtolegratio
    this.sticks['arm2'].x2=this.sticks['arm2'].x1+dx2;
    this.sticks['arm2'].y2=this.sticks['arm2'].y1+dy2;;
  }
  moveBody(){
    this.sticks['body'].x1=this.sticks['leg1'].x1;
    this.sticks['body'].x2=this.sticks['leg1'].x1;

    this.sticks['body'].y1=this.sticks['leg1'].y1-this.bodylength;
    this.sticks['body'].y2=this.sticks['leg1'].y1;
  }
  moveLegs(){
    if(this.legangle<this.maxlegangle){
      this.legangle+=this.leganglespeed;
    }else{
      this.legangle=-this.maxlegangle+this.leganglespeed;
      this.leg1onground=!this.leg1onground;
    }
    var groundfootx = 0;
    var groundfooty = 0;
    var airfootx = 0;
    var airfooty = 0;
    var hipx = 0;
    var hipy = 0;
    var groundleg = "";
    var airleg = "";
    if(this.leg1onground){
      groundleg = "leg1";
      airleg = "leg2";
    }else{
      groundleg = "leg2";
      airleg = "leg1";
    }
    groundfootx = this.sticks[groundleg].x2;
    groundfooty =  this.sticks[groundleg].y2;
    if(this.direction==1){
       hipx = groundfootx + Math.sin(this.legangle*Math.PI/180)*this.leglength;
       airfootx = this.sticks[groundleg].x2 + 2*Math.sin(this.legangle*Math.PI/180)*this.leglength;
    }else if(this.direction==-1){
       hipx = groundfootx - Math.sin(this.legangle*Math.PI/180)*this.leglength;
       airfootx = this.sticks[groundleg].x2 - 2*Math.sin(this.legangle*Math.PI/180)*this.leglength;
    }

    hipy = groundfooty - Math.cos(this.legangle*Math.PI/180)*this.leglength;
    airfooty = this.sticks[groundleg].y2;

    this.sticks[groundleg].x1 = hipx;
    this.sticks[groundleg].y1 = hipy;
    this.sticks[airleg].x1 = hipx;
    this.sticks[airleg].y1 = hipy;
    this.sticks[airleg].x2 = airfootx;

  }


  drawLine(x1,y1,x2,y2,col){
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    ctx.strokeStyle = col;
    this.ctx.stroke();
  }
  solidCirc(x,y,r,col){
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    this.ctx.fillStyle = col;
    this.ctx.fill();
  }

}
