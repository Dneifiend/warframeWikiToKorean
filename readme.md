# 워프레임 위키 한국어 변환기

## INFO
워프레임 위키(https://warframe.fandom.com/wiki/) 를 한국어로 전환하는 확장프로그램 코드입니다.


## 실행순서
1. node getData.js
2. node getWFCD.js
3. node search.js

## 각 파일 역할
#### getData.js
앱 데이터 파서. 앱이 요청하는 워프레임 공식 사이트의 브런치를 가져와 사용

#### getWFCD.js
WFCD 한국어 데이터 파싱

#### search.js
위 두 파일로 읽어온 문서를 합친 후 `{영문: 한글}`으로 변경 형식으로 변경

## 폴더 구분
#### export
사용된 데이터 아웃풋

#### ChromeExpansion
크롬 확장프로그램용

