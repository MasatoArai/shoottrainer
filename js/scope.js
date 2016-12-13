var scopeCtrl;
(function(){
    window.addEventListener("load",function(event){
        scopeCtrl=new Ctrl();
    });
    function Ctrl(){
        this.cam=document.querySelector('#scopecam');
        parent.bridgeCtrl.setIframe('#scopeframe');
        this.targetFaces = document.querySelectorAll('.targetface');
        this.arrows=[];
        this.$hitarrows = $('#hitarrows');
        this.enableFace;
        for(var i=0;i<this.targetFaces.length;i++){
            this.targetFaces[i].setAttribute('visible','false');
        }
        this.setTarget('cp50');
    }
    Ctrl.prototype.setRotation = function(obj){
        this.cam.setAttribute('rotation',obj);
    };
    Ctrl.prototype.setTarget = function(targettype){
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
    
    Ctrl.prototype.shoot = function(){
        var leng=10;
        var shaft = 0.8;
        var ro = this.cam.getAttribute("rotation");
        var y = leng*Math.tan(ro.x*Math.PI/180);
        //var y=yl*Math.sin(ro.z*Math.PI/180);
        var x = -(leng*Math.tan(ro.y*Math.PI/180));
        //var x=xl*Math.sin(ro.z*Math.PI/180);
        var pos={x:x,y:y,z:leng};
        
        this.arrows.push($('<a-circle color="#000" radius="0.003" position="'+x+' '+y+' '+-leng+'"><a-circle color="#00ff14" radius="0.002" position="0 0 0.001"></a-circle></a-circle>').appendTo(this.$hitarrows));
    }
    Ctrl.prototype.clearShoot = function(){
        this.arrows.forEach(function(el,i,arr){
            el.remove();
        });
        this.arrows=[];
    }
})();