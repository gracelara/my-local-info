const fs = require('fs');
const path = require('path');

// 1. 기존 데이터 읽기
const dataPath = path.join(__dirname, '../public/data/local-info.json');
let existingData = { lastUpdated: '', items: [] };

try {
  if (fs.existsSync(dataPath)) {
    existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }
} catch (e) {
  console.error("기존 데이터를 불러오는 중 오류 발생:", e);
}

// 기존 등록된 이름/제목 집합
const existingNames = new Set(
  existingData.items.map(item => item.name || item.title || "")
);

async function run() {
  const apiKey = process.env.PUBLIC_DATA_API_KEY;
  if (!apiKey || apiKey.includes("여기에_본인_공공데이터")) {
    console.error("에러: PUBLIC_DATA_API_KEY 환경변수가 설정되지 않았습니다.");
    return;
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey || geminiApiKey.includes("여기에_본인_Gemini")) {
    console.error("에러: GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
    return;
  }

  // 1단계: 공공데이터포털 API 호출
  let decodedKey = apiKey;
  try {
    decodedKey = decodeURIComponent(apiKey);
  } catch (e) {}

  const url = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=20&returnType=JSON&serviceKey=${encodeURIComponent(decodedKey)}`;

  console.log("공공데이터 API 호출 중...");
  
  let services = [];
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Infuser ${decodedKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    services = json.data || [];
  } catch (e) {
    console.error("공공데이터 API 호출 실패:", e);
    return;
  }

  if (services.length === 0) {
    console.log("새로운 데이터가 없습니다. (API 응답이 비어있음)");
    return;
  }

  // 필드 도우미 함수
  function getField(item, keys) {
    for (const key of keys) {
      if (item[key] !== undefined && item[key] !== null) {
        return String(item[key]);
      }
    }
    return "";
  }

  // 필터링 규칙 적용
  // 1. "성남" 포함 필터링
  let filtered = services.filter(item => {
    const name = getField(item, ['서비스명', 'svcNm', 'serviceName']);
    const purpose = getField(item, ['서비스목적요약', '서비스목적', 'svcPps']);
    const target = getField(item, ['지원대상', 'target']);
    const agency = getField(item, ['소관기관명', '소관기관', 'deptNm']);
    const text = [name, purpose, target, agency].join(" ");
    return text.includes("성남");
  });

  // 2. "성남" 없으면 "경기" 포함 필터링
  if (filtered.length === 0) {
    console.log("'성남' 관련 데이터가 없어 '경기' 관련 데이터로 필터링합니다.");
    filtered = services.filter(item => {
      const name = getField(item, ['서비스명', 'svcNm', 'serviceName']);
      const purpose = getField(item, ['서비스목적요약', '서비스목적', 'svcPps']);
      const target = getField(item, ['지원대상', 'target']);
      const agency = getField(item, ['소관기관명', '소관기관', 'deptNm']);
      const text = [name, purpose, target, agency].join(" ");
      return text.includes("경기");
    });
  }

  // 3. 둘 다 없으면 전체 데이터 사용
  if (filtered.length === 0) {
    console.log("'성남' 및 '경기' 관련 데이터가 없어 전체 데이터를 사용합니다.");
    filtered = services;
  }

  // 중복 제거 (name 기준)
  const newCandidates = filtered.filter(item => {
    const name = getField(item, ['서비스명', 'svcNm', 'serviceName']);
    return name && !existingNames.has(name);
  });

  if (newCandidates.length === 0) {
    console.log("새로운 데이터가 없습니다");
    return;
  }

  // 1건 추출
  const targetItem = newCandidates[0];
  const targetName = getField(targetItem, ['서비스명', 'svcNm', 'serviceName']);
  console.log(`선택된 새로운 서비스: ${targetName}`);

  // 3단계: Gemini AI로 새 항목 1개 가공
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

  const prompt = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해.
startDate가 없으면 오늘 날짜, endDate가 없으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

공공데이터 내용:
${JSON.stringify(targetItem, null, 2)}`;

  console.log("Gemini AI를 이용하여 데이터를 가공하는 중...");
  
  let processedItem = null;
  try {
    const geminiResponse = await fetch(geminiUrl, {
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

    if (!geminiResponse.ok) {
      throw new Error(`Gemini HTTP error! status: ${geminiResponse.status}`);
    }

    const geminiJson = await geminiResponse.json();
    const responseText = geminiJson.candidates[0].content.parts[0].text;
    
    // 마크다운 코드블록 제거
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    processedItem = JSON.parse(cleanJson);
  } catch (e) {
    console.error("Gemini AI 가공 중 오류 발생. 기존 데이터 보존:", e);
    return;
  }

  if (!processedItem) {
    console.error("가공된 데이터가 없습니다.");
    return;
  }

  // 호환성 처리 (name 필드를 title로 매핑하여 저장 등)
  processedItem.title = processedItem.name || processedItem.title;
  if (processedItem.category === '행사') {
    processedItem.category = '행사/축제';
  } else if (processedItem.category === '혜택') {
    processedItem.category = '지원금/혜택';
  }

  // 4단계: 기존 데이터에 추가 및 파일 저장
  existingData.items.push(processedItem);
  existingData.lastUpdated = new Date().toISOString().split('T')[0];

  try {
    fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2), 'utf8');
    console.log("성공적으로 새로운 항목 1건을 수집하고 local-info.json에 추가하였습니다!");
    console.log("추가된 항목:", processedItem);
  } catch (e) {
    console.error("데이터 파일 저장 실패:", e);
  }
}

run();
