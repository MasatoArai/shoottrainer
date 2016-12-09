var scopeCtrl;
(function(){
    window.addEventListener("load",function(event){
        scopeCtrl=new Ctrl();
    });
    function Ctrl(){
        this.cam=document.querySelector('#scopecam');
        parent.bridgeCtrl.setIframe('#scopeframe');
    }
    Ctrl.prototype.setRotation = function(obj){
        this.cam.setAttribute('rotation',obj);
    }
})();