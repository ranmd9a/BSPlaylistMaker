const updateContextMenus = async () => {
	await chrome.contextMenus.removeAll();

	chrome.contextMenus.create({
		id: "create-playlist",
		title: "検索結果から playlist を作成",
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
	switch (info.menuItemId) {
		case 'create-playlist':
			const response = chrome.tabs.sendMessage(tab.id, 'create-playlist')
			response.then((result) => {
				chrome.downloads.download({
					url: result.url,
					// filename: "search_result.bplist",
					filename: result.filename,
				});
			}).catch((error) => {
				console.error(error);
			})
			break;
		default:
			break;
	}
	return;
});
