function checkCookie() {
    var username = "";
    if (getCookie("username") == false) {
        window.location = "login.html";
    }
}

checkCookie();
window.onload = pageLoad;

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function pageLoad() {
    getTopUsers();
    playerprofile();
    getcat();
    // rePage();
}

// let countRe = 6;

// function rePage(){
//     if(countRe == 2){
//         location.reload();
//     }
// }

let CMTMode = false;
let getPF;
// function fix(){
//     let screen = document.getElementById("textbox-bg");
//     screen.style.justifyContent = "center";
// }

function getTopUsers() {
    let username, point, love;
    console.log("get user")
    fetch('/getTopUsers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            point: point,
            love: love,
        }),
    })
        .then(response => response.json())
        .then(data => {
            displayTopUsers(data.topUsers);
            console.log(data.topUsers);
        })
        .catch(error => {
            console.error('Error fetching top users:', error);
        });
}

// function getTopUsers() {
//     console.log("get user")
//     setInterval(() => {
//         fetch('/getTopUsers')
//         .then(response => response.json())
//         .then(data => {
//             console.log("still run");
//             displayTopUsers(data.topUsers);
//         })
//         .catch(error => {
//             console.error('Error fetching top users:', error);
//         });
//     }, 2000);
// }

function displayTopUsers(topUsers) {
    const scoreboard = document.querySelector('.scoreboard');

    topUsers.forEach((user, index) => {
        const scoreDiv = document.createElement('div');
        scoreDiv.classList.add('score');

        // สร้าง HTML แต่ละส่วนของข้อมูลผู้ใช้
        const rankPfpDiv = document.createElement('div');
        rankPfpDiv.id = 'rank-pfp';
        rankPfpDiv.innerHTML = `
            <div id="rank">${index + 1}</div>
            <div id="Upfp">
                <img src="css/pic/${user.cat}pfp.png">
            </div>
        `;

        const detailDiv = document.createElement('div');
        detailDiv.id = 'detail';
        detailDiv.innerHTML = `
            <div id="Uname">${user.username}</div>
            <div id="infoU">
                <img id="icondec" src="css/pic/star.png">
                <div id="scorepoint">${user.point}</div>
            </div>
            <div id="infoU">
                <img id="icondec" src="css/pic/heart.png">
                <div id="likecount">${user.love}</div>
            </div>
        `;

        // เพิ่มส่วนของข้อมูลผู้ใช้ลงใน scoreDiv
        scoreDiv.appendChild(rankPfpDiv);
        scoreDiv.appendChild(detailDiv);

        // เพิ่ม scoreDiv ลงใน scoreboard
        scoreboard.appendChild(scoreDiv);
    });
    attachClickListeners();
}

function clearScoreboard() {
    console.log("clear board");
    const scoreboard = document.querySelector('.scoreboard');

    // เลือกทุก div ที่มี class เป็น "score" แล้วลบทิ้ง
    const scoreDivs = document.querySelectorAll('.score');
    scoreDivs.forEach(scoreDiv => {
        scoreboard.removeChild(scoreDiv);
    });
}



function playerprofile() {
    let fillprofile = (() => {
        const cat = getCookie('cat');
        console.log("Fill Profile");
        const point = getCookie('point');
        const love = getCookie('love');
        document.getElementById('PP').src = "css/pic/"+ cat +"pfp.png";
        document.getElementById('rank').innerText = 'U';
        document.getElementById('Uname').innerText = "you";
        document.getElementById('scorepoint').innerText = point;
        document.getElementById('likecount').innerText = love;
        document.getElementById('gamepoint').innerHTML = point;
    });
    fillprofile();
    getPF = setInterval(() => {
        fillprofile();
        clearScoreboard();
        getTopUsers();
    }, 2000);
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

//cat//
const cat = getCookie('cat');

function getcat() {
    let catbox = document.getElementById("cat");
    //change cat here//
    catbox.style.backgroundImage = "url(css/pic/" + cat + "POP1.png)";
    catbox.style.left = "200px";
    catbox.style.top = "85px";
    catbox.style.width = "350px";
    catbox.style.height = "350px";
    catbox.style.backgroundSize = "100%";

    x = 100;
    y = 100;

    // const catImage = document.getElementById('cat');
    // catImage.addEventListener('click', handleCatClick);
    checkclick()
}


function checkclick() {
    let catImage = document.querySelector('.cat');
    catImage.addEventListener('mousedown', mousedown);
}

const audio = new Audio('css/pic/POPCAT.mp3');

function mousedown() {
    let catImage = document.querySelector('.cat');
    let catbox = document.getElementById("cat")
    catbox.style.backgroundImage = "url(css/pic/" + cat + "POP2.png)";
    audio.play();
    catImage.addEventListener('mouseup', mouseup);
}

function mouseup() {
    let catImage = document.querySelector('.cat');
    let catbox = document.getElementById("cat")
    catbox.style.backgroundImage = "url(css/pic/" + cat + "POP1.png)";
    const currentPoints = parseInt(document.getElementById('gamepoint').innerHTML);
    const newPoints = currentPoints + 1;
    document.getElementById('gamepoint').innerHTML = newPoints;
    updateCookie('point', newPoints);
    catImage.removeEventListener('mouseup', mouseup);
    // updateDB();
}

function updateCookie(name, value) {
    document.cookie = `${name}=${value}`;
}

function updateDB() {
    console.log("update Database");
    const username = getCookie('username');
    const newScore = parseInt(document.getElementById('gamepoint').innerHTML);

    fetch('/updateScore', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, newScore }),
    })
}

function stopGame() {
    updateDB();
    clearInterval(getPF);
}

//love//
function lovePlayer(targetUserId) {
    const loverId = getCookie('id'); // รับรหัสของผู้ที่กด "love"

    fetch('/lovePlayerAndUpdate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            lover_id: loverId,
            loved_id: targetUserId,
        }),
    })
        .then(response => response.json())
        .catch(error => {
            console.error('Error loving player:', error);
        });
}

//comment//
function getComments(receiverId) {
    fetch(`/getComments/${receiverId}`)
        .then(response => response.json())
        .then(data => {
            const comments = data.comments;
            // ทำอย่างไรก็ตามที่คุณต้องการใน Frontend
        })
        .catch(error => {
            console.error('Error fetching comments:', error);
        });
}

function addComment(senderId, receiverId, message) {
    fetch('/addComment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            senderId: senderId,
            receiverId: receiverId,
            message: message,
        }),
    })
        .then(response => response.json())
        .then(data => {
            // ทำอย่างอื่น ๆ หลังจากเพิ่ม Comment เสร็จสิ้น
            console.log('Comment added successfully');
        })
        .catch(error => {
            console.error('Error adding comment:', error);
        });
}

function attachClickListeners() {
    const userElements = document.querySelectorAll('.scoreboard .score #Uname');
    let getname = getCookie('username');

    userElements.forEach((userElement) => {
        userElement.addEventListener('click', () => {
            const sentboxExists = display.querySelector('.sentBoxGame') !== null;
            CMTMode = sentboxExists;
            console.log(CMTMode);
            if (CMTMode == false) {
                const selectedUserName = userElement.innerText;
                if (selectedUserName !== "you" && selectedUserName !== getname) {
                    createCommentBox(selectedUserName);
                }
            }

        });
    });
}

// สร้างและแสดงช่องใส่คอมเมนต์
function createCommentBox(userName) {
    const display = document.getElementById("display");
    const sentBoxGame = document.createElement('div');
    sentBoxGame.classList.add('sentBoxGame');

    sentBoxGame.innerHTML = `
        <p>sent to ${userName}</p>
        <div class="commentator">
            <textarea name="msg" id="textmsg" value="" placeholder=""></textarea>
            <button class="pawpost" id="postbutton"><img src="css/pic/paw.png"></button>
        </div>
    `;

    const postButton = sentBoxGame.querySelector('#postbutton');
    postButton.addEventListener('click', () => {
        const commentMessage = sentBoxGame.querySelector('#textmsg').value;
        let sender = getCookie('id');
        postComment(userName, commentMessage, sender);
        sentBoxGame.remove();
    });
    display.appendChild(sentBoxGame);
}

function postComment(userName, commentMessage, sender) {
    // ทำการ fetch เพื่อส่งข้อมูลไปยังเซิร์ฟเวอร์
    fetch('/postComment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userName: userName,
            commentMessage: commentMessage,
            sender: sender,
        }),
    })
        .then(response => response.json())
        .then(data => {
            // ทำตามที่คุณต้องการหลังจากส่งข้อมูลสำเร็จ
            console.log('Comment posted successfully:', data);
        })
        .catch(error => {
            console.error('Error posting comment:', error);
        });
}