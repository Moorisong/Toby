import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import NumberSlot from '../components/NumberSlot';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';
import { pickRandomNumbers } from '../utils/random';

const NumberPicker: React.FC = () => {
    // State for settings
    const [totalStudents, setTotalStudents] = useState<number>(30); // Default 30
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
        // Parse excludes for saving
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

        // Validate
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

    // Check if all animations are done
    useEffect(() => {
        if (isAnimating && animationDoneCount >= pickCount) {
            setIsAnimating(false);
        }
    }, [animationDoneCount, pickCount, isAnimating]);

    return (
        <div>
            <Header />
            <div className="container">
                <h2>번호 뽑기</h2>

                {/* Settings Area */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1.5rem',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    backgroundColor: '#fff',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>전체 인원</label>
                        <input
                            type="number"
                            value={totalStudents}
                            onChange={(e) => setTotalStudents(parseInt(e.target.value) || 0)}
                            style={{ padding: '0.5rem', fontSize: '1.2rem', width: '100px', textAlign: 'center' }}
                            min="1"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>뽑을 수</label>
                        <input
                            type="number"
                            value={pickCount}
                            onChange={(e) => setPickCount(parseInt(e.target.value) || 0)}
                            style={{ padding: '0.5rem', fontSize: '1.2rem', width: '100px', textAlign: 'center' }}
                            min="1"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>제외 번호 (쉼표 구분)</label>
                        <input
                            type="text"
                            value={excludeInput}
                            onChange={(e) => setExcludeInput(e.target.value)}
                            placeholder="예: 5, 12, 19"
                            style={{ padding: '0.5rem', fontSize: '1.2rem', width: '200px' }}
                        />
                    </div>
                </div>

                {/* Result Area */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    minHeight: '200px',
                    marginBottom: '2rem'
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
                        <div style={{ fontSize: '1.5rem', color: '#888', alignSelf: 'center' }}>
                            시작 버튼을 눌러주세요
                        </div>
                    )}
                </div>

                {/* Control */}
                <button
                    onClick={handleStart}
                    disabled={isAnimating}
                    style={{
                        fontSize: '1.5rem',
                        padding: '1rem 3rem',
                        backgroundColor: isAnimating ? '#ccc' : 'var(--primary-color)',
                        cursor: isAnimating ? 'not-allowed' : 'pointer',
                        transform: isAnimating ? 'none' : undefined
                    }}
                >
                    {isAnimating ? '추첨 중...' : '뽑기 시작'}
                </button>
            </div>
        </div>
    );
};

export default NumberPicker;
