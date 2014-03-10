"use strict";
(function()
{
	if(window.CVPong.Ball)
		return;
				
	var TRAVEL_RATE = 4.0;
	var TRAVEL_RATE_HALF = TRAVEL_RATE * 0.5;
				
	window.CVPong.Ball = function(ballElement, webgl)
	{		
		function Point()
		{
			var x = 0;
			var y = 0;
					
			Object.defineProperty(this, "X", 
			{
				get: function() { return x; },
				set: function(value) {x = parseFloat(value);}
			});
			
			Object.defineProperty(this, "Y", 
			{
				get: function() {return y; },
				set: function(value) {y = parseFloat(value);}
			});
		}
		
		function initDirectionVector()
		{
			directionVector.X = Math.random() > 0.5 ? TRAVEL_RATE : -TRAVEL_RATE;
			directionVector.Y = 0;
		}

		function updateBallPosition()
		{
			var potentialY = ballPosition.Y + directionVector.Y;
			if(potentialY <= 0 || (potentialY + ballElement.offsetHeight) >= webgl.Canvas.height)
				directionVector.Y = directionVector.Y * -1;
				
			ballPosition.X = ballPosition.X + directionVector.X;
			ballPosition.Y = ballPosition.Y + directionVector.Y;
		
			ballElement.style.left = parseInt(ballPosition.X) + "px";
			ballElement.style.top = parseInt(ballPosition.Y) + "px";
		}
		
		function homeBall()
		{
			ballPosition.X = centerLine - ballRadius;
			ballPosition.Y = (webgl.Canvas.height * 0.5) - ballRadius;
		}
		
		var directionVector = new Point();
		var ballPosition = new Point();
		var centerLine = webgl.Canvas.width * 0.5;
		var ballRadius = ballElement.offsetWidth * 0.5;
		
		ballPosition.X = ballElement.style.left;
		ballPosition.Y = ballElement.style.top;
		
		this.checkHit = function()
		{
			var xOffset = null;
			if(directionVector.X < 0 && ballPosition.X + ballRadius < centerLine)
				xOffset = 0;
			else if(directionVector.X > 0 && ballPosition.X + ballRadius> centerLine)
				xOffset = ballElement.offsetWidth;
				
			if(xOffset !== null && webgl.paddleHit(ballPosition.X + xOffset, ballPosition.Y + ballRadius))
			{
				var result = webgl.paddleHeight();
				var total = result[0] + result[1];
				if(total > 10) //garbage px check.
				{
					var xDir = directionVector.X < 0 ? 1 : -1;
					directionVector.Y = ((result[1] / total) - 0.5) * TRAVEL_RATE;
					directionVector.X = (TRAVEL_RATE_HALF + Math.abs(directionVector.Y)) * xDir;
				}
			}
		}
		
		this.move = function(scoreFn)
		{
			updateBallPosition();
			if(ballPosition.X <= 0)
				scoreFn("left");
			else if(ballPosition.X + ballElement.offsetWidth > webgl.Canvas.width)
				scoreFn("right");
		}
		
		this.resetBall = function()
		{
			homeBall();
			initDirectionVector();
		}
	}
})();