/* REAL BETIS INSIDE · 2026년 11월 예약 신청 시스템
 * 구글 시트 연결 방법: README_연결방법.txt를 참조하세요.
 * 앱스 스크립트의 배포 URL을 아래 appsScriptUrl에 붙여 넣으면
 * 실제 신청자 접수·이메일 알림·공유 모집 인원이 활성화됩니다.
 * 비워두면 시연 모드로 실행하며 어떤 개인정보도 외부로 전송하지 않습니다.
 */
const BETIS_CONFIG = Object.freeze({
  appsScriptUrl: '',  // 예: https://script.google.com/macros/s/배포ID/exec
  seatsTotal: 15,
  seatsBooked: 11,
  seatsAsOf: '2026.11.02'
});
let seatState = {total:15,booked:11,asOf:'2026.11.02'};
const isLive = Boolean(BETIS_CONFIG.appsScriptUrl.trim());
const demoKey = 'realBetisInside2026DemoBooked-v3';

const days = [
  {date:'12.05',day:'토요일',name:'스페인으로 출발',am:'공항 집결 · 출국 준비',pm:'항공 수속 · 한국 출발',pmType:'',ev:'기내 이동',evType:''},
  {date:'12.06',day:'일요일',name:'세비야 입성',am:'스페인 도착 · 마드리드 집결',pm:'점심식사 · 구단 대절버스로 세비야 이동 <small>(약 6시간)</small>',pmType:'',ev:'숙소 체크인 · 저녁식사 · 오리엔테이션',evType:''},
  {date:'12.07',day:'월요일',name:'베티스 첫 훈련',am:'훈련 ① <small>(90분)</small>',amType:'train',pm:'점심식사 · 자유일정 · 휴식',pmType:'free',ev:'훈련 ② <small>(90분)</small>',evType:'train'},
  {date:'12.08',day:'화요일',name:'훈련과 첫 친선경기',am:'훈련 ③ <small>(90분)</small>',amType:'train',pm:'훈련 ④ <small>(90분)</small>',pmType:'train',ev:'21:00 레알 베티스 유소년 친선경기 ①',evType:'event'},
  {date:'12.09',day:'수요일',name:'챔피언스리그 관람',am:'훈련 ⑤ <small>(90분)</small>',amType:'train',pm:'점심식사 · 자유일정 · 경기장 이동',pmType:'free',ev:'18:45 챔피언스리그 경기 관람',evType:'event'},
  {date:'12.10',day:'목요일',name:'두 번째 친선경기',am:'훈련 ⑥ <small>(90분)</small>',amType:'train',pm:'점심식사 · 휴식 · 경기 준비',pmType:'free',ev:'21:00 레알 베티스 유소년 친선경기 ②',evType:'event'},
  {date:'12.11',day:'금요일',name:'구단 투어와 저녁 훈련',am:'훈련 ⑦ <small>(90분)</small>',amType:'train',pm:'점심식사 · 구단 및 경기장 투어 · 자유일정',pmType:'free',ev:'훈련 ⑧ <small>(90분)</small>',evType:'train'},
  {date:'12.12',day:'토요일',name:'마지막 트레이닝',am:'훈련 ⑨ <small>(90분)</small>',amType:'train',pm:'점심식사 · 자유일정 · 선택 관광',pmType:'free',ev:'저녁식사 · 자유일정 · 휴식',evType:'free'},
  {date:'12.13',day:'일요일',name:'스페인 출발',am:'조식 · 체크아웃 · 구단 대절버스 탑승',pm:'마드리드 이동 <small>(약 6시간)</small> · 점심식사 · 공항 수속',pmType:'',ev:'스페인 저녁 출발 · 귀국 항공편',evType:'event'},
  {date:'12.14',day:'월요일',name:'한국 도착',am:'기내 이동 · 환승 일정',pm:'한국 도착 · 해산',pmType:'',ev:'귀가 · 휴식',evType:''}
];

const faqs = [
  ['선수·학부모 참가비에 항공권이 포함되나요?', '네. 선수 690만 원, 학부모 590만 원 모두 왕복 국제선 항공권이 포함된 상품입니다. 별도 개인 경비와 선택 활동 비용은 제외될 수 있습니다.'],
  ['훈련은 며칠에 몇 회 진행되나요?', '총 9회이며 <b>1회당 90분</b>입니다. 7일 오전·저녁 각 1회, 8일 오전·오후 각 1회, 9일 오전 1회, 10일 오전 1회, 11일 오전·저녁 각 1회, 12일 오전 1회입니다. 하루 2회면 총 3시간입니다.'],
  ['골키퍼 훈련도 진행되나요?', '네. 레알 베티스 측에서 골키퍼 전문 코치의 훈련이 포함된다고 안내했습니다.'],
  ['축구를 아주 잘해야 참가할 수 있나요?', '공식 입단 테스트가 아니라 전문 지도와 경기 경험을 위한 유소년 프로그램입니다. 모집 연령과 운영 조건에 맞는 선수라면 신청할 수 있으며 연령과 수준에 맞춰 훈련을 편성합니다.'],
  ['아이 혼자 참가해도 되나요?', '네. 국내 전담 인솔진이 단체 이동·생활·통역을 지원합니다. 미성년자의 자유일정은 인솔진의 관리 체계 안에서 운영합니다.'],
  ['중학교 진학이나 유럽 입단에 직접 도움이 되나요?', '캠프는 공식 입단 테스트나 스카우팅, 중학교 입학 특혜를 제공하지 않습니다. 현지 훈련과 경기를 경험하고 앞으로의 성장 방향을 탐색하는 프로그램입니다.'],
  ['예약금은 얼마인가요?', '선수 <b>69만 원</b>, 학부모 <b>59만 원</b>이며 총 참가비에 포함됩니다. 선수 잔금은 621만 원, 학부모 잔금은 531만 원입니다. 신청서를 제출하면 결제선생 청구서를 별도로 보내드립니다. 신청 자체는 결제 완료가 아닙니다.'],
  ['항공권은 어느 업체에서 예약·발권하나요?', '왕복 국제선 항공권은 관광사업자 등록업체인 <b>(주)신흥항공</b>(사업자등록번호 203-81-48596, 관광사업자 등록번호 일반여행업 2012-17)을 통해 예약·발권합니다. 예약금 납부와 발권정보 접수가 완료되면 3일 이내 발권을 진행하고, 항공편 정보 및 예약번호를 안내합니다. 변경·취소는 해당 항공권의 운임규정과 계약조건에 따릅니다.'],
  ['예약 후 항공권은 언제 발권하나요?', '예약금 납부 확인과 여권 영문 성명 등 필수 발권정보 접수가 완료되면 <b>3일 이내 발권을 진행</b>합니다. 항공편 정보는 발권 후 안내합니다.'],
  ['취소·환불 규정은 어떻게 되나요?', `캠프 취소·환불 안내는 다음과 같습니다. <table class="refund-table"><thead><tr><th>구분</th><th>환불 안내</th></tr></thead><tbody><tr><td>예약 후 10일 이내 취소</td><td>프로그램 비용 100% 환불<br><small>단, 출발 10일 전부터는 출발 임박 기준이 우선 적용됩니다.</small></td></tr><tr><td>출발 10일 전~출발 당일 취소</td><td>프로그램 참가비의 50% 환불</td></tr><tr><td>항공권 발권 후 취소</td><td>항공권 취소수수료 30만 원 (해당 항공 운임규정 기준)</td></tr><tr><td>출발 당일 미탑승(노쇼)</td><td>항공운임 환불 불가 · 항공사 노쇼 수수료 별도 발생</td></tr></tbody></table><b>중요:</b> 왕복 항공권 포함 상품이므로 항공권과 프로그램 비용을 구분한 실제 환불액, 중복 수수료 적용 여부 및 불가피한 사유에 따른 예외는 참가 계약서와 관계 법령에 따라 판단합니다. 출발 10일 전부터 50% 환불 조건은 일반 국외여행 소비자분쟁해결기준과 다른 특별약관이 될 수 있어 별도 고지·동의 및 유효성 검토가 필요합니다.`],
  ['12월 13일에 귀국하는 건가요?', '12월 13일 저녁 스페인에서 귀국 항공편에 탑승하고, 12월 14일 한국에 도착합니다. 실제 출도착 시각과 환승 정보는 발권 후 안내합니다.'],
  ['베티스 선수들과 어떤 방식으로 경기하나요?', '레알 베티스 유소년 선수들과 친선경기 2회를 진행하며, 참가 구성에 맞춰 7대7·8대8·11대11 경기 방식을 경험합니다.'],
  ['훈련 외에 어떤 일정이 있나요?', '챔피언스리그 경기 관람 일정, 베티스 구단·경기장 투어, 세비야 문화 경험과 자유일정이 있습니다. 현지 시설과 항공편 일정에 따라 세부 시간은 조정될 수 있습니다.'],
  ['마드리드에서 세비야까지 어떻게 이동하고 얼마나 걸리나요?', '레알 베티스 구단에서 대절하는 단체버스를 이용합니다. 마드리드에서 세비야까지 도로 이동 시간은 <b>약 6시간</b>으로 계획하며, 휴게소 정차와 교통상황에 따라 달라질 수 있습니다. 귀국 시 세비야에서 마드리드로 이동할 때도 단체버스를 이용합니다.'],
  ['세비야 현지에서 훈련장과 경기장은 어떻게 이동하나요?', '세비야에 도착한 뒤 <b>모든 공식 일정은 구단이 마련한 단체버스로 이동</b>합니다. 훈련·친선경기·구단 투어 등 공식 활동을 함께 이동하며, 개인 자유일정에 따른 별도 이동은 포함되지 않을 수 있습니다.'],
];

const fmt = n => new Intl.NumberFormat('ko-KR').format(n)+'원';
const checkoutData = {
  player: {label:'선수 참가',total:6900000,deposit:690000,balance:6210000},
  parent: {label:'학부모 동행',total:5900000,deposit:590000,balance:5310000}
};
let selectedKind='player', lastFocus=null, isSubmitting=false;
let requestCallbackId=0;

function renderSchedule(){
  const list=document.getElementById('schedule-list');
  list.innerHTML=days.map(d=>`<div class="day-row"><div class="day-date"><strong>${d.date} <small style="font-size:11px">${d.day[0]}</small></strong><span>${d.name}</span></div><div class="day-plan"><div class="day-slot ${d.amType==='train'?'highlight':''}"><span>오전</span><p>${d.am}</p></div><div class="day-slot ${d.pmType==='event'?'event':d.pmType==='train'?'highlight':d.pmType==='free'?'free':''}"><span>오후</span><p>${d.pm}</p></div><div class="day-slot ${d.evType==='event'?'event':d.evType==='train'?'highlight':''}"><span>저녁</span><p>${d.ev}</p></div></div></div>`).join('');
}
function renderFAQs(){
  const list=document.getElementById('faq-items');
  list.innerHTML=faqs.map(([q,a],i)=>`<div class="faq-item"><button type="button" aria-expanded="false" aria-controls="faq-answer-${i}" id="faq-button-${i}"><span>${q}</span><span class="faq-plus" aria-hidden="true"></span></button><div class="faq-answer" id="faq-answer-${i}" hidden><p>${a}</p></div></div>`).join('');
  list.querySelectorAll('.faq-item>button').forEach(button=>button.addEventListener('click',()=>{
    const item=button.parentElement, answer=item.querySelector('.faq-answer'),expanded=button.getAttribute('aria-expanded')==='true';
    button.setAttribute('aria-expanded',String(!expanded));answer.hidden=expanded;item.classList.toggle('expanded',!expanded);
  }));
}
function setSeats(result){
  if(result){
    const total=Number(result.total), booked=Number(result.booked);
    if(Number.isFinite(total)&&total>0&&Number.isFinite(booked)){
      seatState.total=total;seatState.booked=Math.max(0,Math.floor(booked));
      if(result.asOf)seatState.asOf=String(result.asOf);
    }
  }
  const {total,booked}=seatState;
  const untilTarget=Math.max(total-booked,0);
  const overTarget=Math.max(booked-total,0);
  const targetReached=booked>=total;
  const message=booked<total
    ? `1차 목표까지 ${untilTarget}명`
    : booked===total ? '1차 목표 달성 · 추가 신청 접수 중'
    : `1차 목표 달성 · 추가 신청 ${overTarget}명`;
  document.querySelectorAll('[data-seat-message]').forEach(x=>x.textContent=message);
  document.querySelectorAll('[data-booked]').forEach(x=>x.textContent=booked);
  document.querySelectorAll('[data-total]').forEach(x=>x.textContent=total);
  document.querySelectorAll('[data-asof]').forEach(x=>x.textContent=seatState.asOf);
  document.querySelectorAll('[data-seat-status-label]').forEach(x=>x.textContent=targetReached?'추가 신청 접수':'1차 목표까지');
  document.querySelectorAll('[data-seat-stat]').forEach(x=>x.textContent=targetReached?(booked===total?'진행 중':`+${overTarget}`):String(untilTarget));
  document.querySelectorAll('[data-seat-stat-unit]').forEach(x=>x.textContent=targetReached&&booked===total?'':'명');
  document.querySelectorAll('.capacity-left').forEach(x=>x.classList.toggle('target-reached',targetReached));
  // The bar visualizes progress toward the initial goal; it never limits applications.
  const percent=Math.min(100,100*booked/total);
  document.querySelectorAll('[data-fill]').forEach(bar=>bar.style.width=percent+'%');
  document.querySelectorAll('[data-fill-mini]').forEach(bar=>bar.style.width=percent+'%');
  const progress=document.querySelector('.capacity-progress');
  if(progress){progress.setAttribute('aria-valuenow',String(Math.min(total,booked)));progress.setAttribute('aria-valuemax',String(total));progress.setAttribute('aria-valuetext',`${booked}명 신청 접수, 1차 목표 ${total}명`);}
  document.querySelectorAll('.js-book[data-kind="player"]').forEach(x=>x.removeAttribute('aria-label'));
}
function jsonpStatus(requestId='',extra={}){
  return new Promise((resolve,reject)=>{
    if(!isLive){reject(Error('not configured'));return;}
    const cb='betisCallback_'+(++requestCallbackId)+'_'+Math.random().toString(36).slice(2,8);
    const script=document.createElement('script');
    let done=false;
    const cleanup=()=>{if(done)return;done=true;clearTimeout(timer);delete window[cb];script.remove();};
    const timer=setTimeout(()=>{cleanup();reject(new Error('상태 조회 시간이 초과되었습니다.'));},12000);
    window[cb]=data=>{cleanup();resolve(data);};
    script.onerror=()=>{cleanup();reject(new Error('상태 조회에 실패했습니다.'));};
    const url=new URL(BETIS_CONFIG.appsScriptUrl);
    url.searchParams.set('prefix',cb);
    if(requestId)url.searchParams.set('requestId',requestId);
    Object.entries(extra).forEach(([key,value])=>url.searchParams.set(key,String(value)));
    url.searchParams.set('_',String(Date.now()));
    script.src=url.toString();
    document.head.appendChild(script);
  });
}
async function refreshSeats(){
  if(!isLive)return;
  try{
    const data=await jsonpStatus();
    if(data&&data.ok)setSeats(data);
  }catch(e){
    // Keep last confirmed known count; never silently fabricate server confirmation.
    console.warn('[BETIS] 신청 현황을 불러올 수 없습니다:',e.message);
  }
}
function selectKind(kind){
  selectedKind=kind==='parent'?'parent':'player';const data=checkoutData[selectedKind];
  document.querySelectorAll('.checkout-types button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.type===selectedKind)));
  document.getElementById('checkout-full').textContent=fmt(data.total);
  document.getElementById('checkout-deposit').textContent=fmt(data.deposit);
  document.getElementById('checkout-balance').textContent=fmt(data.balance);
  const playerFields=document.getElementById('player-fields');
  playerFields.hidden=selectedKind==='parent';
  document.getElementById('apply-player').required=selectedKind==='player';
  document.getElementById('checkout-status').textContent='';
}
function openDrawer(kind){
  selectKind(kind);lastFocus=document.activeElement;
  document.getElementById('checkout-overlay').hidden=false;
  requestAnimationFrame(()=>document.getElementById('checkout-overlay').classList.add('active'));
  const dr=document.getElementById('checkout-drawer');dr.classList.add('open');dr.setAttribute('aria-hidden','false');
  document.getElementById('apply-form').hidden=false;document.getElementById('apply-success').hidden=true;
  document.getElementById('apply-form').reset();
  if(!isLive){document.getElementById('checkout-status').textContent='미리보기 모드입니다. 신청 인원만 이 브라우저에서 테스트되며, 실제 신청 정보는 저장·전송되지 않습니다.';}
  document.body.classList.add('drawer-open');document.getElementById('close-drawer').focus();
  refreshSeats();
}
function closeDrawer(){
  if(isSubmitting)return;
  document.getElementById('checkout-overlay').classList.remove('active');
  const dr=document.getElementById('checkout-drawer');dr.classList.remove('open');dr.setAttribute('aria-hidden','true');
  document.getElementById('checkout-overlay').hidden=true;document.body.classList.remove('drawer-open');
  if(lastFocus?.focus)lastFocus.focus();
}
function makeId(){
  if(window.crypto&&typeof window.crypto.randomUUID==='function')return window.crypto.randomUUID();
  return 'bt-'+Date.now()+'-'+Math.random().toString(36).slice(2,14);
}
function normalizePhone(v){return String(v||'').replace(/[^0-9]/g,'');}
function setStatus(message,error=false){
  const el=document.getElementById('checkout-status');
  el.textContent=message;el.classList.toggle('error',error);
}
function showSuccess(id,demo=false){
  document.getElementById('apply-form').hidden=true;document.getElementById('apply-success').hidden=false;
  document.getElementById('success-title').textContent=demo?'신청 화면 테스트 완료':'참가 신청이 접수되었습니다!';
  document.getElementById('success-desc').textContent=demo
    ?'미리보기 모드입니다. 접수 인원은 이 브라우저에서만 변경되며, 이메일 전송과 실제 예약 접수는 이루어지지 않았습니다.'
    :'운영팀이 신청정보를 확인한 뒤 입력한 휴대전화로 결제선생 카드결제 청구서를 보내드립니다. 결제 완료 후 예약 확정 안내를 받으세요.';
  document.getElementById('success-id').textContent=id.slice(0,18).toUpperCase();
  document.getElementById('apply-success').scrollIntoView({behavior:'smooth',block:'nearest'});
}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function sendRequest(payload,action=''){
  // Simple cross-origin text/plain POST avoids a CORS preflight. The response is
  // intentionally opaque; a separate read-only JSONP status verifies reception.
  try{
    await fetch(BETIS_CONFIG.appsScriptUrl,{
      method:'POST',mode:'no-cors',credentials:'omit',redirect:'follow',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify(payload)
    });
  }catch(err){
    // The network error might occur after the script accepted the request;
    // requestId idempotency ensures repeating the same payload is safe.
    console.warn('[BETIS] 전송 응답 오류, 서버 접수 상태 확인 진행:',err);
  }
  for(let tries=0;tries<14;tries++){
    await delay(800 + (tries>4?500:0));
    try{
      const state=await jsonpStatus(payload.requestId,action?{action}:{});
      if(state&&state.ok){setSeats(state);
        const s=state.request&&state.request.status;
        if(['accepted','duplicate','full','invalid'].includes(s))return {status:s,state};
      }
    }catch(e){console.warn('[BETIS] 신청상태 확인 재시도',e.message);}
  }
  return {status:'unverified'};
}
async function submitApplication(e){
  e.preventDefault();
  if(isSubmitting)return;
  const form=document.getElementById('apply-form');
  const name=form.elements.parentName.value.trim();
  const phone=normalizePhone(form.elements.phone.value);
  const playerName=form.elements.playerName.value.trim();
  if(!name||name.length>30){setStatus('보호자 성함을 입력해 주세요.',true);form.elements.parentName.focus();return;}
  if(!/^01[016789][0-9]{7,8}$/.test(phone)){setStatus('휴대전화번호를 정확히 입력해 주세요.',true);form.elements.phone.focus();return;}
  if(selectedKind==='player'&&!playerName){setStatus('참가 선수 이름을 입력해 주세요.',true);form.elements.playerName.focus();return;}
  if(!document.getElementById('privacy-consent').checked||!document.getElementById('pay-consent').checked){setStatus('개인정보 이용 동의 및 상품 안내 확인이 필요합니다.',true);return;}
  const requestId=makeId();
  const payload={requestId,kind:selectedKind,parentName:name,phone,playerName:selectedKind==='player'?playerName:'',grade:form.elements.grade.value,position:form.elements.position.value,website:form.elements.website.value,consent:true,startedAt:Date.now()};
  const previous=seatState.booked;
  isSubmitting=true;const btn=document.getElementById('checkout-pay');btn.disabled=true;btn.textContent='신청 접수 확인 중…';
  setStatus('신청서를 접수하고 있습니다. 잠시만 기다려 주세요.');
  // Instant optimistic counter on submitting a valid player application, then
  // server response confirms or rolls it back to the actual shared count.
  if(selectedKind==='player')setSeats({total:seatState.total,booked:previous+1});
  try{
    if(!isLive){
      if(selectedKind==='player'){
        try{localStorage.setItem(demoKey,String(seatState.booked));}catch(_e){}
      }
      await delay(420);
      showSuccess(requestId,true);
      return;
    }
    const out=await sendRequest(payload);
    if(out.status==='accepted'){
      showSuccess(requestId,false);return;
    }
    if(out.status==='duplicate')setStatus('이미 같은 연락처와 선수 이름으로 신청한 내역이 있습니다. 운영팀에 확인해 주세요.',true);
    else if(out.status==='full')setStatus('이전 서버 코드가 신청을 차단하고 있습니다. 운영팀에 문의해 주세요.',true);
    else if(out.status==='invalid')setStatus('입력하신 신청정보를 확인해 주세요. 양식에 오류가 있습니다.',true);
    else {
      setStatus('서버 접수 여부를 확인하지 못했습니다. 중복 신청하지 마시고 운영팀의 연락 또는 신청 내역을 먼저 확인해 주세요.',true);
      setSeats({total:seatState.total,booked:previous});
    }
    await refreshSeats();
  }catch(err){
    setStatus('신청 상태를 확인할 수 없습니다. 다시 제출하기 전 운영팀에 접수 여부를 확인해 주세요.',true);
    setSeats({total:seatState.total,booked:previous});
    await refreshSeats();
  }finally{
    isSubmitting=false;btn.disabled=false;btn.textContent='참가 신청 접수하기 ↗';
    if(!isLive)setSeats({total:seatState.total,booked:seatState.booked});
  }
}

/* COMMENTS: localStorage preview; optional shared Google Sheets via existing Apps Script. */
const commentLocalKey='betisInside2026CommentsLocal-v1';
let commentItems=[];
let commentPending=false;
function escapeText(s){return String(s==null?'':s);}
function commentDate(iso){
  const d=new Date(iso);
  return Number.isNaN(d.getTime())?'방금 전':d.toLocaleDateString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'});
}
function createCommentCard(item){
  const article=document.createElement('article');article.className='comment-item';
  const head=document.createElement('div');head.className='comment-item-head';
  const author=document.createElement('strong');author.textContent=item.nickname||'학부모';
  const meta=document.createElement('span');meta.textContent=commentDate(item.createdAt)+(item.pending?' · 검토 대기':'');
  const body=document.createElement('p');body.textContent=item.message||'';
  head.append(author,meta);article.append(head,body);
  if(item.pending)article.classList.add('comment-pending');
  return article;
}
function renderComments(){
  const list=document.getElementById('comment-list');if(!list)return;
  const count=document.getElementById('comment-count');count.textContent=String(commentItems.length);
  list.replaceChildren();
  if(!commentItems.length){const empty=document.createElement('div');empty.className='comment-empty';empty.textContent=isLive?'아직 공개된 질문이 없습니다. 질문을 남기시면 운영팀 확인 후 게시됩니다.':'아직 작성된 댓글이 없습니다. 첫 질문을 남겨주세요.';list.appendChild(empty);return;}
  commentItems.slice(0,30).forEach(item=>list.appendChild(createCommentCard(item)));
}
function setCommentFeedback(message,error=false){const e=document.getElementById('comment-feedback');if(e){e.textContent=message;e.classList.toggle('error',error);}}
function loadLocalComments(){try{const saved=JSON.parse(localStorage.getItem(commentLocalKey)||'[]');commentItems=Array.isArray(saved)?saved.slice(0,30).filter(x=>typeof x?.message==='string'):[];}catch(e){commentItems=[];}renderComments();}
function saveLocalComments(){try{localStorage.setItem(commentLocalKey,JSON.stringify(commentItems.slice(0,30)));}catch(e){setCommentFeedback('브라우저 저장 공간을 이용할 수 없어 새로고침하면 댓글이 사라질 수 있습니다.',true);}}
async function refreshComments(){
  if(!isLive)return;
  try{
    const data=await jsonpStatus('',{action:'comments'});
    if(data&&data.ok&&Array.isArray(data.comments)){
      commentItems=data.comments.map(x=>({nickname:x.nickname,message:x.message,createdAt:x.createdAt}));
      renderComments();
      document.getElementById('comment-feed-label').textContent='공개 승인된 댓글';
    }
  }catch(e){console.warn('[BETIS] 댓글을 불러오지 못했습니다:',e.message);}
}
async function submitComment(e){
  e.preventDefault();if(commentPending)return;
  const nickname=document.getElementById('comment-name').value.trim();
  const message=document.getElementById('comment-body').value.trim();
  if(nickname.length<2||nickname.length>20){setCommentFeedback('닉네임을 2~20자로 입력해 주세요.',true);return;}
  if(message.length<5||message.length>500){setCommentFeedback('질문을 5~500자로 작성해 주세요.',true);return;}
  const submit=document.getElementById('comment-submit');commentPending=true;submit.disabled=true;submit.textContent='등록 중…';
  try{
    if(!isLive){
      commentItems.unshift({nickname,message,createdAt:new Date().toISOString()});
      commentItems=commentItems.slice(0,30);saveLocalComments();renderComments();
      setCommentFeedback('이 브라우저에 댓글을 저장했습니다. 다른 사람에게는 보이지 않습니다.');
    }else{
      const requestId=makeId();
      const out=await sendRequest({action:'comment',requestId,nickname,message,consent:true,website:''},'comments');
      if(out.status==='accepted'){
        setCommentFeedback('질문이 접수되었습니다. 운영팀이 확인한 뒤 공개됩니다.');
        await refreshComments();
      }else if(out.status==='invalid'){setCommentFeedback('댓글 내용을 확인해 주세요.',true);return;}
      else{setCommentFeedback('접수 상태를 확인하지 못했습니다. 잠시 후 다시 확인해 주세요.',true);return;}
    }
    document.getElementById('comment-body').value='';
    document.getElementById('comment-length').textContent='0';
  }catch(err){setCommentFeedback('등록 중 오류가 발생했습니다. 다시 시도해 주세요.',true);}
  finally{commentPending=false;submit.disabled=false;submit.innerHTML='댓글 등록하기 <span aria-hidden="true">↗</span>';}
}
function initComments(){
  const form=document.getElementById('comment-form');if(!form)return;
  if(isLive){document.getElementById('comment-feed-label').textContent='공개 댓글';}
  const textarea=document.getElementById('comment-body');
  textarea.addEventListener('input',()=>document.getElementById('comment-length').textContent=String(textarea.value.length));
  form.addEventListener('submit',submitComment);
  if(isLive){refreshComments();setInterval(()=>{if(!document.hidden)refreshComments();},45000);}else{loadLocalComments();}
  window.addEventListener('storage',e=>{if(!isLive&&e.key===commentLocalKey)loadLocalComments();});
}

function init(){
  renderSchedule();renderFAQs();initComments();
  if(!isLive){
    document.body.classList.add('preview-mode');
    try{const n=Number(localStorage.getItem(demoKey));if(Number.isInteger(n)&&n>=BETIS_CONFIG.seatsBooked)seatState.booked=n;}catch(e){}
    const asof=document.querySelector('.capacity-asof');if(asof)asof.innerHTML='현재 <b>미리보기 모드</b> · 다른 기기에는 반영되지 않습니다. 실제 운영은 구글 시트 연동 후 시작합니다.';
  }
  setSeats();
  const navToggle=document.querySelector('.nav-toggle'),nav=document.getElementById('mobile-menu');
  navToggle.addEventListener('click',()=>{const opened=navToggle.getAttribute('aria-expanded')==='true';navToggle.setAttribute('aria-expanded',String(!opened));nav.hidden=opened;});
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.hidden=true;navToggle.setAttribute('aria-expanded','false');}));
  document.querySelectorAll('.js-book').forEach(button=>button.addEventListener('click',()=>{nav.hidden=true;navToggle.setAttribute('aria-expanded','false');openDrawer(button.dataset.kind||'player');}));
  document.querySelectorAll('.checkout-types button').forEach(b=>b.addEventListener('click',()=>selectKind(b.dataset.type)));
  document.getElementById('close-drawer').addEventListener('click',closeDrawer);
  document.getElementById('success-close').addEventListener('click',closeDrawer);
  document.getElementById('checkout-overlay').addEventListener('click',closeDrawer);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('checkout-drawer').classList.contains('open'))closeDrawer();});
  document.getElementById('apply-form').addEventListener('submit',submitApplication);
  if(isLive){
    refreshSeats();
    // All open pages refresh the same server-backed count regularly.
    setInterval(()=>{if(!document.hidden&&!isSubmitting)refreshSeats();},15000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshSeats();});
  }else{
    window.addEventListener('storage',e=>{if(e.key===demoKey){const n=Number(e.newValue);if(Number.isInteger(n))setSeats({total:BETIS_CONFIG.seatsTotal,booked:n});}});
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
