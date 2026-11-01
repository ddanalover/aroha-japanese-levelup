"use strict";
const KANJI_CARDS = [
  {
    "section": "한자도 만나봐요",
    "title": "공연을 만나요",
    "text": "한자를 외우기보다, 위에 달린 작은 글씨로 소리를 읽고 뜻과 연결해 봐요.",
    "words": [
      {
        "jp": "<ruby>公演<rt>こうえん</rt></ruby>",
        "meaning": "공연",
        "example": "「<ruby>公演<rt>こうえん</rt></ruby>」는 '공연'이라는 뜻입니다.<br><br><b><ruby>公演<rt>こうえん</rt></ruby>は18<ruby>時<rt>じ</rt></ruby>からです。</b><br>공연은 18시부터입니다."
      },
      {
        "jp": "<ruby>開演<rt>かいえん</rt></ruby>",
        "meaning": "공연 시작",
        "example": "「<ruby>開演<rt>かいえん</rt></ruby>」는 '공연 시작'이라는 뜻입니다.<br><br><b><ruby>開演<rt>かいえん</rt></ruby>は19<ruby>時<rt>じ</rt></ruby>です。</b><br>공연 시작은 19시입니다."
      },
      {
        "jp": "<ruby>終演<rt>しゅうえん</rt></ruby>",
        "meaning": "공연 종료",
        "example": "「<ruby>終演<rt>しゅうえん</rt></ruby>」는 '공연 종료'라는 뜻입니다.<br><br><b><ruby>終演<rt>しゅうえん</rt></ruby>は21<ruby>時<rt>じ</rt></ruby>ごろです。</b><br>공연 종료는 21시쯤입니다."
      }
    ],
    "note": "따나퀴즈의 루비·뜻·예문을 가져온 검토용 단어 카드예요. 예문은 펼쳐서 볼 수 있어요."
  },
  {
    "section": "한자도 만나봐요",
    "title": "함께 즐겨요",
    "text": "한자를 외우기보다, 위에 달린 작은 글씨로 소리를 읽고 뜻과 연결해 봐요.",
    "words": [
      {
        "jp": "<ruby>歌<rt>うた</rt></ruby>う",
        "meaning": "노래하다",
        "example": "「<ruby>歌<rt>うた</rt></ruby>う」는 '노래하다'라는 뜻입니다.<br><br><b>この<ruby>曲<rt>きょく</rt></ruby>を<ruby>歌<rt>うた</rt></ruby>います。</b><br>이 곡을 노래합니다."
      },
      {
        "jp": "<ruby>踊<rt>おど</rt></ruby>る",
        "meaning": "춤추다",
        "example": "「<ruby>踊<rt>おど</rt></ruby>る」는 '춤추다'라는 뜻입니다.<br><br><b>ステージで<ruby>踊<rt>おど</rt></ruby>ります。</b><br>무대에서 춤춥니다."
      },
      {
        "jp": "<ruby>拍手<rt>はくしゅ</rt></ruby>",
        "meaning": "박수",
        "example": "「<ruby>拍手<rt>はくしゅ</rt></ruby>」는 '박수'라는 뜻입니다.<br><br><b><ruby>拍手<rt>はくしゅ</rt></ruby>をお<ruby>願<rt>ねが</rt></ruby>いします。</b><br>박수 부탁드립니다."
      }
    ],
    "note": "따나퀴즈의 루비·뜻·예문을 가져온 검토용 단어 카드예요. 예문은 펼쳐서 볼 수 있어요."
  },
  {
    "section": "한자도 만나봐요",
    "title": "팬의 마음을 전해요",
    "text": "한자를 외우기보다, 위에 달린 작은 글씨로 소리를 읽고 뜻과 연결해 봐요.",
    "words": [
      {
        "jp": "<ruby>応援<rt>おうえん</rt></ruby>",
        "meaning": "응원",
        "example": "「<ruby>応援<rt>おうえん</rt></ruby>」는 '응원'이라는 뜻입니다.<br><br><b>たくさんの<ruby>応援<rt>おうえん</rt></ruby>をありがとうございます。</b><br>많은 응원 감사합니다."
      },
      {
        "jp": "<ruby>笑顔<rt>えがお</rt></ruby>",
        "meaning": "웃는 얼굴",
        "example": "「<ruby>笑顔<rt>えがお</rt></ruby>」는 '웃는 얼굴'이라는 뜻입니다.<br><br><b>みんなの<ruby>笑顔<rt>えがお</rt></ruby>が<ruby>見<rt>み</rt></ruby>えました。</b><br>모두의 웃는 얼굴이 보였습니다."
      },
      {
        "jp": "<ruby>楽<rt>たの</rt></ruby>しい",
        "meaning": "즐겁다",
        "example": "「<ruby>楽<rt>たの</rt></ruby>しい」는 '즐겁다'라는 뜻입니다.<br><br><b>きょうのライブはとても<ruby>楽<rt>たの</rt></ruby>しかったです。</b><br>오늘 라이브는 매우 즐거웠습니다."
      }
    ],
    "note": "따나퀴즈의 루비·뜻·예문을 가져온 검토용 단어 카드예요. 예문은 펼쳐서 볼 수 있어요."
  },
  {
    "section": "한자도 만나봐요",
    "title": "소리와 움직임을 알아봐요",
    "text": "한자를 외우기보다, 위에 달린 작은 글씨로 소리를 읽고 뜻과 연결해 봐요.",
    "words": [
      {
        "jp": "<ruby>聞<rt>き</rt></ruby>こえる",
        "meaning": "들리다",
        "example": "「<ruby>聞<rt>き</rt></ruby>こえる」는 '들리다'라는 뜻입니다.<br><br><b>マイクの<ruby>声<rt>こえ</rt></ruby>がよく<ruby>聞<rt>き</rt></ruby>こえません。</b><br>마이크 소리가 잘 들리지 않습니다."
      },
      {
        "jp": "<ruby>見<rt>み</rt></ruby>える",
        "meaning": "보이다",
        "example": "「<ruby>見<rt>み</rt></ruby>える」는 '보이다'라는 뜻입니다.<br><br><b><ruby>後<rt>うし</rt></ruby>ろの<ruby>席<rt>せき</rt></ruby>からもステージがよく<ruby>見<rt>み</rt></ruby>えます。</b><br>뒤쪽 자리에서도 무대가 잘 보입니다."
      },
      {
        "jp": "<ruby>歌声<rt>うたごえ</rt></ruby>",
        "meaning": "노랫소리",
        "example": "「<ruby>歌声<rt>うたごえ</rt></ruby>」는 '노랫소리'라는 뜻입니다.<br><br><b>きれいな<ruby>歌声<rt>うたごえ</rt></ruby>が<ruby>聞<rt>き</rt></ruby>こえます。</b><br>아름다운 노랫소리가 들립니다."
      }
    ],
    "note": "따나퀴즈의 루비·뜻·예문을 가져온 검토용 단어 카드예요. 예문은 펼쳐서 볼 수 있어요."
  }
];
