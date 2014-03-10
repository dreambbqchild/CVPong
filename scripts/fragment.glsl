precision mediump float;
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
}