const https = require('https');
const fs = require('fs');
const path = require('path');
const lzma = require('lzma');

let baseUrl = lang => `https://origin.warframe.com/PublicExport/index_${lang}.txt.lzma`;

let koUrl = baseUrl('ko');
let enUrl = baseUrl('en');

// ko 파일을 fetch로 접속하여 동일한 파일명으로 저장한다.
// lzma 압축을 해제한다.

function download(url) {
	return new Promise((resolve, reject) => {
		const filename = path.basename(url);
		const filePath = path.resolve(__dirname, filename);
		const fileStream = fs.createWriteStream(filePath);

		const req = https.get(url, res => {
			if (res.statusCode !== 200) {
				reject(new Error(`Request Failed. Status Code: ${res.statusCode}`));
				res.resume();
				return;
			}
			res.pipe(fileStream);
		});

		req.on('error', err => {
			reject(err);
		});

		fileStream.on('finish', () => {
			fileStream.close(() => resolve(filePath));
		});

		fileStream.on('error', err => {
			fs.unlink(filePath, () => reject(err));
		});
	});
}

async function decompressLzma(inputPath, outputPath) {
	const data = fs.readFileSync(inputPath);
	// lzma.decompress can accept a Buffer/Uint8Array
	await new Promise((resolve, reject) => {
		try {
			lzma.decompress(data, (result, err) => {
				// Some versions: callback(err, result) or callback(result)
				if (err) return reject(err);
				if (!result) return reject(new Error('lzma.decompress returned empty result'));
				try {
					fs.writeFileSync(outputPath, Buffer.from(result));
					console.log('Decompressed using pure lzma package');
					resolve(outputPath);
				} catch (e) {
					reject(e);
				}
			});
		} catch (e) {
			reject(e);
		}
	});
	return outputPath;
}

async function main() {
	try {
		// process both KO and EN
		await processLang('ko');
		await processLang('en');
	} catch (err) {
		console.error('Error during download/decompress:', err);
		process.exitCode = 1;
	}
}

async function processLang(lang){
	const url = baseUrl(lang);
	console.log(`Downloading ${lang} file:`, url);
	const lzmaPath = await download(url);
	console.log('Saved:', lzmaPath);

	const outPath = lzmaPath.replace(/\.lzma$/i, '');
	console.log('Decompressing to:', outPath);
	await decompressLzma(lzmaPath, outPath);
	console.log(`${lang} decompressed file created at:`, outPath);
	// After decompression, parse the index file and fetch each manifest entry
	await processManifestList(outPath);
}

async function processManifestList(indexFilePath){
	const content = fs.readFileSync(indexFilePath, 'utf8');
	const lines = content.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
	console.log(`Found ${lines.length} manifest entries in ${path.basename(indexFilePath)}`);

	// Ensure output directory exists
	const outDir = path.resolve(__dirname, 'app_appdata');
	if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

	for (const line of lines) {
		// Each line looks like: ExportCustoms_ko.json!00_iJjU8rqcw10eqUVbV-6I8g
		// Build URL: https://content.warframe.com/PublicExport/Manifest/<line>
		const manifestUrl = `https://content.warframe.com/PublicExport/Manifest/${line}`;
		const safeName = line.replace(/\.json!.+$/g,'');
		const outPath = path.join(outDir, safeName + '.txt');
		try {
			await fetchAndSave(manifestUrl, outPath);
			console.log('Saved manifest:', outPath);
		} catch (err) {
			console.error('Failed to fetch manifest', manifestUrl, err.message || err);
		}
	}
}

function fetchAndSave(url, outPath){
	return new Promise((resolve, reject)=>{
		const fileStream = fs.createWriteStream(outPath);
		const req = https.get(url, res=>{
			if (res.statusCode !== 200) {
				fileStream.close();
				fs.unlink(outPath, ()=>{});
				return reject(new Error(`Request Failed. Status Code: ${res.statusCode}`));
			}
			res.pipe(fileStream);
		});
		req.on('error', err=>{
			fileStream.close();
			fs.unlink(outPath, ()=>{});
			reject(err);
		});
		fileStream.on('finish', ()=>{
			fileStream.close(resolve);
		});
		fileStream.on('error', err=>{
			fileStream.close();
			fs.unlink(outPath, ()=>{});
			reject(err);
		});
	});
}

if (require.main === module) main();

