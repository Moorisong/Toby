import React from 'react';
import Header from '../components/Header';

const BallPicker: React.FC = () => {
    return (
        <div>
            <Header />
            <div className="container">
                <h2>공 튀기기</h2>
                <p>물리 엔진을 이용한 공 튀기기 추첨입니다.</p>
                <canvas id="ball-canvas" width="800" height="600" style={{ border: '1px solid #ddd', marginTop: '1rem' }} />
                <div>
                    <button style={{ marginTop: '1rem' }}>시작</button>
                </div>
            </div>
        </div>
    );
};

export default BallPicker;
