document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const game = new Game(canvas);

    document.getElementById('startButton').addEventListener('click', () => {
        game.start();
    });

    document.getElementById('restartButton').addEventListener('click', () => {
        game.start();
    });
});