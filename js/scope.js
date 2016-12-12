var scopeCtrl;
(function(){
    window.addEventListener("load",function(event){
        scopeCtrl=new Ctrl();
    });
    function Ctrl(){
        this.cam=document.querySelector('#scopecam');
        parent.bridgeCtrl.setIframe('#scopeframe');
        this.targetFaces = document.querySelectorAll('.targetface');
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
})();