import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

type SeatMode = 'number' | 'name';

const STORAGE_KEY_PAIRS = 'TRT_SEAT_PAIRS';
const STORAGE_KEY_TOTAL = 'TRT_SEAT_TOTAL';
const STORAGE_KEY_MODE = 'TRT_SEAT_MODE';
const STORAGE_KEY_NAMES = 'TRT_SEAT_NAMES';
const SESSION_KEY_FIXED = 'TRT_SEAT_FIXED_SESSION';

const SeatSettings: React.FC = () => {
    const [pairRows, setPairRows] = useState<number>(5);
    const [pairRowsInput, setPairRowsInput] = useState<string>('5');
    const [totalStudents, setTotalStudents] = useState<number>(30);
    const [totalStudentsInput, setTotalStudentsInput] = useState<string>('30');
    const [mode, setMode] = useState<SeatMode>('number');
    const [names, setNames] = useState<string[]>([]);
    const [nameInput, setNameInput] = useState<string>('');
    const [showNameInput, setShowNameInput] = useState<boolean>(false);
    const [fixedSeats, setFixedSeats] = useState<Map<string, number>>(new Map());
    const [selectedSeat, setSelectedSeat] = useState<{ row: number, pair: number, seat: number } | null>(null);
    const [showGoHint, setShowGoHint] = useState<boolean>(false);

    // 계산된 값
    const studentCount = mode === 'name' ? names.length : totalStudents;
    const totalPairs = Math.ceil(studentCount / 2) || 1;
    const pairsPerRow = Math.max(1, Math.ceil(totalPairs / pairRows));

    // 이름 파싱
    const parseNames = (input: string): string[] => {
        return input
            .split(/[\n,，\t\s]+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    };

    // Load settings
    useEffect(() => {
        const savedPairs = localStorage.getItem(STORAGE_KEY_PAIRS);
        const savedTotal = localStorage.getItem(STORAGE_KEY_TOTAL);
        const savedMode = localStorage.getItem(STORAGE_KEY_MODE);
        const savedNames = localStorage.getItem(STORAGE_KEY_NAMES);
        const savedFixed = sessionStorage.getItem(SESSION_KEY_FIXED);

        if (savedPairs) { const v = parseInt(savedPairs); setPairRows(v); setPairRowsInput(String(v)); }
        if (savedTotal) { const v = parseInt(savedTotal); setTotalStudents(v); setTotalStudentsInput(String(v)); }
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

    // 저장 함수
    const saveToStorage = (data: {
        pairRows?: number;
        totalStudents?: number;
        mode?: SeatMode;
        names?: string[];
        fixedSeats?: Map<string, number>;
    }) => {
        if (data.pairRows !== undefined) localStorage.setItem(STORAGE_KEY_PAIRS, data.pairRows.toString());
        if (data.totalStudents !== undefined) localStorage.setItem(STORAGE_KEY_TOTAL, data.totalStudents.toString());
        if (data.mode !== undefined) localStorage.setItem(STORAGE_KEY_MODE, data.mode);
        if (data.names !== undefined) localStorage.setItem(STORAGE_KEY_NAMES, JSON.stringify(data.names));
        if (data.fixedSeats !== undefined) {
            const fixedObj = Object.fromEntries(data.fixedSeats);
            sessionStorage.setItem(SESSION_KEY_FIXED, JSON.stringify(fixedObj));
        }
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
        if (parsed.length > 0) setShowGoHint(true);
    };

    const handleSeatClick = (row: number, pair: number, seat: number) => {
        setSelectedSeat({ row, pair, seat });
    };

    const setFixedSeat = (studentIdx: number) => {
        if (!selectedSeat) return;

        const posKey = `${selectedSeat.row}-${selectedSeat.pair}-${selectedSeat.seat}`;
        const newFixed = new Map(fixedSeats);

        // 해제 (studentIdx가 0이거나 유효하지 않으면)
        if (studentIdx <= 0 || studentIdx > studentCount) {
            newFixed.delete(posKey);
        } else {
            // 같은 학생이 다른 곳에 고정되어 있으면 제거
            for (const [pos, num] of newFixed) {
                if (num === studentIdx && pos !== posKey) {
                    newFixed.delete(pos);
                }
            }
            newFixed.set(posKey, studentIdx);
        }

        setFixedSeats(newFixed);
        setSelectedSeat(null);
        saveToStorage({ fixedSeats: newFixed });
    };

    const clearAllFixed = () => {
        if (confirm('모든 고정석을 해제하시겠습니까?')) {
            const emptyMap = new Map<string, number>();
            setFixedSeats(emptyMap);
            saveToStorage({ fixedSeats: emptyMap });
        }
    };

    // 표시 텍스트
    const getDisplayText = (idx: number): string => {
        if (mode === 'name' && names[idx - 1]) {
            return names[idx - 1];
        }
        return String(idx);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#ffffff' }}>
            <Header />
            <div className="container" style={{ maxWidth: '900px', paddingTop: '1.5rem' }}>
                {/* 타이틀 */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '2rem', color: '#333', margin: 0, fontWeight: '600' }}>
                        ⚙️ 짝꿍 배치 설정
                    </h1>
                    <p style={{ color: '#888', marginTop: '0.3rem', fontSize: '0.9rem' }}>
                        고정석을 설정하세요 (브라우저 탭을 닫으면 초기화)
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #eee', opacity: 0.5 }}>
                        <label style={{ color: '#555', fontWeight: '500', fontSize: '0.9rem' }}>줄 수</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={pairRowsInput}
                            readOnly
                            style={{ padding: '0.4rem', fontSize: '1rem', width: '50px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '6px', background: '#eee', cursor: 'not-allowed' }}
                        />
                    </div>

                    {mode === 'number' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #eee', opacity: 0.5 }}>
                            <label style={{ color: '#555', fontWeight: '500', fontSize: '0.9rem' }}>학생 수</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={totalStudentsInput}
                                readOnly
                                style={{ padding: '0.4rem', fontSize: '1rem', width: '60px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '6px', background: '#eee', cursor: 'not-allowed' }}
                            />
                        </div>
                    )}

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
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#888', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>인식된 이름: {parseNames(nameInput).length}명</span>
                                <button
                                    onClick={() => {
                                        const testData = "김민준, 이서준, 박지후, 최도윤, 정예준, 강하준, 조준우, 윤시우, 장서연, 임지우, 한수아, 오예린, 신하윤, 서서현, 권지민, 황민서, 안윤서, 송채원, 유소연, 남유진, 백태윤, 노승우, 하준호, 배현우, 문다은, 성은서, 주시현, 류유나, 홍채윤, 전수빈, 고지안, 손연우, 차세아";
                                        navigator.clipboard.writeText(testData);
                                        alert('테스트 이름 33명 복사됨! 붙여넣기 하세요!');
                                    }}
                                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', color: '#666' }}
                                >
                                    📋 테스트 데이터
                                </button>
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
                            📌 고정석: {fixedSeats.size}개
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
                </div>

                {/* 안내 */}
                <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    👆 좌석 클릭 → 학생 {mode === 'name' ? '이름' : '번호'} 입력 → 그 자리에 고정
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
                            minWidth: '320px'
                        }}>
                            <h3 style={{ margin: '0 0 1rem 0' }}>
                                📌 {selectedSeat.row + 1}줄 {selectedSeat.pair + 1}번째 {selectedSeat.seat === 0 ? '왼쪽' : '오른쪽'}
                            </h3>
                            <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>
                                이 자리에 앉힐 학생 선택
                            </p>
                            {mode === 'name' ? (
                                <select
                                    id="fixedSeatInput"
                                    defaultValue={fixedSeats.get(`${selectedSeat.row}-${selectedSeat.pair}-${selectedSeat.seat}`) || ''}
                                    autoFocus
                                    style={{
                                        padding: '1rem',
                                        fontSize: '1.1rem',
                                        width: '220px',
                                        textAlign: 'center',
                                        border: '2px solid #E24A90',
                                        borderRadius: '8px',
                                        marginBottom: '1rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="">-- 선택 --</option>
                                    {names.map((name, idx) => (
                                        <option key={idx} value={idx + 1}>{name}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="number"
                                    id="fixedSeatInput"
                                    placeholder="번호"
                                    defaultValue={fixedSeats.get(`${selectedSeat.row}-${selectedSeat.pair}-${selectedSeat.seat}`) || ''}
                                    autoFocus
                                    style={{
                                        padding: '1rem',
                                        fontSize: '1.5rem',
                                        width: '120px',
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
                            )}
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setFixedSeat(0)}
                                    style={{ padding: '0.6rem 1rem', background: '#fee', color: '#c00', border: '1px solid #fcc', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    해제
                                </button>
                                <button
                                    onClick={() => setSelectedSeat(null)}
                                    style={{ padding: '0.6rem 1rem', background: '#f0f0f0', color: '#555', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    취소
                                </button>
                                <button
                                    onClick={() => {
                                        const input = document.getElementById('fixedSeatInput') as HTMLInputElement | HTMLSelectElement;
                                        const val = parseInt(input.value) || 0;
                                        setFixedSeat(val);
                                    }}
                                    style={{ padding: '0.6rem 1.2rem', background: '#4A90E2', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    저장
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 짝꿍 좌석 그리드 */}
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

                        {/* 짝꿍 좌석 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {Array.from({ length: pairRows }).map((_, rowIdx) => (
                                <div key={rowIdx} style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem' }}>
                                    {Array.from({ length: pairsPerRow }).map((_, pairIdx) => {
                                        const leftSeatNum = rowIdx * pairsPerRow * 2 + pairIdx * 2 + 1;
                                        const rightSeatNum = leftSeatNum + 1;
                                        const leftKey = `${rowIdx}-${pairIdx}-0`;
                                        const rightKey = `${rowIdx}-${pairIdx}-1`;
                                        const leftFixed = fixedSeats.get(leftKey);
                                        const rightFixed = fixedSeats.get(rightKey);
                                        const leftValid = leftSeatNum <= studentCount;
                                        const rightValid = rightSeatNum <= studentCount;

                                        return (
                                            <div key={pairIdx} style={{
                                                display: 'flex',
                                                gap: '2px',
                                                background: '#e0e0e0',
                                                padding: '3px',
                                                borderRadius: '10px'
                                            }}>
                                                {/* 왼쪽 좌석 */}
                                                <div
                                                    onClick={() => leftValid && handleSeatClick(rowIdx, pairIdx, 0)}
                                                    style={{
                                                        minWidth: mode === 'name' ? '60px' : '48px',
                                                        height: '48px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: leftFixed ? '#e8f4ff' : (leftValid ? '#fff' : '#f5f5f5'),
                                                        border: leftFixed ? '2px solid #4A90E2' : '1px solid #ddd',
                                                        borderRadius: '8px 2px 2px 8px',
                                                        fontSize: mode === 'name' ? '0.75rem' : (leftFixed ? '1rem' : '0.75rem'),
                                                        fontWeight: leftFixed ? '600' : '400',
                                                        color: leftFixed ? '#0066cc' : (leftValid ? '#999' : '#ccc'),
                                                        cursor: leftValid ? 'pointer' : 'default',
                                                        transition: 'all 0.2s',
                                                        padding: '0 0.2rem',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    {leftFixed ? getDisplayText(leftFixed) : ''}
                                                </div>
                                                {/* 오른쪽 좌석 */}
                                                <div
                                                    onClick={() => rightValid && handleSeatClick(rowIdx, pairIdx, 1)}
                                                    style={{
                                                        minWidth: mode === 'name' ? '60px' : '48px',
                                                        height: '48px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: rightFixed ? '#e8f4ff' : (rightValid ? '#fff' : '#f5f5f5'),
                                                        border: rightFixed ? '2px solid #4A90E2' : '1px solid #ddd',
                                                        borderRadius: '2px 8px 8px 2px',
                                                        fontSize: mode === 'name' ? '0.75rem' : (rightFixed ? '1rem' : '0.75rem'),
                                                        fontWeight: rightFixed ? '600' : '400',
                                                        color: rightFixed ? '#0066cc' : (rightValid ? '#999' : '#ccc'),
                                                        cursor: rightValid ? 'pointer' : 'default',
                                                        transition: 'all 0.2s',
                                                        padding: '0 0.2rem',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    {rightFixed ? getDisplayText(rightFixed) : ''}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 하단 */}
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <a
                        href="/seat"
                        className={showGoHint ? 'btn-pulse-hint' : ''}
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
                        🪑 짝꿍 배치로 이동
                    </a>
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>
                    ⚠️ 고정석은 브라우저 탭을 닫으면 초기화됩니다
                </div>
            </div>
        </div>
    );
};

export default SeatSettings;
