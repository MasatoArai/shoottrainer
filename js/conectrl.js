var baseCtrl;

(function() {
    var requestAnimationFrame = window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame;
        window.requestAnimationFrame = requestAnimationFrame;
    window.addEventListener("load",function(event){
        /*baseCtrl = new BaseCtrl();
        baseCtrl.startLoop();*/
    });
    function BaseCtrl(){
        this.cam = document.querySelector('#basecam');
        this.cone = document.querySelector('#cone');
        this.directcone = document.querySelector('#directcone');
        parent.bridgeCtrl.setIframe('#baseframe');
    }
    BaseCtrl.prototype.startLoop = function(){
        var self = this;
        lookloop();
        function lookloop(){
            window.requestAnimationFrame(lookloop);
            var camRotation = self.cam.getAttribute("rotation");
            var srad = Math.atan2(camRotation.y,camRotation.x)*180/Math.PI;
            self.cone.setAttribute('rotation',{x:-camRotation.x-90,y:-camRotation.y,z:-camRotation.z});
            self.directcone.setAttribute('rotation',{x:0,y:0,z:srad-180});
            parent.bridgeCtrl.linkRotation(camRotation);
        }
    }
})();
