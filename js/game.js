class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = getCanvasContext(canvas);
        this.gameData = null;
        this.animationId = null;
        this.score = 0;
        this.gameState = GameState.IDLE;
        this.bindEvents();
    }

    init() {
        const { width, height } = this.canvas;
        const platformWidth = width * GAME_CONFIG.PLATFORM_WIDTH_MULTIPLIER;
        const platformGap = width * GAME_CONFIG.PLATFORM_GAP_MULTIPLIER;
        const groundY = height * GAME_CONFIG.GROUND_HEIGHT_MULTIPLIER;

        this.gameData = {
            player: {
                x: platformWidth / 2,
                y: groundY,
                width: GAME_CONFIG.PLAYER_WIDTH,
                height: GAME_CONFIG.PLAYER_HEIGHT,
                targetX: null,
                walkSpeed: GAME_CONFIG.PLAYER_WALK_SPEED,
                legAngle: 0,
                legSpeed: GAME_CONFIG.LEG_ANIMATION_SPEED,
                fallSpeed: 0,
                rotation: 0
            },
            stick: {
                length: 0,
                angle: 0,
                falling: false,
                fallSpeed: GAME_CONFIG.STICK_FALL_SPEED,
                baseX: platformWidth / 2
            },
            platforms: [
                { x: 0, width: platformWidth },
                { x: platformWidth + platformGap, width: platformWidth }
            ],
            growing: false
        };

        this.score = 0;
        this.gameState = GameState.PLAYING;
        this.updateUI();
    }

    bindEvents() {
        const handleStart = () => {
            if (this.gameState === GameState.PLAYING) {
                this.gameData.growing = true;
            }
        };

        const handleEnd = () => {
            if (this.gameState === GameState.PLAYING && this.gameData.growing) {
                this.gameData.growing = false;
                this.gameData.stick.falling = true;
            }
        };

        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') handleStart();
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') handleEnd();
        });

        // Touch controls
        this.canvas.addEventListener('touchstart', handleStart);
        this.canvas.addEventListener('touchend', handleEnd);

        // Mouse controls
        this.canvas.addEventListener('mousedown', handleStart);
        this.canvas.addEventListener('mouseup', handleEnd);

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.gameState === GameState.IDLE) {
            this.init();
        }
    }

    update() {
        if (this.gameData.growing) {
            this.gameData.stick.length += GAME_CONFIG.STICK_GROWTH_SPEED;
        } else if (this.gameData.stick.falling) {
            this.gameData.stick.angle += this.gameData.stick.fallSpeed;

            if (this.gameData.stick.angle >= Math.PI / 2) {
                this.gameData.stick.angle = Math.PI / 2;
                this.gameData.stick.falling = false;

                const nextPlatform = this.gameData.platforms[1];
                const stickEnd = this.gameData.stick.baseX + this.gameData.stick.length;
                const success = stickEnd >= nextPlatform.x && stickEnd <= (nextPlatform.x + nextPlatform.width);

                if (!success) {
                    this.gameData.player.targetX = stickEnd;
                    this.gameState = GameState.WALKING_TO_FALL;
                    GAME_SOUNDS.FALL.play();
                } else {
                    this.gameData.player.targetX = stickEnd;
                    this.gameState = GameState.WALKING;
                }
            }
        } else if (this.gameState === GameState.WALKING || this.gameState === GameState.WALKING_TO_FALL) {
            this.gameData.player.legAngle = (this.gameData.player.legAngle + this.gameData.player.legSpeed) % (2 * Math.PI);

            if (this.gameData.player.targetX !== null) {
                const dx = this.gameData.player.targetX - (this.gameData.player.x + GAME_CONFIG.PLAYER_WIDTH / 2);
                if (Math.abs(dx) > this.gameData.player.walkSpeed) {
                    this.gameData.player.x += this.gameData.player.walkSpeed * Math.sign(dx);
                } else {
                    this.gameData.player.x = this.gameData.player.targetX - GAME_CONFIG.PLAYER_WIDTH / 2;
                    this.gameData.player.targetX = null;

                    if (this.gameState === GameState.WALKING_TO_FALL) {
                        this.gameState = GameState.FALLING;
                        GAME_SOUNDS.SCREAM.play();
                    } else {
                        const lastPlatform = this.gameData.platforms[this.gameData.platforms.length - 1];
                        const newPlatformX = lastPlatform.x + lastPlatform.width +
                            Math.random() * 0.1 * lastPlatform.width +
                            0.15 * lastPlatform.width;

                        this.gameData.platforms.push({ x: newPlatformX, width: lastPlatform.width });

                        this.gameData.stick.length = 0;
                        this.gameData.stick.angle = 0;
                        this.gameData.stick.falling = false;
                        this.gameData.stick.baseX = this.gameData.player.x + GAME_CONFIG.PLAYER_WIDTH / 2;
                        this.gameState = GameState.PLAYING;
                        this.score += 1;
                        this.updateUI();
                    }
                }
            }
        } else if (this.gameState === GameState.FALLING) {
            this.gameData.player.y += GAME_CONFIG.PLAYER_FALL_SPEED;
            this.gameData.player.rotation += GAME_CONFIG.PLAYER_ROTATION_SPEED;

            if (this.gameData.player.y > this.canvas.height + 100) {
                this.gameState = GameState.GAME_OVER;
                this.updateUI();
                return false;
            }
        }

        return true;
    }

    draw() {
        clearCanvas(this.ctx);
        drawBackground(this.ctx);
        drawPlatforms(this.ctx, this.gameData.platforms, this.gameData.player.y);
        drawStick(this.ctx, this.gameData.stick, this.gameData.player.y);
        drawPlayer(this.ctx, this.gameData.player, this.gameState);

        // Debug visuals (remove later)
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        this.ctx.fillRect(this.gameData.player.x, this.gameData.player.y, 5, 5);
    }

    updateUI() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('startScreen').classList.toggle('hidden', this.gameState !== GameState.IDLE);
        document.getElementById('gameOverScreen').classList.toggle('hidden', this.gameState !== GameState.GAME_OVER);
        document.getElementById('instructions').classList.toggle('hidden', this.gameState !== GameState.PLAYING);
        document.getElementById('finalScore').textContent = `Score: ${this.score}`;
    }

    gameLoop() {
        if (this.update()) {
            this.draw();
            this.animationId = requestAnimationFrame(() => this.gameLoop());
        }
    }

    start() {
        this.init();
        this.gameLoop();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}
