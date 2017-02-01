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
        window.addEventListener('unload',function(){
           vueApp.setStrageData(); 
        });
        document.addEventListener('keydown',function(ev){
            var keycode = ev.keyCode;
            if(keycode == 13){
                if(vueApp){
                    vueApp.arrowShoot();
                }
            }
        });
        bridgeCtrl=new bridge();
        vueApp = new Vue({
          el: '#base_wrapper',
          data: {
              tmpData:0,
              initObj:{
                  kind:'compound',
                  zoom:8,
                  pin:true,
                  mark:true,
                  onRing:true,
                  onDot:true,
                  markColor:'orange',
                  ring:{r:20,lwidth:5},
                  dot:{r:10},
                  stabilize:30,
                  targetFace:'cp50',
                  brightness:100,
                  sBokeh:0,
                  tBokeh:0
              },
              orientation:"portrait",
              orientationRotate:0,
              northDir:-1,
              centerTrimDeg:NaN,
              centerDirByNorth:0,
              showMenu:false,
              basesrc:"base.html",
              scopesrc:"scope.html",
              scopeWakuVis:true,
              scopeDragPos:{x:0,y:0,z:0},
              tsumamiTex:'>|<',
              hitCheckSlider:{},
              geoCorrectioner:{},
              stabilizeSlider:{},
              ringRadiusslider:{},
              dotRadiusslider:{},
              brightslider:{},
              sbokehslider:{},
              tbokehslider:{},
              sliderFor:"",
              shootbut:true,
              colors:{
                  orange:'#ff9242',
                  yellow:'#e2ff42',
                  green:'#51ff42',
                  black:'#000',
                  frost:'rgba(244, 252, 255, 0.95)'
              },
              deb:false,
              debtext:""
          },
            computed:{
                scopewaku:function(){
                    var obj={};
                    switch(this.initObj.kind){
                    case 'compound':
                    obj={backgroundImage:"url(images/scope.png)",
                        filter:'brightness('+(this.initObj.brightness/100)+')'+(this.initObj.sBokeh>0?'blur('+this.initObj.sBokeh+'px)':'')};
                    break;
                    case 'recurv':
                    obj={backgroundImage:"url(images/recpin.png)",
                        filter:'brightness('+(this.initObj.brightness/100)+')'+(this.initObj.sBokeh>0?'blur('+this.initObj.sBokeh+'px)':''),
                        backgroundSize:'50%'};
                    break;
                }
                    return obj;
            },
                ring:function(){
                    var val = this.initObj.ring;
                    var obj = {
                    gaikei:val.r*2+val.lwidth,
                    naikei:val.r*2-val.lwidth
                    };
                    return obj;
            },
                dot:function(){
                    var val = this.initObj.dot;
                    var obj = {
                        chokkei:val.r*2
                    }
                    return obj;
            },
                pretarget:function(){
                    var tar = this.initObj.targetFace;
                    var src="";
                    switch(tar){
                        case 'cp50':
                            src="images/target.png";
                            break;
                        case 'rc70':
                            src="images/target10.png";
                            break;
                        case 'id18':
                            src="images/threepoint.png";
                            break;
                    }
                    return src;
            }
          },
            methods: {
                initWorld:function(){
                    this.setTargetFace(this.initObj.targetFace);
                    this.setScopeKind(this.initObj.kind);
                    this.setScopeMark(this.initObj.mark);
                    this.setZoom(this.initObj.zoom);
                    this.setStabilize(this.initObj.stabilize);
                    this.stabilizeSlider.setSlideBut(this.initObj.stabilize);
                    this.brightslider.setSlideBut(this.initObj.brightness);
                    this.sbokehslider.setSlideBut(this.initObj.sBokeh);
                    this.tbokehslider.setSlideBut(this.initObj.tBokeh);
                },
                centerTrim:function(){
                    var camrotationObj = bridgeCtrl.baseframe.contentWindow.baseCtrl.cam.getAttribute('rotation');
                    var direct = bridgeCtrl.baseframe.contentWindow.baseCtrl.cam.getAttribute('direct');
                    var dragInteg = bridgeCtrl.baseframe.contentWindow.baseCtrl.cam.components['look-controls'].dragInteg;
                    
                    direct.y += degToRad(-camrotationObj.y)+dragInteg;
                    bridgeCtrl.baseframe.contentWindow.baseCtrl.cam.setAttribute('direct',direct);
                    
                    this.centerDirByNorth = this.northDir;
                    this.centerTrimDeg = radToDeg(direct.y);
                    
                    function degToRad(n){
                        return n * Math.PI/180;
                    }
                    function radToDeg(r){
                        return r * 360/(2*Math.PI);
                    }
                },
                getNorthDir:function(){
                    var self = this;
                    $(window).on('deviceorientation',function(ev){
                        var compassdir=ev.originalEvent.webkitCompassHeading||ev.originalEvent.alpha;
                        var north = compassdir;
                            //compassHeading(compassdir,ev.originalEvent.beta,ev.originalEvent.gamma);
                       if(self.orientation == "landscape"){
                            north=(360+(north+self.orientationRotate))%360;
                        }
                        self.northDir=north;
                    });
                    //note:いらないようだ↓
                    function compassHeading(alpha, beta, gamma) {
                      var degtorad = Math.PI / 180; // Degree-to-Radian conversion

                      var _x = beta ? beta * degtorad : 0; // beta value
                      var _y = gamma ? gamma * degtorad : 0; // gamma value
                      var _z = alpha ? alpha * degtorad : 0; // alpha value

                      var cX = Math.cos(_x);
                      var cY = Math.cos(_y);
                      var cZ = Math.cos(_z);
                      var sX = Math.sin(_x);
                      var sY = Math.sin(_y);
                      var sZ = Math.sin(_z);

                      // Calculate Vx and Vy components
                      var Vx = -cZ * sY - sZ * sX * cY;
                      var Vy = -sZ * sY + cZ * sX * cY;

                      // Calculate compass heading
                      var compassHeading = Math.atan(Vx / Vy);

                      // Convert compass heading to use whole unit circle
                      if (Vy < 0) {
                        compassHeading += Math.PI;
                      } else if (Vx < 0) {
                        compassHeading += 2 * Math.PI;
                      }

                      return compassHeading * ( 180 / Math.PI ); // Compass Heading (in degrees)
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
                this.initObj.kind=k;
                
            },
                setScopeMark:function(b){
                    this.initObj.mark=b;
                },
                setStabilize:function(n){
                    this.initObj.stabilize = n;  bridgeCtrl.baseframe.contentWindow.baseCtrl.cam.setAttribute('stabilize',n);
                },
                setZoom:function(n){
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
                    var io = this.initObj;
                    
                    Object.keys(obj).forEach(function(key){
                        //旧タイプのオブジェクトでタイプが会わない場合はソース側のオブジェクトで上書き
                        var value = this[key];
                        if(typeof io[key] !== typeof value){
                            this[key] = io[key];
                        }
                    },obj);
                    
                    io.kind     = obj.kind||io.kind ;
                    io.zoom     = obj.zoom||io.zoom;
                    
                    io.pin      = typeof obj.pin === void(0)?io.pin:obj.pin;
                    io.mark     = typeof obj.mark === void(0)?io.mark:obj.mark;
                    
                    
                    io.onRing   = (typeof obj.onRing === "boolean")?obj.onRing:true;
                    io.onDot    = (typeof obj.onDot === "boolean")?obj.onDot:true;
                    
                    io.markColor= obj.markColor||io.markColor;
                    io.dot      = obj.dot||io.dot;
                    io.ring     = obj.ring||io.ring;
                    io.stabilize = obj.stabilize||io.stabilize;
                    io.targetFace = obj.targetFace||io.targetFace;
                    io.brightness = obj.brightness||io.brightness;
                    io.sBokeh = obj.sBokeh||io.sBokeh;
                    io.tBokeh = obj.tBokeh||io.tBokeh;
                },
                setStrageData:function(){
                    var json = JSON.stringify(this.initObj);
                    localStorage.setItem('initObj',json);
                },
                drawMark:function(t){
                    if(t=="ring"){
                    //this.svgDraw.clear();
                        var r = this.initObj.ring.r;
                        var R = this.initObj.ring.r+this.initObj.ring.lwidth/2;
                    this.svgDraw.circle(R,R,r).attr({fill:"none",stroke:this.colors[this.initObj.markColor],strokeWidth:this.initObj.ring.lwidth});
                    }
                },
                initSvgRing:function(){
                    this.svgDraw.snap = Snap('#presvg');
                    this.svgDraw.ring = this.svgDraw.snap.circle(150,100,100).attr({fill:'red',stroke:'red',strokeWidth:10});
                },
                openSlider:function(target){
                    var self = this;
                    if(this.sliderFor.length>0){
                        this.sliderFor="";
                        return;
                    }
                    // naikei
                    if(target=="naikei"){
                        this.sliderFor = "naikei";
                        this.ringRadiusslider.setNob(this.ring.naikei/2);
                        this.ringRadiusslider.setTarget(function(rr){
                        var ring = self.initObj.ring;
                            var R = ring.lwidth/2+ring.r;
                            var lineWidth = R-rr;
                            var r=rr+lineWidth/2;
                            ring.r=r;
                            ring.lwidth=lineWidth;
                        });
                        
                    }
                    // gaikei
                    if(target=="gaikei"){
                        this.sliderFor = "gaikei";
                        this.ringRadiusslider.setNob(this.ring.gaikei/2);
                        this.ringRadiusslider.setTarget(function(rr){
                        var ring = self.initObj.ring;
                            var inR = ring.r-ring.lwidth/2;
                            var lineWidth = rr-inR;
                            var r=rr-lineWidth/2;
                            ring.r=r;
                            ring.lwidth=lineWidth;
                        });
                    }
                    // dotkei
                    if(target=="dotkei"){
                        this.sliderFor = "dotkei";
                        this.dotRadiusslider.setNob(this.dot.chokkei/2);
                        this.dotRadiusslider.setTarget(function(rr){
                            var dot = self.initObj.dot;
                            dot.r=rr;
                        });
                    }
                },
                arrowShoot:function(){
                    if(!this.scopeWakuVis)return;
                    bridgeCtrl.shoot();
                }
            },
        mounted:function(){
            var self = this;
            bridgeCtrl.regVue(this);
            this.getNorthDir();
            this.getStrageData();
            this.hitCheckSlider = new HitCheckSlider(this);
            this.geoCorrectioner = new GeoCorrectioner(this);
            this.stabilizeSlider = new BasicSlider(this,'#stabiSliderset',1,90,function(n){
                self.setStabilize(n);
            });
            this.brightslider = new BasicSlider(this,'#brightSliderset',0,100,function(n){
                self.initObj.brightness = n;
            });
            this.sbokehslider = new BasicSlider(this,'#sbokehliderset',0,10,function(n){
                self.initObj.sBokeh = n;
            });
            this.tbokehslider = new BasicSlider(this,'#tbokehliderset',0,10,function(n){
                self.initObj.tBokeh = n;
            });
            this.ringRadiusslider = new RadiusSlider(this,"#ringRadiussliderbase");
            this.dotRadiusslider = new RadiusSlider(this,"#dotRadiussliderbase");
            //this.initSvgRing();
            
            $('#shootbut').on('touchstart',function(){
                self.arrowShoot();
            });
        }});
    });
    function bridge(){
        this.baseframe;
        this.scopeframe;
        this.vueApp;
    }
    bridge.prototype.regVue = function(v){
        this.vueApp = v;
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
        //todo orientationchan
        if(!this.vueApp)return;
            this.vueApp.orientationRotate = window.orientation;
            if(Math.abs(window.orientation)===90){
                orientationDo(false);
                this.vueApp.orientation = "landscape";
                //landscape
            }else{
                orientationDo(true);
                this.vueApp.orientation="portrait";
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
                //todo 変更点　orientationchange
                window.addEventListener('orientationchange',function(ev){
                    self.orientationChange();
                    self.vueApp.hitCheckSlider.setOrientation();
                    self.vueApp.geoCorrectioner.changeOri();
                });
                
                self.orientationChange();
                self.vueApp.initWorld();
            })
        }
        }
    
    bridge.prototype.linkRotation = function(obj){
        var camYaw = obj.y;
        
        if(!this.vueApp.scopeWakuVis){
           obj = this.vueApp.scopeDragPos;
            //$('#deb').text('x'+obj.x+';y:'+obj.y+';z:'+obj.x);
        }
        if(this.scopeframe){
            if(this.scopeframe.contentWindow.scopeCtrl)            this.scopeframe.contentWindow.scopeCtrl.setRotation(obj);
        }
        
        if(!this.vueApp.scopeWakuVis)return;
        
        var magDir = this.vueApp.centerDirByNorth-this.vueApp.northDir;
        var dig = (360+(magDir-camYaw))%360;//コンパスとジャイロの差異
        if(Math.abs(dig)>180){
            dig = dig>0?360-dig:360+dig;
        }
        if(Math.abs(dig)>3){ 
            
            this.vueApp.tmpData++;
            this.magrecovery(dig);
        }
    }
    
    bridge.prototype.magrecovery=function(dig){//修正dir指定
        var direct = this.baseframe.contentWindow.baseCtrl.cam.getAttribute('direct');   
        direct.y += degToRad(dig);
        this.baseframe.contentWindow.baseCtrl.cam.setAttribute('direct',direct);
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
                self.setZoom(self.initObj.zoom);
                
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
    function RadiusSlider(vueObj,targetset){
        this.$targetSet = $(targetset);
        this.callback = function(){};
            this.min=5;
            this.max=100;
        var self = vueObj;
        var my=this;
            var $sliderbase = this.$targetSet.find('.ruler');
            var $sliderbut = this.$targetSet.find('.ruler div');
        
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
                var trans=ev.targetTouches[0].clientX-slideX;
                slideX=ev.targetTouches[0].clientX;
                slideY=ev.targetTouches[0].clientY;
                
                    var tox = $sliderbut.position().left+trans;
                    if(tox<0){
                        tox=0;
                    }else if(tox>my.sliderArea.width){
                        tox=my.sliderArea.width;
                    }
                    $sliderbut.css('left',tox+"px");
                    my.par = tox/my.sliderArea.width;
                my.callback(getNum(my.par));  
                
            }).on('touchend',function(ev){
                ev.preventDefault();
                ev.stopPropagation();
                //console.error(getNum(my.par));
                self.sliderFor="";
            });
        
        
        function getNum(p){
            var min=my.min;
            var max=my.max;
            var area=max-min;
            var sep = Math.floor(area*p);
            return sep+min;
        }
    }
    RadiusSlider.prototype.setTarget = function(callback){
        this.callback=callback;
    };
    RadiusSlider.prototype.setNob = function(n){
            var $sliderbase = this.$targetSet.find('.ruler');
            var $sliderbut = this.$targetSet.find('.ruler div');
        var self = this;
        function getPar(f){
            var area=self.max-self.min;
            return (f-self.min)/area;
        }
        var p=getPar(n);
                var tox = this.sliderArea.width*p;
                        $sliderbut.css('left',tox+"px");
    };
    
    function BasicSlider(vueObj,tar,min,max,callback){
            this.min=min;
            this.max=max;
        this.callback = callback;
        var self = vueObj;
            var my=this;
            this.position = 'portrait';
            this.$sliderbase = $(tar);
            this.$sliderbut = this.$sliderbase.find('.sliderButt');
        
            this.sliderArea = {
                width:this.$sliderbase.width()-this.$sliderbut.width(),
                height:this.$sliderbase.height()-this.$sliderbut.height()
            };
            var slideX = 0;
            var slideY = 0;
            this.par=1;
        
            this.$sliderbut.on('touchstart',function(ev){
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
                    var tox = my.$sliderbut.position().left+trans;
                    if(tox<0){
                        tox=0;
                    }else if(tox>my.sliderArea.width){
                        tox=my.sliderArea.width;
                    }
                    my.$sliderbut.css('left',tox+"px");
                    my.par = tox/my.sliderArea.width;
                my.callback(getNum(my.par));
                }else{
                    //landscape;
                    var toy = my.$sliderbut.position().top+trans;
                    if(toy<0){
                        toy=0;
                    }else if(toy>my.sliderArea.height){
                        toy=my.sliderArea.height;
                    }
                    my.$sliderbut.css('top',toy+"px");
                    my.par = (my.sliderArea.height-toy)/my.sliderArea.height;
                my.callback(getNum(my.par));
                    
                }                
            }).on('touchend',function(ev){
                ev.preventDefault();
                ev.stopPropagation();
            });
        function getNum(p){
            var min=my.min;
            var max=my.max;
            var area=max-min;
            var sep = Math.floor(area*p);
            return sep+min;
        }
    }
    BasicSlider.prototype.setSlideBut=function(n){
        var self = this;
        function getPar(f){
            var area=self.max-self.min;
            return f/area;
        }
        var p=getPar(n-self.min);
            var $sliderbut = this.$sliderbut;
            if(this.position=="portrait"){
                var tox = this.sliderArea.width*p;
                        $sliderbut.css('left',tox+"px");
            }else{
                var toy = this.sliderArea.height*p;
                        $sliderbut.css('top',toy+"px");
            }
        };
})();