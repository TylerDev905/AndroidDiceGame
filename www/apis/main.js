(function ( $ ) {
	
	$.fn.dice = function ( options ) {
		var dice = this;
		
		$(this).each(function(){
			var die = $(this);
			die.data("dice", new Die(die));
		});

		return dice;
	}
	
	function Die(die){
		this.container = die;
		this.init();
		this.drawDie(1);
	return this;
	}
	
	Die.prototype.init = function(){
		
		this.watchId = null;
		this.status = false;
		this.timer = 0;
		this.frequency = 200;
		this.acceleration = null;
		
		this.shake = {
			threshold:4,
			intervals:0
		};
		this.animate = {
			flag: true,
			delay: 300
		};
		this.debug = {
			coords: {
				flag: false,
				x:0,
				y:0,
				z:0,
			}
		};
		
		this.dots = 6;
		this.face = 1;
		this.img = [];
		
		for(var i = 1; i <= this.dots; i++){
			this.img[i] = "images/dice"+ i +".png";
		}
	}
	
	Die.prototype.startWatch = function(){
		var options = { frequency: this.frequency };
        this.watchId = navigator.accelerometer.watchAcceleration(jQuery.proxy(this.onWatchElapse, this), jQuery.proxy(this.onWatchError, this), options);
	}
	
	Die.prototype.stopWatch = function(){
		if(this.watchId){
			this.init();
			navigator.accelerometer.clearWatch(this.watchId);
		}
	}
	
	Die.prototype.mathRound = function(number, decimalplaces){
		return  Math.round(number * Math.pow(10,decimalplaces)) / Math.pow(10,decimalplaces);
	}
	
	Die.prototype.roll = function(){
		this.face = Math.floor((Math.random() * this.dots + 1) + 0);
		this.drawDie(this.face);
	}
	
	Die.prototype.onDeviceReady = function(){
		this.startWatch();
	}
	
	Die.prototype.onWatchError = function(){
		$('#messages').text('OnError has happened...').css('color','red');
		console.log(this);
	}	
	
	Die.prototype.onWatchElapse = function(acceleration){
		if(this.status){
			if(this.acceleration != null){
				this.calculateThreshold(acceleration.x,acceleration.y,acceleration.z);
			}
			this.debug.coords.x = this.mathRound(acceleration.x, 3);
			this.debug.coords.y = this.mathRound(acceleration.y, 3);
			this.debug.coords.z = this.mathRound(acceleration.z, 3);
			this.acceleration = acceleration;
			this.drawCoords();
			this.timer++;
		}
	}
	
	Die.prototype.debugOn = function(){
		this.debug.coords.flag = true;
		this.drawFootball();
		this.drawCoords();
		console.log(this);
	}
	
	Die.prototype.debugOff = function(){
		this.debug.coords.flag = false;
		this.hideFootball();
		this.hideCoords();
	}
	
	Die.prototype.drawCoords = function(){
		if(this.debug.coords.flag){
			$('#x').text(this.debug.coords.x);
			$('#y').text(this.debug.coords.y);
			$('#z').text(this.debug.coords.z);
			$('#t').text(this.timer);
			$("#accelerometer").css({display:"block"});
		}
	}
	
	Die.prototype.hideCoords = function(){
		if(!this.debug.coords.flag){
			$("#accelerometer").css({display:"none"});
		}
	}	
	
	Die.prototype.drawDie = function(face){
		this.container.html('<img src="'+ this.img[face] +'" />');
	}
	
	Die.prototype.hideDie = function(face){
		$("#die").html("");
	}
	
	Die.prototype.animateDie = function(){
		if(this.animate.flag){
			this.roll();
			setTimeout(jQuery.proxy(this.animateDie, this), this.animate.delay); 
		}
	}
	
	Die.prototype.calculateThreshold = function(newX,newY,newZ){
		var intervalLast = (Math.abs(this.acceleration.x) + Math.abs(this.acceleration.y) + Math.abs(this.acceleration.z));
		var intervalCurrent = (Math.abs(newX) + Math.abs(newY) + Math.abs(newZ));
		var intervalDiff = Math.abs(intervalLast - intervalCurrent);
		if(intervalDiff > this.shake.threshold){
			this.shake.intervals++;
		}
		if(this.shake.intervals == 3){
			this.onShake();
			this.shake.intervals = 0;
		}
	}
	
	Die.prototype.onShake = function(){
		this.roll();
		this.roll();
		this.status = false;
		this.result = this.face;
		this.stopWatch();
		this.animate.flag = false;
	}

})( jQuery );
	
(function ( $ ) {
	
var dice = $(".dice").dice();
$("#status").html("<code>Let's Roll!</code> Press Start to play.");

$("#start").click(function(){
	dice.each(function(){
		var die = $(this).data("dice");
		die.status = true;
		die.startWatch();
		die.animate.flag = true;
		die.animateDie();	
	});
	$("#status").html("Shake those dice.");
	gameStatus();
});	

function gameStatus(){
var status = false;
var results = [];

	dice.each(function(index){
		var die = $(this).data("dice");
		if(die.status){
			status = true;
		}
		results[index] = die.result;
	});
	
	if(status){
		setTimeout(function(){gameStatus()}, 1000);
	}
	else{
		if(results[0] == results[1]){
			if(results[0] == 1)
				$("#status").html("<code>Nice roll!</code> Snake Eyes!");
			else
				$("#status").html("<code>Nice roll!</code> Doubles!");
		}
		else{
			$("#status").html("Nice roll!");
		}
	}
}

})( jQuery );
