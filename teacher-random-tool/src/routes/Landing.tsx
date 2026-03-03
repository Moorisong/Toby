import React, { useEffect, useState } from 'react';
import '../styles/global.css';

const Landing: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleRedirect = () => {
        window.location.href = 'https://box.haroo.site/toby';
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1a1a1a',
            fontFamily: '"Pretendard", "Inter", sans-serif',
            overflow: 'hidden',
            position: 'relative',
        }}>
            <div style={{
                zIndex: 1,
                textAlign: 'center',
                padding: '2rem',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
                maxWidth: '600px',
            }}>
                <div style={{ marginBottom: '2rem' }}>
                    <img
                        src="/logo.png"
                        alt="Toby Logo"
                        style={{
                            width: '130px',
                            height: '130px',
                            objectFit: 'contain',
                        }}
                    />
                </div>

                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '1rem',
                    letterSpacing: '-0.02em',
                }}>
                    Toby 주소가 변경되었습니다
                </h1>

                <p style={{
                    fontSize: '1.1rem',
                    color: '#666',
                    marginBottom: '2.5rem',
                    lineHeight: 1.6,
                }}>
                    이제 Toby를 <strong>하루상자(Haroo Box)</strong>에서<br />
                    더욱 쾌적하게 이용하실 수 있습니다.
                </p>

                <button
                    onClick={handleRedirect}
                    style={{
                        padding: '1rem 2.5rem',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#fff',
                        background: '#1a1a1a',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.background = '#333';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.background = '#1a1a1a';
                    }}
                >
                    새로운 Toby 주소로 이동하기
                </button>

                <div style={{
                    marginTop: '3rem',
                    fontSize: '0.9rem',
                    color: '#999',
                }}>
                    자동으로 이동하지 않을 경우 위의 버튼을 클릭해주세요.
                </div>
            </div>
        </div>
    );
};

export default Landing;
