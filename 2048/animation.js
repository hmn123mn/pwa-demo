
var animation={
  DURATION:1000,
  STEPS:50,
  interval:0,
  moved:0,
  timer:null,
  tasks:[],
  CSIZE:100,  //每个格子宽度
  OFFSET:16,  //间隔宽度

  init:function(){//初始化
    this.interval=this.DURATION/this.STEPS;
  },
  
  addTask:function(currR,currC,tagR,tagC){
    
    var cell=document.getElementById("c"+currR+currC);
    var distanceL=(tagC-currC)*(this.CSIZE+this.OFFSET);
    var stepL=distanceL/this.STEPS;
    var distanceT=(tagR-currR)*(this.CSIZE+this.OFFSET);
    var stepT=distanceT/this.STEPS;
    this.tasks.push({cell:cell,stepL:stepL,stepT:stepT});
  },
  startMove:function(fun){
    this.timer=
      setInterval(this.move.bind(this,fun),this.interval);
  },
  move:function(fun){//移动每一步
    for(var i=0;i<this.tasks.length;i++){
      var cell=this.tasks[i].cell;
      var left=parseFloat(getComputedStyle(cell).left);
      var top=parseFloat(getComputedStyle(cell).top);
      cell.style.left=left+this.tasks[i].stepL+"px";
      cell.style.top=top+this.tasks[i].stepT+"px";
    }
    this.moved++;
    if(this.moved==this.STEPS){
      this.moved=0;
      for(var i=0;i<this.tasks.length;i++){
        this.tasks[i].cell.style.left="";
        this.tasks[i].cell.style.top="";
      }
      this.tasks=[];
      clearInterval(this.timer);
      fun();
    }
  }
}