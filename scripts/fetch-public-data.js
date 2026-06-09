const fs = require('fs');
const path = require('path');

async function run() {
  const apiKey = process.env.PUBLIC_DATA_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("에러: PUBLIC_DATA_API_KEY 환경변수가 없습니다.");
    return;
  }
  if (!geminiApiKey) {
    console.error("에러: GEMINI_API_KEY 환경변수가 없습니다.");
    return;
  }

  // 1. 기존 데이터 읽기
  const dataPath = path.join(__dirname, '../public/data/local-info.json');
  let existingData = { lastUpdated: '', items: [] };
  try {
    if (fs.existsSync(dataPath)) {
      existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
  } catch (e) {
    console.error("기존 데이터를 불러오는 중 오류 발생:", e);
    return;
  }

  const existingNames = new Set(
    existingData.items.map(item => item.name || item.title || "")
  );

  let decodedKey = apiKey;
  try {
    decodedKey = decodeURIComponent(apiKey);
  } catch (e) {}

  // [1단계] 공공데이터포털 API에서 데이터 가져오기
  const url = 'https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=20&returnType=JSON';
  let services = [];

  try {
    // 1차 시도: 헤더에 인증키 넣기 (API 표준)
    let response = await fetch(url, {
      headers: {
        'Authorization': `Infuser ${decodedKey}`
      }
    });

    // 1차 시도가 실패한 경우 쿼리 파라미터 방식으로 2차 시도
    if (!response.ok) {
      const fallbackUrl = `${url}&serviceKey=${encodeURIComponent(decodedKey)}`;
      response = await fetch(fallbackUrl);
    }

    const responseData = await response.json().catch(() => null);

    if (!response.ok || (responseData && responseData.code === -4)) {
      const errorMsg = responseData ? responseData.msg : `상태 코드 ${response.status}`;
      throw new Error(
        `API 인증 실패 (${errorMsg}).\n` +
        `원인: 공공데이터포털(data.go.kr)에 등록되지 않았거나 대기 중인 인증키입니다.\n` +
        `해결방법: .env.local 파일의 PUBLIC_DATA_API_KEY에 올바른 인증키(Decoding 키 권장)를 입력해 주세요.`
      );
    }

    services = (responseData && responseData.data) || [];
  } catch (e) {
    console.error("\n[오류 발생] 공공데이터 API 호출에 실패했습니다.");
    console.error(e.message || e);
    return;
  }

  if (services.length === 0) {
    console.log("새로운 데이터가 없습니다");
    return;
  }

  // 필드 값을 안전하게 가져오는 보조 함수
  function getField(item, keys) {
    for (const key of keys) {
      if (item[key] !== undefined && item[key] !== null) {
        return String(item[key]);
      }
    }
    return "";
  }

  // 필터링 키워드 포함 확인 함수
  function checkKeyword(item, keyword) {
    const name = getField(item, ['서비스명', 'svcNm', 'serviceName']);
    const purpose = getField(item, ['서비스목적요약', '서비스목적', 'svcPps']);
    const target = getField(item, ['지원대상', 'target']);
    const agency = getField(item, ['소관기관명', '소관기관', 'deptNm']);
    const combinedText = [name, purpose, target, agency].join(" ");
    return combinedText.includes(keyword);
  }

  // 필터링 규칙 적용
  let filtered = services.filter(item => checkKeyword(item, "성남"));
  if (filtered.length === 0) {
    filtered = services.filter(item => checkKeyword(item, "부산"));
  }
  if (filtered.length === 0) {
    filtered = services;
  }

  // [2단계] 기존 데이터와 비교 (중복 제거)
  const newCandidates = filtered.filter(item => {
    const name = getField(item, ['서비스명', 'svcNm', 'serviceName']);
    return name && !existingNames.has(name);
  });

  if (newCandidates.length === 0) {
    console.log("새로운 데이터가 없습니다");
    return;
  }

  // 가장 첫 번째 신규 항목 선택
  const targetItem = newCandidates[0];

  // [3단계] Gemini AI로 새 항목 1개만 가공
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

  const prompt = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해.
startDate가 없으면 오늘 날짜, endDate가 없으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

공공데이터 내용:
${JSON.stringify(targetItem, null, 2)}`;

  let processedItem = null;
  try {
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API 오류 상태 코드: ${response.status}`);
    }

    const geminiJson = await response.json();
    const responseText = geminiJson.candidates[0].content.parts[0].text;

    // 마크다운 코드 블록 제거 및 JSON 추출
    let cleanJson = responseText.replace(/```json|```/g, "").trim();
    const startIdx = cleanJson.indexOf('{');
    const endIdx = cleanJson.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      cleanJson = cleanJson.substring(startIdx, endIdx + 1);
    }

    processedItem = JSON.parse(cleanJson);
  } catch (e) {
    console.error("Gemini AI 데이터 가공 중 오류 발생. 기존 데이터를 보존합니다:", e);
    return;
  }

  if (!processedItem) {
    console.error("가공된 데이터가 올바르지 않습니다.");
    return;
  }

  // [4단계] 기존 데이터에 추가 및 저장
  existingData.items.push(processedItem);
  existingData.lastUpdated = new Date().toISOString().split('T')[0];

  try {
    fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2), 'utf8');
    console.log("성공적으로 새로운 데이터를 수집하여 추가했습니다.");
  } catch (e) {
    console.error("데이터 파일 저장 중 오류 발생. 기존 데이터를 보존합니다:", e);
  }
}

run();
