document.addEventListener('DOMContentLoaded', function() {
    const signInButton = document.getElementById('signInButton');
    const signOutButton = document.getElementById('signOutButton');
    const usernameInput = document.getElementById('username');
    const signInTimeElement = document.getElementById('signInTime');
    const signOutTimeElement = document.getElementById('signOutTime');
    const durationElement = document.getElementById('duration');
    const overtimeMessage = document.getElementById('overtimeMessage');

    const storageKey = 'attendanceRecords';
    let attendanceRecords = [];

    // 加载并解析存储的记录
    try {
        const storedRecords = JSON.parse(localStorage.getItem(storageKey)) || [];
        attendanceRecords = storedRecords.map(record => ({
            ...record,
            signInTime: record.signInTime ? new Date(record.signInTime) : null,
            signOutTime: record.signOutTime ? new Date(record.signOutTime) : null
        }));
    } catch (error) {
        console.error('Error parsing stored records:', error);
    }

    function formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    function calculateTimeDifference(signInTime, signOutTime) {
        const diff = signOutTime - signInTime;
        const minutes = Math.floor(diff / (1000 * 60));

        let message = '';
        if (minutes > 80 && minutes <= 100) {
            message = '您已超时，请在系统补票5元！';
        } else if (minutes > 100 && minutes <= 120) {
            message = '您已超时，请在系统补票10元！';
        } else if (minutes > 120) {
            message = '您已超时，请在系统补票15元！';
        }

        return { minutes, message };
    }

    function saveRecords() {
        localStorage.setItem(storageKey, JSON.stringify(attendanceRecords));
    }

    signInButton.addEventListener('click', function() {
        const username = usernameInput.value;
        if (!username) {
            alert('请输入用户名');
            return;
        }

        const found = attendanceRecords.find(record => record.username === username && !record.signOutTime);

        if (!found) {
            const newRecord = {
                username: username,
                signInTime: new Date(),
                signOutTime: null
            };
            attendanceRecords.push(newRecord);
            saveRecords();
            signInTimeElement.textContent = formatTime(newRecord.signInTime);
            signOutTimeElement.textContent = '-';
            durationElement.textContent = '-';
            overtimeMessage.style.display = 'none';
            alert('签到成功！');
        } else {
            alert('您已经签到，请勿重复签到。');
        }
    });

    signOutButton.addEventListener('click', function() {
        const username = usernameInput.value;
        if (!username) {
            alert('请输入用户名');
            return;
        }

        const foundIndex = attendanceRecords.findIndex(record => record.username === username && !record.signOutTime);

        if (foundIndex !== -1) {
            const record = attendanceRecords[foundIndex];
            record.signOutTime = new Date();
            saveRecords();
            signOutTimeElement.textContent = formatTime(record.signOutTime);

            const result = calculateTimeDifference(record.signInTime, record.signOutTime);

            durationElement.textContent = `${result.minutes}分钟`;
            if (result.message) {
                overtimeMessage.textContent = result.message;
                overtimeMessage.style.display = 'block';
            } else {
                overtimeMessage.style.display = 'none';
            }
            alert('签退成功！');
        } else {
            alert('您还未签到，请先签到。');
        }
    });

    // 加载最后一条未完成的记录
    const lastIncompleteRecord = attendanceRecords.find(record => record.signInTime && !record.signOutTime);
    if (lastIncompleteRecord) {
        usernameInput.value = lastIncompleteRecord.username;
        signInTimeElement.textContent = formatTime(lastIncompleteRecord.signInTime);
        signOutTimeElement.textContent = '-';
        durationElement.textContent = '-';
        overtimeMessage.style.display = 'none';
    }
});
