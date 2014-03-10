"use strict";
(function()
{
	if(window.CVPong.WebGL)
		return;
	
	var black = [0.0, 0.0, 0.0, 1.0];
	
	function makeUseProgram(gl)
	{
		var ajax = new AJAX();
		var shaders = [];
		
		ajax.getFragment("scripts/vertex.glsl", "text", function(vertex)
		{
			shaders.push(loadShader(gl, vertex, gl.VERTEX_SHADER));
		}, false);
		
		ajax.getFragment("scripts/fragment.glsl", "text", function(fragment)
		{
			shaders.push(loadShader(gl, fragment, gl.FRAGMENT_SHADER));
		}, false);
		
		var program = createProgram(gl, shaders);
		gl.useProgram(program);
		return program;
	}
	
	window.CVPong.WebGL = function(video, sliders) 
	{
		var texture = null;
		function updateTexture() 
		{
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
		
		var canvas = document.createElement("canvas");
		var shaders = [];
		canvas.width = video.width;
		canvas.height = video.height;
		var gl = setupWebGL(canvas, {preserveDrawingBuffer: true});
		gl.clearColor(0.0, 0.0, 0.0, 1.0); 
		var program = makeUseProgram(gl);
		
		var positionLocation = gl.getAttribLocation(program, "a_position");
		var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
		var texCoordBuffer = gl.createBuffer();
		var arrBounds = new Float32Array([0.0,  0.0,
										  1.0,  0.0,
										  0.0,  1.0,
										  0.0,  1.0,
										  1.0,  0.0,
										  1.0,  1.0]);
														 
		gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, arrBounds, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(texCoordLocation);
		gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

		texture = gl.createTexture();
		var resolutionLocation = gl.getUniformLocation(program, "resolution");
		gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
					
		var buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
		var maxMinH = gl.getUniformLocation(program, "minMaxH");
		var maxMinS = gl.getUniformLocation(program, "minMaxS");
		var maxMinV = gl.getUniformLocation(program, "minMaxV");

		this.render = function()
		{	
			try
			{
				updateTexture();	
				gl.uniform2fv(maxMinH, sliders.H.Bounds);
				gl.uniform2fv(maxMinS, sliders.S.Bounds);
				gl.uniform2fv(maxMinV, sliders.V.Bounds);
			
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(
											 [0.0,           0.0,
											  canvas.width,  0.0,
											  0.0,           canvas.height,
											  0.0,           canvas.height,
											  canvas.width,  0.0,
											  canvas.width,  canvas.height]), gl.STATIC_DRAW);
				gl.drawArrays(gl.TRIANGLES, 0, 6);		
			}
			catch(err)
			{
				console.log("Meh, video probably isn't initialized yet...");
			}
		}
		
		var pixelValues = new Uint8Array(4 * canvas.height);
		var hitY = 0;
		this.paddleHit = function(x, y)
		{
			x = parseInt(x);
			hitY = (canvas.height - 1) - parseInt(y);
			gl.readPixels(x, 0, 1, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixelValues);
			return pixelValues[hitY * 4] === 255;
		}
		
		this.paddleHeight = function()
		{
			var height = [0, 0];
			
			if(pixelValues[hitY * 4] !== 255)
				return height;
				
			var y = hitY;
			while(--y >= 0 && pixelValues[y * 4] === 255)
				height[0]++;
			
			y = hitY + 1;
			while(++y < canvas.height && pixelValues[y * 4] === 255)
				height[1]++;
			
			return height;
		}
		
		Object.defineProperty(this, "Canvas", 
		{
			get: function() {return canvas; },
		});
	}
})();