"use strict";
const GROUPS = {
  letters: {title:'글자 첫걸음', description:'히라가나·가타카나와 기본 발음을 만나는 공간', sections:['일본어 글자와 소리','히라가나','가타카나','탁음·반탁음','받침 소리 · っ·ん','조합','장음','한자도 만나봐요']},
  words: {title:'단어로 익혀요', description:'문장과 같은 내용별 분류로 단어·표현을 익혀요.', sections:LEARNING_CATEGORIES.map(category=>category.title)},
  concert: {title:'문장으로 외워요', description:'인사와 감사, 무대 멘트, 소감과 공연 공지를 상황별로 모았어요.', sections:LEARNING_CATEGORIES.map(category=>category.title)}
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
  $('list-back').textContent='홈으로';$('list-back').onclick=()=>show('home');
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
    detail.textContent=category ? `${count}개 ${key==='concert'?'문장':'단어'} · 목표: ${category.goal}` : `${count}개 카드`;
    button.append(detail);button.onclick=()=>category?openCategory(name):openSection(name);
    $('lesson-list').append(button);
  });
  show('list');
}
function openCategory(title){
  const category=LEARNING_CATEGORIES.find(category=>category.title===title);if(!category)return;
  $('list-title').textContent=GROUPS[group].title;
  $('lesson-list').replaceChildren();
  $('lesson-list').append(makeElement('h2',null,category.title),makeElement('p','muted',`목표: ${category.goal}`));
  if(category.id==='announcements')$('lesson-list').append(makeElement('p','muted','학습용 공지 예문입니다. 촬영·휴대전화·응원봉 규칙은 공연마다 달라요. 허용·금지를 구별해 듣고 실제 현장 안내를 따라 주세요.'));
  category.subcategories.forEach((sub,index)=>{
    const button=makeElement('button','btn-pixel btn-opt lesson-link',`${String(index+1).padStart(2,'0')} · ${sub.title}`);
    const count=courseCards(sub.id,group).length;
    button.append(makeElement('small',null,`${count}개 ${group==='concert'?'문장':'단어'}`));
    button.disabled=count===0;button.onclick=()=>openSection(sub.id);$('lesson-list').append(button);
  });
  $('list-back').textContent='큰 분류로';$('list-back').onclick=()=>openGroup(group);show('list');
}
function backToLessonList(){
  const info=courseInfo(selectedSection);
  if(info&&group!=='letters')openCategory(info.category.title);else openGroup(group);
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
  const info=courseInfo(selectedSection),category=info?.category;
  $('viewer-title').textContent=category?GROUPS[group].title:selectedSection;
  $('lesson-body').replaceChildren();$('lesson-body').scrollTop=0;
  const card=document.createElement('article');card.className='lesson-card';
  const count=document.createElement('p');count.className='muted';count.textContent=`${info?info.title:selectedSection} · ${stage+1}/${cards.length}`;
  const title=document.createElement('h2');title.textContent=data.title;
  card.append(count);
  if(group==='concert'&&!DAILY_LESSONS.some(day=>day.sentences.includes(exampleText(data.examples[0][0]))))card.append(makeElement('p','muted','선택 예문 · 30일 필수 과정 외'));
  if(group==='concert')card.append(makeElement('p','speaker-label',speakerLabel(data)));
  card.append(title);
  if(data.text)card.append(makeElement('p',null,data.text));
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
    if(data.kana)card.append(makeElement('p','label sum','단어 예시'));
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
    const context=category&&group==='words'?courseCards(selectedSection,'concert'):[];
    const shown=appendWordExample(card,data,context,true);
    const localExamples=wordExamples(data,context,3);
    const examples=localExamples.length>1?localExamples:wordExamples(data,context,3,true);
    const alternatives=examples.filter(sentence=>sentence!==shown);
    if(alternatives.length){
      const details=document.createElement('details');
      const summary=document.createElement('summary');summary.textContent='다른 상황의 예문 보기';details.append(summary);
      alternatives.forEach(sentence=>appendSentenceExample(details,sentence,true));card.append(details);
    }
  }
  if(data.note)card.append(makeElement('p','letter-note',data.note));
  if((group==='concert'||group==='words')&&stage===cards.length-1){
    const repeat=document.createElement('button');repeat.className='btn-pixel';repeat.textContent='처음부터 다시 보기';
    repeat.onclick=()=>{stage=0;renderFrame();};card.append(repeat);
  }
  $('lesson-body').append(card);
  $('prev').disabled=stage===0;$('next').disabled=stage===cards.length-1;
}

function appendSentenceExample(container,sentence,withLink=false){
  const block=makeElement('div','word-example sentence-example');
  block.dataset.exampleJp=exampleText(sentence.examples[0][0]);
  const label=makeElement('p','label sum','예문');
  if(withLink&&courseInfo(selectedSection)?.sub&&sentenceSubcategory(sentence)!==selectedSection){
    const info=courseInfo(sentenceSubcategory(sentence));block.append(makeElement('p','muted',`다른 분류: ${info.title}`));
  }
  const role=makeElement('p','speaker-label',speakerLabel(sentence));
  const jp=makeElement('p','jp');jp.lang='ja';jp.innerHTML=sentence.examples[0][0];
  block.append(label,role,jp,makeElement('p','reading',sentence.examples[0][1]),makeElement('p',null,sentence.examples[0][2]));
  if(withLink){
    const button=makeElement('button','btn-pixel btn-opt','문장 카드로 이동');
    button.onclick=()=>openSentence(sentence.examples[0][0]);block.append(button);
  }
  container.append(block);
}
function appendWordExample(container,word,context=[],withLink=false){
  const examples=wordExamples(word,context,withLink?1:2,!withLink);
  if(examples[0])appendSentenceExample(container,examples[0],withLink);
  if(examples.length>1){
    const details=makeElement('details','extra-examples');details.append(makeElement('summary',null,'다른 상황의 예문도 보기'));
    examples.slice(1).forEach(sentence=>appendSentenceExample(details,sentence));container.append(details);
  }
  return examples[0]||null;
}
