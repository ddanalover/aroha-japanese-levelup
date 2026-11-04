"use strict";
let quizState = null;
const QUIZ_TITLES = {word:'알맞은 단어를 골라요',sentence:'알맞은 문장을 골라요'};
function makeElement(tag, className, text){
  const element=document.createElement(tag);
  if(className)element.className=className;
  if(text!==undefined)element.textContent=text;
  return element;
}
function shuffle(items){
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
function plainJapanese(html){
  const template=document.createElement('template');template.innerHTML=html;
  template.content.querySelectorAll('rt').forEach(rt=>rt.remove());
  return template.content.textContent;
}
function kanaReading(html){
  const template=document.createElement('template');template.innerHTML=html;
  template.content.querySelectorAll('ruby').forEach(ruby=>{
    const reading=[...ruby.querySelectorAll('rt')].map(rt=>rt.textContent).join('');
    if(reading)ruby.replaceWith(document.createTextNode(reading));
  });
  return template.content.textContent;
}
function startCheck(){
  quizState=null;
  $('check-title').textContent='퀴즈로 확인해요';
  $('check-body').replaceChildren();
  $('check-body').append(makeElement('p','muted','한 번에 5문제씩, 배운 내용을 가볍게 확인해요.'));
  for(const mode of ['word','sentence']){
    const button=makeElement('button','btn-pixel',QUIZ_TITLES[mode]);
    button.onclick=()=>startQuizMode(mode);$('check-body').append(button);
  }
  $('check-body').append(makeElement('p','muted','일본어와 한글 읽는 법을 보고, 한국어 뜻을 골라요.'));
  $('check-back').textContent='홈으로';$('check-back').onclick=()=>show('home');
  show('check');
}
function quizPool(mode){
  const sections=mode==='word'?WORD_TOPICS:CONCERT_SCENES;
  const pool=LESSONS.filter(card=>sections.includes(card.section)&&card.examples?.length);
  // Identical phrases must not become competing answers.
  return pool.filter((card,i)=>pool.findIndex(other=>plainJapanese(other.examples[0][0])===plainJapanese(card.examples[0][0]))===i);
}
function makeQuizQuestion(card,mode,pool){
  const jp=plainJapanese(card.examples[0][0]);
  const meaning=QUIZ_DISTRACTORS[mode][jp];
  if(!meaning||meaning===card.examples[0][2])throw new Error('이 문항의 한국어 보기를 확인해 주세요: '+jp);
  const distractor={examples:[['','',meaning]]};
  return {card,mode,choices:shuffle([card,distractor])};
}
function startQuizMode(mode){
  const pool=quizPool(mode);
  const questions=shuffle(pool).slice(0,5).map(card=>makeQuizQuestion(card,mode,pool));
  quizState={mode,questions,index:0,correct:0,answered:false};
  $('check-title').textContent=QUIZ_TITLES[mode];
  $('check-back').textContent='문제 선택으로';$('check-back').onclick=startCheck;
  show('check');renderQuizQuestion();
}
let quizFeedbackAction=null;
let quizFeedbackFocus=null;
function hideQuizFeedback(){
  const overlay=$('feedback-overlay');
  if(overlay)overlay.classList.remove('show');
  document.querySelectorAll('#app > .screen').forEach(screen=>screen.inert=false);
  quizFeedbackAction=null;
}
function openQuizFeedback(card,title,action,context=[]){
  quizFeedbackFocus=document.activeElement;
  $('f-title').textContent=title;
  $('f-exp').replaceChildren();
  const jp=makeElement('p','jp');jp.lang='ja';jp.innerHTML=card.examples[0][0];
  if(CONCERT_SCENES.includes(card.section))$('f-exp').append(makeElement('p','speaker-label',speakerLabel(card)));
  $('f-exp').append(makeElement('strong',null,`정답: ${card.examples[0][2]}`),jp,makeElement('p','reading',card.examples[0][1]));
  if(card.note)$('f-exp').append(makeElement('p',null,card.note));
  if(card.sourceExamples)appendWordExample($('f-exp'),card,context);
  document.querySelector('.f-scroll').scrollTop=0;
  quizFeedbackAction=action;
  document.querySelectorAll('#app > .screen').forEach(screen=>screen.inert=true);
  $('feedback-overlay').classList.add('show');$('feedback-continue').focus();
}
function continueQuizFeedback(){
  const action=quizFeedbackAction,focus=quizFeedbackFocus;
  hideQuizFeedback();
  if(action)action();else if(focus?.isConnected&&!focus.disabled)focus.focus();
}
function renderQuizQuestion(){
  const state=quizState,question=state.questions[state.index],example=question.card.examples[0];
  state.answered=false;state.results=state.results||[];
  show('screen-quiz');
  $('quiz-header').textContent=state.title||QUIZ_TITLES[state.mode];
  $('q-label').textContent=`STEP ${String(state.index+1).padStart(2,'0')}`;
  $('progress-fill').style.width=`${state.index/state.questions.length*100}%`;
  $('q-text').replaceChildren();
  const jp=makeElement('div','jp');jp.lang='ja';jp.innerHTML=example[0];
  if((question.mode||state.mode)==='sentence')$('q-text').append(makeElement('p','speaker-label',speakerLabel(question.card)));
  $('q-text').append(jp);
  if((question.mode||state.mode)==='word'&&!example[0].includes('<ruby>')){
    const kana=makeElement('p','quiz-kana',kanaReading(example[0]));kana.lang='ja';
    if(kana.textContent!==plainJapanese(example[0]))$('q-text').append(kana);
  }
  $('q-text').append(makeElement('p','quiz-reading',example[1]),makeElement('p','quiz-prompt','한국어 뜻을 고르세요.'));
  question.choices.forEach((option,i)=>{
    const button=$(`opt${i}`);button.disabled=false;
    button.textContent=`${i===0?'A':'B'}. ${option.examples[0][2]}`;
    button.onclick=()=>answerQuiz(option);
  });
  document.querySelector('#screen-quiz .content').scrollTop=0;
}
function answerQuiz(selected){
  const state=quizState;if(state.answered)return;state.answered=true;
  const question=state.questions[state.index],card=question.card,isCorrect=selected===card;
  if(isCorrect)state.correct++;
  state.results.push({question,isCorrect});
  if(state.onAnswer)state.onAnswer(question,isCorrect);
  $('opt0').disabled=true;$('opt1').disabled=true;
  playSnd(isCorrect?'c':'w');
  openQuizFeedback(card,isCorrect?'🌟 정답입니다!':'☁️ 아쉬워요!',()=>{
    state.index++;
    if(state.index<state.questions.length)renderQuizQuestion();else renderQuizResult();
  },question.reviewSentence?[question.reviewSentence]:[]);
}
function renderQuizResult(){
  const state=quizState;
  show('screen-result');
  if(state.onComplete)state.onComplete(state);
  $('res-c').textContent=state.correct;$('res-total').textContent=state.questions.length;
  $('review-list').replaceChildren();
  state.results.forEach((result,i)=>{
    const card=result.question.card;
    const button=makeElement('button','review-item');
    const jp=makeElement('strong');jp.lang='ja';jp.innerHTML=`${i+1}. ${card.examples[0][0]}`;
    const reading=makeElement('div','reading',card.examples[0][1]);
    const answer=makeElement('div',null,`정답: ${card.examples[0][2]}`);answer.style.color=result.isCorrect?'var(--primary)':'#E74C3C';
    if(CONCERT_SCENES.includes(card.section))button.append(makeElement('div','speaker-label',speakerLabel(card)));
    button.append(jp,reading,answer);
    button.onclick=()=>openQuizFeedback(card,result.isCorrect?'🌟 해설 복습':'☁️ 해설 복습',null,result.question.reviewSentence?[result.question.reviewSentence]:[]);
    $('review-list').append(button);
  });
  $('review-list').scrollTop=0;
  $('quiz-continue').textContent=state.onFinish?'오늘 공부로':'계속 풀기';
  $('quiz-continue').onclick=()=>state.onFinish?state.onFinish(state):startQuizMode(state.mode);
}
function retryQuiz(){
  const state=quizState;
  state.index=0;state.correct=0;state.answered=false;state.results=[];
  renderQuizQuestion();
}
function leaveQuiz(){
  const state=quizState;
  if(state?.mode==='review'){
    if(state.index===state.questions.length)state.onFinish(state);
    else{renderDaily();show('daily');}
  }else startCheck();
}
