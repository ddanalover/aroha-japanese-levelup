"use strict";
let dailyState=null;
const DAILY_STORAGE='concert-japanese-daily-v3';
const DAILY_SENTENCE_CARDS=new Map(concertLessons().map(card=>[plainJapanese(card.examples[0][0]),card]));
const DAILY_WORD_CARDS=new Map(LESSONS.filter(card=>WORD_TOPICS.includes(card.section)).map(card=>[plainJapanese(card.examples[0][0]),card]));
function dailyRecords(){
  try{
    const saved=JSON.parse(localStorage.getItem(DAILY_STORAGE)||'{}');
    return {completed:Array.isArray(saved?.completed)?saved.completed:[],mistakes:saved?.mistakes&&typeof saved.mistakes==='object'?saved.mistakes:{}};
  }catch{return {completed:[],mistakes:{}};}
}
function saveDailyRecords(record){try{localStorage.setItem(DAILY_STORAGE,JSON.stringify(record));}catch{/* Learning remains available without storage. */}}
function dailySentences(day){
  return day.sentences.map(jp=>DAILY_SENTENCE_CARDS.get(jp));
}
function dailyNewSentences(day){return dailySentences(day).slice(0,3);}
function dailyWords(day){
  return day.words.map(jp=>DAILY_WORD_CARDS.get(jp));
}
function openDailyMenu(){
  $('daily-list').replaceChildren();
  $('daily-list').append(makeElement('p','muted','하루 새 문장 3개와 복습·비교 2단계. 한 문장에서는 핵심 말 하나와 상황을 먼저 잡아요.'));
  $('daily-list').append(makeElement('p','muted','30일 동안 짧은 기본 문장 90개를 만나요. 긴 공지는 문장 메뉴의 심화·추가에서 선택해서 봐요. 실제 일본어 음성은 아직 제공하지 않아요.'));
  try{
    if(localStorage.getItem('aroha-daily-v1')||localStorage.getItem('concert-japanese-daily-v2'))$('daily-list').append(makeElement('p','muted','쉬운 과정의 완료 기록은 새로 시작해요. 이전 과정의 기록은 이 브라우저에 그대로 보관되어 있어요.'));
  }catch{/* Storage may be unavailable. */}
  const records=dailyRecords();
  for(let day=1;day<=30;day++){
    const lesson=DAILY_LESSONS.find(item=>item.day===day);
    const button=makeElement('button','btn-pixel btn-opt lesson-link',`${day}일차${records.completed.includes(day)?' · 다시 보기':''}`);
    const detail=makeElement('small',null,lesson?`${lesson.title} · 새 문장 3개 + 복습·비교`:'내용 준비 중');
    button.append(detail);button.disabled=!lesson;
    if(lesson)button.onclick=()=>openDaily(day);
    $('daily-list').append(button);
  }
  show('daily-menu');
}
function openDaily(day){
  const lesson=DAILY_LESSONS.find(item=>item.day===day);if(!lesson)return;
  sentenceLevel='basic';
  dailyState={lesson,step:0};renderDaily();show('daily');
}
function moveDaily(delta){
  dailyState.step=Math.max(0,Math.min(6,dailyState.step+delta));renderDaily();
}
function renderDaily(){
  const {lesson,step}=dailyState;
  $('daily-title').textContent=`매일 공부해요 · ${lesson.day}일차`;
  $('daily-body').replaceChildren();$('daily-body').scrollTop=0;
  $('daily-prev').disabled=step===0;$('daily-next').disabled=step===6;
  if(step<5){
    const data=dailySentences(lesson)[step];
    const type=lesson.stepTypes[step];
    const label=type==='new'?`새 문장 ${step+1}/3`:type==='review'?'뜻 떠올리기 · 4/5':'표현 비교 · 5/5';
    $('daily-body').append(makeElement('p','quiz-progress',label));
    $('daily-body').append(makeElement('h2','daily-theme',lesson.title));
    const flow=document.createElement('ol');flow.className='daily-flow';flow.setAttribute('aria-label','오늘의 학습 흐름');
    lesson.flow.forEach((label,index)=>{
      const item=makeElement('li',null,label);
      if(index===step)item.setAttribute('aria-current','step');
      flow.append(item);
    });
    $('daily-body').append(flow);
    const card=makeElement('article','lesson-card');
    const phrase=(container,sentence)=>{
      const jp=makeElement('p','jp');jp.lang='ja';jp.innerHTML=sentence.examples[0][0];container.append(jp);
    };
    if(type==='compare'){
      const left=DAILY_SENTENCE_CARDS.get(lesson.comparison.left),right=DAILY_SENTENCE_CARDS.get(lesson.comparison.right);
      card.append(makeElement('h3',null,'두 표현의 차이를 떠올려 보세요'));
      phrase(card,left);phrase(card,right);
      const answer=makeElement('details');answer.append(makeElement('summary',null,'차이 확인'));
      answer.append(makeElement('p',null,lesson.comparison.explanation));
      for(const sentence of [left,right])answer.append(makeElement('p',null,sentence.examples[0][2]));
      card.append(answer);
    }else{
      card.append(makeElement('p','speaker-label',speakerLabel(data)));
      if(type==='new')appendBasicCue(card,data);
      if(type==='review')card.append(makeElement('p',null,lesson.day===1?'방금 배운 인사예요. 뜻을 먼저 떠올려 보세요.':'전날 배운 말이에요. 뜻을 먼저 떠올려 보세요.'));
      phrase(card,data);
      const answer=type==='review'?makeElement('details'):card;
      if(type==='review')answer.append(makeElement('summary',null,'뜻 확인'));
      answer.append(makeElement('p','reading',data.examples[0][1]),makeElement('p',null,data.examples[0][2]));
      if(type==='review'){appendBasicCue(answer,data);card.append(answer);}
      if(type==='new'&&data.note){const note=makeElement('details');note.append(makeElement('summary',null,'설명 더 보기'),makeElement('p','muted',data.note));card.append(note);}
    }
    $('daily-body').append(card);
  }else if(step===5){
    $('daily-body').append(makeElement('h2',null,'오늘의 핵심 말 · 최대 3개'));
    dailyWords(lesson).forEach(data=>{
      const card=makeElement('article','lesson-card');
      const jp=makeElement('h2','jp');jp.lang='ja';jp.innerHTML=data.examples[0][0];
      card.append(jp,makeElement('p','reading',data.examples[0][1]),makeElement('p',null,data.examples[0][2]));
      appendWordExample(card,data,dailySentences(lesson));
      $('daily-body').append(card);
    });
  }else{
    const card=makeElement('article','lesson-card');
    card.append(makeElement('h2',null,'오늘의 세 문장을 만났어요'));
    card.append(makeElement('p',null,'여기서 마쳐도 좋아요. 더 확인하고 싶다면 오늘 새로 배운 세 문장의 뜻을 골라 보세요.'));
    const finish=makeElement('button','btn-pixel','오늘 공부 마무리');finish.onclick=()=>finishDaily();
    const check=makeElement('button','btn-pixel','오늘 문장 3문제 · 선택');check.onclick=()=>startDailyReview();
    card.append(finish,check);$('daily-body').append(card);
  }
}
function prioritizeReview(cards){
  const mistakes=dailyRecords().mistakes;
  return shuffle(cards).sort((a,b)=>(mistakes[plainJapanese(b.examples[0][0])]||0)-(mistakes[plainJapanese(a.examples[0][0])]||0));
}
function dailyReviewSources(day){
  const lesson=DAILY_LESSONS.find(item=>item.day===day);
  return lesson?prioritizeReview(dailyNewSentences(lesson)):[];
}
function startDailyReview(){
  const day=dailyState.lesson.day,sources=dailyReviewSources(day);
  const questions=sources.map(source=>{
    const question=makeQuizQuestion(source,'sentence',sources);
    question.reviewSentence=source;return question;
  });
  quizState={mode:'review',title:`${day}일차 · 오늘 문장 확인`,questions,index:0,correct:0,answered:false,
    onComplete(){const records=dailyRecords();if(!records.completed.includes(day))records.completed.push(day);saveDailyRecords(records);},
    onAnswer(question,correct){
      const records=dailyRecords(),key=plainJapanese(question.reviewSentence.examples[0][0]);
      records.mistakes[key]=correct?Math.max(0,(records.mistakes[key]||0)-1):(records.mistakes[key]||0)+1;
      saveDailyRecords(records);
    },
    onFinish(state){finishDaily(state.correct);}
  };
  $('check-title').textContent=`${day}일차 · 오늘 문장 확인`;
  $('check-back').textContent='오늘 공부로';$('check-back').onclick=()=>{renderDaily();show('daily');};
  show('check');renderQuizQuestion();
}
function finishDaily(score){
  const day=dailyState.lesson.day,records=dailyRecords();
  if(!records.completed.includes(day))records.completed.push(day);
  saveDailyRecords(records);
  $('daily-body').replaceChildren();
  const card=makeElement('article','lesson-card');card.append(makeElement('h2',null,'오늘도 한 걸음 더 가까워졌어요!'));
  card.append(makeElement('p',null,score===undefined?'새 문장 세 개와 복습·비교를 마쳤어요.':`오늘 문장 3문제 중 ${score}개를 맞혔어요.`));
  const again=makeElement('button','btn-pixel','오늘 문장 다시 보기');again.onclick=()=>openDaily(day);
  const list=makeElement('button','btn-pixel btn-opt','날짜 선택으로');list.onclick=openDailyMenu;
  $('daily-body').append(card,again,list);$('daily-body').scrollTop=0;
  $('daily-prev').disabled=true;$('daily-next').disabled=true;show('daily');
}
