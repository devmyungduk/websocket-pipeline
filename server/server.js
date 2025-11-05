const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

let clientCount = 0;  // 추가: 클라이언트 수 추적

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('WebSocket 서버 시작');
console.log('주소: ws://localhost:8080');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

server.on('connection', (ws) => {
  clientCount++;  // 추가: 연결 시 카운트 증가
  console.log(`클라이언트 연결됨 (총 ${clientCount}개)`);  // 수정: 연결 수 표시
  
  ws.on('message', (message) => {
    const data = message.toString();
    console.log('수신:', data);
    
    // 추가: JSON 파싱 시도
    let parsedData;
    try {
      parsedData = JSON.parse(data);
      console.log('파싱 성공:', parsedData.type);
    } catch (e) {
      console.log('파싱 실패: 원본 문자열 사용');
    }
    
    // 수정: 송신자 제외 브로드캐스트
    server.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {  // 수정: client !== ws 조건 추가
        client.send(message);
      }
    });
  });
  
  // 추가: 에러 핸들러
  ws.on('error', (error) => {
    console.error('WebSocket 오류:', error.message);
  });
  
  ws.on('close', () => {
    clientCount--;  // 추가: 종료 시 카운트 감소
    console.log(`클라이언트 연결 종료 (총 ${clientCount}개)`);  // 수정: 연결 수 표시
  });
});

// 추가: 서버 에러 핸들러
server.on('error', (error) => {
  console.error('서버 오류:', error.message);
});

process.on('SIGINT', () => {
  console.log('\n서버 종료');
  server.close();
  process.exit(0);
});
