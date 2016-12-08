(function() {
    var requestAnimationFrame = window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame;
        window.requestAnimationFrame = requestAnimationFrame;
    var cam,cone;
    window.addEventListener("load",function(event){
        cam = document.querySelector('#basecam');
        cone = document.querySelector('#cone');
        directcone = document.querySelector('#directcone');
        lookloop();
    });
    function lookloop(){
        window.requestAnimationFrame(lookloop);
        var camRotation = cam.getAttribute("rotation");
        var srad = Math.atan2(camRotation.y,camRotation.x)*180/Math.PI;
        cone.setAttribute('rotation',{x:-camRotation.x-90,y:-camRotation.y,z:-camRotation.z});
        directcone.setAttribute('rotation',{x:0,y:0,z:srad-180});
    }
})();
