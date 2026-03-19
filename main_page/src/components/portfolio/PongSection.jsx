import React, { useEffect, useRef, useState } from 'react';

const GAME_WIDTH = 920;
const GAME_HEIGHT = 520;
const PADDLE_WIDTH = 14;
const PADDLE_HEIGHT = 96;
const BALL_SIZE = 14;
const PADDLE_MARGIN = 28;
const PLAYER_SPEED = 430;
const AI_SPEED = 360;
const WINNING_SCORE = 7;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createInitialState() {
  return {
    playerY: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    botY: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    ballX: GAME_WIDTH / 2 - BALL_SIZE / 2,
    ballY: GAME_HEIGHT / 2 - BALL_SIZE / 2,
    ballVX: 320 * (Math.random() > 0.5 ? 1 : -1),
    ballVY: 220 * (Math.random() * 2 - 1)
  };
}

function resetBall(state, direction = 1) {
  state.ballX = GAME_WIDTH / 2 - BALL_SIZE / 2;
  state.ballY = GAME_HEIGHT / 2 - BALL_SIZE / 2;
  state.ballVX = 320 * direction;
  state.ballVY = 220 * (Math.random() * 2 - 1);
}

function TouchControl({ label, onPress, onRelease }) {
  return (
    <button
      type="button"
      className="inline-flex min-w-24 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/70 px-4 py-3 text-xs uppercase tracking-[0.18em] text-slate-200 transition hover:border-cyan-300/45 hover:text-cyan-100"
      onPointerDown={onPress}
      onPointerUp={onRelease}
      onPointerLeave={onRelease}
      onPointerCancel={onRelease}
    >
      {label}
    </button>
  );
}

function PongSection() {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const lastFrameRef = useRef(0);
  const gameRef = useRef(createInitialState());
  const keysRef = useRef({ up: false, down: false });
  const touchRef = useRef(0);
  const scoreRef = useRef({ player: 0, bot: 0 });
  const winnerRef = useRef(null);
  const [score, setScore] = useState({ player: 0, bot: 0 });
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    winnerRef.current = winner;
  }, [winner]);

  useEffect(() => {
    function onKeyDown(event) {
      const activeTag = document.activeElement?.tagName;
      const isTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable;
      if (isTyping) return;

      const key = event.key.toLowerCase();
      if (key === 'w') {
        event.preventDefault();
        keysRef.current.up = true;
      }
      if (key === 's') {
        event.preventDefault();
        keysRef.current.down = true;
      }
    }

    function onKeyUp(event) {
      const key = event.key.toLowerCase();
      if (key === 'w') keysRef.current.up = false;
      if (key === 's') keysRef.current.down = false;
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    function scorePoint(side) {
      const nextScore = {
        ...scoreRef.current,
        [side]: scoreRef.current[side] + 1
      };

      scoreRef.current = nextScore;
      setScore(nextScore);

      if (nextScore[side] >= WINNING_SCORE) {
        const nextWinner = side === 'player' ? 'You' : 'Bot';
        winnerRef.current = nextWinner;
        setWinner(nextWinner);
        return;
      }

      resetBall(gameRef.current, side === 'player' ? -1 : 1);
    }

    function drawNet() {
      context.strokeStyle = 'rgba(148, 163, 184, 0.28)';
      context.lineWidth = 3;
      context.setLineDash([10, 16]);
      context.beginPath();
      context.moveTo(GAME_WIDTH / 2, 18);
      context.lineTo(GAME_WIDTH / 2, GAME_HEIGHT - 18);
      context.stroke();
      context.setLineDash([]);
    }

    function drawGame() {
      const state = gameRef.current;

      context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      const background = context.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
      background.addColorStop(0, '#020617');
      background.addColorStop(1, '#0f172a');
      context.fillStyle = background;
      context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      context.fillStyle = 'rgba(34, 211, 238, 0.12)';
      context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      drawNet();

      context.fillStyle = '#e2e8f0';
      context.shadowColor = 'rgba(34, 211, 238, 0.2)';
      context.shadowBlur = 12;
      context.fillRect(PADDLE_MARGIN, state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
      context.fillRect(
        GAME_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
        state.botY,
        PADDLE_WIDTH,
        PADDLE_HEIGHT
      );
      context.fillRect(state.ballX, state.ballY, BALL_SIZE, BALL_SIZE);
      context.shadowBlur = 0;
    }

    function step(timestamp) {
      if (!lastFrameRef.current) {
        lastFrameRef.current = timestamp;
      }

      const delta = Math.min((timestamp - lastFrameRef.current) / 1000, 0.033);
      lastFrameRef.current = timestamp;

      if (!winnerRef.current) {
        const state = gameRef.current;
        const playerDirection = touchRef.current || (keysRef.current.down ? 1 : 0) - (keysRef.current.up ? 1 : 0);

        state.playerY = clamp(
          state.playerY + playerDirection * PLAYER_SPEED * delta,
          12,
          GAME_HEIGHT - PADDLE_HEIGHT - 12
        );

        const botCenter = state.botY + PADDLE_HEIGHT / 2;
        const ballCenter = state.ballY + BALL_SIZE / 2;
        const botDirection = ballCenter > botCenter + 10 ? 1 : ballCenter < botCenter - 10 ? -1 : 0;
        state.botY = clamp(
          state.botY + botDirection * AI_SPEED * delta,
          12,
          GAME_HEIGHT - PADDLE_HEIGHT - 12
        );

        state.ballX += state.ballVX * delta;
        state.ballY += state.ballVY * delta;

        if (state.ballY <= 12 || state.ballY + BALL_SIZE >= GAME_HEIGHT - 12) {
          state.ballY = clamp(state.ballY, 12, GAME_HEIGHT - BALL_SIZE - 12);
          state.ballVY *= -1;
        }

        const playerPaddleX = PADDLE_MARGIN;
        const botPaddleX = GAME_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH;

        const hitsPlayer = (
          state.ballX <= playerPaddleX + PADDLE_WIDTH &&
          state.ballX + BALL_SIZE >= playerPaddleX &&
          state.ballY + BALL_SIZE >= state.playerY &&
          state.ballY <= state.playerY + PADDLE_HEIGHT &&
          state.ballVX < 0
        );

        const hitsBot = (
          state.ballX + BALL_SIZE >= botPaddleX &&
          state.ballX <= botPaddleX + PADDLE_WIDTH &&
          state.ballY + BALL_SIZE >= state.botY &&
          state.ballY <= state.botY + PADDLE_HEIGHT &&
          state.ballVX > 0
        );

        if (hitsPlayer || hitsBot) {
          const paddleY = hitsPlayer ? state.playerY : state.botY;
          const paddleCenter = paddleY + PADDLE_HEIGHT / 2;
          const ballCenterY = state.ballY + BALL_SIZE / 2;
          const impact = (ballCenterY - paddleCenter) / (PADDLE_HEIGHT / 2);
          const nextSpeed = Math.min(Math.abs(state.ballVX) + 18, 640);

          state.ballVX = hitsPlayer ? nextSpeed : -nextSpeed;
          state.ballVY = impact * 300;
          state.ballX = hitsPlayer
            ? playerPaddleX + PADDLE_WIDTH
            : botPaddleX - BALL_SIZE;
        }

        if (state.ballX + BALL_SIZE < 0) {
          scorePoint('bot');
        } else if (state.ballX > GAME_WIDTH) {
          scorePoint('player');
        }
      }

      drawGame();
      frameRef.current = requestAnimationFrame(step);
    }

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  function resetGame() {
    scoreRef.current = { player: 0, bot: 0 };
    setScore(scoreRef.current);
    winnerRef.current = null;
    setWinner(null);
    gameRef.current = createInitialState();
    lastFrameRef.current = 0;
  }

  return (
    <section id="pong" data-reveal className="py-20 md:py-28">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-300/75">
            Mini Game
          </p>
          <h2 className="mt-3 font-sans text-3xl font-bold text-slate-100 md:text-4xl">
            Pong
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
            You are the left paddle. Use <span className="font-semibold text-slate-100">W</span> and <span className="font-semibold text-slate-100">S</span> to play against the bot.
          </p>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">You</p>
            <p className="mt-2 font-sans text-3xl font-bold text-cyan-300">{score.player}</p>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Bot</p>
            <p className="mt-2 font-sans text-3xl font-bold text-slate-100">{score.bot}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_42%),linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(2,6,23,0.98))] p-4 shadow-[0_24px_80px_rgba(2,6,23,0.42)] md:p-6">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="block w-full rounded-[1.5rem] border border-slate-800 bg-slate-950"
        />

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <TouchControl label="Up" onPress={() => { touchRef.current = -1; }} onRelease={() => { touchRef.current = 0; }} />
            <TouchControl label="Down" onPress={() => { touchRef.current = 1; }} onRelease={() => { touchRef.current = 0; }} />
          </div>

          <div className="flex items-center gap-3">
            {winner && (
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-slate-100">{winner}</span> won. First to {WINNING_SCORE}.
              </p>
            )}
            <button
              type="button"
              className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300/55 hover:bg-cyan-300/14 hover:text-cyan-100"
              onClick={resetGame}
            >
              Reset match
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PongSection;
