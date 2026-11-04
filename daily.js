"use strict";
let dailyState=null;
const DAILY_STORAGE='concert-japanese-daily-v2';
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
function dailyWords(day){
  return day.words.map(jp=>DAILY_WORD_CARDS.get(jp));
}
function openDailyMenu(){
  $('daily-list').replaceChildren();
  $('daily-list').append(makeElement('p','muted','하루 한 상황, 다섯 문장. 곡 소개·관객 호응·토크·공연 안내를 흐름에 따라 익혀요. 날짜에 맞추지 않아도 언제든 열어 볼 수 있어요.'));
  $('daily-list').append(makeElement('p','muted','30일 동안 필수 150문장을 만나요. 2일차부터 복습 3문제, 7일차부터는 전날 2문제와 더 이전 내용 1문제를 복습해요. 음성 듣기 훈련은 아직 제공하지 않아요.'));
  try{
    if(localStorage.getItem('aroha-daily-v1'))$('daily-list').append(makeElement('p','muted','학습 순서가 바뀌어 새 과정의 완료 기록은 별도로 저장해요. 이전 과정의 기록은 이 브라우저에 그대로 보관되어 있어요.'));
  }catch{/* Storage may be unavailable. */}
  const records=dailyRecords();
  for(let day=1;day<=30;day++){
    const lesson=DAILY_LESSONS.find(item=>item.day===day);
    const button=makeElement('button','btn-pixel btn-opt lesson-link',`${day}일차${records.completed.includes(day)?' · 다시 보기':''}`);
    const detail=makeElement('small',null,lesson?`${lesson.title} · ${day===1?'첫날은 복습 없이 시작해요':'복습 3문제'}`:'내용 준비 중');
    button.append(detail);button.disabled=!lesson;
    if(lesson)button.onclick=()=>openDaily(day);
    $('daily-list').append(button);
  }
  show('daily-menu');
}
function openDaily(day){
  const lesson=DAILY_LESSONS.find(item=>item.day===day);if(!lesson)return;
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
    $('daily-body').append(makeElement('p','quiz-progress',`오늘의 문장 ${step+1}/5`));
    $('daily-body').append(makeElement('h2','daily-theme',lesson.title));
    const flow=document.createElement('ol');flow.className='daily-flow';flow.setAttribute('aria-label','오늘의 학습 흐름');
    lesson.flow.forEach((label,index)=>{
      const item=makeElement('li',null,label);
      if(index===step)item.setAttribute('aria-current','step');
      flow.append(item);
    });
    $('daily-body').append(flow);
    const card=makeElement('article','lesson-card');
    card.append(makeElement('p','speaker-label',speakerLabel(data)));
    const jp=makeElement('h2','jp');jp.lang='ja';jp.innerHTML=data.examples[0][0];
    card.append(jp,makeElement('p','reading',data.examples[0][1]),makeElement('p',null,data.examples[0][2]));
    if(data.text)card.append(makeElement('p','muted',data.text));
    if(data.note)card.append(makeElement('p','muted',data.note));
    $('daily-body').append(card);
  }else if(step===5){
    $('daily-body').append(makeElement('h2',null,'문장 속 단어·표현'));
    dailyWords(lesson).forEach(data=>{
      const card=makeElement('article','lesson-card');
      const jp=makeElement('h2','jp');jp.lang='ja';jp.innerHTML=data.examples[0][0];
      card.append(jp,makeElement('p','reading',data.examples[0][1]),makeElement('p',null,data.examples[0][2]));
      appendWordExample(card,data,dailySentences(lesson));
      $('daily-body').append(card);
    });
  }else{
    const card=makeElement('article','lesson-card');
    card.append(makeElement('h2',null,lesson.day===1?'첫 다섯 문장을 만났어요!':'어제 만난 말을 다시 떠올려요'));
    card.append(makeElement('p',null,lesson.day===1?'첫날은 복습 문제 없이 마무리해요. 다음에는 오늘의 문장이 복습으로 나와요.':lesson.day>=7?'전날 문장 2개와 더 이전 문장 1개를 복습해요.':'전날 문장 중 3개를 복습해요.'));
    const button=makeElement('button','btn-pixel',lesson.day===1?'오늘 공부 마무리':'복습 3문제 시작');
    button.onclick=lesson.day===1?()=>finishDaily():()=>startDailyReview();
    card.append(button);$('daily-body').append(card);
  }
}
function prioritizeReview(cards){
  const mistakes=dailyRecords().mistakes;
  return shuffle(cards).sort((a,b)=>(mistakes[plainJapanese(b.examples[0][0])]||0)-(mistakes[plainJapanese(a.examples[0][0])]||0));
}
function dailyReviewSources(day){
  const previous=DAILY_LESSONS.find(lesson=>lesson.day===day-1);
  if(!previous)return [];
  const recent=prioritizeReview(dailySentences(previous));
  const older=DAILY_LESSONS.filter(lesson=>lesson.day<day-1).flatMap(dailySentences);
  return day>=7&&older.length?[...recent.slice(0,2),prioritizeReview(older)[0]]:recent.slice(0,3);
}
function startDailyReview(){
  const day=dailyState.lesson.day,sources=dailyReviewSources(day);
  const learnedDays=DAILY_LESSONS.filter(lesson=>lesson.day<day);
  const sentencePool=[...new Set(learnedDays.flatMap(dailySentences))];
  const wordPool=[...new Set(learnedDays.flatMap(dailyWords))];
  const questions=sources.map((source,i)=>{
    const sourceJp=plainJapanese(source.examples[0][0]);
    const word=i===0?wordPool.find(card=>sourceJp.includes(plainJapanese(card.examples[0][0]))||card.sourceExamples?.some(example=>plainJapanese(example.jp)===sourceJp)):null;
    const question=makeQuizQuestion(word||source,word?'word':'sentence',word?wordPool:sentencePool);
    question.reviewSentence=source;return question;
  });
  quizState={mode:'review',title:`${day}일차 · 복습`,questions,index:0,correct:0,answered:false,
    onComplete(){const records=dailyRecords();if(!records.completed.includes(day))records.completed.push(day);saveDailyRecords(records);},
    onAnswer(question,correct){
      const records=dailyRecords(),key=plainJapanese(question.reviewSentence.examples[0][0]);
      records.mistakes[key]=correct?Math.max(0,(records.mistakes[key]||0)-1):(records.mistakes[key]||0)+1;
      saveDailyRecords(records);
    },
    onFinish(state){finishDaily(state.correct);}
  };
  $('check-title').textContent=`${day}일차 · 복습`;
  $('check-back').textContent='오늘 공부로';$('check-back').onclick=()=>{renderDaily();show('daily');};
  show('check');renderQuizQuestion();
}
function finishDaily(score){
  const day=dailyState.lesson.day,records=dailyRecords();
  if(!records.completed.includes(day))records.completed.push(day);
  saveDailyRecords(records);
  $('daily-body').replaceChildren();
  const card=makeElement('article','lesson-card');card.append(makeElement('h2',null,'오늘도 한 걸음 더 가까워졌어요!'));
  card.append(makeElement('p',null,score===undefined?'문장 다섯 개를 만나봤어요.':`복습 3문제 중 ${score}개를 맞혔어요.`));
  const again=makeElement('button','btn-pixel','오늘 문장 다시 보기');again.onclick=()=>openDaily(day);
  const list=makeElement('button','btn-pixel btn-opt','날짜 선택으로');list.onclick=openDailyMenu;
  $('daily-body').append(card,again,list);$('daily-body').scrollTop=0;
  $('daily-prev').disabled=true;$('daily-next').disabled=true;show('daily');
}
