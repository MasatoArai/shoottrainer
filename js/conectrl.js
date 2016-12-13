var baseCtrl;
var baseVue
(function() {
    var requestAnimationFrame = window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame;
        window.requestAnimationFrame = requestAnimationFrame;
    window.addEventListener("load",function(event){
        baseCtrl = new BaseCtrl();
        baseCtrl.setToBridge();
        baseCtrl.startLoop();
    });
    function BaseCtrl(){
        this.cam = document.querySelector('#basecam');
        this.cone = document.querySelector('#cone');
        this.directcone = document.querySelector('#directcone');
        this.targetFaces = document.querySelectorAll('.targetface');
        this.enableFace;
        this.setTarget('cp50');
        this.$hitarrows = $('#hitarrows');
        this.arrows =[];
    }
    BaseCtrl.prototype.setToBridge = function(){
        parent.bridgeCtrl.setIframe('#baseframe');
    }
    BaseCtrl.prototype.setTarget = function(targettype){
        if(this.enableFace)this.enableFace.setAttribute('visible','false');
        switch(targettype){
            case 'rc70':
                this.enableFace = this.targetFaces[0];
                break;
            case 'cp50':
                this.enableFace = this.targetFaces[1];
                break;
            case 'id18':
                this.enableFace = this.targetFaces[2];
                break;
        }
        this.enableFace.setAttribute('visible','true');
    };
    BaseCtrl.prototype.startLoop = function(){
        var self = this;
        lookloop();
        function lookloop(){
            window.requestAnimationFrame(lookloop);
            var camRotation = self.cam.getAttribute("rotation");
            var srad = Math.atan2(camRotation.y,camRotation.x)*180/Math.PI;
            self.cone.setAttribute('rotation',{x:-camRotation.x-90,y:-camRotation.y,z:-camRotation.z});
            self.directcone.setAttribute('rotation',{x:0,y:0,z:srad-180});
            if(getDriftDistance(camRotation.x,camRotation.y)<1){
                self.directcone.setAttribute('visible',false);
            }else if(!self.directcone.getAttribute('visible')){
                self.directcone.setAttribute('visible',true);
            }
            parent.bridgeCtrl.linkRotation(camRotation);
        }
        
          function getDriftDistance(dx,dy){
             return Math.sqrt(dx*dx+dy*dy);
          }
    }
    BaseCtrl.prototype.shoot = function(){
        var leng=10;
        var shaft = 0.8;
        var ro = this.cam.getAttribute("rotation");
        var y = leng*Math.tan(ro.x*Math.PI/180);
        //var y=yl*Math.sin(ro.z*Math.PI/180);
        var x = -(leng*Math.tan(ro.y*Math.PI/180));
        //var x=xl*Math.sin(ro.z*Math.PI/180);
        var pos={x:x,y:y,z:leng};
        
        this.arrows.push($('<a-circle color="#000" radius="0.004" position="'+x+' '+y+' '+-leng+'"><a-circle color="#00ff14" radius="0.003" position="0 0 0.001"></a-circle></a-circle>').appendTo(this.$hitarrows));
    }
    BaseCtrl.prototype.clearShoot = function(){
        this.arrows.forEach(function(el,i,arr){
            el.remove();
        });
        this.arrows=[];
    }
})();
