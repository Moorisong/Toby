import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import { toPng } from 'html-to-image';

interface SeatData {
    display: string;
}

type SeatMode = 'number' | 'name';

const STORAGE_KEY_PAIRS = 'TRT_SEAT_PAIRS';
const STORAGE_KEY_MODE = 'TRT_SEAT_MODE';
const STORAGE_KEY_NAMES = 'TRT_SEAT_NAMES';
const STORAGE_KEY_TOTAL = 'TRT_SEAT_TOTAL';
const SESSION_KEY_FIXED = 'TRT_SEAT_FIXED_SESSION';

const SeatRandom: React.FC = () => {
    const [pairRows, setPairRows] = useState<number>(5);
    const [mode, setMode] = useState<SeatMode>('number');
    const [totalStudents, setTotalStudents] = useState<number>(30);
    const [names, setNames] = useState<string[]>([]);
    const [nameInput, setNameInput] = useState<string>('');
    const [showNameInput, setShowNameInput] = useState<boolean>(false);
    const [seats, setSeats] = useState<(SeatData | null)[][]>([]);
    const [fixedSeats, setFixedSeats] = useState<Map<string, number>>(new Map());
    const gridRef = useRef<HTMLDivElement>(null);

    // Load settings
    useEffect(() => {
        const savedPairs = localStorage.getItem(STORAGE_KEY_PAIRS);
        const savedMode = localStorage.getItem(STORAGE_KEY_MODE);
        const savedTotal = localStorage.getItem(STORAGE_KEY_TOTAL);
        const savedNames = localStorage.getItem(STORAGE_KEY_NAMES);
        const savedFixed = sessionStorage.getItem(SESSION_KEY_FIXED);

        if (savedPairs) setPairRows(parseInt(savedPairs));
        if (savedMode) setMode(savedMode as SeatMode);
        if (savedTotal) setTotalStudents(parseInt(savedTotal));
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

    // 저장 함수
    const saveToStorage = (data: {
        pairRows?: number;
        totalStudents?: number;
        mode?: SeatMode;
        names?: string[];
    }) => {
        if (data.pairRows !== undefined) localStorage.setItem(STORAGE_KEY_PAIRS, data.pairRows.toString());
        if (data.totalStudents !== undefined) localStorage.setItem(STORAGE_KEY_TOTAL, data.totalStudents.toString());
        if (data.mode !== undefined) localStorage.setItem(STORAGE_KEY_MODE, data.mode);
        if (data.names !== undefined) localStorage.setItem(STORAGE_KEY_NAMES, JSON.stringify(data.names));
    };

    // 이름 파싱
    const parseNames = (input: string): string[] => {
        return input
            .split(/[\n,，\t\s]+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    };

    const handlePairRowsChange = (val: number) => {
        const newVal = Math.max(1, val);
        setPairRows(newVal);
        saveToStorage({ pairRows: newVal });
    };

    const handleTotalStudentsChange = (val: number) => {
        const newVal = Math.max(1, val);
        setTotalStudents(newVal);
        saveToStorage({ totalStudents: newVal });
    };

    const handleModeChange = (newMode: SeatMode) => {
        setMode(newMode);
        saveToStorage({ mode: newMode });
    };

    const handleNameInputSave = () => {
        const parsed = parseNames(nameInput);
        setNames(parsed);
        setTotalStudents(parsed.length);
        setShowNameInput(false);
        saveToStorage({ names: parsed, totalStudents: parsed.length });
    };

    const studentCount = mode === 'name' ? names.length : totalStudents;
    const totalPairs = Math.ceil(studentCount / 2);
    const pairsPerRow = Math.max(1, Math.ceil(totalPairs / pairRows));

    // 학생 표시 텍스트 가져오기
    const getStudentDisplay = useCallback((index: number): string => {
        if (mode === 'name' && names[index]) {
            return names[index];
        }
        return String(index + 1);
    }, [mode, names]);

    // 셔플 함수 (고정석 반영)
    const shuffleSeats = () => {
        const studentList = mode === 'name' ? [...names] : Array.from({ length: totalStudents }, (_, i) => String(i + 1));
        const count = studentList.length;

        if (count === 0) return;

        // 고정석에 배치된 학생 인덱스들 (0-based)
        const fixedStudentIndices = new Set<number>();
        fixedSeats.forEach((studentIdx) => {
            if (studentIdx > 0 && studentIdx <= count) {
                fixedStudentIndices.add(studentIdx - 1);
            }
        });

        // 고정되지 않은 학생들 셔플
        const shuffledStudents: string[] = [];
        for (let i = 0; i < count; i++) {
            if (!fixedStudentIndices.has(i)) {
                shuffledStudents.push(studentList[i]);
            }
        }

        // Fisher-Yates 셔플
        for (let i = shuffledStudents.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledStudents[i], shuffledStudents[j]] = [shuffledStudents[j], shuffledStudents[i]];
        }

        // 좌석 배치 (고정석 위치에는 해당 학생, 나머지는 셔플된 학생)
        const pairs: (SeatData | null)[][] = [];
        let shuffleIndex = 0;

        for (let row = 0; row < pairRows; row++) {
            const rowPairs: (SeatData | null)[] = [];
            for (let p = 0; p < pairsPerRow; p++) {
                for (let seat = 0; seat < 2; seat++) {
                    const posKey = `${row}-${p}-${seat}`;
                    const fixedStudentIdx = fixedSeats.get(posKey);

                    if (fixedStudentIdx && fixedStudentIdx > 0 && fixedStudentIdx <= count) {
                        // 고정석: 해당 학생 배치
                        rowPairs.push({ display: getStudentDisplay(fixedStudentIdx - 1) });
                    } else if (shuffleIndex < shuffledStudents.length) {
                        // 비고정석: 셔플된 학생 배치
                        rowPairs.push({ display: shuffledStudents[shuffleIndex] });
                        shuffleIndex++;
                    } else {
                        rowPairs.push(null);
                    }
                }
            }
            pairs.push(rowPairs);
        }

        setSeats(pairs);
    };

    // 줄 수 변경 시 다시 섞기 (seats가 있을 때만)
    useEffect(() => {
        if (seats.length > 0) {
            shuffleSeats();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pairRows]);

    // 이미지 저장
    const handleExport = async () => {
        if (!gridRef.current) return;

        try {
            const dataUrl = await toPng(gridRef.current, {
                backgroundColor: '#ffffff',
                pixelRatio: 2
            });

            const link = document.createElement('a');
            link.download = `짝꿍배치_${new Date().toLocaleDateString()}.png`;
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
                        🪑 짝꿍 배치
                    </h1>
                    <p style={{ color: '#888', marginTop: '0.3rem', fontSize: '0.9rem' }}>
                        학생들의 짝꿍을 랜덤으로 배치합니다
                    </p>
                </div>

                {/* 설정 영역 */}
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
                            onClick={() => handleModeChange('number')}
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
                            번호
                        </button>
                        <button
                            onClick={() => handleModeChange('name')}
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
                            이름
                        </button>
                    </div>

                    {/* 줄 수 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                        <label style={{ color: '#555', fontWeight: '500', fontSize: '0.9rem' }}>줄 수</label>
                        <input
                            type="number"
                            value={pairRows}
                            onChange={(e) => handlePairRowsChange(parseInt(e.target.value) || 1)}
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
                                onChange={(e) => handleTotalStudentsChange(parseInt(e.target.value) || 1)}
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
                            📝 이름 ({names.length}명)
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
                                줄바꿈, 쉼표, 띄어쓰기로 구분
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
                        🔀 짝꿍 섞기
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
                            💾 저장
                        </button>
                    )}
                </div>

                {/* 좌석 그리드 - 짝꿍 레이아웃 */}
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

                        {/* 짝꿍 좌석 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {seats.length > 0 ? (
                                seats.map((row, rowIdx) => (
                                    <div key={rowIdx} style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                                        {Array.from({ length: Math.ceil(row.length / 2) }).map((_, pairIdx) => {
                                            const left = row[pairIdx * 2];
                                            const right = row[pairIdx * 2 + 1];
                                            return (
                                                <div key={pairIdx} style={{
                                                    display: 'flex',
                                                    gap: '2px',
                                                    background: '#e8e8e8',
                                                    padding: '3px',
                                                    borderRadius: '10px'
                                                }}>
                                                    <div style={{
                                                        minWidth: mode === 'name' ? '65px' : '50px',
                                                        height: '50px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: left ? '#fff' : '#f0f0f0',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '8px 2px 2px 8px',
                                                        fontSize: mode === 'name' ? '0.85rem' : '1.2rem',
                                                        fontWeight: '600',
                                                        color: left ? '#333' : '#ccc',
                                                        padding: '0 0.3rem',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {left?.display || ''}
                                                    </div>
                                                    <div style={{
                                                        minWidth: mode === 'name' ? '65px' : '50px',
                                                        height: '50px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: right ? '#fff' : '#f0f0f0',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '2px 8px 8px 2px',
                                                        fontSize: mode === 'name' ? '0.85rem' : '1.2rem',
                                                        fontWeight: '600',
                                                        color: right ? '#333' : '#ccc',
                                                        padding: '0 0.3rem',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {right?.display || ''}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))
                            ) : (
                                // 빈 그리드 미리보기
                                Array.from({ length: pairRows }).map((_, rowIdx) => (
                                    <div key={rowIdx} style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                                        {Array.from({ length: pairsPerRow || 3 }).map((_, pairIdx) => (
                                            <div key={pairIdx} style={{
                                                display: 'flex',
                                                gap: '2px',
                                                background: '#e8e8e8',
                                                padding: '3px',
                                                borderRadius: '10px'
                                            }}>
                                                <div style={{
                                                    minWidth: '50px',
                                                    height: '50px',
                                                    background: '#f5f5f5',
                                                    borderRadius: '8px 2px 2px 8px',
                                                    border: '1px dashed #ddd'
                                                }} />
                                                <div style={{
                                                    minWidth: '50px',
                                                    height: '50px',
                                                    background: '#f5f5f5',
                                                    borderRadius: '2px 8px 8px 2px',
                                                    border: '1px dashed #ddd'
                                                }} />
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* 설정 링크 */}
                <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#bbb', fontSize: '0.8rem' }}>
                    <a href="/seat/settings" style={{ color: '#aaa', textDecoration: 'none' }}>Setting</a>
                </div>
            </div>
        </div>
    );
};

export default SeatRandom;
