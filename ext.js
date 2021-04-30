// import getVideoId to turn youtube URL into ID
import getVideoId from "get-video-id";
import { baseURL } from "./constants";

// Listen for the URL to change and decide if the user is on an eligible page
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.message === "update") {
    const { url } = request;
    const { id } = getVideoId(url);
    if (id) {
      const report = await getReport(url);
      if (Array.isArray(report) && report.length > 0) {
        processData(report);
      } else {
        chrome.runtime.sendMessage({ status: "no_info" });
        chrome.storage.local.set({ status: "no_info" });
      }
    } else {
      chrome.runtime.sendMessage({ status: "no_info" });
      chrome.storage.local.set({ status: "no_info" });
    }
  }
});

// Contact the DB to find if there are any reports about the current video
export async function getReport(videoURL) {
  const address = `${baseURL}/getreports`;
  const payload = { video: videoURL };

  try {
    const res = await fetch(address, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return (await res.json())?.data;
  } catch (error) {
    throw "Issue getting data";
  }
}

// Determine whether or not the video might have harmful content and broadcast the result
export function processData(data) {
  const trig_count = data.filter((text) => text === "ep_trigger").length;
  const no_trig_count = data.filter((text) => text === "no_ep_trigger").length;
  if (trig_count >= no_trig_count) {
    chrome.runtime.sendMessage({ status: "ep_trigger" });
    chrome.storage.local.set({ status: "ep_trigger" });
  } else {
    chrome.runtime.sendMessage({ status: "no_ep_trigger" });
    chrome.storage.local.set({ status: "no_ep_trigger" });
  }
}
