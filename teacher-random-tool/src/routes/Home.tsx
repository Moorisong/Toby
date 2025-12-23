import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/global.css';

const Home: React.FC = () => {
    return (
        <div className="center-screen container">
            <h1>선생님용 랜덤 도구</h1>
            <p>수업 시간에 필요한 랜덤 도구들을 모았습니다.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginTop: '3rem', width: '100%' }}>
                <Link to="/number" style={{ textDecoration: 'none' }}>
                    <button style={{ width: '100%', padding: '2rem', fontSize: '1.2rem' }}>번호 뽑기</button>
                </Link>
                <Link to="/ball" style={{ textDecoration: 'none' }}>
                    <button style={{ width: '100%', padding: '2rem', fontSize: '1.2rem' }}>공 튀기기</button>
                </Link>
                <Link to="/seat" style={{ textDecoration: 'none' }}>
                    <button style={{ width: '100%', padding: '2rem', fontSize: '1.2rem' }}>자리 배치</button>
                </Link>
            </div>
        </div>
    );
};

export default Home;
