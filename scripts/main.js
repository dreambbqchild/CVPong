import './elements/GameBall.js';
import './elements/RangeSelector.js';
import './elements/WebGLCanvas.js';

const init = () => {
    if(!navigator.mediaDevices.getUserMedia) {
        document.body.textContent = "Sorry, this ain't gonna work with your browser.";
        return;
    }

    window.addEventListener("DOMContentLoaded", function()
    {
        const video = document.querySelector("video");
        const ball = document.querySelector("game-ball");
        const webgl = document.querySelector('webgl-canvas');
        const sliders = {}; 

        for(const rangeSelector of this.document.querySelectorAll("range-selector"))
            sliders[rangeSelector.label.toLowerCase()] = rangeSelector;

        let calibrated = false;        
                            
        var button = document.querySelector("button");
        button.addEventListener("click", () =>
        {
            calibrated = true;
            button.parentNode.removeChild(button);
            const a = document.querySelector("a");
            a.parentElement.removeChild(a);
            ball.style.display = null;
            ball.resetBall();
        });
        
        function updateScore(pointFor)
        {
            const score = document.querySelector("#" + pointFor + "Player");
            score.textContent = parseInt(score.textContent) + 1;
            ball.resetBall();
        }
        
        function render()
        {
            webgl.render();
            if(calibrated)
            {
                ball.checkHit();
                ball.move(updateScore)
            }
            window.requestAnimationFrame(render);
        }

        navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) 
        {
            video.srcObject = stream;
            webgl.init(video, sliders);
            ball.init(webgl);
            
            render();
        }, function() { document.body.textContent = "Unable to Access WebCam." });
    });
}

init();