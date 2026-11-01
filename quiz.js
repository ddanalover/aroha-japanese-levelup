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
  $('check-title').textContent='짧게 확인해요';
  $('check-body').replaceChildren();
  $('check-body').append(makeElement('p','muted','한 번에 5문제씩, 배운 내용을 가볍게 확인해요.'));
  for(const mode of ['word','sentence']){
    const button=makeElement('button','btn-pixel',QUIZ_TITLES[mode]);
    button.onclick=()=>startQuizMode(mode);$('check-body').append(button);
  }
  $('check-body').append(makeElement('p','muted','단어: 일본어를 보고 뜻 고르기 / 문장: 한국어 뜻에 맞는 일본어 문장 고르기'));
  $('check-back').textContent='홈으로';$('check-back').onclick=()=>show('home');
  show('check');
}
function quizPool(mode){
  const sections=mode==='word'?WORD_TOPICS:CONCERT_SCENES;
  const pool=LESSONS.filter(card=>sections.includes(card.section)&&card.examples?.length);
  // Identical phrases must not become competing answers.
  return pool.filter((card,i)=>pool.findIndex(other=>plainJapanese(other.examples[0][0])===plainJapanese(card.examples[0][0]))===i);
}
function startQuizMode(mode){
  const pool=quizPool(mode);
  const questions=shuffle(pool).slice(0,5).map(card=>{
    const jp=plainJapanese(card.examples[0][0]);
    const candidates=pool.filter(other=>other!==card&&plainJapanese(other.examples[0][0])!==jp&&other.examples[0][2]!==card.examples[0][2]);
    // Keep the user's first example's contrast precise.
    const preferred=mode==='word'&&jp==='嬉しい'?candidates.find(other=>plainJapanese(other.examples[0][0])==='悲しい'):null;
    const distractor=preferred||shuffle(candidates)[0];
    return {card,choices:shuffle([card,distractor])};
  });
  quizState={mode,questions,index:0,correct:0,answered:false};
  $('check-title').textContent=QUIZ_TITLES[mode];
  $('check-back').textContent='문제 선택으로';$('check-back').onclick=startCheck;
  show('check');renderQuizQuestion();
}
function renderQuizQuestion(){
  const state=quizState,question=state.questions[state.index],example=question.card.examples[0];
  state.answered=false;$('check-body').replaceChildren();$('check-body').scrollTop=0;
  $('check-body').append(makeElement('p','quiz-progress',`${state.index+1}/${state.questions.length}`));
  const card=makeElement('article','lesson-card');
  if(state.mode==='word'){
    card.append(makeElement('p','quiz-reading',example[1]));
    const jp=makeElement('h2','jp',plainJapanese(example[0]));jp.lang='ja';
    const kana=makeElement('p','quiz-kana',kanaReading(example[0]));kana.lang='ja';
    card.append(jp,kana,makeElement('p',null,'의 뜻을 고르세요.'));
  }else{
    card.append(makeElement('p','muted','이 뜻에 맞는 문장을 고르세요.'),makeElement('h2',null,example[2]));
  }
  $('check-body').append(card);
  const choices=makeElement('div','quiz-options');
  question.choices.forEach(option=>{
    const button=makeElement('button','btn-pixel btn-opt');
    if(state.mode==='word')button.textContent=option.examples[0][2];
    else{
      const jp=makeElement('span','jp');jp.lang='ja';jp.innerHTML=option.examples[0][0];button.append(jp);
    }
    button.onclick=()=>answerQuiz(option,choices);choices.append(button);
  });
  $('check-body').append(choices);
}
function answerQuiz(selected,choices){
  const state=quizState;if(state.answered)return;state.answered=true;
  const card=state.questions[state.index].card,isCorrect=selected===card;
  if(isCorrect)state.correct++;
  choices.querySelectorAll('button').forEach(button=>button.disabled=true);
  const feedback=makeElement('div','lesson-card quiz-feedback');feedback.setAttribute('role','status');
  feedback.append(makeElement('strong',null,isCorrect?'🌟 정답이에요!':'다시 기억해 봐요.'));
  const jp=makeElement('p','jp');jp.lang='ja';jp.innerHTML=card.examples[0][0];
  feedback.append(jp,makeElement('p',null,card.examples[0][1]),makeElement('p',null,card.examples[0][2]));
  const next=makeElement('button','btn-pixel',state.index===state.questions.length-1?'결과 보기':'다음 문제');
  next.onclick=()=>{state.index++;if(state.index<state.questions.length)renderQuizQuestion();else renderQuizResult();};
  $('check-body').append(feedback,next);
  feedback.scrollIntoView({block:'nearest'});
}
function renderQuizResult(){
  const state=quizState;$('check-body').replaceChildren();$('check-body').scrollTop=0;
  const card=makeElement('article','lesson-card');card.append(makeElement('h2',null,'오늘의 짧은 확인 완료!'),makeElement('p',null,`${state.questions.length}문제 중 ${state.correct}개를 맞혔어요.`));
  const retry=makeElement('button','btn-pixel','다시 풀기');retry.onclick=()=>startQuizMode(state.mode);
  const choose=makeElement('button','btn-pixel btn-opt','다른 문제 선택');choose.onclick=startCheck;
  $('check-body').append(card,retry,choose);
}
