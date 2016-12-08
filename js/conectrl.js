(function() {
    var requestAnimationFrame = window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame;
        window.requestAnimationFrame = requestAnimationFrame;
    var cam,cone;
    window.addEventListener("load",function(event){
        cam = document.querySelector('#basecam');
        cone = document.querySelector('#cone');
        lookloop();
    });
    function lookloop(){
        window.requestAnimationFrame(lookloop);
        var camRotation = cam.getAttribute("rotation");
        cone.setAttribute('rotation',{x:-camRotation.x-90,y:-camRotation.y,z:-camRotation.z});
    }
})();
