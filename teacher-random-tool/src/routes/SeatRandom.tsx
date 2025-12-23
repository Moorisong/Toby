import React from 'react';
import Header from '../components/Header';
import SeatGrid from '../components/SeatGrid';
import ExportButton from '../components/ExportButton';

const SeatRandom: React.FC = () => {
    const handleExport = () => {
        alert('이미지 저장 기능은 구현 예정입니다.');
    };

    return (
        <div>
            <Header />
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>자리 배치</h2>
                    <ExportButton onExport={handleExport} />
                </div>
                <p>학생들의 자리를 랜덤으로 배치합니다.</p>
                <SeatGrid />
            </div>
        </div>
    );
};

export default SeatRandom;
