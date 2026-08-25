import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Play, RotateCcw, AlertTriangle, 
  Gamepad2, Zap, Brain, LayoutGrid, Sparkles
} from 'lucide-react';

export default function FocusGames() {
  const [activeTab, setActiveTab] = useState('schulte'); // 'schulte', 'simon', 'reaction', 'matrix'

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Game Mode Selector Tabs */}
      <div className="flex flex-wrap gap-3 pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('schulte')}
          className={`px-5 py-3 rounded-2xl font-black text-sm flex items-center gap-2 cursor-pointer transition-all duration-300 ${
            activeTab === 'schulte'
              ? 'bg-gradient-to-r from-teal-500 to-teal-650 text-white shadow-lg shadow-teal-500/20'
              : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-850 hover:text-slate-200'
          }`}
        >
          <LayoutGrid size={16} />
          Schulte Grid
        </button>

        <button
          onClick={() => setActiveTab('simon')}
          className={`px-5 py-3 rounded-2xl font-black text-sm flex items-center gap-2 cursor-pointer transition-all duration-300 ${
            activeTab === 'simon'
              ? 'bg-gradient-to-r from-teal-500 to-teal-650 text-white shadow-lg shadow-teal-500/20'
              : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-850 hover:text-slate-200'
          }`}
        >
          <Brain size={16} />
          Attention Recall
        </button>

        <button
          onClick={() => setActiveTab('reaction')}
          className={`px-5 py-3 rounded-2xl font-black text-sm flex items-center gap-2 cursor-pointer transition-all duration-300 ${
            activeTab === 'reaction'
              ? 'bg-gradient-to-r from-teal-500 to-teal-650 text-white shadow-lg shadow-teal-500/20'
              : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-850 hover:text-slate-200'
          }`}
        >
          <Zap size={16} />
          Alertness Check
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-5 py-3 rounded-2xl font-black text-sm flex items-center gap-2 cursor-pointer transition-all duration-300 ${
            activeTab === 'matrix'
              ? 'bg-gradient-to-r from-teal-500 to-teal-650 text-white shadow-lg shadow-teal-500/20'
              : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-850 hover:text-slate-200'
          }`}
        >
          <Gamepad2 size={16} />
          Matrix Memory
        </button>
      </div>

      {/* Render Active Game Module */}
      <div className="transition-all duration-500">
        {activeTab === 'schulte' && <SchulteGridGame />}
        {activeTab === 'simon' && <SimonSaysGame />}
        {activeTab === 'reaction' && <ReactionTimerGame />}
        {activeTab === 'matrix' && <MatrixMemoryGame />}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// GAME 1: SCHULTE GRID (ATTENTION FINDER)
// ----------------------------------------------------
function SchulteGridGame() {
  const [grid, setGrid] = useState([]);
  const [nextNum, setNextNum] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [bestTime, setBestTime] = useState(() => {
    return parseFloat(localStorage.getItem('schulte_best') || '999');
  });
  const [isWon, setIsWon] = useState(false);
  
  const timerRef = useRef(null);

  const generateGrid = () => {
    const arr = Array.from({ length: 16 }, (_, i) => i + 1);
    // Shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setGrid(arr);
    setNextNum(1);
    setTime(0);
    setIsWon(false);
  };

  const startNewGame = () => {
    generateGrid();
    setIsPlaying(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      setTime(parseFloat(((Date.now() - start) / 1000).toFixed(2)));
    }, 10);
  };

  const handleTileClick = (num) => {
    if (!isPlaying) return;
    if (num === nextNum) {
      if (num === 16) {
        // WIN
        clearInterval(timerRef.current);
        setIsPlaying(false);
        setIsWon(true);
        if (time < bestTime) {
          setBestTime(time);
          localStorage.setItem('schulte_best', String(time));
        }
      } else {
        setNextNum(num + 1);
      }
    }
  };

  useEffect(() => {
    generateGrid();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Description Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card p-6 rounded-3xl border border-teal-500/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <LayoutGrid size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-100 uppercase">Schulte Grid</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed font-bold">
            Train your peripheral vision, visual search speed, and focused attention!
          </p>
          <div className="mt-4 border-t border-slate-800/60 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest">How to Play:</h4>
            <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
              <li>Click numbers from <span className="text-slate-200 font-black">1 to 16</span> in ascending order.</li>
              <li>Keep your eyes anchored in the center of the grid.</li>
              <li>Find each number as quickly as possible!</li>
            </ul>
          </div>
        </div>

        {/* Stats card */}
        <div className="glass-card p-6 rounded-3xl border border-teal-500/10 flex justify-between items-center bg-slate-900/30">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Personal Best</p>
            <p className="text-2xl font-black text-slate-100 mt-1 font-mono">
              {bestTime === 999 ? 'N/A' : `${bestTime}s`}
            </p>
          </div>
          <Trophy size={36} className="text-amber-500 drop-shadow-lg" />
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="lg:col-span-8 flex flex-col items-center">
        <div className="glass-card w-full max-w-md p-6 rounded-[2rem] border border-teal-500/15 flex flex-col items-center gap-6">
          <div className="w-full flex justify-between items-center select-none font-mono">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Elapsed Time</p>
              <p className="text-3xl font-black text-teal-400">{time.toFixed(2)}s</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Target</p>
              <p className="text-3xl font-black text-slate-200">{isWon ? 'Done!' : nextNum}</p>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-4 gap-3 w-full aspect-square">
            {grid.map((num, i) => {
              const isPassed = num < nextNum;
              const isNext = num === nextNum;
              return (
                <button
                  key={i}
                  disabled={!isPlaying}
                  onClick={() => handleTileClick(num)}
                  className={`rounded-2xl text-xl font-black cursor-pointer select-none transition-all duration-200 border-2 font-mono flex items-center justify-center ${
                    isPassed 
                      ? 'bg-teal-950/20 border-teal-500/20 text-teal-500/30'
                      : isPlaying && isNext
                      ? 'bg-teal-900/10 border-teal-400 text-teal-400 shadow-md shadow-teal-500/10'
                      : isPlaying
                      ? 'bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700 active:scale-95'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          <div className="w-full mt-2">
            {!isPlaying ? (
              <button
                onClick={startNewGame}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-650 hover:from-teal-500 hover:to-teal-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-teal-950/60 hover:scale-103 active:scale-98 transition-all"
              >
                {isWon ? <RotateCcw size={16} /> : <Play size={16} fill="currentColor" />}
                {isWon ? 'Play Again' : 'Start Focus Run'}
              </button>
            ) : (
              <button
                onClick={() => {
                  if (timerRef.current) clearInterval(timerRef.current);
                  setIsPlaying(false);
                  setTime(0);
                  setNextNum(1);
                }}
                className="w-full py-4 bg-slate-900 hover:bg-slate-850 text-slate-450 border border-slate-800 font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                Abort Run
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// GAME 2: SIMON PATTERN MATCH (ATTENTION RECALL)
// ----------------------------------------------------
function SimonSaysGame() {
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePad, setActivePad] = useState(null); 
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('simon_best') || '0');
  });
  const [gameOver, setGameOver] = useState(false);
  const [gameStateMsg, setGameStateMsg] = useState('Recall & Click');

  const padDetails = [
    { id: 0, color: 'bg-emerald-500/30 border-emerald-500/50 hover:bg-emerald-500/40 text-emerald-400', activeClass: 'bg-emerald-400 border-emerald-300 shadow-emerald-500 shadow-2xl scale-103' },
    { id: 1, color: 'bg-rose-500/30 border-rose-500/50 hover:bg-rose-500/40 text-rose-455', activeClass: 'bg-rose-400 border-rose-300 shadow-rose-500 shadow-2xl scale-103' },
    { id: 2, color: 'bg-amber-500/30 border-amber-500/50 hover:bg-amber-500/40 text-amber-400', activeClass: 'bg-amber-400 border-amber-300 shadow-amber-500 shadow-2xl scale-103' },
    { id: 3, color: 'bg-sky-500/30 border-sky-500/50 hover:bg-sky-500/40 text-sky-400', activeClass: 'bg-sky-400 border-sky-300 shadow-sky-500 shadow-2xl scale-103' }
  ];

  const playSequence = async (seq) => {
    setIsPlayerTurn(false);
    setGameStateMsg('Watch closely...');
    for (let i = 0; i < seq.length; i++) {
      await new Promise(r => setTimeout(r, 450));
      setActivePad(seq[i]);
      await new Promise(r => setTimeout(r, 400));
      setActivePad(null);
    }
    await new Promise(r => setTimeout(r, 200));
    setIsPlayerTurn(true);
    setGameStateMsg('Your Turn! Click!');
  };

  const startNewGame = () => {
    const firstPad = Math.floor(Math.random() * 4);
    const newSeq = [firstPad];
    setSequence(newSeq);
    setUserSequence([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    playSequence(newSeq);
  };

  const handlePadClick = (id) => {
    if (!isPlaying || !isPlayerTurn || gameOver) return;
    
    setActivePad(id);
    setTimeout(() => setActivePad(null), 150);

    const nextUserSeq = [...userSequence, id];
    setUserSequence(nextUserSeq);

    const currentStep = nextUserSeq.length - 1;
    if (nextUserSeq[currentStep] !== sequence[currentStep]) {
      setGameOver(true);
      setIsPlaying(false);
      setGameStateMsg('Game Over! Focus Break!');
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('simon_best', String(score));
      }
      return;
    }

    if (nextUserSeq.length === sequence.length) {
      setScore(score + 1);
      setUserSequence([]);
      const nextSequence = [...sequence, Math.floor(Math.random() * 4)];
      setSequence(nextSequence);
      setTimeout(() => {
        playSequence(nextSequence);
      }, 700);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Description Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card p-6 rounded-3xl border border-teal-500/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Brain size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-100 uppercase">Attention Recall</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed font-bold">
            Train your sustained attention and working memory. Keep track of growing color flash sequences!
          </p>
          <div className="mt-4 border-t border-slate-800/60 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest">How to Play:</h4>
            <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
              <li>Watch the colored blocks light up in sequence.</li>
              <li>Replay the exact sequence in the same order.</li>
              <li>The list grows by one tile every successful round.</li>
            </ul>
          </div>
        </div>

        {/* Stats card */}
        <div className="glass-card p-6 rounded-3xl border border-teal-500/10 flex justify-between items-center bg-slate-900/30">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Score</p>
            <p className="text-2xl font-black text-slate-100 mt-1 font-mono">
              {highScore} Rounds
            </p>
          </div>
          <Trophy size={36} className="text-amber-500 drop-shadow-lg" />
        </div>
      </div>

      {/* Game Layout */}
      <div className="lg:col-span-8 flex flex-col items-center">
        <div className="glass-card w-full max-w-md p-6 rounded-[2rem] border border-teal-500/15 flex flex-col items-center gap-6 select-none">
          <div className="w-full flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Current Score</p>
              <p className="text-3xl font-black text-teal-400 font-mono">{score}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">State</p>
              <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                gameOver
                  ? 'bg-rose-950/40 border-rose-500/30 text-rose-455'
                  : isPlayerTurn
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 animate-pulse'
                  : isPlaying
                  ? 'bg-amber-950/40 border-amber-500/30 text-amber-400'
                  : 'bg-slate-950/40 border-slate-900 text-slate-500'
              }`}>
                {gameStateMsg}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full aspect-square">
            {padDetails.map((pad) => {
              const active = activePad === pad.id;
              return (
                <button
                  key={pad.id}
                  disabled={!isPlaying || !isPlayerTurn || gameOver}
                  onClick={() => handlePadClick(pad.id)}
                  className={`rounded-[2rem] border-2 cursor-pointer transition-all duration-150 active:scale-95 ${
                    active ? pad.activeClass : pad.color
                  } ${
                    (!isPlayerTurn && isPlaying) ? 'cursor-not-allowed opacity-90' : ''
                  }`}
                  style={{ minHeight: '120px' }}
                />
              );
            })}
          </div>

          <div className="w-full mt-2">
            {!isPlaying ? (
              <button
                onClick={startNewGame}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-650 hover:from-teal-500 hover:to-teal-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-teal-950/60 hover:scale-103 active:scale-98 transition-all"
              >
                {gameOver ? <RotateCcw size={16} /> : <Play size={16} fill="currentColor" />}
                {gameOver ? 'Try Again' : 'Begin Memory Challenge'}
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setGameOver(false);
                  setGameStateMsg('Aborted');
                }}
                className="w-full py-4 bg-slate-900 hover:bg-slate-850 text-slate-450 border border-slate-800 font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                Abort Challenge
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// GAME 3: REACTION TIMER (ALERTNESS CHECK)
// ----------------------------------------------------
function ReactionTimerGame() {
  const [gameState, setGameState] = useState('idle'); 
  const [trials, setTrials] = useState([]);
  const [reactionTime, setReactionTime] = useState(0);
  const [bestTime, setBestTime] = useState(() => {
    return parseInt(localStorage.getItem('reaction_best') || '9999');
  });

  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  const startTest = () => {
    setGameState('wait');
    const delay = Math.random() * 3000 + 1500; 
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setGameState('click');
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleContainerClick = () => {
    if (gameState === 'wait') {
      clearTimeout(timerRef.current);
      setGameState('early');
    } else if (gameState === 'click') {
      const duration = Date.now() - startTimeRef.current;
      setReactionTime(duration);
      setTrials(prev => [duration, ...prev].slice(0, 5));
      setGameState('result');
      
      if (duration < bestTime) {
        setBestTime(duration);
        localStorage.setItem('reaction_best', String(duration));
      }
    }
  };

  const getAverageTime = () => {
    if (trials.length === 0) return 0;
    const sum = trials.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum / trials.length);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Description Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card p-6 rounded-3xl border border-teal-500/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Zap size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-100 uppercase">Alertness Check</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed font-bold">
            Measure your reaction time to check your focus, fatigue levels, and neurological alertness!
          </p>
          <div className="mt-4 border-t border-slate-800/60 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest">How to Play:</h4>
            <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
              <li>Click the card to begin, then wait for the alert area to turn green.</li>
              <li>As soon as it turns green, click anywhere on the box!</li>
              <li>Avoid jumping early, or you will get penalized.</li>
            </ul>
          </div>
        </div>

        {/* Stats card */}
        <div className="glass-card p-6 rounded-3xl border border-teal-500/10 flex justify-between items-center bg-slate-900/30">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Alert Speed</p>
            <p className="text-2xl font-black text-slate-100 mt-1 font-mono">
              {bestTime === 9999 ? 'N/A' : `${bestTime}ms`}
            </p>
          </div>
          <Zap size={36} className="text-teal-400 drop-shadow-lg animate-pulse" />
        </div>
      </div>

      <div className="lg:col-span-8 flex flex-col items-center">
        <div className="w-full max-w-lg flex flex-col gap-6">
          <div 
            onClick={handleContainerClick}
            className={`w-full h-80 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-150 flex flex-col items-center justify-center text-center p-8 select-none ${
              gameState === 'idle'
                ? 'bg-slate-900/50 border-slate-800 hover:border-teal-500/30 text-slate-350'
                : gameState === 'wait'
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-455 cursor-not-allowed'
                : gameState === 'click'
                ? 'bg-emerald-500/15 border-emerald-400 text-emerald-400 shadow-2xl shadow-emerald-500/10'
                : gameState === 'result'
                ? 'bg-teal-950/20 border-teal-400 text-teal-400'
                : 'bg-amber-950/30 border-amber-500/40 text-amber-400'
            }`}
          >
            {gameState === 'idle' && (
              <div className="space-y-3 pointer-events-none">
                <Play size={44} className="mx-auto text-teal-450 opacity-80" />
                <h4 className="text-xl font-extrabold text-slate-100">CLICK TO BEGIN SPEED RUN</h4>
                <p className="text-xs text-slate-450 font-bold">Alert area will load shortly</p>
              </div>
            )}

            {gameState === 'wait' && (
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto"></div>
                <h4 className="text-2xl font-black uppercase tracking-wider animate-pulse">Wait for green...</h4>
                <p className="text-xs opacity-75 font-bold">Do not click yet!</p>
              </div>
            )}

            {gameState === 'click' && (
              <div className="space-y-2 scale-105 transition-all">
                <Zap size={56} className="mx-auto animate-bounce text-emerald-450 fill-emerald-500" />
                <h4 className="text-3xl font-black uppercase tracking-widest">CLICK NOW!</h4>
                <p className="text-xs uppercase font-extrabold opacity-80">Quick! Tap anywhere!</p>
              </div>
            )}

            {gameState === 'result' && (
              <div className="space-y-3">
                <Sparkles size={40} className="mx-auto text-teal-350 drop-shadow-md" />
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest font-mono">Reaction Time</h4>
                <p className="text-5xl font-black text-slate-100 font-mono">{reactionTime}ms</p>
                <p className="text-xs font-bold text-slate-455 uppercase mt-2">Click to start another trial</p>
              </div>
            )}

            {gameState === 'early' && (
              <div className="space-y-3">
                <AlertTriangle size={44} className="mx-auto text-amber-500" />
                <h4 className="text-2xl font-black uppercase tracking-wider">Too early!</h4>
                <p className="text-xs text-slate-400 font-bold">Wait for the screen to turn green before tapping.</p>
                <p className="text-xs text-amber-450 uppercase font-black tracking-widest mt-4">Click to Reset</p>
              </div>
            )}
          </div>

          {(gameState === 'result' || gameState === 'early') && (
            <button
              onClick={startTest}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-650 hover:from-teal-500 hover:to-teal-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-teal-950/60 hover:scale-103 active:scale-98 transition-all font-mono"
            >
              <RotateCcw size={16} /> Try Again
            </button>
          )}

          {trials.length > 0 && (
            <div className="glass-card p-6 rounded-3xl border border-teal-500/10">
              <div className="flex justify-between items-center mb-4 select-none">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Recent Runs</h4>
                <p className="text-xs font-bold text-slate-350">
                  Average Time: <span className="text-teal-400 font-black font-mono">{getAverageTime()}ms</span>
                </p>
              </div>
              <ul className="space-y-2">
                {trials.map((t, idx) => (
                  <li key={idx} className="flex justify-between items-center py-2 px-4 rounded-xl bg-slate-950/30 border border-slate-900/80 font-mono text-sm">
                    <span className="text-slate-500 text-xs">Run #{trials.length - idx}</span>
                    <span className="font-black text-slate-200">{t}ms</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// GAME 4: MATRIX MEMORY (SPATIAL MEMORIZATION)
// ----------------------------------------------------
function MatrixMemoryGame() {
  const [level, setLevel] = useState(1);
  const [gridSize, setGridSize] = useState(4); 
  const [activeTiles, setActiveTiles] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [gameState, setGameState] = useState('idle'); 
  const [bestLevel, setBestLevel] = useState(() => {
    return parseInt(localStorage.getItem('matrix_best') || '1');
  });

  const generateLevel = (lvl) => {
    const numTiles = Math.min(3 + lvl, 10);
    const totalTiles = gridSize * gridSize;
    const indices = [];

    while (indices.length < numTiles) {
      const idx = Math.floor(Math.random() * totalTiles);
      if (!indices.includes(idx)) {
        indices.push(idx);
      }
    }

    setActiveTiles(indices);
    setSelectedTiles([]);
    setGameState('showing');

    setTimeout(() => {
      setGameState('playing');
    }, 1250);
  };

  const startNewGame = () => {
    setLevel(1);
    setGameState('showing');
    generateLevel(1);
  };

  const handleTileClick = (idx) => {
    if (gameState !== 'playing') return;
    if (selectedTiles.includes(idx)) return;

    if (activeTiles.includes(idx)) {
      const nextSelection = [...selectedTiles, idx];
      setSelectedTiles(nextSelection);

      if (nextSelection.length === activeTiles.length) {
        setGameState('win');
        const nextLvl = level + 1;
        setLevel(nextLvl);
        if (nextLvl > bestLevel) {
          setBestLevel(nextLvl);
          localStorage.setItem('matrix_best', String(nextLvl));
        }
      }
    } else {
      setGameState('lose');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Description Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card p-6 rounded-3xl border border-teal-500/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Gamepad2 size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-100 uppercase">Matrix Memory</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed font-bold">
            Train your spatial working memory and pattern recognition. Memorize grid configurations!
          </p>
          <div className="mt-4 border-t border-slate-800/60 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest">How to Play:</h4>
            <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
              <li>Click start level. Memorize the glowing green tiles.</li>
              <li>Wait for the tiles to turn off, then click the correct locations.</li>
              <li>Clear each level to increase tile patterns.</li>
            </ul>
          </div>
        </div>

        {/* Stats card */}
        <div className="glass-card p-6 rounded-3xl border border-teal-500/10 flex justify-between items-center bg-slate-900/30">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Stage Cleared</p>
            <p className="text-2xl font-black text-slate-100 mt-1 font-mono">
              Level {bestLevel}
            </p>
          </div>
          <Trophy size={36} className="text-amber-500 drop-shadow-lg" />
        </div>
      </div>

      <div className="lg:col-span-8 flex flex-col items-center">
        <div className="glass-card w-full max-w-md p-6 rounded-[2rem] border border-teal-500/15 flex flex-col items-center gap-6 select-none">
          <div className="w-full flex justify-between items-center font-mono">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage Level</p>
              <p className="text-3xl font-black text-teal-400">Level {level}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">State</p>
              <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                gameState === 'showing'
                  ? 'bg-amber-950/40 border-amber-500/30 text-amber-400 animate-pulse'
                  : gameState === 'playing'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 animate-pulse'
                  : gameState === 'win'
                  ? 'bg-teal-950/45 border-teal-500/30 text-teal-400'
                  : gameState === 'lose'
                  ? 'bg-rose-950/40 border-rose-500/30 text-rose-455'
                  : 'bg-slate-950/40 border-slate-900 text-slate-500'
              }`}>
                {gameState === 'showing' && 'MEMORIZE NOW'}
                {gameState === 'playing' && 'CLICK TILES'}
                {gameState === 'win' && 'LEVEL CLEAR!'}
                {gameState === 'lose' && 'FAILED'}
                {gameState === 'idle' && 'READY'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3.5 w-full aspect-square bg-slate-950/20 p-2.5 border border-slate-800/80 rounded-3xl">
            {Array.from({ length: 16 }).map((_, idx) => {
              const active = activeTiles.includes(idx);
              const selected = selectedTiles.includes(idx);
              
              let tileClass = 'bg-slate-900/60 border-slate-800 text-transparent';
              
              if (gameState === 'showing') {
                if (active) {
                  tileClass = 'bg-emerald-555 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-98';
                }
              } else if (gameState === 'playing') {
                if (selected) {
                  tileClass = 'bg-emerald-500/30 border-emerald-500/60 text-emerald-400 scale-95';
                } else {
                  tileClass = 'bg-slate-900/90 border-slate-800 text-transparent hover:bg-slate-850 hover:border-slate-700 active:scale-95';
                }
              } else if (gameState === 'win') {
                if (active) {
                  tileClass = 'bg-emerald-555 border-emerald-400 scale-98';
                }
              } else if (gameState === 'lose') {
                if (active && !selected) {
                  tileClass = 'bg-amber-500 border-amber-400';
                } else if (selected) {
                  tileClass = 'bg-emerald-500/30 border-emerald-500';
                } else {
                  tileClass = 'bg-rose-550 border-rose-400 scale-95';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={gameState !== 'playing'}
                  onClick={() => handleTileClick(idx)}
                  className={`rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-center ${tileClass}`}
                />
              );
            })}
          </div>

          <div className="w-full mt-2">
            {gameState === 'idle' || gameState === 'lose' ? (
              <button
                onClick={startNewGame}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-650 hover:from-teal-500 hover:to-teal-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-teal-950/60 hover:scale-103 active:scale-98 transition-all"
              >
                {gameState === 'lose' ? <RotateCcw size={16} /> : <Play size={16} fill="currentColor" />}
                {gameState === 'lose' ? 'Try Again' : 'Begin Memory Test'}
              </button>
            ) : gameState === 'win' ? (
              <button
                onClick={() => generateLevel(level)}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-650 hover:from-teal-500 hover:to-teal-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-teal-950/60 hover:scale-103 active:scale-98 transition-all"
              >
                <Play size={16} fill="currentColor" />
                Proceed to Stage {level}
              </button>
            ) : (
              <button
                onClick={() => {
                  setGameState('idle');
                  setLevel(1);
                  setActiveTiles([]);
                  setSelectedTiles([]);
                }}
                className="w-full py-4 bg-slate-900 hover:bg-slate-850 text-slate-450 border border-slate-800 font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                Abort Test
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
