"use strict";
const GROUPS = {
  letters: {title:'글자 첫걸음', description:'히라가나·가타카나와 기본 발음을 만나는 공간', sections:['일본어 글자와 소리','히라가나','가타카나','작은 글자와 긴 소리','자주 쓰는 단어','한자도 만나봐요']},
  words: {title:'단어로 익혀요', description:'문장과 같은 내용별 분류로 단어·표현을 익혀요.', sections:LEARNING_CATEGORIES.map(category=>category.title)},
  concert: {title:'문장으로 외워요', description:'인사와 감사, 공연 진행, 소감과 마음을 전하는 말로 문장을 모았어요.', sections:LEARNING_CATEGORIES.map(category=>category.title)}
};
let group='letters';
let selectedSection='';
let stage=0;
const $=id=>document.getElementById(id);
function show(id){
  if(typeof hideQuizFeedback==='function')hideQuizFeedback();
  document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('hidden',el.id!==id));
}
function openGroup(key){
  group=key;
  const config=GROUPS[key];
  $('list-title').textContent=config.title;
  $('lesson-list').replaceChildren();
  const intro=document.createElement('p');
  intro.className='muted';intro.textContent=config.description;
  $('lesson-list').append(intro);
  config.sections.forEach((name,i)=>{
    const button=document.createElement('button');
    button.className='btn-pixel btn-opt lesson-link';
    const category=key==='concert'||key==='words'?LEARNING_CATEGORIES.find(category=>category.title===name):null;
    button.textContent=`${String(i+1).padStart(2,'0')} · ${name}`;
    const detail=document.createElement('small');
    const count=letterCards(name).length;
    detail.textContent=category ? `${count}개 ${key==='concert'?'문장':'단어'} · 목표: ${category.goal}` : `${count}개 카드 · 편한 순서로 살펴봐요`;
    button.append(detail);button.onclick=()=>openSection(name);
    $('lesson-list').append(button);
  });
  show('list');
}
function openSection(name){selectedSection=name;stage=0;renderFrame();show('viewer');}
function renderFrame(){
  if(letterCards(selectedSection).length){renderLetters();return;}
  $('lesson-body').scrollTop=0;
  const steps=group==='letters'
    ? ['모양과 소리를 만나요','한 번 더 살펴봐요','짧게 확인해요']
    : ['이런 상황에서 들어요','소리와 뜻을 연결해요','짧게 확인해요'];
  $('viewer-title').textContent=GROUPS[group].title;
  $('lesson-body').replaceChildren();
  const card=document.createElement('article');card.className='lesson-card';
  const count=document.createElement('p');count.className='muted';count.textContent=`${selectedSection} · ${stage+1}/${steps.length}`;
  const title=document.createElement('h2');title.textContent=steps[stage];
  const note=document.createElement('p');note.textContent='여기에 들어갈 학습 내용은 함께 정할 예정이에요.';
  const slots=document.createElement('p');slots.className='muted';
  slots.textContent=group==='letters'
    ? ['글자 · 읽는 법 · 발음 안내','공연·라이브와 연결되는 짧은 예시','이번에 본 글자 확인'][stage]
    : ['상황 설명 · 핵심 표현','일본어 · 읽는 법 · 한국어 뜻 · 듣기 포인트','방금 배운 표현의 뜻 확인'][stage];
  card.append(count,title,note,slots);$('lesson-body').append(card);
  $('prev').disabled=stage===0;$('next').disabled=stage===steps.length-1;
}
function move(delta){
  const count=letterCards(selectedSection).length;
  const last=count?count-1:2;
  stage=Math.max(0,Math.min(last,stage+delta));renderFrame();
}

function letterCards(section){return courseCards(section,group)||[...LESSONS,...KANJI_CARDS].filter(card=>card.section===section);}
function renderLetters(){
  const cards=letterCards(selectedSection), data=cards[stage];
  const category=LEARNING_CATEGORIES.find(category=>category.title===selectedSection);
  $('viewer-title').textContent=category?GROUPS[group].title:selectedSection;
  $('lesson-body').replaceChildren();$('lesson-body').scrollTop=0;
  const card=document.createElement('article');card.className='lesson-card';
  const count=document.createElement('p');count.className='muted';count.textContent=`${category?category.title:'검토용 초안'} · ${stage+1}/${cards.length}`;
  const title=document.createElement('h2');title.textContent=data.title;
  const text=document.createElement('p');text.textContent=data.text;
  card.append(count);
  if(group==='concert')card.append(makeElement('p','speaker-label',speakerLabel(data)));
  card.append(title,text);
  if(data.kana){
    const grid=document.createElement('div');grid.className='kana-grid';
    data.kana.forEach((char,i)=>{
      const cell=document.createElement('div');cell.className='kana-cell';
      const jp=document.createElement('strong');jp.lang='ja';jp.textContent=char;
      const sound=document.createElement('span');sound.textContent=data.sounds[i];
      cell.append(jp,sound);grid.append(cell);
    });card.append(grid);
  }
  if(data.examples){
    const label=document.createElement('p');label.className='label sum';label.textContent=data.kana?'이 글자를 단어에서 만나요':'소리와 뜻을 연결해요';card.append(label);
    data.examples.forEach(([jp,reading,meaning])=>{
      const block=document.createElement('div');block.className='word-example';
      const expression=document.createElement('p');expression.className='jp';expression.lang='ja';expression.innerHTML=jp;
      const pronunciation=document.createElement('p');pronunciation.className='reading';pronunciation.textContent=reading;
      const translation=document.createElement('p');translation.textContent=meaning;
      block.append(expression,pronunciation,translation);card.append(block);
    });
  }
  if(data.words)data.words.forEach(word=>{
    const block=document.createElement('div');block.className='word-example';
    const jp=document.createElement('p');jp.className='jp';jp.lang='ja';jp.innerHTML=word.jp;
    const meaning=document.createElement('p');meaning.textContent=word.meaning;
    const details=document.createElement('details');
    const summary=document.createElement('summary');summary.textContent='예문 펼쳐 보기';
    const example=document.createElement('div');example.className='kanji-example';example.innerHTML=word.example;
    details.append(summary,example);block.append(jp,meaning,details);card.append(block);
  });
  if(data.sourceExamples){
    const details=document.createElement('details');
    const summary=document.createElement('summary');summary.textContent='이 단어가 나온 문장 보기';details.append(summary);
    const matching=category&&group==='words'?new Set(courseCards(category.title,'concert').map(card=>card.examples[0][0])):null;
    const sources=matching?data.sourceExamples.filter(source=>matching.has(source.jp)):data.sourceExamples;
    sources.forEach(source=>{
      const block=document.createElement('div');block.className='word-example';
      const jp=document.createElement('p');jp.className='jp';jp.lang='ja';jp.innerHTML=source.jp;
      const meaning=document.createElement('p');meaning.textContent=source.meaning;
      const button=document.createElement('button');button.className='btn-pixel btn-opt';button.textContent='문장 카드로 이동';
      button.onclick=()=>openSentence(source.jp);
      block.append(jp,meaning,button);details.append(block);
    });card.append(details);
  }
  const note=document.createElement('p');note.className='letter-note';note.textContent=data.note;card.append(note);
  if(data.source){const source=document.createElement('p');source.className='muted';source.textContent=data.source;card.append(source);}
  if((group==='concert'||group==='words')&&stage===cards.length-1){
    const repeat=document.createElement('button');repeat.className='btn-pixel';repeat.textContent='처음부터 다시 보기';
    repeat.onclick=()=>{stage=0;renderFrame();};card.append(repeat);
  }
  $('lesson-body').append(card);
  $('prev').disabled=stage===0;$('next').disabled=stage===cards.length-1;
}
