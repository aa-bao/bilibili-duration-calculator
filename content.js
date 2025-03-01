// 监听来自 popup.js 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "calculateDuration") {
        try {
            const result = calculateTime(request.start, request.end);
            sendResponse(result);
        } catch (error) {
            sendResponse({
                error: error.message
            });
        }
        return true; // 保持消息通道打开
    }
});

function calculateTime(start, end) {
    const lis = document.querySelectorAll('.stat-item.duration');
    if (lis.length === 0) {
        throw new Error("未找到视频时长信息，请确保页面已完全加载！");
    }

    let time_h = 0,
        time_m = 0,
        time_s = 0;

    lis.forEach((item, index) => {
        if (index >= start - 1 && index <= end - 1) {
            const time = item.innerText.trim();
            const timeArr = time.split(':');

            if (timeArr.length === 3) {
                time_h += Number(timeArr[0]);
                time_m += Number(timeArr[1]);
                time_s += Number(timeArr[2]);
            } else if (timeArr.length === 2) {
                time_m += Number(timeArr[0]);
                time_s += Number(timeArr[1]);
            } else {
                throw new Error(`无效的时长格式：${time}`);
            }
        }
    });

    // 时间进位计算
    time_m += Math.floor(time_s / 60);
    time_s = time_s % 60;
    time_h += Math.floor(time_m / 60);
    time_m = time_m % 60;

    return {
        hours: time_h,
        minutes: time_m,
        seconds: time_s,
        start: start,
        end: end
    };
}