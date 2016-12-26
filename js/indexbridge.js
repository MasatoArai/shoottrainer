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
            vueApp.geoCorrectioner.changeOri();
        });
        window.addEventListener('unload',function(){
           vueApp.setStrageData(); 
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
              initObj:{
                  kind:'compound',
                  zoom:8,
                  ring:false,
                  stabilize:30,
                  targetFace:'cp50'
              },
              showMenu:false,
              basesrc:"base.html",
              scopesrc:"scope.html",
              stabilize:30,
              kind:'compound',
              zoom:8,
              targetFace:'cp50',
              scopeWakuVis:true,
              scopering:{backgroundImage:'url(images/ring.svg)'},
              ring:true,
              scopeDragPos:{x:0,y:0,z:0},
              tsumamiTex:'>|<',
              hitCheckSlider:{},
              geoCorrectioner:{},
              stabilizeSlider:{},
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
                    this.setTargetFace(this.initObj.targetFace);
                    this.setScopeKind(this.initObj.kind);
                    this.setScopeRing(this.initObj.ring);
                    this.setZoom(this.initObj.zoom);
                    this.setStabilize(this.initObj.stabilize);
                    this.stabilizeSlider.setSlideBut(this.initObj.stabilize);
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
                 this.initObj.targetFace=code;
                 bridgeCtrl.baseframe.contentWindow.baseCtrl.setTarget(code);
                 bridgeCtrl.scopeframe.contentWindow.scopeCtrl.setTarget(code);
            },
                setScopeKind:function(k){
                this.kind=k;
                this.initObj.kind=k;
                
            },
                setScopeRing:function(b){
                    this.ring=b;
                    this.initObj.ring=b;
                },
                setStabilize:function(n){
                    this.stabilize = n;
                    this.initObj.stabilize = n;  bridgeCtrl.baseframe.contentWindow.baseCtrl.cam.setAttribute('stabilize',n);
                },
                setZoom:function(n){
                    this.zoom=n;
                    this.initObj.zoom = n;
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
                setSliderZoom:function(n){
                    var min=1.2;
                    var max=4;
                    bridgeCtrl.setLensTimes((max-min)/100*n+min);
                },
                getStrageData:function(){
                    var json = localStorage.getItem('initObj')
                    if(json == null)return;
                    var obj = $.parseJSON(json);
                    this.initObj.kind = obj.kind;
                    this.initObj.zoom = obj.zoom;
                    this.initObj.ring = obj.ring;
                    this.initObj.stabilize = obj.stabilize;
                    this.initObj.targetFace = obj.targetFace;
                },
                setStrageData:function(){
                    var json = JSON.stringify(this.initObj);
                    localStorage.setItem('initObj',json);
                }
            },
        mounted:function(){
            this.getStrageData();
            this.hitCheckSlider = new HitCheckSlider(this);
            this.geoCorrectioner = new GeoCorrectioner(this);
            this.stabilizeSlider = new StabilizeSlider(this);
            
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
        var me = this;
            var $dragsliderbase = $('#dragSliderset');
            var $dragsliderbut = $('#dragSliderbutt');
            this.dragsliderArea = {
                width:$dragsliderbase.width()-$dragsliderbut.width(),
                height:$dragsliderbase.height()
            };
            
            var dragslideX=0;
            this.dragZero = this.dragsliderArea.width/2;
            this.dragMax = 0.00015;
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
                }else if(tox>me.dragsliderArea.width){
                    tox=me.dragsliderArea.width;
                }
                $dragsliderbut.css('left',tox+"px");
                setPos(tox);
            }).on('touchend',function(ev){
                ev.preventDefault();
                ev.stopPropagation();
            });
        function setZero(){
            $dragsliderbut.css('left',me.dragZero+"px");
            setPos(me.dragZero);
        }
        function setPos(tox){
                var diff = tox-me.dragZero;
                diff = (Math.abs(diff)<1)?0:diff;
                if(diff == 0){
                    $dragsliderbut.text(">|<");
                }else if(diff<0){
                    $dragsliderbut.text(">| ");
                }else if(diff>0){
                    $dragsliderbut.text(" |<");
                }
                var draglength = -diff/me.dragZero*me.dragMax;
            me.position = draglength;
              
            if(bridgeCtrl.baseframe){    bridgeCtrl.baseframe.contentWindow.baseCtrl.cam.setAttribute('dragging',draglength);
            }
        }
    }
    GeoCorrectioner.prototype.changeOri = function(){
            var $dragsliderbase = $('#dragSliderset');
            var $dragsliderbut = $('#dragSliderbutt');
            this.dragsliderArea.width = $dragsliderbase.width()-$dragsliderbut.width();
            this.dragsliderArea.height = $dragsliderbase.height();
            this.dragZero = this.dragsliderArea.width/2
            
            var draglength = this.position/this.dragMax*this.dragZero;
            $dragsliderbut.css('left',-draglength+this.dragZero+"px");
    }
    function StabilizeSlider(vueObj){
        this.stabilizeStrength = 1;
            this.min=1;
            this.max=180;
        var self = vueObj;
            var my=this;
            this.position = 'portrait';
            var $sliderbase = $('#stabiSliderset');
            var $sliderbut = $('#stabiSliderbutt');
        
            this.sliderArea = {
                width:$sliderbase.width()-$sliderbut.width(),
                height:$sliderbase.height()-$sliderbut.height()
            };
            var slideX = 0;
            var slideY = 0;
            this.par=1;
        
            $sliderbut.on('touchstart',function(ev){
                ev.preventDefault();
                ev.stopPropagation();
                slideX = ev.targetTouches[0].clientX;
                slideY = ev.targetTouches[0].clientY;
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
                    my.par = tox/my.sliderArea.width;
                }else{
                    //landscape;
                    var toy = $sliderbut.position().top+trans;
                    if(toy<0){
                        toy=0;
                    }else if(toy>my.sliderArea.height){
                        toy=my.sliderArea.height;
                    }
                    $sliderbut.css('top',toy+"px");
                    my.par = (my.sliderArea.height-toy)/my.sliderArea.height;
                }                
            }).on('touchend',function(ev){
                ev.preventDefault();
                ev.stopPropagation();
                stabiNum(my.par);
            });
        function stabiNum(p){
            var min=my.min;
            var max=my.max;
            var area=max-min;
            var sep = Math.floor(area*p);
            self.setStabilize(sep+min);
        }
    }
    StabilizeSlider.prototype.setSlideBut=function(n){
        var self = this;
        function getPar(f){
            var area=self.max-self.min;
            return f/area;
        }
        var p=getPar(n);
            var $sliderbut = $('#stabiSliderbutt');
            if(this.position=="portrait"){
                var tox = this.sliderArea.width*p;
                        $sliderbut.css('left',tox+"px");
            }else{
                var toy = this.sliderArea.height*p;
                        $sliderbut.css('top',toy+"px");
            }
        };
})();