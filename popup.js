document.getElementById('calculate').addEventListener('click', () => {
    const start = parseInt(document.getElementById('start').value);
    const end = parseInt(document.getElementById('end').value);

    if (isNaN(start) || isNaN(end) || start < 1 || end < 1 || start > end) {
        alert("请输入有效的分集号（起始分集 ≤ 结束分集）");
        return;
    }

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, (tabs) => {
        const activeTab = tabs[0];
        if (!activeTab) {
            alert("无法获取当前标签页，请刷新后重试！");
            return;
        }

        // 先注入内容脚本（如果尚未注入）
        chrome.scripting.executeScript({
            target: {
                tabId: activeTab.id
            },
            files: ["content.js"]
        }, () => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                alert("无法注入内容脚本，请检查页面是否为B站视频合集页面！");
                return;
            }

            // 再发送消息
            chrome.tabs.sendMessage(activeTab.id, {
                action: "calculateDuration",
                start: start,
                end: end
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    alert("通信失败，请检查控制台日志！");
                    return;
                }

                document.getElementById('result').innerHTML =
                    `从P${response.start}到P${response.end}总时长：<br>
                    ${response.hours}小时 ${response.minutes}分 ${response.seconds}秒`;
            });
        });
    });
});