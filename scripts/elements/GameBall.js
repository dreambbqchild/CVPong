const TRAVEL_RATE = 4.0;
const TRAVEL_RATE_HALF = TRAVEL_RATE * 0.5;

class Point {
    #x = 0;
    #y = 0;

    get x() { return this.#x; }
    set x(value) {this.#x = parseFloat(value);}

    get y() { return this.#y; }
    set y(value) {this.#y = parseFloat(value);}
}

export default class GameBall extends HTMLElement{
    #directionVector = new Point();
    #ballPosition = new Point();
    #centerLine;
    #ballRadius;
    #webglCanvas;

    init(webglCanvas) {
        this.#webglCanvas = webglCanvas;

        this.#centerLine = webglCanvas.width * 0.5;
        this.#ballRadius = this.offsetWidth * 0.5;

        this.#ballPosition.x = this.style.left;
        this.#ballPosition.y = this.style.top;
    }

    #initDirectionVector()
    {
        this.#directionVector.x = Math.random() > 0.5 ? TRAVEL_RATE : -TRAVEL_RATE;
        this.#directionVector.y = 0;
    }

    #updateBallPosition()
    {
        const potentialY = this.#ballPosition.y + this.#directionVector.y;
        if(potentialY <= 0 || (potentialY + this.offsetHeight) >= this.#webglCanvas.height)
            this.#directionVector.y = this.#directionVector.y * -1;
            
        this.#ballPosition.x = this.#ballPosition.x + this.#directionVector.x;
        this.#ballPosition.y = this.#ballPosition.y + this.#directionVector.y;
    
        this.style.left = `${parseInt(this.#ballPosition.x)}px`;
        this.style.top = `${parseInt(this.#ballPosition.y)}px`;
    }
    
    #homeBall()
    {
        this.#ballPosition.x = this.#centerLine - this.#ballRadius;
        this.#ballPosition.y = (this.#webglCanvas.height * 0.5) - this.#ballRadius;
    }
    
    checkHit()
    {
        let xOffset = null;
        if(this.#directionVector.x < 0 && this.#ballPosition.x + this.#ballRadius < this.#centerLine)
            xOffset = 0;
        else if(this.#directionVector.x > 0 && this.#ballPosition.x + this.#ballRadius > this.#centerLine)
            xOffset = this.offsetWidth;
            
        if(xOffset === null || !this.#webglCanvas.paddleHit(this.#ballPosition.x + xOffset, this.#ballPosition.y + this.#ballRadius))
            return;
        
        const result = this.#webglCanvas.paddleHeight();
        const total = result[0] + result[1];
        if(total > 10) //garbage px check.
        {
            const xDir = this.#directionVector.x < 0 ? 1 : -1;
            this.#directionVector.y = ((result[1] / total) - 0.5) * TRAVEL_RATE;
            this.#directionVector.x = (TRAVEL_RATE_HALF + Math.abs(this.#directionVector.y)) * xDir;
        }
    }

    move(scoreFn)
    {
        this.#updateBallPosition();
        if(this.#ballPosition.x <= 0)
            scoreFn("left");
        else if(this.#ballPosition.x + this.offsetWidth > this.#webglCanvas.width)
            scoreFn("right");
    }
    
    resetBall()
    {
        this.#homeBall();
        this.#initDirectionVector();
    }
}

customElements.define("game-ball", GameBall);