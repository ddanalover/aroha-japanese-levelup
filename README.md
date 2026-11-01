# AROHA Japanese Level Up!

일본어를 처음 접하는 아로하가 공연·라이브에서 아티스트의 말을 이해하도록 돕는 모바일 학습 앱입니다.

## 현재 구성

- 글자 첫걸음: 글자와 소리, 히라가나 46자, 가타카나 46자, 기본 소리 규칙
- 자주 쓰는 단어: 공연·라이브 관련 단어 12개
- 한자도 만나봐요: 따나퀴즈에서 가져온 루비 단어 12개와 펼쳐 보는 예문
- 단어로 배워요: 공연 예문에서 뽑은 단어 26개, 원문 펼치기와 문장 카드 이동
- 문장으로 배워요: 첫인사 → 호응 → 곡 소개 → 코너 전환 → 토크 → 앙코르 → 마지막 인사, 학습용 예문 31개
- 라이브에서 들어요 / 짧게 확인해요: 화면 구조만 준비, 본문은 협의 후 작성

공연 문장은 특정 아티스트의 실제 발언 인용이 아닌 학습용 예문입니다. 단어 카드는 해당 예문에 나온 형태와 기본형을 연결합니다.

기존 따나퀴즈는 수정하지 않았으며, 기존 Git 이력을 복사하지 않았습니다. 학습 내용은 검토용 초안입니다.

## 실행

이 폴더에서 `python3 -m http.server 8001 --bind 127.0.0.1`을 실행합니다. 별도 빌드·패키지·비밀키가 필요하지 않습니다. Google Fonts는 선택 사항이며 기본 폰트로도 동작합니다.

## GitHub Pages 배포

저장소: `ddanalover/aroha-japanese-levelup`

1. 이 폴더의 파일을 저장소 루트에 올립니다. index.html과 app.js는 루트에, lessons.js와 kanji.js는 data 폴더에 있어야 합니다.
2. Settings → Pages → Build and deployment에서 Source를 Deploy from a branch로 설정합니다.
3. Branch는 main, Folder는 /(root)로 설정하고 Save를 누릅니다.
4. Actions의 Pages 배포가 성공하면 Settings → Pages에서 제공하는 주소를 엽니다.

배포 예상 주소: https://ddanalover.github.io/aroha-japanese-levelup/
(배포 성공 전에는 사용할 수 없습니다.)

외부 API, 계정 가입, 사용자 데이터 수집 기능은 없습니다.
