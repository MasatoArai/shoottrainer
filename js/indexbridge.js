var bridgeCtrl,vueApp

(function(){
    document.addEventListener('DOMContentLoaded',function(event){
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
                setScopeKind:function(k){
                this.kind=k;
                
        },
                setZoom:function(n){
                    switch(n){
                        case 4:
                            bridgeCtrl.setLensTimes(2);
                            this.showMenu = false;
                            break;
                        case 6:
                            bridgeCtrl.setLensTimes(2.7);
                            this.showMenu = false;
                            break;
                        case 8:
                            bridgeCtrl.setLensTimes(3.5);
                            this.showMenu = false;
                            break;
                    }
                    
                }
            }});
    });
    function bridge(){
        this.baseframe;
        this.scopeframe;
    }
    bridge.prototype.setIframe = function(q){
            switch(q){
                case '#baseframe':
                    this.baseframe = document.querySelector('#baseframe');
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