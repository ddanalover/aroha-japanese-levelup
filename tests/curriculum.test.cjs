const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({});
for (const file of ['data/lessons.js', 'data/days.js', 'data/quiz-options.js', 'courses.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
}
const data = vm.runInContext('({lessons:LESSONS, days:DAILY_LESSONS, quiz:QUIZ_DISTRACTORS, scenes:CONCERT_SCENES, topics:WORD_TOPICS})', context);
const plain = html => html.replace(/<rt>.*?<\/rt>/g, '').replace(/<[^>]*>/g, '');
const sentences = data.lessons.filter(card => data.scenes.includes(card.section));
const words = data.lessons.filter(card => data.topics.includes(card.section));
const sentenceMap = new Map(sentences.map(card => [plain(card.examples[0][0]), card]));
const wordMap = new Map(words.map(card => [plain(card.examples[0][0]), card]));

test('30 days contain 150 distinct, resolvable sentences with five flow steps', () => {
  assert.equal(data.days.length, 30);
  const selected = [];
  data.days.forEach((day, index) => {
    assert.equal(day.day, index + 1);
    assert.ok(day.title);
    assert.equal(day.flow.length, 5);
    assert.ok(day.flow.every(Boolean));
    assert.equal(day.sentences.length, 5);
    for (const jp of day.sentences) {
      assert.ok(sentenceMap.has(jp), `Missing sentence on day ${day.day}: ${jp}`);
      selected.push(jp);
    }
  });
  assert.equal(new Set(selected).size, 150);
});

test('each daily word has an authored example within that day', () => {
  for (const day of data.days) {
    assert.ok(day.words.length > 0);
    assert.equal(new Set(day.words).size, day.words.length);
    for (const jp of day.words) {
      const word = wordMap.get(jp);
      assert.ok(word, `Missing word on day ${day.day}: ${jp}`);
      assert.ok(word.sourceExamples?.some(source => day.sentences.includes(plain(source.jp))),
        `No example from day ${day.day} for ${jp}`);
    }
  }
});

test('all sentence and word quizzes have a distinct Korean alternative', () => {
  for (const [mode, cards] of [['sentence', sentences], ['word', words]]) {
    for (const card of cards) {
      const [jp, reading, meaning] = card.examples[0];
      assert.ok(reading && meaning, `Incomplete card: ${jp}`);
      const alternative = data.quiz[mode][plain(jp)];
      assert.ok(alternative, `Missing ${mode} quiz: ${plain(jp)}`);
      assert.notEqual(alternative, meaning);
    }
  }
});

test('core includes song introduction and contrasting permissions, not seasonal specialist talk', () => {
  const core = data.days.flatMap(day => day.sentences);
  for (const jp of ['新曲を紹介します。', 'ここからは撮影してもいいですよ。', '動画の撮影は禁止です。', 'フラッシュは使わないでください。', '順番にご退場ください。']) {
    assert.ok(core.includes(jp), `Missing core use case: ${jp}`);
  }
  assert.ok(core.every(jp => !/北海道|筋トレ|ムキムキ|ギター|来年|温泉/.test(jp)));
  const greetings = core.filter(jp => ['만났을 때', '마지막 인사'].includes(sentenceMap.get(jp).section));
  assert.ok(greetings.length <= 30, 'Greetings and endings should not dominate the core');
  assert.ok(sentenceMap.has('北海道に行ってみたいです。'), 'Optional examples must remain available');
});

test('announcements have their own speaker and category, with opening distinct from admission', () => {
  const notices = sentences.filter(card => card.speaker === 'announcement');
  assert.equal(notices.length, 32);
  for (const card of notices) {
    context.notice = card;
    assert.equal(vm.runInContext('speakerLabel(notice)', context), '공연 공지');
    assert.equal(vm.runInContext('sentenceCategory(notice)', context), 'announcements');
    assert.ok(vm.runInContext('courseInfo(sentenceSubcategory(notice))', context));
  }
  assert.equal(sentenceMap.get('動画の撮影は禁止です。').speaker, 'announcement');
  assert.equal(sentenceMap.get('まもなく開演します。').examples[0][2], '곧 공연을 시작합니다.');
  assert.equal(sentenceMap.get('まもなく開場します。').examples[0][2], '곧 입장을 시작합니다.');
  assert.ok(data.days[19].sentences.includes('まもなく開演します。'));
  assert.ok(data.days[19].sentences.every(jp => !jp.includes('再開')));
  for (const card of words) {
    for (const source of card.sourceExamples || []) {
      if (data.days[19].sentences.includes(plain(source.jp))) {
        context.wordKey = plain(card.examples[0][0]);
        context.sourceText = plain(source.jp);
        assert.ok(vm.runInContext('wordMatchesSentence(wordKey, sourceText)', context), `Unrelated opening example for ${context.wordKey}`);
      }
    }
  }
});
