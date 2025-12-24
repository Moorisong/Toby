import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    return (
        <header style={{
            padding: '0.8rem 1.5rem',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fff'
        }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
                <Link to="/" style={{
                    textDecoration: 'none',
                    color: '#4A90E2',
                    fontWeight: 'bold',
                    letterSpacing: '2px'
                }}>TOBY</Link>
            </h1>
            <nav style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/number" style={{
                    textDecoration: 'none',
                    color: '#555',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    transition: 'background 0.2s'
                }}>번호 뽑기</Link>
                <Link to="/ball" style={{
                    textDecoration: 'none',
                    color: '#555',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem'
                }}>공 튀기기</Link>
                <Link to="/seat" style={{
                    textDecoration: 'none',
                    color: '#555',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem'
                }}>자리 배치</Link>
            </nav>
        </header>
    );
};

export default Header;
