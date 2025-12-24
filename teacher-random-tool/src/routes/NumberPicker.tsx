import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import NumberSlot from '../components/NumberSlot';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';
import { pickRandomNumbers } from '../utils/random';

const NumberPicker: React.FC = () => {
    // State for settings
    const [totalStudents, setTotalStudents] = useState<number>(30);
    const [pickCount, setPickCount] = useState<number>(1);
    const [excludeInput, setExcludeInput] = useState<string>('');

    // State for execution
    const [results, setResults] = useState<number[]>([]);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [animationDoneCount, setAnimationDoneCount] = useState<number>(0);

    // Load settings on mount
    useEffect(() => {
        const savedTotal = loadFromStorage(STORAGE_KEYS.TOTAL_STUDENTS, 30);
        const savedCount = loadFromStorage(STORAGE_KEYS.PICK_COUNT, 1);
        const savedExclude = loadFromStorage(STORAGE_KEYS.EXCLUDE_LIST, []);

        setTotalStudents(savedTotal);
        setPickCount(savedCount);
        setExcludeInput(savedExclude.join(', '));
    }, []);

    // Save settings when changed
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.TOTAL_STUDENTS, totalStudents);
        saveToStorage(STORAGE_KEYS.PICK_COUNT, pickCount);
        const excludeList = parseExcludeInput(excludeInput);
        saveToStorage(STORAGE_KEYS.EXCLUDE_LIST, excludeList);
    }, [totalStudents, pickCount, excludeInput]);

    const parseExcludeInput = (input: string): number[] => {
        return input
            .split(',')
            .map(s => parseInt(s.trim(), 10))
            .filter(n => !isNaN(n));
    };

    const handleStart = () => {
        if (isAnimating) return;

        const excludeList = parseExcludeInput(excludeInput);

        if (totalStudents < 1) {
            alert('전체 인원은 1명 이상이어야 합니다.');
            return;
        }
        if (pickCount < 1) {
            alert('뽑을 인원은 1명 이상이어야 합니다.');
            return;
        }
        const possibleCount = totalStudents - excludeList.filter(n => n <= totalStudents).length;
        if (pickCount > possibleCount) {
            alert(`뽑을 수 있는 인원이 부족합니다. (가능: ${possibleCount}명)`);
            return;
        }

        try {
            const newResults = pickRandomNumbers(totalStudents, pickCount, excludeList);
            setResults(newResults);
            setIsAnimating(true);
            setAnimationDoneCount(0);
        } catch (e) {
            alert('번호 추첨 중 오류가 발생했습니다.');
            console.error(e);
        }
    };

    const handleAnimationComplete = () => {
        setAnimationDoneCount(prev => prev + 1);
    };

    useEffect(() => {
        if (isAnimating && animationDoneCount >= pickCount) {
            setIsAnimating(false);
        }
    }, [animationDoneCount, pickCount, isAnimating]);

    return (
        <div style={{ minHeight: '100vh', background: '#ffffff' }}>
            <Header />
            <div className="container" style={{ maxWidth: '800px', paddingTop: '1.5rem' }}>
                {/* 타이틀 */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        color: '#333',
                        margin: 0,
                        fontWeight: '600'
                    }}>
                        🎲 번호 뽑기
                    </h1>
                    <p style={{ color: '#888', marginTop: '0.3rem', fontSize: '0.9rem' }}>
                        랜덤으로 번호를 추첨합니다
                    </p>
                </div>

                {/* 설정 영역 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    padding: '1.2rem 1.5rem',
                    background: 'rgba(0,0,0,0.02)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.06)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: '#fff',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #eee'
                    }}>
                        <label style={{ color: '#555', fontWeight: '500', fontSize: '0.9rem' }}>전체 인원</label>
                        <input
                            type="number"
                            value={totalStudents}
                            onChange={(e) => setTotalStudents(parseInt(e.target.value) || 0)}
                            style={{
                                padding: '0.4rem',
                                fontSize: '1rem',
                                width: '60px',
                                textAlign: 'center',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                outline: 'none'
                            }}
                            min="1"
                            disabled={isAnimating}
                        />
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: '#fff',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #eee'
                    }}>
                        <label style={{ color: '#555', fontWeight: '500', fontSize: '0.9rem' }}>뽑을 수</label>
                        <input
                            type="number"
                            value={pickCount}
                            onChange={(e) => setPickCount(parseInt(e.target.value) || 0)}
                            style={{
                                padding: '0.4rem',
                                fontSize: '1rem',
                                width: '60px',
                                textAlign: 'center',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                outline: 'none'
                            }}
                            min="1"
                            disabled={isAnimating}
                        />
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: '#fff',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #eee'
                    }}>
                        <label style={{ color: '#555', fontWeight: '500', fontSize: '0.9rem' }}>제외 번호</label>
                        <input
                            type="text"
                            value={excludeInput}
                            onChange={(e) => setExcludeInput(e.target.value)}
                            placeholder="예: 5, 12"
                            style={{
                                padding: '0.4rem',
                                fontSize: '1rem',
                                width: '120px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                outline: 'none'
                            }}
                            disabled={isAnimating}
                        />
                    </div>
                </div>

                {/* 결과 영역 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    minHeight: '180px',
                    marginBottom: '1.5rem',
                    padding: '2rem',
                    background: '#fafafa',
                    borderRadius: '16px',
                    border: '1px solid #eee',
                    alignItems: 'center'
                }}>
                    {results.length > 0 ? (
                        results.map((num, idx) => (
                            <NumberSlot
                                key={`${isAnimating ? 'anim' : 'static'}-${idx}`}
                                targetNumber={num}
                                isAnimating={isAnimating}
                                index={idx}
                                onAnimationComplete={handleAnimationComplete}
                            />
                        ))
                    ) : (
                        <div style={{ fontSize: '1.2rem', color: '#aaa' }}>
                            시작 버튼을 눌러주세요
                        </div>
                    )}
                </div>

                {/* 시작 버튼 */}
                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={handleStart}
                        disabled={isAnimating}
                        style={{
                            fontSize: '1.2rem',
                            padding: '0.8rem 2.5rem',
                            background: isAnimating ? '#ccc' : '#4A90E2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: isAnimating ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            boxShadow: isAnimating ? 'none' : '0 2px 8px rgba(74,144,226,0.3)'
                        }}
                    >
                        {isAnimating ? '⏳ 추첨 중...' : '🎯 뽑기 시작'}
                    </button>
                </div>

                {/* 안내 */}
                <div style={{
                    marginTop: '2rem',
                    textAlign: 'center',
                    color: '#999',
                    fontSize: '0.85rem'
                }}>
                    💡 설정은 자동으로 저장됩니다
                </div>
            </div>
        </div>
    );
};

export default NumberPicker;
