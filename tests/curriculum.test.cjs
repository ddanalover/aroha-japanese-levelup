const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = vm.createContext({});
for (const file of ['data/lessons.js','data/days.js','data/quiz-options.js','courses.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
}
const data = vm.runInContext('({lessons:LESSONS,days:DAILY_LESSONS,quiz:QUIZ_DISTRACTORS,scenes:CONCERT_SCENES,topics:WORD_TOPICS})',context);
const plain = html => html.replace(/<rt>.*?<\/rt>/g,'').replace(/<[^>]*>/g,'');
const sentences = data.lessons.filter(card=>data.scenes.includes(card.section));
const words = data.lessons.filter(card=>data.topics.includes(card.section));
const sentenceMap = new Map(sentences.map(card=>[plain(card.examples[0][0]),card]));
const wordMap = new Map(words.map(card=>[plain(card.examples[0][0]),card]));
const core = data.days.flatMap(day=>day.sentences.slice(0,3));

test('30 days teach 90 distinct short sentences and never introduce new text in review/comparison',()=>{
  assert.equal(data.days.length,30);
  const learned = new Set();
  data.days.forEach((day,index)=>{
    assert.equal(day.day,index+1);
    assert.equal(day.sentences.length,5);
    assert.equal(day.flow.length,5);
    assert.deepEqual(Array.from(day.stepTypes),['new','new','new','review','compare']);
    for(const jp of day.sentences.slice(0,3)){
      assert.ok(!learned.has(jp),`Repeated new sentence: ${jp}`);
      const card=sentenceMap.get(jp);assert.ok(card,`Missing ${jp}`);
      assert.equal(card.level,'basic');
      assert.ok(jp.length<=20,`Long beginner sentence: ${jp}`);
      assert.ok(card.basicCue?.heard&&card.basicCue?.action);
      assert.ok(jp.includes(card.basicCue.heard),`Cue not heard in sentence: ${jp}`);
      learned.add(jp);
    }
    for(const jp of [day.sentences[3],day.sentences[4],day.comparison.left,day.comparison.right])assert.ok(learned.has(jp),`Unintroduced review: ${jp}`);
    assert.equal(day.sentences[3],index?data.days[index-1].sentences[0]:day.sentences[0]);
    assert.ok(day.comparison.left!==day.comparison.right);
    assert.ok(day.comparison.explanation);
  });
  assert.equal(new Set(core).size,90);
});

test('each day targets at most three words with examples in its new sentences',()=>{
  for(const day of data.days){
    assert.ok(day.words.length>=1&&day.words.length<=3);
    assert.equal(new Set(day.words).size,day.words.length);
    for(const jp of day.words){
      const word=wordMap.get(jp);assert.ok(word,`Missing ${jp}`);
      assert.equal(word.level,'basic');
      assert.ok(word.sourceExamples.some(source=>day.sentences.slice(0,3).includes(plain(source.jp))),`No new-day example for ${jp}`);
    }
  }
});

test('all basic and advanced quizzes retain distinct Korean alternatives',()=>{
  for(const [mode,cards] of [['sentence',sentences],['word',words]])for(const card of cards){
    const [jp,reading,meaning]=card.examples[0];
    assert.ok(reading&&meaning);
    assert.ok(['basic','advanced'].includes(card.level));
    assert.ok(data.quiz[mode][plain(jp)],`Missing quiz: ${plain(jp)}`);
    assert.notEqual(data.quiz[mode][plain(jp)],meaning);
  }
});

test('long announcements are advanced while essential opening and permission cues remain basic',()=>{
  for(const jp of ['新曲を紹介します。','撮影してもいいですよ。','撮影は禁止です。','動画の撮影は禁止です。','まもなく開場します。','まもなく開演します。'])assert.ok(core.includes(jp));
  const notices=sentences.filter(card=>card.speaker==='announcement');
  assert.equal(notices.length,36);
  for(const card of notices){context.notice=card;assert.equal(vm.runInContext('speakerLabel(notice)',context),'공연 공지');assert.equal(vm.runInContext('sentenceCategory(notice)',context),'announcements');}
  for(const jp of ['係員がお呼びするまで、お席でお待ちください。','気分が悪くなった方は係員にお知らせください。'])assert.equal(sentenceMap.get(jp).level,'advanced');
  assert.ok(core.every(jp=>!/北海道|筋トレ|ムキムキ|ギター|温泉/.test(jp)));
  assert.ok(sentenceMap.has('北海道に行ってみたいです。'));
});

test('basic library exposes only basic sentences; advanced remains separately reachable',()=>{
  const results={};
  for(const level of ['basic','advanced']){
    vm.runInContext(`sentenceLevel=${JSON.stringify(level)}`,context);
    const selected=vm.runInContext("LEARNING_CATEGORIES.flatMap(category=>courseCards(category.title,'concert'))",context);
    assert.ok(selected.length);
    assert.ok(selected.every(card=>card.level===level));
    results[level]=new Set(selected.map(card=>plain(card.examples[0][0])));
  }
  assert.equal(results.basic.size,90);
  assert.ok(results.advanced.has('係員がお呼びするまで、お席でお待ちください。'));
  assert.ok([...results.basic].every(jp=>!results.advanced.has(jp)));
});

context.plainJapanese=plain;
context.shuffle=items=>Array.from(items);
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','daily.js'),'utf8'),context);
test('optional daily check covers all three current new sentences, including day one and day thirty',()=>{
  for(const day of data.days){
    const selected=vm.runInContext(`dailyReviewSources(${day.day})`,context);
    assert.equal(selected.length,3);
    assert.deepEqual(selected.map(card=>plain(card.examples[0][0])).sort(),Array.from(day.sentences.slice(0,3)).sort());
  }
});
