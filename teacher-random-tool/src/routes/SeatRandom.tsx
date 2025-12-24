import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import { toPng } from 'html-to-image';

interface SeatData {
    display: string; // 번호 또는 이름
}

type SeatMode = 'number' | 'name';

const STORAGE_KEY_ROWS = 'TRT_SEAT_ROWS';
const STORAGE_KEY_COLS = 'TRT_SEAT_COLS';
const STORAGE_KEY_TOTAL = 'TRT_SEAT_TOTAL';
const STORAGE_KEY_MODE = 'TRT_SEAT_MODE';
const STORAGE_KEY_NAMES = 'TRT_SEAT_NAMES';
const SESSION_KEY_FIXED = 'TRT_SEAT_FIXED_SESSION';

const SeatRandom: React.FC = () => {
    const [rows, setRows] = useState<number>(5);
    const [cols, setCols] = useState<number>(6);
    const [totalStudents, setTotalStudents] = useState<number>(30);
    const [mode, setMode] = useState<SeatMode>('number');
    const [names, setNames] = useState<string[]>([]);
    const [nameInput, setNameInput] = useState<string>('');
    const [showNameInput, setShowNameInput] = useState<boolean>(false);
    const [seats, setSeats] = useState<(SeatData | null)[][]>([]);
    const [fixedSeats, setFixedSeats] = useState<Map<string, number>>(new Map());
    const gridRef = useRef<HTMLDivElement>(null);

    // Load settings
    useEffect(() => {
        const savedRows = localStorage.getItem(STORAGE_KEY_ROWS);
        const savedCols = localStorage.getItem(STORAGE_KEY_COLS);
        const savedTotal = localStorage.getItem(STORAGE_KEY_TOTAL);
        const savedMode = localStorage.getItem(STORAGE_KEY_MODE);
        const savedNames = localStorage.getItem(STORAGE_KEY_NAMES);
        const savedFixed = sessionStorage.getItem(SESSION_KEY_FIXED);

        if (savedRows) setRows(parseInt(savedRows));
        if (savedCols) setCols(parseInt(savedCols));
        if (savedTotal) setTotalStudents(parseInt(savedTotal));
        if (savedMode) setMode(savedMode as SeatMode);
        if (savedNames) {
            const parsed = JSON.parse(savedNames);
            setNames(parsed);
            setNameInput(parsed.join('\n'));
        }
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
        localStorage.setItem(STORAGE_KEY_MODE, mode);
        localStorage.setItem(STORAGE_KEY_NAMES, JSON.stringify(names));
    }, [rows, cols, totalStudents, mode, names]);

    // 이름 파싱
    const parseNames = (input: string): string[] => {
        return input
            .split(/[\n,，\t]/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    };

    const handleNameInputSave = () => {
        const parsed = parseNames(nameInput);
        setNames(parsed);
        setTotalStudents(parsed.length);
        setShowNameInput(false);
    };

    // 셔플 함수
    const shuffleSeats = () => {
        const totalSeats = rows * cols;
        const studentList = mode === 'name' ? names : Array.from({ length: totalStudents }, (_, i) => String(i + 1));
        const studentCount = Math.min(studentList.length, totalSeats);

        // 고정석 위치와 인덱스
        const fixedPositions = new Set<string>();
        const fixedIndices = new Set<number>();
        fixedSeats.forEach((idx, pos) => {
            if (idx <= studentCount && idx > 0) {
                fixedPositions.add(pos);
                fixedIndices.add(idx - 1); // 0-indexed
            }
        });

        // 고정되지 않은 학생들
        const availableStudents: string[] = [];
        for (let i = 0; i < studentCount; i++) {
            if (!fixedIndices.has(i)) {
                availableStudents.push(studentList[i]);
            }
        }

        // Fisher-Yates 셔플
        for (let i = availableStudents.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableStudents[i], availableStudents[j]] = [availableStudents[j], availableStudents[i]];
        }

        // 좌석 배치
        const newSeats: (SeatData | null)[][] = [];
        let studentIndex = 0;

        for (let r = 0; r < rows; r++) {
            const row: (SeatData | null)[] = [];
            for (let c = 0; c < cols; c++) {
                const posKey = `${r}-${c}`;

                if (fixedSeats.has(posKey) && fixedSeats.get(posKey)! <= studentCount) {
                    const fixedIdx = fixedSeats.get(posKey)! - 1;
                    row.push({ display: studentList[fixedIdx] });
                } else if (studentIndex < availableStudents.length) {
                    row.push({ display: availableStudents[studentIndex] });
                    studentIndex++;
                } else {
                    row.push(null);
                }
            }
            newSeats.push(row);
        }

        setSeats(newSeats);
    };

    // 이미지 저장
    const handleExport = async () => {
        if (!gridRef.current) return;

        try {
            const dataUrl = await toPng(gridRef.current, {
                backgroundColor: '#ffffff',
                pixelRatio: 2
            });

            const link = document.createElement('a');
            link.download = `자리배치_${new Date().toLocaleDateString()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (e) {
            console.error(e);
            alert('이미지 저장 중 오류가 발생했습니다.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#ffffff' }}>
            <Header />
            <div className="container" style={{ maxWidth: '1000px', paddingTop: '1.5rem' }}>
                {/* 타이틀 */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '2rem', color: '#333', margin: 0, fontWeight: '600' }}>
                        🪑 자리 배치
                    </h1>
                    <p style={{ color: '#888', marginTop: '0.3rem', fontSize: '0.9rem' }}>
                        학생들의 자리를 랜덤으로 배치합니다
                    </p>
                </div>

                {/* 모드 선택 + 설정 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    padding: '1rem 1.5rem',
                    background: 'rgba(0,0,0,0.02)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.06)'
                }}>
                    {/* 모드 토글 */}
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button
                            onClick={() => setMode('number')}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                background: mode === 'number' ? '#4A90E2' : '#f0f0f0',
                                color: mode === 'number' ? '#fff' : '#666',
                                border: mode === 'number' ? 'none' : '1px solid #ddd',
                                borderRadius: '8px 0 0 8px',
                                cursor: 'pointer'
                            }}
                        >
                            번호 모드
                        </button>
                        <button
                            onClick={() => setMode('name')}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                background: mode === 'name' ? '#E24A90' : '#f0f0f0',
                                color: mode === 'name' ? '#fff' : '#666',
                                border: mode === 'name' ? 'none' : '1px solid #ddd',
                                borderRadius: '0 8px 8px 0',
                                cursor: 'pointer'
                            }}
                        >
                            이름 모드
                        </button>
                    </div>

                    {/* 행/열 설정 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                        <label style={{ color: '#555', fontWeight: '500', fontSize: '0.9rem' }}>행</label>
                        <input
                            type="number"
                            value={rows}
                            onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                            style={{ padding: '0.4rem', fontSize: '1rem', width: '45px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '6px' }}
                            min="1"
                            max="10"
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                        <label style={{ color: '#555', fontWeight: '500', fontSize: '0.9rem' }}>열</label>
                        <input
                            type="number"
                            value={cols}
                            onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
                            style={{ padding: '0.4rem', fontSize: '1rem', width: '45px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '6px' }}
                            min="1"
                            max="10"
                        />
                    </div>

                    {/* 번호 모드: 학생 수 */}
                    {mode === 'number' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                            <label style={{ color: '#555', fontWeight: '500', fontSize: '0.9rem' }}>학생 수</label>
                            <input
                                type="number"
                                value={totalStudents}
                                onChange={(e) => setTotalStudents(Math.max(1, parseInt(e.target.value) || 1))}
                                style={{ padding: '0.4rem', fontSize: '1rem', width: '55px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '6px' }}
                                min="1"
                            />
                        </div>
                    )}

                    {/* 이름 모드: 이름 설정 버튼 */}
                    {mode === 'name' && (
                        <button
                            onClick={() => setShowNameInput(true)}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                background: '#fff',
                                color: '#E24A90',
                                border: '1px solid #E24A90',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            📝 이름 설정 ({names.length}명)
                        </button>
                    )}
                </div>

                {/* 이름 입력 모달 */}
                {showNameInput && (
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
                            padding: '1.5rem',
                            borderRadius: '16px',
                            width: '90%',
                            maxWidth: '400px'
                        }}>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>📝 학생 이름 입력</h3>
                            <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
                                이름을 줄바꿈 또는 쉼표로 구분하여 입력하세요
                            </p>
                            <textarea
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                placeholder="예시:&#10;김철수&#10;이영희&#10;박민수"
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    padding: '0.8rem',
                                    fontSize: '1rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
                                인식된 이름: {parseNames(nameInput).length}명
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button
                                    onClick={() => setShowNameInput(false)}
                                    style={{ padding: '0.5rem 1rem', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleNameInputSave}
                                    style={{ padding: '0.5rem 1.5rem', background: '#4A90E2', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    저장
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 버튼 영역 */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={shuffleSeats}
                        disabled={mode === 'name' && names.length === 0}
                        style={{
                            padding: '0.7rem 1.8rem',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            background: (mode === 'name' && names.length === 0) ? '#ccc' : '#4A90E2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: (mode === 'name' && names.length === 0) ? 'not-allowed' : 'pointer',
                            boxShadow: '0 2px 8px rgba(74,144,226,0.3)'
                        }}
                    >
                        🔀 자리 섞기
                    </button>
                    {seats.length > 0 && (
                        <button
                            onClick={handleExport}
                            style={{
                                padding: '0.7rem 1.5rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                background: '#50C878',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer'
                            }}
                        >
                            💾 이미지 저장
                        </button>
                    )}
                </div>

                {/* 고정석 안내 */}
                {fixedSeats.size > 0 && (
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '1rem',
                        padding: '0.6rem 1rem',
                        background: '#f0f7ff',
                        borderRadius: '8px',
                        color: '#0066cc',
                        fontSize: '0.9rem'
                    }}>
                        📌 고정석 {fixedSeats.size}개 적용됨
                    </div>
                )}

                {/* 좌석 그리드 */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div
                        ref={gridRef}
                        style={{
                            display: 'inline-block',
                            padding: '1.5rem',
                            background: '#fafafa',
                            borderRadius: '16px',
                            border: '1px solid #eee'
                        }}
                    >
                        {/* 칠판 */}
                        <div style={{
                            background: '#2d5a27',
                            color: '#fff',
                            padding: '0.8rem 3rem',
                            borderRadius: '8px',
                            textAlign: 'center',
                            marginBottom: '1.5rem',
                            fontSize: '1.1rem',
                            fontWeight: '500'
                        }}>
                            📖 칠판
                        </div>

                        {/* 좌석 */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${cols}, 1fr)`,
                            gap: '0.5rem'
                        }}>
                            {seats.length > 0 ? (
                                seats.flat().map((seat, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            minWidth: mode === 'name' ? '70px' : '55px',
                                            height: '55px',
                                            padding: '0 0.3rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: seat ? '#fff' : '#e0e0e0',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: mode === 'name' ? '0.9rem' : '1.3rem',
                                            fontWeight: '600',
                                            color: seat ? '#333' : '#999',
                                            boxShadow: seat ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                    >
                                        {seat?.display || ''}
                                    </div>
                                ))
                            ) : (
                                Array.from({ length: rows * cols }).map((_, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            minWidth: mode === 'name' ? '70px' : '55px',
                                            height: '55px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: '#f5f5f5',
                                            border: '1px dashed #ccc',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            color: '#bbb'
                                        }}
                                    >
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* 안내 */}
                <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#bbb', fontSize: '0.8rem' }}>
                    <a href="/seat/settings" style={{ color: '#aaa', textDecoration: 'none' }}>Setting</a>
                </div>
            </div>
        </div>
    );
};

export default SeatRandom;
