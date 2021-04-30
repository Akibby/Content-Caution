const baseURL = "https://content-caution-video-reporting.vercel.app/api";
let text;

// Setup of popup on click
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("submit").addEventListener("click", onSubmit);
  text = document.getElementById("p");
  chrome.storage.local.get(["status"], function (result) {
    console.log(result.status);
    updatePopout(result.status);
  });
});

// Handle user submitting a report
function onSubmit() {
  let reportIndex = parseInt(document.getElementById("report").value, 10);
  let status = "no_info";
  if (reportIndex === 1) {
    updatePopout(status);
    return;
  } else if (reportIndex === 2) {
    status = "no_ep_trigger";
    updatePopout(status);
  } else if (reportIndex === 3) {
    status = "ep_trigger";
    updatePopout(status);
  }
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let url = tabs[0].url;
    getUser(url, status);
    text.innerHTML = "Thank you for your report";
    document.getElementById("submit").disabled = true;
  });
}

// Update elements in the popout
function updatePopout(status) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let url = tabs[0].url;
    validURL = ["www.youtube", "www.youtu.be", "www.y2u.be"];
    if (url.includes(...validURL)) {
      document.getElementById("submit").disabled = false;
      if (status === "no_info") {
        document.MainImg.src = grayImg.src;
        text.innerHTML = "The video is currently Unreported!";
      } else if (status === "ep_trigger") {
        document.MainImg.src = redImg.src;
        text.innerHTML = "The video is reported HARMFUL!";
      } else if (status === "no_ep_trigger") {
        document.MainImg.src = greenImg.src;
        text.innerHTML = "The video is reported SAFE!";
      }
    } else {
      document.getElementById("submit").disabled = true;
      document.MainImg.src = grayImg.src;
      text.innerHTML = "Please try on a YouTube video";
    }
  });
}

// Contacts the server to update the DB
async function submitReport(videoURL, status, user) {
  const address = `${baseURL}/reportvid`;
  const payload = { video: videoURL, status, user };
  try {
    const res = await fetch(address, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then((res) => {
      if (res.ok) {
        console.log(res);
        chrome.runtime.sendMessage({ status });
        chrome.storage.local.set({ status });
      } else {
        text.innerHTML = "Page invalid or user is banned";
        document.getElementById("submit").disabled = true;
        document.MainImg.src = grayImg.src;
        console.log(res.body);
        console.log(res.statusMessage);
        throw new Error("Page invalid or user is banned", error);
      }
    });
  } catch (error) {}
}

function getUser(videoURL, status) {
  chrome.storage.sync.get("userid", function (items) {
    var userid = items.userid;
    if (userid) {
      console.log("Exisiting id is", userid);
      submitReport(videoURL, status, userid);
    } else {
      userid = getRandomToken();
      chrome.storage.sync.set({ userid: userid });
      console.log("New id is ", userid);
      return submitReport(videoURL, status, userid);
    }
  });
}

function getRandomToken() {
  var randomPool = new Uint8Array(32);
  crypto.getRandomValues(randomPool);
  var hex = "";
  for (var i = 0; i < randomPool.length; i++) {
    hex += randomPool[i].toString(16);
  }
  return hex;
}
