function getCanvasContext(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Could not get canvas context');
    }
    return ctx;
}

function clearCanvas(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawPlatforms(ctx, platforms, groundY) {
    ctx.fillStyle = '#000';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, groundY, platform.width, ctx.canvas.height - groundY);
    });
}

function drawStick(ctx, stick, groundY) {
    if (stick.length > 0) {
        ctx.save();
        ctx.translate(stick.baseX, groundY);
        ctx.rotate(-Math.PI / 2 + stick.angle);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, stick.length, GAME_CONFIG.STICK_WIDTH);
        ctx.restore();
    }
}

function drawPlayer(ctx, player, gameState) {
    const { x, y, legAngle, rotation } = player;
    const playerHeight = GAME_CONFIG.PLAYER_HEIGHT;

    ctx.save();
    ctx.translate(x + GAME_CONFIG.PLAYER_WIDTH / 2, y);
    ctx.rotate(rotation);
    ctx.translate(-(x + GAME_CONFIG.PLAYER_WIDTH / 2), -y);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Draw head
    ctx.beginPath();
    ctx.arc(
        x + GAME_CONFIG.PLAYER_WIDTH / 2,
        y - playerHeight + GAME_CONFIG.HEAD_RADIUS,
        GAME_CONFIG.HEAD_RADIUS,
        0,
        Math.PI * 2
    );
    ctx.stroke();

    // Draw body
    ctx.beginPath();
    ctx.moveTo(x + GAME_CONFIG.PLAYER_WIDTH / 2, y - playerHeight + GAME_CONFIG.HEAD_RADIUS * 2);
    ctx.lineTo(x + GAME_CONFIG.PLAYER_WIDTH / 2, y - GAME_CONFIG.HEAD_RADIUS);
    ctx.stroke();

    // Draw legs with animation
    if (gameState === GameState.WALKING || gameState === GameState.WALKING_TO_FALL) {
        // Animated walking legs
        ctx.beginPath();
        ctx.moveTo(x + GAME_CONFIG.PLAYER_WIDTH / 2, y - GAME_CONFIG.HEAD_RADIUS);
        ctx.lineTo(
            x + GAME_CONFIG.PLAYER_WIDTH / 2 + Math.cos(legAngle) * GAME_CONFIG.HEAD_RADIUS * 2,
            y
        );
        ctx.moveTo(x + GAME_CONFIG.PLAYER_WIDTH / 2, y - GAME_CONFIG.HEAD_RADIUS);
        ctx.lineTo(
            x + GAME_CONFIG.PLAYER_WIDTH / 2 + Math.cos(legAngle + Math.PI) * GAME_CONFIG.HEAD_RADIUS * 2,
            y
        );
    } else {
        // Standing legs
        ctx.beginPath();
        ctx.moveTo(x + GAME_CONFIG.PLAYER_WIDTH / 2, y - GAME_CONFIG.HEAD_RADIUS);
        ctx.lineTo(x + GAME_CONFIG.PLAYER_WIDTH / 2 - GAME_CONFIG.HEAD_RADIUS, y);
        ctx.moveTo(x + GAME_CONFIG.PLAYER_WIDTH / 2, y - GAME_CONFIG.HEAD_RADIUS);
        ctx.lineTo(x + GAME_CONFIG.PLAYER_WIDTH / 2 + GAME_CONFIG.HEAD_RADIUS, y);
    }
    ctx.stroke();

    // Draw arms
    ctx.beginPath();
    ctx.moveTo(x + GAME_CONFIG.PLAYER_WIDTH / 2, y - playerHeight + GAME_CONFIG.HEAD_RADIUS * 3);
    ctx.lineTo(x + GAME_CONFIG.PLAYER_WIDTH / 2 - GAME_CONFIG.HEAD_RADIUS, y - playerHeight + GAME_CONFIG.HEAD_RADIUS * 4);
    ctx.moveTo(x + GAME_CONFIG.PLAYER_WIDTH / 2, y - playerHeight + GAME_CONFIG.HEAD_RADIUS * 3);
    ctx.lineTo(x + GAME_CONFIG.PLAYER_WIDTH / 2 + GAME_CONFIG.HEAD_RADIUS, y - playerHeight + GAME_CONFIG.HEAD_RADIUS * 4);
    ctx.stroke();

    ctx.restore();
}