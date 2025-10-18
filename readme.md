# 워프레임 위키 한국어 변환기

## INFO
워프레임 위키(https://warframe.fandom.com/wiki/) 를 한국어로 전환하는 확장프로그램 코드입니다.

## 녹스기준 공홈 앱 데이터 추출
```bash
C:\Utility\platform-tools\adb.exe connect 127.0.0.1:62001
C:\Utility\platform-tools\adb.exe -s 127.0.0.1:62001 pull /data/data/com.digitalextremes.warframenexus/app_appdata
```

```js
//r&d 필요
`https://origin.warframe.com/origin/PublicExport/index_ko.txt.lzma`
`https://origin.warframe.com/origin/PublicExport/index_en.txt.lzma`
`https://content.warframe.com/PublicExport/Manifest/ExportCustoms_ko.json!00_iJjU8rqcw10eqUVbV-6I8g`

// bash에서 xz 명령어로 lzma 압축 해제
```

## 실행순서
해시/lzma 추출하여 app_appdata 폴더에 넣어둔 후 명령어 실행
`dataparser.bat` 혹은 아래를 순서대로 실행

1. node getOfficialData.js
2. node getAppData.js
3. node getWFCD.js
4. node search.js



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

