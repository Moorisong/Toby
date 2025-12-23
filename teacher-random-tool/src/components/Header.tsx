import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    return (
        <header style={{ padding: '1rem', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Teacher Tool</Link>
            </h1>
            <nav>
                <Link to="/number" style={{ margin: '0 10px' }}>번호 뽑기</Link>
                <Link to="/ball" style={{ margin: '0 10px' }}>공 튀기기</Link>
                <Link to="/seat" style={{ margin: '0 10px' }}>자리 배치</Link>
            </nav>
        </header>
    );
};

export default Header;
