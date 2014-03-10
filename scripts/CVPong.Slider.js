"use strict";
(function()
{
	if(window.CVPong.Slider)
		return;
	
	var src = null;
	window.addEventListener("mouseup", function(){src = null;});
				
	window.CVPong.Slider = function(parent)
	{			
		var inputs = Array.prototype.slice.call(parent.querySelectorAll("input"));
		inputs[1].min = inputs[0].min = 0;
		inputs[1].max = inputs[0].max;
		
		var min = inputs[0];
		var max = inputs[1];
		
		min.value = min.min;
		max.value = max.max;
		for(var i = 0; i < inputs.length; i++)
		{ 
			inputs[i].addEventListener("mousedown", captureSrc);
			inputs[i].addEventListener("change", sliderChanged);
		}
				
		function captureSrc(e)
		{
			src = e.srcElement;
		}
		
		function sliderChanged(e)
		{
			if(parseInt(min.value) > parseInt(max.value))
			{
				console.log((min.value > max.value) + " " + min.value + " " + max.value)
				if(src === min)
					max.value = min.value;
				else
					min.value = max.value;
			}
		}
		
		Object.defineProperty(this, "Bounds", 
		{
			get: function() {return [parseInt(min.value) / parseInt(inputs[0].max), parseInt(max.value) / parseInt(inputs[0].max)]; },
			enumerable: true,
			set: function(value)
			{
				min.value = value[0] * parseInt(inputs[0].max);
				max.value = value[1] * parseInt(inputs[0].max);
			}
		});
	}
})();