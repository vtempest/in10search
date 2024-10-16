import { searchEngines } from "$lib/config/config";

// Create the context menu
chrome.contextMenus.removeAll(function () {
  chrome.contextMenus.create({
    title: "Search With...",
    id: "searchWithParent",
    contexts: ["selection"],
  });

  for (const [engine, entry] of Object.entries(searchEngines)) {
    chrome.contextMenus.create({
      title: ` ${engine}`,
      parentId: "searchWithParent",
      id: `searchWith${engine}`,
      contexts: ["selection"]
    });
  }

  chrome.contextMenus.create({
    title: "Reading Mode",
    id: "readingMode",
    contexts: [ "page", "frame", "image", "link", "video", "audio"],
  });
});

// Listen for clicks on the context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const { menuItemId, selectionText } = info;

  if (menuItemId.startsWith("searchWith")) {
    const engine = menuItemId.replace("searchWith", "");
    const searchUrl = searchEngines[engine];
    const url = searchUrl + encodeURIComponent(selectionText);

    chrome.tabs.create({
      url,
      active: false
    }, (newTab) => {
      setTimeout(() => {
        chrome.tabs.update(newTab.id, { active: true }, (updatedTab) => {
          if (chrome.runtime.lastError) {
            console.error("Error updating tab:", chrome.runtime.lastError);
          }
        });
      }, 1500);
    });
  } else if (menuItemId === "readingMode") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      let currentTab = tabs[0];
      if (currentTab) {
        chrome.tabs.sendMessage(currentTab.id, {action: "activateReadingMode"});
      }
    });
  }
});
