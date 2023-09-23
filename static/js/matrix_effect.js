const matrix = document.querySelector('.matrix');

function createChar() {
    const char = document.createElement('p');
    char.textContent = String.fromCharCode(Math.floor(Math.random() * 94) + 33);
    char.style.marginTop = Math.random() * 100 + 'vh';
    char.style.opacity = Math.random();
    matrix.appendChild(char);
    setTimeout(() => {
        char.remove();
    }, 5000);
}

setInterval(createChar, 100);
