const DEBUG = false;

function paddingZero(n) {
	return `0${n}`.slice(-2);
}

function createNowText() {
	const now = new Date();
	let text = `${now.getFullYear()}${paddingZero(now.getMonth() + 1)}`
		+ `${paddingZero(now.getDate())}-${paddingZero(now.getHours())}${paddingZero(now.getMinutes())}`;
	return text;
}

function createPlaylist() {
	const result = [];
	const searchResult = document.body.getElementsByClassName("search-results");
	if (searchResult != null) {
		const beatmaps = searchResult[0].getElementsByClassName("beatmap");
		if (DEBUG) {
			console.log(beatmaps?.length)
		}
		for (const beatmap of beatmaps) {
			const link = beatmap.querySelector("div.body .links a[title='Download zip']");
			if (link?.href == null) {
				continue;
			}
			// ダウンロードURL から hash を取得
			const downloadUrl = new URL(link.href);
			let filename = downloadUrl.pathname;
			const idx = filename.lastIndexOf('/');
			if (idx >= 0) {
				filename = filename.substring(idx + 1);
			}
			if (filename.toUpperCase().endsWith(".ZIP")) {
				filename = filename.substring(0, filename.length - 4);
			}
			result.push(filename);
		}
	}
	const nowText = createNowText();
	const playlist = {
		playlistTitle: `playlist ${nowText}`,
		songs: result.map((hash) => {
			return {
				hash
			};
		}),
	};
	const blob = new Blob([JSON.stringify(playlist)], { type: "application/octet-stream" });
	const url = URL.createObjectURL(blob);
	return {
		url,
		filename: `search_result_${nowText}.bplist`,
		// contents: blob,
	};
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	let result;
	switch (request.id) {
		case 'create-playlist':
			result = createPlaylist();
			sendResponse(result);
			break;
		case 'revoke-object-url':
			// service worker 内では URL.revokeObjectURL() が使用できないのでここで破棄
			try {
				URL.revokeObjectURL(request.url);
				if (DEBUG) {
					console.log(`revoked: ${request.url}`);
				}
			} catch (error) {
				// log only
				console.warn(error);
			}
			sendResponse();
			break;
		default:
			console.warn(`Unknown request`);
			sendResponse();
			break;
	}
	return;
});
