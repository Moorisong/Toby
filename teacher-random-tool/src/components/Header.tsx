import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    return (
        <header className="toby-header">
            <h1 className="toby-header-logo">
                <Link to="/" style={{
                    textDecoration: 'none',
                    color: '#4A90E2',
                    fontWeight: 'bold',
                    letterSpacing: '2px'
                }}>TOBY</Link>
            </h1>
            <nav className="toby-header-nav">
                <Link to="/number">번호 뽑기</Link>
                <Link to="/ball">공 튀기기</Link>
                <Link to="/seat">자리 배치</Link>
            </nav>
        </header>
    );
};

export default Header;
