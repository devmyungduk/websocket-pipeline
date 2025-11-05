'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const ws = useRef(null);
  const [connected, setConnected] = useState(false);
  const [log, setLog] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080');

    ws.current.onopen = () => {
      console.log('연결 성공');
      setConnected(true);
    };

    ws.current.onclose = () => {
      console.log('연결 종료');
      setConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('오류:', error);
    };

    return () => ws.current?.close();
  }, []);

  const addLog = (msg) => {
    setLog((prev) => [msg, ...prev.slice(0, 49)]);
  };

  const handleClick = (e) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    const data = {
      type: 'click',
      x: e.clientX,
      y: e.clientY,
      time: new Date().toLocaleTimeString()
    };

    ws.current.send(JSON.stringify(data));
    addLog(`Click (${data.x}, ${data.y})`);
  };

  const sendText = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    if (!text.trim()) return;

    const data = {
      type: 'text',
      content: text,
      time: new Date().toLocaleTimeString()
    };

    ws.current.send(JSON.stringify(data));
    addLog(`Text: ${text}`);
    setText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#1a1a2e',
        color: '#eee',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={handleClick}
    >
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '10px 20px',
          background: connected ? '#0f0' : '#f00',
          color: '#000',
          borderRadius: '5px',
          fontWeight: 'bold'
        }}
      >
        {connected ? '연결됨' : '연결 끊김'}
      </div>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
        WebSocket 테스트
      </h1>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          width: '80%',
          maxWidth: '600px'
        }}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="텍스트 입력 (Enter로 전송)"
          style={{
            flex: 1,
            padding: '10px',
            background: '#0f0f23',
            border: '1px solid #333',
            borderRadius: '5px',
            color: '#eee',
            fontSize: '16px'
          }}
        />
        <button
          onClick={sendText}
          style={{
            padding: '10px 20px',
            background: '#0f0',
            color: '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          전송
        </button>
      </div>

      <div
        style={{
          background: '#0f0f23',
          padding: '20px',
          borderRadius: '10px',
          width: '80%',
          maxWidth: '600px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}
      >
        <h3>전송 로그</h3>
        {log.length === 0 ? (
          <p style={{ opacity: 0.5 }}>전송 데이터가 없습니다.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {log.map((item, i) => (
              <li
                key={i}
                style={{
                  padding: '5px 10px',
                  background: '#16213e',
                  marginBottom: '5px',
                  borderRadius: '3px'
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
