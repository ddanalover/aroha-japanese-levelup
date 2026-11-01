"use strict";
const CONCERT_SCENES = ['만났을 때','함께 즐길 때','곡을 소개할 때','다음 순서로 넘어갈 때','토크할 때','앙코르에서','마지막 인사'];
const WORD_TOPICS = ['기분과 마음','노래와 연습','공연의 흐름','함께하는 말','마음을 전하는 말'];
const CONCERT_COURSES = [
  {title:'한 공연을 처음부터 끝까지', level:1, description:'기본 문장으로 첫인사부터 마지막 인사까지 함께 가요.'},
  {title:'익숙한 말에 조금 더', level:2, description:'같은 공연 흐름을 다시 보며 새 표현을 조금 더 만나요.'},
  {title:'더 다양한 말도 알아들어요', level:3, description:'익숙한 문장에 다른 소개·호응·마음 표현을 더해요.'},
  {title:'모든 표현으로 다시 한 공연', level:4, description:'지금까지의 표현을 공연 순서대로 편하게 반복해요.'}
];
const COURSE_INTRODUCTIONS = [
  [
    "여러분, 안녕하세요!",
    "일본 아로하 여러분을 만날 수 있어서 기뻐요.",
    "오늘 와 주셔서 감사합니다.",
    "여러분, 즐기고 있나요?",
    "준비됐나요?",
    "함께 불러 주세요!",
    "다음 곡을 들어 주세요",
    "다음 코너로 넘어가 볼까요",
    "오늘을 위해 많이 연습했어요.",
    "앙코르 감사합니다!",
    "조금 더 함께 즐겨요!",
    "다음이 마지막 곡이에요",
    "조심히 돌아가세요.",
    "또 만나요!"
  ],
  [
    "오랜만이에요!",
    "계속 보고 싶었어요.",
    "마지막까지 함께 즐겨요!",
    "더 큰 목소리로!",
    "여러분의 목소리를 들려주세요",
    "박수 부탁드립니다",
    "다음은 신곡이에요",
    "한 번 더 부탁해요!",
    "조금 긴장하고 있어요.",
    "항상 응원해 주셔서 감사합니다."
  ],
  [
    "뒤쪽에 계신 여러분도 보여요!",
    "응원봉을 보여주세요",
    "센터도 사이드도 고마워요",
    "이 곡, 알고 있나요?",
    "다음 곡을 들려드리겠습니다",
    "스크린을 봐 주세요",
    "다음 문제 부탁드립니다",
    "여러분의 웃는 얼굴을 보면 힘이 나요.",
    "앙코르 곡을 들려드리겠습니다",
    "앞으로도 계속 노력하겠습니다"
  ]
];
function concertLessons(){
  return CONCERT_SCENES.flatMap(section=>LESSONS.filter(card=>card.section===section));
}
function sentenceLevel(card){
  const index=COURSE_INTRODUCTIONS.findIndex(titles=>titles.includes(card.title));
  return index<0?4:index+1;
}
function wordLevel(card){
  const all=concertLessons();
  const levels=(card.sourceExamples||[]).map(source=>{
    const sentence=all.find(c=>c.examples[0][0]===source.jp);
    return sentence?sentenceLevel(sentence):4;
  });
  return levels.length?Math.min(...levels):4;
}
function courseCards(title,kind){
  const course=CONCERT_COURSES.find(c=>c.title===title);
  if(!course)return null;
  if(kind==='concert')return concertLessons().filter(c=>sentenceLevel(c)<=course.level);
  if(kind==='words'){
    const words=LESSONS.filter(c=>WORD_TOPICS.includes(c.section)&&wordLevel(c)<=course.level);
    // Revisit vocabulary in the order its source sentence is first heard.
    const flow=concertLessons();
    const position=card=>Math.min(...(card.sourceExamples||[]).map(source=>flow.findIndex(c=>c.examples[0][0]===source.jp)).filter(i=>i>=0));
    return words.sort((a,b)=>position(a)-position(b));
  }
  return null;
}
function openSentence(jp){
  const sentence=concertLessons().find(card=>card.examples[0][0]===jp);
  if(!sentence)return;
  group='concert';selectedSection=CONCERT_COURSES[sentenceLevel(sentence)-1].title;
  stage=letterCards(selectedSection).indexOf(sentence);renderFrame();show('viewer');
}
