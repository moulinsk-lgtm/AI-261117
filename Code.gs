/**
 * KGMP 및 ISO 13485:2016 교육 효과성 평가 웹앱
 * 1) Apps Script 프로젝트에 Code.gs와 index.html 생성
 * 2) 바인딩 스크립트가 아니면 CONFIG.SPREADSHEET_ID 입력
 * 3) setupSheets() 1회 실행 후 권한 승인
 * 4) 배포 > 새 배포 > 웹 앱 (실행 사용자/접근권한은 사내 정책에 맞게 설정)
 */
const CONFIG = {
  SPREADSHEET_ID: '',
  RESULT_SHEET: '교육평가결과',
  RUBRIC_SHEET: '관리자_채점기준',
  COMPANY_NAME: '[회사명]',
  TITLE: 'KGMP 및 ISO 13485:2016 규격에 대한 이해',
  PASS_SCORE: 80
};

const MC = [
  {id:'M01', q:'ISO 13485:2016의 주요 목적에 가장 부합하는 설명은?', o:[
    '모든 업종에 공통 적용되는 환경경영시스템 요구사항을 규정한다.',
    '의료기기 관련 고객 및 적용 규제 요구사항을 일관되게 충족하기 위한 품질경영시스템 요구사항을 규정한다.',
    '의료기기의 판매가격과 유통 마진을 관리한다.',
    '제품의 최종검사만을 규정한다.'
  ], a:1, c:'ISO 13485는 의료기기 및 관련 조직의 품질경영시스템 요구사항을 규정한다.', r:'ISO 13485:2016 1, 4.1'},
  {id:'M02', q:'품질경영시스템 문서 및 기록 관리에 대한 설명으로 옳은 것은?', o:[
    '기록은 수정 이력 없이 언제든 삭제할 수 있다.',
    '외부 출처 문서는 식별하거나 관리할 필요가 없다.',
    '기록은 읽기 쉽고 식별·검색 가능하도록 유지하며 보존 및 폐기 기준에 따라 관리한다.',
    '승인되지 않은 구버전 문서를 현장에서 자유롭게 사용해도 된다.'
  ], a:2, c:'문서·기록은 승인, 배포, 변경, 식별, 보관, 보호, 검색, 보존 및 폐기 기준에 따라 관리한다.', r:'ISO 13485:2016 4.2.4, 4.2.5'},
  {id:'M03', q:'ISO 13485:2016의 경영검토에 대한 설명으로 옳은 것은?', o:[
    '필요할 때 구두로만 실시하면 된다.',
    '계획된 주기에 따라 QMS의 지속적인 적절성·충족성·효과성을 검토하고 기록을 유지한다.',
    '품질관리부서 단독으로 수행하면 최고경영자 검토는 불필요하다.',
    '제품 품질 및 자원 필요성은 검토 대상이 아니다.'
  ], a:1, c:'최고경영자는 계획된 주기로 QMS를 검토하고 입력 및 출력사항에 대한 기록을 유지한다.', r:'ISO 13485:2016 5.6'},
  {id:'M04', q:'제품 품질에 영향을 미치는 업무 담당자의 적격성 및 교육에 대한 설명으로 옳은 것은?', o:[
    '교육 참석 서명만 있으면 적격성이 자동 입증된다.',
    '필요 역량을 정하고 교육 등 조치를 제공한 뒤 효과성을 평가하고 기록을 유지한다.',
    '경력자는 신규 업무에 대한 역량 확인이 필요 없다.',
    '모든 업무에 동일한 필기시험만 적용해야 한다.'
  ], a:1, c:'필요 역량 결정, 교육 등 조치, 효과성 평가, 인식 및 교육·기술·경험 기록 유지가 요구되며 평가방법은 업무 위험에 비례한다.', r:'ISO 13485:2016 6.2'},
  {id:'M05', q:'레진 혼합공정의 결과를 후속 검사만으로 충분히 확인하기 어려운 경우 가장 적절한 관리는?', o:[
    '작업자의 경험에만 의존한다.',
    '공정 유효성 확인 필요성을 평가하고 필요한 경우 승인된 조건에서 유효성 확인 및 기록을 수행한다.',
    '완제품 검사 항목을 모두 삭제한다.',
    '공정조건 변경을 기록하지 않는다.'
  ], a:1, c:'후속 모니터링·측정으로 결과를 완전히 검증할 수 없는 공정은 유효성 확인 필요성을 평가하고 필요한 경우 검증한다.', r:'ISO 13485:2016 7.5.6'},
  {id:'M06', q:'점도계 등 모니터링 및 측정 장비 관리에 대한 설명으로 옳은 것은?', o:[
    '고장 나기 전까지 교정이나 확인이 필요 없다.',
    '교정 상태와 무관하게 측정값을 사용한다.',
    '정해진 기준에 따라 교정·검증하고 상태를 식별·관리하며 부적합 장비의 이전 측정결과 영향도 평가한다.',
    '교정기록은 제품 품질과 관련이 없으므로 폐기해도 된다.'
  ], a:2, c:'측정장비의 교정·검증 및 상태관리를 수행하고 부적합 시 이전 측정결과의 유효성을 평가한다.', r:'ISO 13485:2016 7.6'},
  {id:'M07', q:'수입검사에서 원자재가 승인 규격에 부적합한 것으로 확인된 경우 적절한 조치는?', o:[
    '생산 일정이 급하므로 우선 사용한다.',
    '식별·통제하여 의도하지 않은 사용을 방지하고 부적합 관리 절차에 따라 처리한다.',
    '검사 결과를 삭제하고 재검사 결과만 보관한다.',
    '정상 자재와 혼합하여 사용한다.'
  ], a:1, c:'부적합 제품은 식별·통제하여 의도하지 않은 사용 또는 인도를 방지하고 처분 기록을 유지한다.', r:'ISO 13485:2016 8.3'},
  {id:'M08', q:'내부심사에서 심사원의 독립성과 객관성을 확보하는 방법으로 가장 적절한 것은?', o:[
    '심사원이 본인이 수행한 업무를 직접 심사한다.',
    '부서장의 구두 설명만으로 판정한다.',
    '심사 대상 업무에 직접 책임이 없는 심사원을 선정하고 객관적 증거에 근거해 심사한다.',
    '부적합을 발견해도 기록하지 않는다.'
  ], a:2, c:'심사원의 선정과 심사 수행은 객관성·공평성을 보장해야 하며 자신의 업무를 심사해서는 안 된다.', r:'ISO 13485:2016 8.2.4'},
  {id:'M09', q:'최종검사에서 제품이 승인된 합격기준을 충족하지 못한 경우 가장 적절한 조치는?', o:[
    '출하 후 고객 불만이 접수되면 처리한다.',
    '부적합 제품으로 식별·통제하고 승인된 절차에 따라 처분 및 관련 기록을 관리한다.',
    '검사자의 판단으로 합격 처리한다.',
    '동일 LOT의 다른 제품이 적합하면 해당 제품도 합격 처리한다.'
  ], a:1, c:'부적합 제품은 의도하지 않은 사용·출하를 방지하도록 통제하고 관련 기록을 유지한다.', r:'ISO 13485:2016 8.3'},
  {id:'M10', q:'식약처 고시 제2025-22호(2025.4.7.)의 주요 개정 내용에 해당하는 것은?', o:[
    '모든 제조업체에 ISO 9001 인증을 의무화하였다.',
    '3등급 제조·수입 의료기기의 적합성인정등 심사 주체 개선 및 MDSAP 심사와의 결합심사 근거 마련 등이 포함되었다.',
    '의료기기 제조 및 품질관리 기준을 전면 폐지하였다.',
    '모든 의료기기의 정기심사를 면제하였다.'
  ], a:1, c:'3등급 심사 주체 개선, MDSAP 결합심사 근거 마련, 디지털의료제품법 소관 소프트웨어 의료기기 관련 조항 정비 등이 포함된다.', r:'식약처 고시 제2025-22호'}
];

const ESSAY = [
  {id:'S01', q:'ISO 13485:2016 6.2에 따른 교육훈련 및 적격성 관리의 주요 요구사항을 설명하고, 교육 효과성 평가 방법을 업무 위험에 비례하여 설정해야 하는 이유를 서술하시오.', rubric:'필요 역량 결정, 교육/기타 조치, 효과성 평가, 인식, 교육·기술·경험 기록 및 업무 위험 비례 원칙을 포함하면 만점.'},
  {id:'S02', q:'치과용 레진 제조 중 혼합 공정조건(예: 혼합 온도 또는 시간)을 변경하려는 경우, 품질경영시스템 관점에서 검토·관리해야 할 사항을 서술하시오.', rubric:'변경관리, 위험/영향평가, 승인, 검증 또는 유효성 확인 필요성, 시험·검사, 문서 개정, 교육, 추적성 및 기록을 포함하면 만점.'},
  {id:'S03', q:'수입검사에서 원자재 부적합이 확인된 경우, 부적합 원자재의 오사용을 방지하고 적절히 처리하기 위한 절차를 서술하시오.', rubric:'식별·격리/접근통제, 부적합 기록, 관련 부서 통보, 반품·폐기·특채 등 승인된 처분, 특채 승인조건, 기록 및 필요 시 시정조치를 포함하면 만점.'},
  {id:'S04', q:'ISO 13485:2016 5.6 경영검토의 목적과 주요 입력사항 및 출력사항을 각각 설명하시오.', rubric:'지속적 적절성·충족성·효과성 평가, 입력 12개 항목의 핵심 및 출력 4개(시스템/프로세스 개선, 제품 개선, 규제변경 대응, 자원)를 포함하면 만점.'},
  {id:'S05', q:'내부심사에서 요구사항에 부합하지 않는 객관적 증거를 발견한 경우, 심사원이 취해야 할 조치와 심사 후속관리 방법을 서술하시오.', rubric:'심사기준과 객관적 증거 연결, 사실에 근거한 부적합 기록, 보고·통보, 원인분석/시정조치, 이행 확인 및 후속 확인을 포함하면 만점.'}
];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('KGMP 및 ISO 13485:2016 교육 효과성 평가')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getTestData() {
  return {
    companyName: CONFIG.COMPANY_NAME,
    title: CONFIG.TITLE,
    passScore: CONFIG.PASS_SCORE,
    mc: MC.map(x => ({id:x.id, q:x.q, options:x.o})),
    essay: ESSAY.map(x => ({id:x.id, q:x.q}))
  };
}

function setupSheets() {
  const ss = getSS_();
  let result = ss.getSheetByName(CONFIG.RESULT_SHEET) || ss.insertSheet(CONFIG.RESULT_SHEET);
  if (result.getLastRow() === 0) {
    const headers = ['제출일시','회사명','교육명','교육일자','성명','부서','사번(선택)']
      .concat(MC.map(x=>x.id), ['객관식 정답수','객관식 점수','객관식 판정'])
      .concat(ESSAY.map(x=>x.id), ['주관식 채점상태','주관식 점수','총점','평가자','평가일','비고']);
    result.appendRow(headers);
    result.setFrozenRows(1);
    result.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#dbeafe');
    result.autoResizeColumns(1,headers.length);
  }
  let rubric = ss.getSheetByName(CONFIG.RUBRIC_SHEET) || ss.insertSheet(CONFIG.RUBRIC_SHEET);
  if (rubric.getLastRow() === 0) {
    rubric.appendRow(['구분','문항ID','정답/채점기준','관련 조항']);
    MC.forEach(x=>rubric.appendRow(['객관식',x.id,`${x.a+1}번. ${x.o[x.a]} / ${x.c}`,x.r]));
    ESSAY.forEach(x=>rubric.appendRow(['주관식',x.id,x.rubric,'평가자 수동 채점']));
    rubric.setFrozenRows(1);
    rubric.getRange(1,1,1,4).setFontWeight('bold').setBackground('#fee2e2');
    rubric.setColumnWidth(3,700);
    rubric.getDataRange().setWrap(true);
  }
  return '결과 시트와 관리자 채점기준 시트가 준비되었습니다.';
}

function submitTest(p) {
  if (!p || !p.name || !p.department || !p.trainingDate || !p.answers || !p.essays)
    throw new Error('필수 입력정보가 누락되었습니다.');
  MC.forEach(q=>{ if (p.answers[q.id] === undefined || p.answers[q.id] === '') throw new Error(q.id+' 문항에 응답해 주세요.'); });
  ESSAY.forEach(q=>{ if (!String(p.essays[q.id]||'').trim()) throw new Error(q.id+' 문항에 답변해 주세요.'); });

  const ss = getSS_();
  let sh = ss.getSheetByName(CONFIG.RESULT_SHEET);
  if (!sh) { setupSheets(); sh = ss.getSheetByName(CONFIG.RESULT_SHEET); }

  let correct = 0;
  const choices = MC.map(q=>{
    const n = Number(p.answers[q.id]);
    if (n === q.a) correct++;
    return (n >= 0 && n <= 3) ? n+1 : '';
  });
  const score = correct * 10;
  const essayAnswers = ESSAY.map(q=>String(p.essays[q.id]).trim());
  const row = [new Date(),CONFIG.COMPANY_NAME,CONFIG.TITLE,p.trainingDate,p.name.trim(),p.department.trim(),p.employeeId||'']
    .concat(choices,[correct,score,score>=CONFIG.PASS_SCORE?'객관식 기준 충족':'재교육 검토'])
    .concat(essayAnswers,['미채점','','','','','']);
  sh.appendRow(row);
  return {success:true,correct:correct,score:score,status:score>=CONFIG.PASS_SCORE?'객관식 기준 충족':'재교육 검토'};
}

function getSS_() {
  if (CONFIG.SPREADSHEET_ID) return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('바인딩 스크립트를 사용하거나 CONFIG.SPREADSHEET_ID를 입력하세요.');
  return ss;
}
