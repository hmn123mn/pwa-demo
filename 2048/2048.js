// document.write(111);

function setCookie(cookieName,value){
	var date = new Date();
	date.setFullYear(date.getFullYear()+1);
	document.cookie = cookieName+'='+value+';expires='+date.toGMTString();
}

//返回角度
function GetSlideAngle(dx,dy) {
  return Math.atan2(dy,dx) * 180 / Math.PI;
}

//根据起点和终点返回方向 1：向上，2：向下，3：向左，4：向右,0：未滑动

function GetSlideDirection(startX,startY, endX, endY) {
  var dy = startY - endY;
  var dx = endX - startX;
  var result = 0;

  //如果滑动距离太短

  if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
     return result;
  }
  var angle = GetSlideAngle(dx, dy);
  if (angle >= -45 && angle < 45) {
     result = 4;
  }else if (angle >= 45 && angle < 135) {
     result = 1;
  }else if (angle >= -135 && angle < -45) {
     result = 2;
  }else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
     result = 3;
  }
  return result;
}


function getCookie(cookieName){
	var str = document.cookie;
	var i = -1;
	if (str.indexOf(cookieName)!=-1) {
		i = str.indexOf(cookieName);
		var start = i+cookieName.length+1;
		var end = str.indexOf(';',start);
		return str.slice(start,end==-1?str.length:end);
	}else{
		return null;
	}
}



var game = {
	data:null,  //保存一个二维数组
	RN:4,	//总行数
	CN:4,	//总列数
	score:0,	//分数
	state:1,
	RUNNING:1,
	GAMEOVER:0,
	PALYING:2,
	top:0,
	CSIZE:100,	//每个格子宽高
	OFFSET:16,

	init:function(){
		var width = this.CN*(this.CSIZE+this.OFFSET)+this.OFFSET;
		var height = this.RN*(this.CSIZE+this.OFFSET)+this.OFFSET;

		gridPanel.style.width = width+'px';
		gridPanel.style.height = height+'px';

		var arr = [];
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				arr.push(''+r+c);
			}
		}

		gridPanel.innerHTML = '<div id="g'+arr.join('" class="grid"></div><div id="g')+'" class="grid"></div>';

		gridPanel.innerHTML += '<div id="c'+arr.join('" class="cell"></div><div id="c')+'" class="cell"></div>';
	},

	star:function(){	//启动游戏
		this.init();
		this.top = getCookie('top')||0;
		this.state = this.RUNNING;	//初始化游戏状态为运行中
		this.score = 0;
		this.data = [];
		for(var r=0;r<this.RN;r++){
			this.data.push([]);
			for(var c=0;c<this.CN;c++){
				this.data[r][c] = 0;
			}
		}
		this.randomNum();
		this.randomNum();
		this.updateView();
		this.bindMobile();
		console.log(this.data.join('\n'));
		var _this = this;
		document.onkeydown = function(e){
			if (_this.state==_this.RUNNING) {
				switch(e.keyCode){
					case 37:_this.moveLeft();break;
					case 38:_this.moveTop();break;
					case 39:_this.moveRight();break;
					case 40:_this.moveDown();break;
				}
			}
		}
	},

	bindMobile:function(){
		var _this = this;
		var h = document.documentElement.clientHeight,
        mybody = document.getElementsByTagName('body')[0];
        mybody.style.height = h + 'px';

        //滑动处理

        var startX, startY;
        mybody.addEventListener('touchstart', function (ev){
          ev.preventDefault();
          startX = ev.touches[0].pageX;
          startY = ev.touches[0].pageY; 
        }, false);

        mybody.addEventListener('touchmove', function (ev){
	   	  var endX, endY;
	      ev.preventDefault();
	      endX = ev.changedTouches[0].pageX;
	      endY = ev.changedTouches[0].pageY;


        var direction = GetSlideDirection(startX, startY, endX, endY);
        if (_this.state==_this.RUNNING) {
	        switch (direction){
	          case 0:
	            // alert("没滑动");
	            break;
	          case 1:
	          	_this.moveTop();
	            break;
	          case 2:
	            _this.moveDown();
	            break;
	          case 3:
	            _this.moveLeft();
	            break;
	          case 4:
	            _this.moveRight();
	            break;
	          default:          
	        }
	    } 
      }, false);
	},

	move:function(fun){
		var before = String(this.data);
		fun.call(this);

		var after = String(this.data);
		if (before!=after) {
			this.state = this.PALYING;
			animation.startMove(function(){
				this.randomNum();
				if (this.isGameOver()) {
					this.state = this.GAMEOVER;
					this.score>this.top&&setCookie('top',this.score);
				}
				else{
					this.state = this.RUNNING;
				}
				this.updateView();
			}.bind(this));
		}
	},

	moveLeft:function(){
		
		this.move(function(){
					for(var r=0;r<this.RN;r++){
		 			this.moveLeftInRow(r);
		 			}});
		
	},
	moveLeftInRow:function(r){
		for(var c=0;c<this.CN-1;c++){
			var nextc = this.getNextInRow(r,c);
			if (nextc==-1) {break;}
			else{
				if (this.data[r][c]==0) {
					this.data[r][c] = this.data[r][nextc];
					animation.addTask(r,nextc,r,c);
					this.data[r][nextc] = 0;
					c--;
				}
				else if(this.data[r][c]==this.data[r][nextc]){
					this.data[r][c] = this.data[r][c]*2;
					this.score += this.data[r][c];
					animation.addTask(r,nextc,r,c);
					this.data[r][nextc] = 0;
				}
			}
		}
	},
	getNextInRow:function(r,c){
		for(var nextc = c+1;nextc<this.CN;nextc++){
			if (this.data[r][nextc]!=0) {
				return nextc;
			}
		}
		return -1;
	},


	moveRight:function(){
		this.move(function(){
			for(var r=0;r<this.RN;r++){
			this.moveRightInRow(r);
		}})
	},
	moveRightInRow:function(r){
		for(var c=this.CN-1;c>0;c--){
			var nextc = this.getNextInRowRight(r,c);
			if (nextc==-1) {break;}
			else{
				if (this.data[r][c]==0) {
					this.data[r][c] = this.data[r][nextc];
					animation.addTask(r,nextc,r,c);
					this.data[r][nextc] = 0;
					c++;
				}
				else if(this.data[r][c]==this.data[r][nextc]){
					this.data[r][c] = this.data[r][c]*2;
					this.score += this.data[r][c];
					animation.addTask(r,nextc,r,c);
					this.data[r][nextc] = 0;
				}
			}
		}
	},
	getNextInRowRight:function(r,c){
		for(var nextc = c-1;nextc>=0;nextc--){
			if (this.data[r][nextc]!=0) {
				return nextc;
			}
		}
		return -1;
	},



	moveTop:function(){
		this.move(function(){
			for(var c=0;c<this.CN;c++){
			this.moveTopInRow(c);
		}
		});
		
	},
	moveTopInRow:function(c){
		for(var r=0;r<this.RN-1;r++){
			var nextr = this.getNextInRowTop(r,c);
			if (nextr==-1) {break;}
			else{
				if (this.data[r][c]==0) {
					this.data[r][c] = this.data[nextr][c];
					animation.addTask(nextr,c,r,c);
					this.data[nextr][c] = 0;
					r--;
				}
				else if(this.data[r][c]==this.data[nextr][c]){
					this.data[r][c] = this.data[r][c]*2;
					this.score += this.data[r][c];
					animation.addTask(nextr,c,r,c);
					this.data[nextr][c] = 0;
				}
			}
		}
	},
	getNextInRowTop:function(r,c){
		for(var nextr = r+1;nextr<this.RN;nextr++){
			if (this.data[nextr][c]!=0) {
				return nextr;
			}
		}
		return -1;
	},


	moveDown:function(){
		this.move(function(){
			for(var c=0;c<this.CN;c++){
			this.moveDownInRow(c);
		}
		})
	},
	moveDownInRow:function(c){
		for(var r=this.RN-1;r>0;r--){
			var nextr = this.getNextInRowDown(r,c);
			if (nextr==-1) {break;}
			else{
				if (this.data[r][c]==0) {
					this.data[r][c] = this.data[nextr][c];
					animation.addTask(nextr,c,r,c);
					this.data[nextr][c] = 0;
					r++;
				}
				else if(this.data[r][c]==this.data[nextr][c]){
					this.data[r][c] = this.data[r][c]*2;
					this.score += this.data[r][c];
					animation.addTask(nextr,c,r,c);
					this.data[nextr][c] = 0;
				}
			}
		}
	},
	getNextInRowDown:function(r,c){
		for(var nextr = r-1;nextr>=0;nextr--){
			if (this.data[nextr][c]!=0) {
				return nextr;
			}
		}
		return -1;
	},

	isGameOver:function(){		
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				if (this.data[r][c]==0) {return false;}
				if (c<this.data[r].length-1 && this.data[r][c]==this.data[r][c+1]){return false;}
				if (r<this.data.length-1 && this.data[r][c]==this.data[r+1][c]){return false;}
			}
		}
		if (r==this.RN) {return true;}
	},

	
	updateView:function(){	//将data中的元素，更新到页面的格子div中
		topScore.innerHTML = this.top;
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				var odiv = document.getElementById('c'+r+c);
				if (this.data[r][c]==0) {
					odiv.innerHTML = '';
					odiv.className = 'cell';
				}else{
					odiv.innerHTML = this.data[r][c];
					odiv.className = 'cell n'+this.data[r][c];
				}
			}
		}

		document.getElementById('score').innerHTML = this.score;
		this.state==this.GAMEOVER && (document.getElementById('final').innerHTML = this.score);
		gameOver.style.display = (this.state==this.GAMEOVER)?'block':'none';
	},

	randomNum:function(){	//在随机位置生成一个数字
		while(1){
			var r = Math.round(Math.random()*(this.RN-1));
			var c = Math.round(Math.random()*(this.CN-1));
			if (this.data[r][c]==0) {
				var num = Math.random();
				this.data[r][c] = num>0.5?2:4;
				break;
			}
		}
	}
}

window.onload = function(){
	game.star();
}
