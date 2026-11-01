"use strict";
const CONCERT_SCENES = ['만났을 때','함께 즐길 때','곡을 소개할 때','다음 순서로 넘어갈 때','토크할 때','앙코르에서','마지막 인사'];
const WORD_TOPICS = ['기분과 마음','노래와 연습','공연의 흐름','함께하는 말','마음을 전하는 말'];
const LEARNING_CATEGORIES = [
  {id:'greetings',title:'인사·감사·함께하자는 말',goal:'익숙한 문장의 뜻을 바로 떠올리기'},
  {id:'requests',title:'호응·곡 소개·코너 진행',goal:'관객에게 무엇을 부탁하는지 알기'},
  {id:'feelings',title:'소감·연습 이야기·팬에게 전하는 마음',goal:'단어가 조금 달라져도 핵심 잡기'}
];
function speakerLabel(card){return card.speaker==='mc'?'MC':'아티스트';}
function concertLessons(){
  return CONCERT_SCENES.flatMap(section=>LESSONS.filter(card=>card.section===section));
}
function sentenceCategory(card){
  const jp=card.examples[0][0].replace(/<rt>.*?<\/rt>/g,'').replace(/<[^>]*>/g,'');
  if(/ありがとう|感謝/.test(jp))return 'greetings';
  if(card.section==='만났을 때')return 'greetings';
  if(/一緒に(?:楽|歌|踊)|みんなで歌|一緒にいて/.test(jp))return 'greetings';
  if(card.speaker==='mc'){
    return /最近|トレーニング|気分|感想|メッセージ|どのくらい|また日本|会える日/.test(jp)?'feelings':'requests';
  }
  if(card.section==='토크할 때'||/楽しい時間|元気をもら/.test(jp))return 'feelings';
  if(card.section==='마지막 인사'){
    return /帰|気をつけ|また会いましょう|また会いに来/.test(jp)?'greetings':'feelings';
  }
  return 'requests';
}
function courseCards(title,kind){
  const category=LEARNING_CATEGORIES.find(category=>category.title===title);
  if(!category)return null;
  const sentences=concertLessons();
  const selected=sentences.filter(card=>sentenceCategory(card)===category.id);
  if(kind==='concert')return selected;
  if(kind==='words'){
    const positions=new Map(selected.map((card,index)=>[card.examples[0][0],index]));
    const words=LESSONS.filter(card=>WORD_TOPICS.includes(card.section)&&card.sourceExamples?.some(source=>positions.has(source.jp)));
    // A shared word may appear in several categories, each linked to a relevant sentence.
    const position=card=>Math.min(...card.sourceExamples.filter(source=>positions.has(source.jp)).map(source=>positions.get(source.jp)));
    return words.sort((a,b)=>position(a)-position(b));
  }
  return null;
}
function openSentence(jp){
  const sentence=concertLessons().find(card=>card.examples[0][0]===jp);
  if(!sentence)return;
  group='concert';selectedSection=LEARNING_CATEGORIES.find(category=>category.id===sentenceCategory(sentence)).title;
  stage=letterCards(selectedSection).indexOf(sentence);renderFrame();show('viewer');
}
