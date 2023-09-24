const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 100, canvas.width/2, canvas.height/2, canvas.width/2);
gradient.addColorStop(0, 'red');
gradient.addColorStop(0.5, 'cyan');
gradient.addColorStop(1, 'magenta');


ctx.globalAlpha = 1;



class Symbol {
    constructor (x, y, fontSize, canvasHeight, characters) {
        this.characters = characters;
        this.x = x;
        this.y = y;
        this.fontSize = fontSize;
        this.text = '';
        this.canvasHeight = canvasHeight;
        this.currentIndex = Math.floor(Math.random() * characters.length);
    }

    draw(context) {
        // Desenha o caractere atual na sequência
        context.fillText(this.text, this.x * this.fontSize, this.y * this.fontSize);

        // Atualiza o índice para o próximo caractere na sequência
        this.currentIndex += 1;

        // Se o índice passar do comprimento da sequência, reinicia
        if (this.currentIndex >= this.characters.length) {
            this.currentIndex = 0;
        }

        if (this.y * this.fontSize > this.canvasHeight && Math.random() > 0.96) {
            this.y = 0;
        } else {
            this.y += 1;
        }

        
        this.text = this.characters.charAt(this.currentIndex);
    }
}


class Effect {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.fontSize = 20;
        this.columns = Math.floor(this.canvasWidth / this.fontSize);
        this.symbols = [];
        this.characters = 'アァカサタナハヰギジヂビピVISITA NA  UNIPAR-PARANAVAI-PR, TITULO: CONHECENDO O ESPAÇO UNIVERSITARIO, ALUNOS DO ESTADUAL ,ウゥクスツヘメレヱゲゼデベペオォコソ'
        this.#initialize();
    }
    
    #initialize() {
        for (let i = 0; i < this.columns; i++) {
            // this.additionalWords[i] = words(i, 0, this.fontSize, this.canvasHeight, this.characters);
            this.symbols[i] = new Symbol(i, 0, this.fontSize, this.canvasHeight, this.characters);
        }
    }

    resize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.columns = Math.floor(this.canvasWidth / this.fontSize);
        this.symbols = [];
        this.#initialize();
    }
}

const effect = new Effect(canvas.width, canvas.height);
let lasTime = 0;
const fps = 100; // Reduzi a taxa de quadros para 60
const nextFrame = 1000 / fps;
let timer = 0;

function animate(timeStamp) {
    const deltaTime = timeStamp - lasTime;
    lasTime = timeStamp;

    if (timer > nextFrame) {
        ctx.globalAlpha = 0.05
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.textAlign = 'center';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = gradient;
        ctx.font = effect.fontSize + 'px monospace';

        // Exibir os símbolos principais
        effect.symbols.forEach(symbol => symbol.draw(ctx));

        timer = 0;
    } else {
        timer += deltaTime;
    }

    requestAnimationFrame(animate);
}

animate(0);


// additionalWords.draw(ctx);

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    effect.resize(canvas.width, canvas.height);
    gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 100, canvas.width/2, canvas.height/2, canvas.width/2);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.5, 'cyan');
    gradient.addColorStop(1, 'magenta');
});
