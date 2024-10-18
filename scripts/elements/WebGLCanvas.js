const vertexShader = `attribute vec2 a_position;
attribute vec2 a_texCoord;
uniform vec2 resolution;
varying vec2 texCoord;

void main() {
   vec2 zeroToOne = a_position / resolution;
   vec2 zeroToTwo = zeroToOne * 2.0;
   vec2 clipSpace = zeroToTwo - 1.0;
   gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
   texCoord = a_texCoord;
}`

const fragmentShader = `precision mediump float;
uniform sampler2D image;
varying vec2 texCoord;
uniform vec2 minMaxH;
uniform vec2 minMaxS;
uniform vec2 minMaxV;

void main() 
{
	vec4 srcColor = texture2D(image, vec2(1.0 - texCoord.x, texCoord.y));
	float minVal = min(srcColor.r, srcColor.g);
	minVal = min(minVal, srcColor.b);
	
	vec3 offsets = vec3(0.0, 1.0 / 3.0, 2.0 / 3.0);
	vec4 mixed = mix(vec4(srcColor.rgb, offsets.r), vec4(srcColor.gbr, offsets.g), step(srcColor.r, srcColor.g));
	mixed = mix(mixed, vec4(srcColor.brg, offsets.b), step(mixed[0], srcColor.b));
	
	float e = 1.0e-20;
	vec3 hsv = vec3(fract(mixed[1] - mixed[2] + mixed[3]), (mixed[0] - minVal) / (mixed[0] + e), mixed[0]);
	
	if((hsv.x >= minMaxH.x && hsv.x <= minMaxH.y)
	&& (hsv.y >= minMaxS.x && hsv.y <= minMaxS.y)
	&& (hsv.z >= minMaxV.x && hsv.z <= minMaxV.y))
	  	gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
	else
 	 	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}`;

const makeUseProgram = (gl) => {
    var shaders = [        
        loadShader(gl, vertexShader, gl.VERTEX_SHADER),
        loadShader(gl, fragmentShader, gl.FRAGMENT_SHADER)
    ];
    
    var program = createProgram(gl, shaders);
    gl.useProgram(program);
    return program;
}

const updateTexture = (gl, texture, video) => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

export default class WebGLCanvas extends HTMLElement {
    #hitY = 0;
    #canvas = document.createElement("canvas");

    #texture;
    #video;
    #sliders;
    #gl;

    #maxMinH;
    #maxMinS;
    #maxMinV;

    #pixelValues;

    init(video, sliders) {
        this.#video = video;
        this.#sliders = sliders;

        this.width = this.#canvas.width = this.#video.width;
        this.height = this.#canvas.height = this.#video.height;

        this.#gl = setupWebGL(this.#canvas, {preserveDrawingBuffer: true});

        this.#gl.clearColor(0.0, 1.0, 0.0, 1.0);

        this.appendChild(this.#canvas);

        const program = makeUseProgram(this.#gl);

        const positionLocation = this.#gl.getAttribLocation(program, "a_position");
        const texCoordLocation = this.#gl.getAttribLocation(program, "a_texCoord");
        const texCoordBuffer = this.#gl.createBuffer();
        const arrBounds = new Float32Array([0.0,  0.0,
                                            1.0,  0.0,
                                            0.0,  1.0,
                                            0.0,  1.0,
                                            1.0,  0.0,
                                            1.0,  1.0]);

        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, texCoordBuffer);
        this.#gl.bufferData(this.#gl.ARRAY_BUFFER, arrBounds, this.#gl.STATIC_DRAW);
        this.#gl.enableVertexAttribArray(texCoordLocation);
        this.#gl.vertexAttribPointer(texCoordLocation, 2, this.#gl.FLOAT, false, 0, 0);

        this.#texture = this.#gl.createTexture();
        const resolutionLocation = this.#gl.getUniformLocation(program, "resolution");
        this.#gl.uniform2f(resolutionLocation, this.#canvas.width, this.#canvas.height);

        const buffer = this.#gl.createBuffer();
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, buffer);
        this.#gl.enableVertexAttribArray(positionLocation);
        this.#gl.vertexAttribPointer(positionLocation, 2, this.#gl.FLOAT, false, 0, 0);
        this.#maxMinH = this.#gl.getUniformLocation(program, "minMaxH");
        this.#maxMinS = this.#gl.getUniformLocation(program, "minMaxS");
        this.#maxMinV = this.#gl.getUniformLocation(program, "minMaxV");

        this.#pixelValues = new Uint8Array(4 * this.#canvas.height);
    }

    render() {	
        if(!this.#gl)
            return;

        try
        {
            updateTexture(this.#gl, this.#texture, this.#video);	
            this.#gl.uniform2fv(this.#maxMinH, this.#sliders.h.bounds);
            this.#gl.uniform2fv(this.#maxMinS, this.#sliders.s.bounds);
            this.#gl.uniform2fv(this.#maxMinV, this.#sliders.v.bounds);
        
            this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(
                                         [0.0,                 0.0,
                                          this.#canvas.width,  0.0,
                                          0.0,                 this.#canvas.height,
                                          0.0,                 this.#canvas.height,
                                          this.#canvas.width,  0.0,
                                          this.#canvas.width,  this.#canvas.height]), this.#gl.STATIC_DRAW);
            this.#gl.drawArrays(this.#gl.TRIANGLES, 0, 6);		
        }
        catch(err)
        {
            console.log("Meh, video probably isn't initialized yet...");
        }
    }

    paddleHit(x, y) {
        x = parseInt(x);
        this.#hitY = (this.#canvas.height - 1) - parseInt(y);
        this.#gl.readPixels(x, 0, 1, this.#canvas.height, this.#gl.RGBA, this.#gl.UNSIGNED_BYTE, this.#pixelValues);
        return this.#pixelValues[this.#hitY * 4] === 255;
    }
    
    paddleHeight() {
        const height = [0, 0];
        
        if(this.#pixelValues[this.#hitY * 4] !== 255)
            return height;
            
        let y = this.#hitY;
        while(--y >= 0 && this.#pixelValues[y * 4] === 255)
            height[0]++;
        
        y = this.#hitY + 1;
        while(++y < this.#canvas.height && this.#pixelValues[y * 4] === 255)
            height[1]++;
        
        return height;
    }
}

customElements.define("webgl-canvas", WebGLCanvas);