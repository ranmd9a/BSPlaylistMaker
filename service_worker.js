const updateContextMenus = async () => {
	await chrome.contextMenus.removeAll();

	chrome.contextMenus.create({
		id: "create-playlist",
		title: "検索結果から playlist を作成",
		documentUrlPatterns: [
			"https://beatsaver.com/*"
		],
		contexts: ["action"],
	});
};

chrome.runtime.onInstalled.addListener(updateContextMenus);
chrome.runtime.onStartup.addListener(updateContextMenus);
chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (!tab.url.startsWith("https://beatsaver.com/")) {
		console.warn(`not target`);
		return;
	}
	const options = {
		frameId: 0, // メインframeにのみ送信
	};
	switch (info.menuItemId) {
		case 'create-playlist':
			const response = chrome.tabs.sendMessage(tab.id, { id: 'create-playlist' }, options);

			response.then((result) => {
				const downloadCallback = (downloadId) => {
					if (downloadId == null) {
						// downloadId が undefined の場合失敗している。
						// https://developer.chrome.com/docs/extensions/reference/downloads/#method-download
						console.warn(`download failed.`);
						// 続行
					}
					// 使用した OjbectURL を破棄
					chrome.tabs.sendMessage(tab.id, { id: 'revoke-object-url', url: result.url }, options);
				};
				chrome.downloads.download({
					url: result.url,
					filename: result.filename,
				}, downloadCallback);
			}).catch((error) => {
				console.error(error);
			})
			break;
		default:
			break;
	}
	return;
});
