chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: "www.youtube.com", schemes: ["https"] },
            css: ["video"],
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ]);
  });
});

// Listen for the URL to change
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, {
      message: "update",
      url: changeInfo.url,
    });
  }
});

// Listen for message to change the favicon
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.status == "no_info") {
    chrome.pageAction.setIcon({
      path: "images/YTAlert_gray_48.png",
      tabId: sender.tab.id,
    });
  } else if (message.status == "ep_trigger") {
    chrome.pageAction.setIcon({
      path: "images/YTAlert 48.png",
      tabId: sender.tab.id,
    });
  } else if (message.status == "no_ep_trigger") {
    chrome.pageAction.setIcon({
      path: "images/YTAlert_green_48.png",
      tabId: sender.tab.id,
    });
  }
});
