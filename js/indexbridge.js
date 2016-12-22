/*--------------------------------------------------------------------------*
 *  
 *  binding dblTap event for jQuery
 *  
 *  MIT-style license. 
 *  
 *  2010 Kazuma Nishihata 
 *  http://blog.webcreativepark.net/2010/09/08-204058.html
 *  
 *--------------------------------------------------------------------------*/
jQuery.event.special.dblTap = {
	setup : (function(){
		var flag = false;
		return function(){
			$(this).click(function(){
				if(flag){
					$(this).trigger("dblTap");
					flag = false;
				}else{
					flag = true;
				}
				setTimeout(function(){
					flag = false;
				},jQuery.event.special.dblTap.delay);
			})
		}
	})() , 
	delay : 500
}

var bridgeCtrl,vueApp

(function(){
    document.addEventListener('DOMContentLoaded',function(event){
        window.addEventListener('orientationchange',function(){
            bridgeCtrl.orientationChange();
            vueApp.hitCheckSlider.setOrientation();
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
              kind:'compound',
              zoom:8,
              targetFace:'cp50',
              scopeWakuVis:true,
              scopeling:{backgroundImage:'url(images/ring.svg)'},
              scopeDragPos:{x:0,y:0,z:0},
              tsumamiTex:'>|<',
              hitCheckSlider:{},
              geoCorrectioner:{},
              shootbut:true,
              deb:false
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
                initWorld:function(){
                    this.setTargetFace(this.targetFace);
                    this.setScopeKind(this.kind);
                    this.setZoom(this.zoom)
                },
                centerTrim:function(){
                    var camrotationObj = bridgeCtrl.baseframe.contentWindow.baseCtrl.cam.getAttribute('rotation');
                    var direct = bridgeCtrl.baseframe.contentWindow.baseCtrl.cam.getAttribute('direct');
                    var dragInteg = bridgeCtrl.baseframe.contentWindow.baseCtrl.cam.components['look-controls'].dragInteg;
                    
                    direct.y += degToRad(-camrotationObj.y)+dragInteg;
                    bridgeCtrl.baseframe.contentWindow.baseCtrl.cam.setAttribute('direct',direct);
                    function degToRad(n){
                        return n * Math.PI/180;
                    }
                    
                },
                clearShoot:function(){
                    bridgeCtrl.clearShoot();
                },
                setTargetFace:function(code){
                 this.targetFace=code;
                 bridgeCtrl.baseframe.contentWindow.baseCtrl.setTarget(code);
                 bridgeCtrl.scopeframe.contentWindow.scopeCtrl.setTarget(code);
            },
                setScopeKind:function(k){
                this.kind=k;
                
            },
                setZoom:function(n){
                    this.zoom=n;
                    switch(n){
                        case 4:
                            bridgeCtrl.setLensTimes(1.3);
                            break;
                        case 6:
                            bridgeCtrl.setLensTimes(1.8);
                            break;
                        case 8:
                            bridgeCtrl.setLensTimes(2.3);
                            break;
                    }
                    
                },
                setSliderZoom(n){
                    var min=1.2;
                    var max=4;
                    bridgeCtrl.setLensTimes((max-min)/100*n+min);
                }
            },
        mounted:function(){
            this.hitCheckSlider = new HitCheckSlider(this);
            this.geoCorrectioner = new GeoCorrectioner(this);
            
            $('#shootbut').on('touchstart',function(){
                bridgeCtrl.shoot();
            });
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
                //landscape
            }else{
                orientationDo(true);
                //portrait
            }
            function orientationDo(b){
            if(!this.baseframe)return;
            var param={},param2={};
            if(!b){
                param = this.baseframe.contentWindow.baseCtrl.cam.getAttribute("camera");
                param.fov = "2.96";
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
                    break;
                case '#scopeframe':
                    this.scopeframe = document.querySelector('#scopeframe');
                    break;
            }
        if(this.baseframe&&this.scopeframe){
            var self=this;
            setTimeout(function(){
                self.orientationChange();
                vueApp.initWorld();
            })
        }
        }
    bridge.prototype.linkRotation = function(obj){
        if(!vueApp.scopeWakuVis){
           obj = vueApp.scopeDragPos;
            //$('#deb').text('x'+obj.x+';y:'+obj.y+';z:'+obj.x);
        }
        if(this.scopeframe){
            if(this.scopeframe.contentWindow.scopeCtrl)            this.scopeframe.contentWindow.scopeCtrl.setRotation(obj);
        }
        
      /*  $("#deb").html('yaw.y:'+this.baseframe.contentWindow.baseCtrl.cam.components['look-controls'].yawObject.rotation.y+'<br>dragInteg:'+this.baseframe.contentWindow.baseCtrl.cam.components['look-controls'].dragInteg+'<br>direct.y:'+this.baseframe.contentWindow.baseCtrl.cam.getAttribute('direct').y+'<br>camrota.y:'+this.baseframe.contentWindow.baseCtrl.cam.getAttribute('rotation').y);*/
    }
    bridge.prototype.setLensTimes = function(n){
        if(this.scopeframe){
            if(this.scopeframe.contentWindow.scopeCtrl) {
            var lens = this.scopeframe.contentWindow.scopeCtrl.cam
            var dfo = lens.getAttribute("camera");
            dfo.zoom = n;
            lens.setAttribute('camera',dfo);
        }
        }
    }
    
    
    function HitCheckSlider(vueObj){
        this.position = '';
        this.setOrientation();
            var self=vueObj;
            var my=this;
            var $sliderbase = $('#sliderset');
            var $sliderbut = $('#sliderbutt');
            var $gard = $('#gard');
            this.sliderArea = {
                width:$sliderbase.width()-$sliderbut.width(),
                height:$sliderbase.height()-$sliderbut.height()
            };
            var slideX = 0;
            var slideY = 0;
            var gardTouch = {x:0,y:0};
            
            
            $sliderbut.on('touchstart',function(ev){
                ev.preventDefault();
                ev.stopPropagation();
                slideX = ev.targetTouches[0].clientX;
                slideY = ev.targetTouches[0].clientY;
                $sliderbut.removeClass("ret");
                self.scopeWakuVis=false;
                self.setSliderZoom(0);
            }).on('touchmove',function(ev){
                ev.preventDefault();
                ev.stopPropagation();
                var trans=my.position=="portrait"?ev.targetTouches[0].clientX-slideX:ev.targetTouches[0].clientY-slideY;
                slideX=ev.targetTouches[0].clientX;
                slideY=ev.targetTouches[0].clientY;
                //portrait;
                if(my.position=="portrait"){
                    var tox = $sliderbut.position().left+trans;
                    if(tox<0){
                        tox=0;
                    }else if(tox>my.sliderArea.width){
                        tox=my.sliderArea.width;
                    }
                    $sliderbut.css('left',tox+"px");
                    var par = tox/my.sliderArea.width*100;
                }else{
                    //landscape;
                    var toy = $sliderbut.position().top+trans;
                    if(toy<0){
                        toy=0;
                    }else if(toy>my.sliderArea.height){
                        toy=my.sliderArea.height;
                    }
                    $sliderbut.css('top',toy+"px");
                    var par = (my.sliderArea.height-toy)/my.sliderArea.height*100;
                }
                
                self.setSliderZoom(par);
            }).on('touchend',function(ev){
                ev.preventDefault();
                ev.stopPropagation();
                $sliderbut.addClass("ret");
                
                $sliderbut.css('top',"");
                $sliderbut.css('left',"");
                
                self.scopeWakuVis=true;
                self.setZoom(self.zoom);
                
                self.scopeDragPos.x=0;
                self.scopeDragPos.y=0;
                self.scopeDragPos.z=0;
            });
            
            $gard.on('touchstart',function(ev){ 
                //self.deb=true;               
                if(self.scopeWakuVis)return;
                ev.preventDefault();
                gardTouch.x = ev.targetTouches[0].clientX;
                gardTouch.y = ev.targetTouches[0].clientY;
            }).on('touchmove',function(ev){ 
                if(self.scopeWakuVis)return;
                ev.preventDefault();
                var dist={};
                //600pxで6deg
                dist.x= ev.targetTouches[0].clientX-gardTouch.x;
                dist.y= ev.targetTouches[0].clientY-gardTouch.y;
                gardTouch.x=ev.targetTouches[0].clientX;
                gardTouch.y=ev.targetTouches[0].clientY;
                dist.x = dist.x/100;
                dist.y = dist.y/100;
                dist.z = 0;
                self.scopeDragPos.x += dist.y;
                self.scopeDragPos.y += dist.x;
                self.scopeDragPos.z = 0;
            }).on('touchend',function(ev){
                //self.deb=false;
                if(self.scopeWakuVis)return;
                ev.preventDefault();
            });
    }
    HitCheckSlider.prototype.setOrientation = function(){
            var $sliderbase = $('#sliderset');
            var $sliderbut = $('#sliderbutt');
            this.sliderArea = {
                width:$sliderbase.width()-$sliderbut.width(),
                height:$sliderbase.height()-$sliderbut.height()
            };
        var self = this;
            if(Math.abs(window.orientation)===90){
                self.position = 'landscape';
                //landscape
            }else{
                self.position = 'portrait';
                //portrait
            }
    }
    
    function GeoCorrectioner(vueObj){
        this.position=0;
        var self = vueObj;
            var $dragsliderbase = $('#dragSliderset');
            var $dragsliderbut = $('#dragSliderbutt');
            var dragsliderArea = {
                width:$dragsliderbase.width()-$dragsliderbut.width(),
                height:$dragsliderbase.height()
            };
            
            var dragslideX=0;
            var dragZero = dragsliderArea.width/2;
            var dragMax = 0.00015;
            setZero()
            
            $dragsliderbase.on('dblTap',function(){
                setZero();
            });
            $dragsliderbut.on('touchstart',function(ev){
                ev.preventDefault();
                ev.stopPropagation();
                dragslideX = ev.targetTouches[0].clientX;
            }).on('touchmove',function(ev){
                ev.preventDefault();
                ev.stopPropagation();
                var trans=ev.targetTouches[0].clientX-dragslideX;
                dragslideX=ev.targetTouches[0].clientX;
                var tox = $dragsliderbut.position().left+trans;
                if(tox<0){
                    tox=0;
                }else if(tox>dragsliderArea.width){
                    tox=dragsliderArea.width;
                }
                $dragsliderbut.css('left',tox+"px");
                setPos(tox);
            }).on('touchend',function(ev){
                ev.preventDefault();
                ev.stopPropagation();
            });
        function setZero(){
            $dragsliderbut.css('left',dragZero+"px");
            setPos(dragZero);
        }
        function setPos(tox){
                var diff = tox-dragZero;
                diff = (Math.abs(diff)<1)?0:diff;
                if(diff == 0){
                    $dragsliderbut.text(">|<");
                }else if(diff<0){
                    $dragsliderbut.text(">| ");
                }else if(diff>0){
                    $dragsliderbut.text(" |<");
                }
                var draglength = -diff/dragZero*dragMax;
              
            if(bridgeCtrl.baseframe){  
              bridgeCtrl.baseframe.contentWindow.baseCtrl.cam.setAttribute('dragging',draglength);
            }
        }
    }
})();