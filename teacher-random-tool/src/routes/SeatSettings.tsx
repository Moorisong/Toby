import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

const STORAGE_KEY_ROWS = 'TRT_SEAT_ROWS';
const STORAGE_KEY_COLS = 'TRT_SEAT_COLS';
const STORAGE_KEY_TOTAL = 'TRT_SEAT_TOTAL';
const SESSION_KEY_FIXED = 'TRT_SEAT_FIXED_SESSION'; // sessionStorage

const SeatSettings: React.FC = () => {
    const [rows, setRows] = useState<number>(5);
    const [cols, setCols] = useState<number>(6);
    const [totalStudents, setTotalStudents] = useState<number>(30);
    const [fixedSeats, setFixedSeats] = useState<Map<string, number>>(new Map());
    const [selectedSeat, setSelectedSeat] = useState<{ row: number, col: number } | null>(null);

    // Load settings
    useEffect(() => {
        const savedRows = localStorage.getItem(STORAGE_KEY_ROWS);
        const savedCols = localStorage.getItem(STORAGE_KEY_COLS);
        const savedTotal = localStorage.getItem(STORAGE_KEY_TOTAL);
        const savedFixed = sessionStorage.getItem(SESSION_KEY_FIXED);

        if (savedRows) setRows(parseInt(savedRows));
        if (savedCols) setCols(parseInt(savedCols));
        if (savedTotal) setTotalStudents(parseInt(savedTotal));
        if (savedFixed) {
            const parsed = JSON.parse(savedFixed);
            setFixedSeats(new Map(Object.entries(parsed).map(([k, v]) => [k, v as number])));
        }
    }, []);

    // Save settings
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_ROWS, rows.toString());
        localStorage.setItem(STORAGE_KEY_COLS, cols.toString());
        localStorage.setItem(STORAGE_KEY_TOTAL, totalStudents.toString());
        const fixedObj = Object.fromEntries(fixedSeats);
        sessionStorage.setItem(SESSION_KEY_FIXED, JSON.stringify(fixedObj));
    }, [rows, cols, totalStudents, fixedSeats]);

    const handleSeatClick = (row: number, col: number) => {
        setSelectedSeat({ row, col });
    };

    const setFixedSeat = (studentNumber: number) => {
        if (!selectedSeat) return;

        const posKey = `${selectedSeat.row}-${selectedSeat.col}`;
        const newFixed = new Map(fixedSeats);

        // 같은 학생이 다른 곳에 고정되어 있으면 제거
        newFixed.forEach((num, pos) => {
            if (num === studentNumber) {
                newFixed.delete(pos);
            }
        });

        if (studentNumber > 0 && studentNumber <= totalStudents) {
            newFixed.set(posKey, studentNumber);
        } else {
            newFixed.delete(posKey);
        }

        setFixedSeats(newFixed);
        setSelectedSeat(null);
    };

    const clearAllFixed = () => {
        if (confirm('모든 고정석을 해제하시겠습니까?')) {
            setFixedSeats(new Map());
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#ffffff' }}>
            <Header />
            <div className="container" style={{ maxWidth: '900px', paddingTop: '1.5rem' }}>
                {/* 타이틀 */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '2rem', color: '#333', margin: 0, fontWeight: '600' }}>
                        ⚙️ 자리 배치 설정
                    </h1>
                    <p style={{ color: '#888', marginTop: '0.3rem', fontSize: '0.9rem' }}>
                        고정석을 설정하세요 (브라우저 탭을 닫으면 초기화됩니다)
                    </p>
                </div>

                {/* 기본 설정 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    padding: '1rem 1.5rem',
                    background: 'rgba(0,0,0,0.02)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.06)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                        <label style={{ color: '#555', fontWeight: '500', fontSize: '0.9rem' }}>행</label>
                        <input
                            type="number"
                            value={rows}
                            onChange={(e) => setRows(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                            style={{ padding: '0.4rem', fontSize: '1rem', width: '50px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '6px' }}
                            min="1"
                            max="10"
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                        <label style={{ color: '#555', fontWeight: '500', fontSize: '0.9rem' }}>열</label>
                        <input
                            type="number"
                            value={cols}
                            onChange={(e) => setCols(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                            style={{ padding: '0.4rem', fontSize: '1rem', width: '50px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '6px' }}
                            min="1"
                            max="10"
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                        <label style={{ color: '#555', fontWeight: '500', fontSize: '0.9rem' }}>학생 수</label>
                        <input
                            type="number"
                            value={totalStudents}
                            onChange={(e) => setTotalStudents(Math.max(1, parseInt(e.target.value) || 1))}
                            style={{ padding: '0.4rem', fontSize: '1rem', width: '60px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '6px' }}
                            min="1"
                        />
                    </div>
                </div>

                {/* 고정석 현황 */}
                <div style={{
                    marginBottom: '1rem',
                    padding: '1rem',
                    background: '#f0f7ff',
                    borderRadius: '10px',
                    border: '1px solid #cce0ff'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600', color: '#0066cc' }}>
                            📌 고정석: {fixedSeats.size}개 설정됨
                        </span>
                        {fixedSeats.size > 0 && (
                            <button
                                onClick={clearAllFixed}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.85rem',
                                    background: '#fff',
                                    color: '#d00',
                                    border: '1px solid #fcc',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                전체 해제
                            </button>
                        )}
                    </div>
                    {fixedSeats.size > 0 && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                            {Array.from(fixedSeats.entries()).map(([pos, num]) => {
                                const [r, c] = pos.split('-').map(Number);
                                return `${r + 1}행${c + 1}열→${num}번`;
                            }).join(', ')}
                        </div>
                    )}
                </div>

                {/* 안내 */}
                <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    👆 좌석을 클릭하여 고정할 학생 번호를 입력하세요
                </div>

                {/* 고정석 입력 모달 */}
                {selectedSeat && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: '#fff',
                            padding: '2rem',
                            borderRadius: '16px',
                            textAlign: 'center',
                            minWidth: '280px'
                        }}>
                            <h3 style={{ margin: '0 0 1rem 0' }}>
                                📌 {selectedSeat.row + 1}행 {selectedSeat.col + 1}열
                            </h3>
                            <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>
                                고정할 학생 번호를 입력하세요
                            </p>
                            <input
                                type="number"
                                placeholder="번호"
                                defaultValue={fixedSeats.get(`${selectedSeat.row}-${selectedSeat.col}`) || ''}
                                autoFocus
                                style={{
                                    padding: '0.8rem',
                                    fontSize: '1.5rem',
                                    width: '100px',
                                    textAlign: 'center',
                                    border: '2px solid #4A90E2',
                                    borderRadius: '8px',
                                    marginBottom: '1rem'
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setFixedSeat(parseInt((e.target as HTMLInputElement).value) || 0);
                                    }
                                    if (e.key === 'Escape') {
                                        setSelectedSeat(null);
                                    }
                                }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setFixedSeat(0)}
                                    style={{ padding: '0.5rem 1rem', background: '#fee', color: '#c00', border: '1px solid #fcc', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    해제
                                </button>
                                <button
                                    onClick={() => setSelectedSeat(null)}
                                    style={{ padding: '0.5rem 1rem', background: '#f0f0f0', color: '#555', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 좌석 그리드 */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '1.5rem',
                        background: '#fafafa',
                        borderRadius: '16px',
                        border: '1px solid #eee'
                    }}>
                        {/* 칠판 */}
                        <div style={{
                            background: '#2d5a27',
                            color: '#fff',
                            padding: '0.6rem 2rem',
                            borderRadius: '8px',
                            textAlign: 'center',
                            marginBottom: '1rem',
                            fontSize: '0.95rem'
                        }}>
                            📖 칠판
                        </div>

                        {/* 좌석 */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${cols}, 1fr)`,
                            gap: '0.4rem'
                        }}>
                            {Array.from({ length: rows * cols }).map((_, idx) => {
                                const row = Math.floor(idx / cols);
                                const col = idx % cols;
                                const posKey = `${row}-${col}`;
                                const fixedNum = fixedSeats.get(posKey);

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleSeatClick(row, col)}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: fixedNum ? '#e8f4ff' : '#fff',
                                            border: fixedNum ? '2px solid #4A90E2' : '1px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: fixedNum ? '1.1rem' : '0.75rem',
                                            fontWeight: fixedNum ? '600' : '400',
                                            color: fixedNum ? '#0066cc' : '#bbb',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {fixedNum ? fixedNum : `${row + 1}-${col + 1}`}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 하단 안내 */}
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <a
                        href="/seat"
                        style={{
                            display: 'inline-block',
                            padding: '0.8rem 2rem',
                            background: '#4A90E2',
                            color: '#fff',
                            textDecoration: 'none',
                            borderRadius: '10px',
                            fontWeight: '600',
                            fontSize: '1.1rem'
                        }}
                    >
                        🪑 자리 배치 페이지로 이동
                    </a>
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>
                    ⚠️ 고정석 설정은 브라우저 탭을 닫으면 초기화됩니다
                </div>
            </div>
        </div>
    );
};

export default SeatSettings;
