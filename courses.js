"use strict";
const CONCERT_SCENES = ['만났을 때','함께 즐길 때','곡을 소개할 때','다음 순서로 넘어갈 때','토크할 때','앙코르에서','마지막 인사'];
const WORD_TOPICS = ['기분과 마음','노래와 연습','공연의 흐름','함께하는 말','마음을 전하는 말'];
const LEARNING_CATEGORIES = [
  {id:'greetings',title:'인사·감사·함께하자는 말',goal:'익숙한 문장의 뜻을 바로 떠올리기',subcategories:[{id:'greetings-meet',title:'만남과 인사'},{id:'greetings-thanks',title:'감사'},{id:'greetings-together',title:'함께하자는 말'}]},
  {id:'requests',title:'호응·곡 소개·코너 진행',goal:'관객에게 무엇을 부탁하는지 알기',subcategories:[{id:'requests-cheer',title:'관객 호응'},{id:'requests-song',title:'곡·무대 소개'},{id:'requests-mc',title:'MC 질문·게임 진행'}]},
  {id:'feelings',title:'소감·연습 이야기·팬에게 전하는 마음',goal:'단어가 조금 달라져도 핵심 잡기',subcategories:[{id:'feelings-mood',title:'기분과 소감'},{id:'feelings-practice',title:'연습·운동'},{id:'feelings-fans',title:'팬에게 전하는 마음'}]}
];
function speakerLabel(card){return card.speaker==='mc'?'MC':'아티스트';}
function concertLessons(){
  return CONCERT_SCENES.flatMap(section=>LESSONS.filter(card=>card.section===section));
}
function sentenceCategory(card){
  if(card.learningSubcategory){const category=LEARNING_CATEGORIES.find(category=>category.subcategories.some(sub=>sub.id===card.learningSubcategory));if(category)return category.id;}
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
function sentenceSubcategory(card){
  if(card.learningSubcategory&&LEARNING_CATEGORIES.some(category=>category.subcategories.some(sub=>sub.id===card.learningSubcategory)))return card.learningSubcategory;
  const category=sentenceCategory(card);
  const jp=card.examples[0][0].replace(/<rt>.*?<\/rt>/g,'').replace(/<[^>]*>/g,'');
  if(category==='greetings'){
    if(/ありがとう|感謝/.test(jp))return 'greetings-thanks';
    if(/一緒に|みんなで/.test(jp))return 'greetings-together';
    return 'greetings-meet';
  }
  if(category==='requests'){
    if(card.section==='곡을 소개할 때'||card.section==='앙코르에서')return 'requests-song';
    if(card.section==='함께 즐길 때')return 'requests-cheer';
    return 'requests-mc';
  }
  if(/練習|筋トレ|筋肉|ムキムキ|トレーニング|ランニング|走|運動|鍛|ストレッチ|ジム|体力|体を動|腕|足|汗|休|強く/.test(jp))return 'feelings-practice';
  if(/そば|ずっと|応援|味方|大好き|頑張|おかげ|約束|これからも|また会|笑顔|離れて|忘れない/.test(jp))return 'feelings-fans';
  return 'feelings-mood';
}
function courseInfo(value){
  for(const category of LEARNING_CATEGORIES){
    if(category.title===value)return {category,title:category.title};
    const sub=category.subcategories.find(sub=>sub.id===value);
    if(sub)return {category,sub,title:sub.title};
  }
  return null;
}
function courseCards(value,kind){
  const info=courseInfo(value);if(!info)return null;
  const selected=concertLessons().filter(card=>info.sub?sentenceSubcategory(card)===info.sub.id:sentenceCategory(card)===info.category.id);
  if(kind==='concert')return selected;
  if(kind==='words'){
    const positions=new Map(selected.map((card,index)=>[card.examples[0][0],index]));
    const words=LESSONS.filter(card=>WORD_TOPICS.includes(card.section)&&card.sourceExamples?.some(source=>positions.has(source.jp)));
    const position=card=>Math.min(...card.sourceExamples.filter(source=>positions.has(source.jp)).map(source=>positions.get(source.jp)));
    return words.sort((a,b)=>position(a)-position(b));
  }
  return null;
}
function openSentence(jp){
  const sentence=concertLessons().find(card=>card.examples[0][0]===jp);
  if(!sentence)return;
  group='concert';selectedSection=sentenceSubcategory(sentence);
  stage=letterCards(selectedSection).indexOf(sentence);renderFrame();show('viewer');
}
function exampleText(html){return html.replace(/<rt>.*?<\/rt>/g,'').replace(/<[^>]*>/g,'');}
function wordMatchesSentence(word,raw){
  const patterns={
    'みなさん':/みなさん|皆さん/,'あいさつ':/あいさつ|挨拶/,'一緒に':/一緒/,
    'いる':/(?:^|[にがもはでて])い(?:て|ま|る)/,'会う':/会(?!場)/,
    '知っている':/知って/,'楽しみにする':/楽しみに/,'楽しむ':/楽し(?:ん|みま|む)/,
    '見る':/見(?:て|ま|る|た|ながら)/,'聴く':/聴(?:い|く|き(?!どころ))/,'届く':/届(?:い|く|き)/,
    '答える':/答え(?:て|ま|る|た)/,'答え':/答え(?:を|は|が)/,
    '忘れる':/忘れ(?!物)/,'休む':/休(?:み|ん|む|ま)/,'日':/(?<![今毎昨明本])日(?!本)/,'体':/体(?!力)/,'思い':/思い(?!出)/,'音':/音(?!色|楽|量|響)/
  };
  if(patterns[word])return patterns[word].test(raw);
  if(raw.includes(word))return true;
  if(/[うくぐすつぬぶむるい]$/.test(word))return raw.includes(word.slice(0,-1));
  return false;
}
function wordExample(word,context=[]){
  const candidates=context.length?context:concertLessons();
  const linked=new Set((word.sourceExamples||[]).map(source=>source.jp));
  const exact=candidates.find(sentence=>linked.has(sentence.examples[0][0]));
  if(exact)return exact;
  const key=exampleText(word.examples[0][0]);
  return candidates.find(sentence=>wordMatchesSentence(key,exampleText(sentence.examples[0][0])))||null;
}

function exampleSimilarity(left,right){
  const grams=value=>{const text=exampleText(value),result=new Set();for(let i=0;i<text.length-1;i++)result.add(text.slice(i,i+2));return result;};
  const a=grams(left),b=grams(right);
  const common=[...a].filter(value=>b.has(value)).length;
  return common/Math.max(1,new Set([...a,...b]).size);
}
function wordExamples(word,context=[],limit=2,otherContexts=false){
  const first=wordExample(word,context)||wordExample(word);
  if(!first)return [];
  const key=exampleText(word.examples[0][0]),result=[first];
  const candidates=context.length&&!otherContexts?context:[...new Set([...context,...concertLessons()])];
  const linked=new Set((word.sourceExamples||[]).map(source=>source.jp));
  const suitable=candidates.filter(sentence=>sentence!==first&&(linked.has(sentence.examples[0][0])||wordMatchesSentence(key,exampleText(sentence.examples[0][0]))));
  suitable.sort((a,b)=>exampleSimilarity(first.examples[0][0],a.examples[0][0])-exampleSimilarity(first.examples[0][0],b.examples[0][0]));
  for(const sentence of suitable){
    if(result.length>=limit)break;
    if(result.every(other=>exampleSimilarity(other.examples[0][0],sentence.examples[0][0])<0.72))result.push(sentence);
  }
  return result;
}
