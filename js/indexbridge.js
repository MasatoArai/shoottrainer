var bridgeCtrl,vueApp

(function(){
    document.addEventListener('DOMContentLoaded',function(event){
        window.addEventListener('orientationchange',function(){
            bridgeCtrl.orientationChange();
        });
        document.addEventListener('keydown',function(ev){
            var keycode = ev.keyCode;
            if(keycode == 13){
                if(bridgeCtrl){
                    bridgeCtrl.shoot();
                }
            }
        });
        bridgeCtrl=new bridge();
        vueApp = new Vue({
          el: '#base_wrapper',
          data: {
              showMenu:false,
              basesrc:"base.html",
              scopesrc:"scope.html",
              kind:'compound'
          },
            computed:{
            scopewaku:function(){
                var obj={};
                switch(this.kind){
                case 'compound':
                obj={backgroundImage:"url(images/scope.png)",
                    backgroundSize:'contain'};
                break;
                case 'recurv':
                obj={backgroundImage:"url(images/recpin.png)",
                    backgroundSize:'50%'};
                break;
            }
                return obj;
        }
            
        },
            methods: {
                clearShoot:function(){
                    bridgeCtrl.clearShoot();
                },
                setTargetFace:function(code){
                 bridgeCtrl.baseframe.contentWindow.baseCtrl.setTarget(code);
                 bridgeCtrl.scopeframe.contentWindow.scopeCtrl.setTarget(code);
            },
                setScopeKind:function(k){
                this.kind=k;
                
            },
                setZoom:function(n){
                    switch(n){
                        case 4:
                            bridgeCtrl.setLensTimes(1.6);
                            break;
                        case 6:
                            bridgeCtrl.setLensTimes(1.9);
                            break;
                        case 8:
                            bridgeCtrl.setLensTimes(2.3);
                            break;
                    }
                    
                }
            }});
    });
    function bridge(){
        this.baseframe;
        this.scopeframe;
    }
    bridge.prototype.shoot = function(){
        this.baseframe.contentWindow.baseCtrl.shoot();
        this.scopeframe.contentWindow.scopeCtrl.shoot();
    }
    bridge.prototype.clearShoot = function(){
        this.baseframe.contentWindow.baseCtrl.clearShoot();
        this.scopeframe.contentWindow.scopeCtrl.clearShoot();
        
    }
    bridge.prototype.orientationChange = function(){
            if(Math.abs(window.orientation)===90){
                orientationDo(false);
            }else{
                orientationDo(true);
            }
            function orientationDo(b){
            if(!this.baseframe)return;
            var param={},param2={};
            if(!b){
                param = this.baseframe.contentWindow.baseCtrl.cam.getAttribute("camera");
                param.fov = "2.6";
                this.baseframe.contentWindow.baseCtrl.cam.setAttribute('camera',param);
                param2 = bridgeCtrl.baseframe.contentWindow.baseCtrl.cone.getAttribute("position");
                param2.x=-0.08;
                param2.y=0; bridgeCtrl.baseframe.contentWindow.baseCtrl.cone.setAttribute("position",param2);bridgeCtrl.baseframe.contentWindow.baseCtrl.directcone.setAttribute("position",param2);
            }else{
                param = this.baseframe.contentWindow.baseCtrl.cam.getAttribute("camera");
                param.fov = "4.4563384";
                this.baseframe.contentWindow.baseCtrl.cam.setAttribute('camera',param);
                param2 = bridgeCtrl.baseframe.contentWindow.baseCtrl.cone.getAttribute("position");
                param2.x=0;
                param2.y=0.08; bridgeCtrl.baseframe.contentWindow.baseCtrl.cone.setAttribute("position",param2);bridgeCtrl.baseframe.contentWindow.baseCtrl.directcone.setAttribute("position",param2);
            }
        }
    }
    bridge.prototype.setIframe = function(q){
            switch(q){
                case '#baseframe':
                    this.baseframe = document.querySelector('#baseframe');
                    this.orientationChange();
                    break;
                case '#scopeframe':
                    this.scopeframe = document.querySelector('#scopeframe');
                    break;
            }
        }
    bridge.prototype.linkRotation = function(obj){
        if(this.scopeframe){
            this.scopeframe.contentWindow.scopeCtrl.setRotation(obj);
        }
    }
    bridge.prototype.setLensTimes = function(n){
        if(this.scopeframe){
            var lens = this.scopeframe.contentWindow.scopeCtrl.cam
            var dfo = lens.getAttribute("camera");
            dfo.zoom = n;
            lens.setAttribute('camera',dfo);
        }
    }
    
})();