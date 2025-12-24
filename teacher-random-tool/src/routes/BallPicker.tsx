import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import { PhysicsEngine } from '../canvas/PhysicsEngine';
import { Ball } from '../canvas/Ball';

const BallPicker: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<PhysicsEngine | null>(null);
    const requestRef = useRef<number>(0);

    // Settings
    const [totalBalls, setTotalBalls] = useState<number>(30);
    const [gameMode, setGameMode] = useState<1 | 2>(1);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [winner, setWinner] = useState<number | null>(null);

    useEffect(() => {
        if (canvasRef.current && !engineRef.current) {
            engineRef.current = new PhysicsEngine(canvasRef.current.width, canvasRef.current.height, gameMode);
        }
    }, []);

    const handleModeChange = (mode: 1 | 2) => {
        setGameMode(mode);
        if (engineRef.current) {
            engineRef.current.setMode(mode);
        }
    };

    const startSimulation = () => {
        if (!canvasRef.current || !engineRef.current) return;
        if (totalBalls < 1) {
            alert('공의 개수는 1개 이상이어야 합니다.');
            return;
        }

        setIsPlaying(true);
        setWinner(null);

        const engine = engineRef.current;

        if (gameMode === 2) {
            engine.setMode(2);
        }

        engine.clear();

        const colors = ['#00FFFF', '#FF00FF', '#FFFF00', '#00FF00', '#FFaaaa', '#aaaaFF'];
        for (let i = 1; i <= totalBalls; i++) {
            const x = (engine.width / 2) + (Math.random() - 0.5) * 50;
            const y = Math.random() * 50 - 60;
            const color = colors[i % colors.length];
            const ball = new Ball(x, y, 15, i, color);
            engine.addBall(ball);
        }

        animate();
    };

    const animate = () => {
        if (!canvasRef.current || !engineRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const engine = engineRef.current;

        engine.update();
        engine.draw(ctx);

        const goalBall = engine.getGoalBall();
        if (goalBall) {
            setWinner(goalBall.number);
            setIsPlaying(false);
            cancelAnimationFrame(requestRef.current);
            return;
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        return () => {
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#ffffff'
        }}>
            <Header />
            <div className="container" style={{ maxWidth: '1000px', paddingTop: '1rem' }}>
                {/* 타이틀 영역 */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(90deg, #00FFFF, #FF00FF, #FFFF00)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 30px rgba(255,0,255,0.3)',
                        margin: 0
                    }}>
                        🎱 공 튀기기 레이스
                    </h1>
                    <p style={{ color: '#666', marginTop: '0.5rem' }}>
                        {gameMode === 1 ? '고정된 코스에서 레이싱!' : '매번 새로운 랜덤 코스!'}
                    </p>
                </div>

                {/* 컨트롤 패널 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '1.5rem',
                    marginBottom: '1.5rem',
                    padding: '1.2rem 2rem',
                    background: 'rgba(0,0,0,0.03)',
                    borderRadius: '16px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)',
                    flexWrap: 'wrap'
                }}>
                    {/* 모드 선택 */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => handleModeChange(1)}
                            disabled={isPlaying}
                            style={{
                                background: gameMode === 1 ? '#4A90E2' : '#f0f0f0',
                                color: gameMode === 1 ? '#fff' : '#666',
                                padding: '0.6rem 1.2rem',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                border: gameMode === 1 ? 'none' : '1px solid #ddd',
                                borderRadius: '8px',
                                cursor: isPlaying ? 'not-allowed' : 'pointer',
                                opacity: isPlaying ? 0.5 : 1,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            🎯 고정 맵
                        </button>
                        <button
                            onClick={() => handleModeChange(2)}
                            disabled={isPlaying}
                            style={{
                                background: gameMode === 2 ? '#E24A90' : '#f0f0f0',
                                color: gameMode === 2 ? '#fff' : '#666',
                                padding: '0.6rem 1.2rem',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                border: gameMode === 2 ? 'none' : '1px solid #ddd',
                                borderRadius: '8px',
                                cursor: isPlaying ? 'not-allowed' : 'pointer',
                                opacity: isPlaying ? 0.5 : 1,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            🎲 랜덤 맵
                        </button>
                    </div>

                    {/* 공 개수 */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(240,240,245,0.9)',
                        padding: '0.5rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(0,0,0,0.1)'
                    }}>
                        <span style={{ color: '#333', fontWeight: '500' }}>🎾 공 개수</span>
                        <input
                            type="number"
                            value={totalBalls}
                            onChange={(e) => setTotalBalls(parseInt(e.target.value) || 0)}
                            style={{
                                width: '55px',
                                padding: '0.4rem 0.5rem',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                background: 'rgba(255,255,255,0.9)',
                                border: '2px solid rgba(0,200,200,0.5)',
                                borderRadius: '8px',
                                color: '#0ff',
                                outline: 'none'
                            }}
                            min="1"
                            max="50"
                            disabled={isPlaying}
                        />
                    </div>

                    {/* 시작 버튼 */}
                    <button
                        onClick={startSimulation}
                        disabled={isPlaying}
                        style={{
                            background: isPlaying
                                ? 'linear-gradient(135deg, #444, #333)'
                                : 'linear-gradient(135deg, #ff00ff, #ff6600, #ffff00)',
                            backgroundSize: '200% 200%',
                            animation: isPlaying ? 'none' : 'gradient 3s ease infinite',
                            border: 'none',
                            color: '#fff',
                            padding: '0.8rem 2rem',
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            borderRadius: '12px',
                            boxShadow: isPlaying ? 'none' : '0 0 25px rgba(255,0,255,0.5)',
                            cursor: isPlaying ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                    >
                        {isPlaying ? '⏳ 레이싱 중...' : '🚀 START!'}
                    </button>
                </div>

                {/* 팁 안내 */}
                <div style={{
                    textAlign: 'center',
                    color: '#888',
                    fontSize: '0.85rem',
                    marginBottom: '1rem'
                }}>
                    💡 {gameMode === 1
                        ? '고정 맵: 항상 같은 장애물 배치'
                        : '랜덤 맵: 매번 새로운 장애물!'}
                </div>

                {/* 캔버스 영역 */}
                <div style={{
                    position: 'relative',
                    width: 'fit-content',
                    margin: '0 auto',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 0 40px rgba(0,255,255,0.2), 0 0 80px rgba(255,0,255,0.1)'
                }}>
                    <canvas
                        ref={canvasRef}
                        id="ball-canvas"
                        width="800"
                        height="600"
                        style={{
                            display: 'block',
                            border: '3px solid rgba(0,255,255,0.3)',
                            borderRadius: '16px',
                            backgroundColor: '#000'
                        }}
                    />

                    {/* 승자 모달 */}
                    {winner !== null && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0, 0, 0, 0.85)',
                            backdropFilter: 'blur(5px)'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(20,20,40,0.95), rgba(40,20,60,0.95))',
                                border: '3px solid #00FFFF',
                                padding: '2.5rem 4rem',
                                borderRadius: '24px',
                                boxShadow: '0 0 60px rgba(0,255,255,0.5), inset 0 0 30px rgba(0,255,255,0.1)',
                                textAlign: 'center',
                                animation: 'popIn 0.3s ease'
                            }}>
                                <div style={{
                                    fontSize: '1.2rem',
                                    color: '#FFFF00',
                                    textShadow: '0 0 15px #FFFF00',
                                    marginBottom: '0.5rem',
                                    letterSpacing: '3px'
                                }}>
                                    🏆 WINNER 🏆
                                </div>
                                <div style={{
                                    fontSize: '7rem',
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(135deg, #FF00FF, #00FFFF)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: '0 0 30px rgba(255,0,255,0.5)',
                                    lineHeight: 1
                                }}>
                                    {winner}
                                </div>
                                <button
                                    onClick={() => setWinner(null)}
                                    style={{
                                        marginTop: '1.5rem',
                                        background: 'linear-gradient(135deg, #333, #555)',
                                        border: '2px solid #666',
                                        color: '#fff',
                                        padding: '0.6rem 2rem',
                                        fontSize: '1rem',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    확인
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CSS 애니메이션 */}
            <style>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes popIn {
                    0% { transform: scale(0.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default BallPicker;
