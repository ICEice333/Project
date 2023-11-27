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
    playerprofile();
    getTopUsers();
    getcat();
    checkmenu();
    showmenu();
    checkclick();
    rePage();
}

let countRe = 6;

function rePage(){
    if(countRe < 1){
        location.reload();
    }
}

let CMTMode = false;
function getTopUsers() {
    let username,point,love;
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

// ฟังก์ชันสำหรับแสดงข้อมูลผู้ใช้
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
                <img id="iconheart" src="css/pic/heart.png" onclick="lovePlayer('${user.id}')">
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
    const scoreboard = document.querySelector('.scoreboard');

    // เลือกทุก div ที่มี class เป็น "score" แล้วลบทิ้ง
    const scoreDivs = document.querySelectorAll('.score');
    scoreDivs.forEach(scoreDiv => {
        scoreboard.removeChild(scoreDiv);
    });
}

let getPF;

function playerprofile() {
    let fillprofile = (() => {
        const point = getCookie('point');
        const love = getCookie('love');
        const cat = getCookie('cat');
        document.getElementById("PP").src = "css/pic/" + cat + "pfp.png";
        document.getElementById('rank').innerText = 'U';
        document.getElementById('Uname').innerText = "you";
        document.getElementById('scorepoint').innerText = point;
        document.getElementById('likecount').innerText = love;
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

//love//
function lovePlayer(targetUserId) {
    const loverId = getCookie('id'); // รับรหัสของผู้ที่กด "love"
    countRe--;
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

//food & Profile//
let menu = true;

function checkmenu() {
    let clickfood = document.getElementById("foodlist");
    let clickprofile = document.getElementById("profile");
    clickfood.onclick = function () {
        menu = true;
        clickfood.className = "showlist";
        clickprofile.className = "hidelist";
        showmenu();
    }

    clickprofile.onclick = function () {
        menu = false;
        clickfood.className = "hidelist";
        clickprofile.className = "showlist";
        showmenu();
    }
}

function showmenu() {
    let getmenu = document.getElementById("container");
    let getbg = document.getElementById("menu");
    if (menu == true) {
        getmenu.innerHTML = `
            <div class="foodbox" id="bagbox">
                <img class = "shaking" id ="bagicon" src="css/pic/bag.png">
            </div>
            <div class="foodbox" id="fishbox">
                <img class = "shaking" id ="fishicon" src="css/pic/fish.png">
            </div>
            <div class="foodbox" id="donutbox">
                <img class = "shaking" id ="donuticon" src="css/pic/donut.png">
            </div>
        `;
        getbg.style.backgroundImage = "url(css/pic/foodmenu.jpg)";
        selectFood();
    }
    else if (menu == false) {
        getmenu.innerHTML = `
        <div id="profilebox">
            <div class="SlcCat">
                <img id="catForChoose" src="">
            </div>
            <div id="button">
                <img id="pre" src="css/pic/back-btn.png">
                <div class="doneBTN">
                    <button class="button-01" id="prf" type="submit" onclick="updateSelectedCat()"> done </button>
                </div>
                <img id="post" src="css/pic/back-btn.png">
            </div>
            <div class="commentBTN">
                <a class="button-Comment" id="prf" href="/comment"> comment </a>
            </div>
            <div class="logoutBTN">
                <a class="button-logout" id="prf" href="/logout"> log out </a>
            </div>
        </div>
        `;
        getbg.style.backgroundImage = "url(css/pic/pfpmenu.jpg)";
        clickBTN();
    }
}

let chooseCat;

function clickBTN() {
    const getPre = document.getElementById("pre");
    const getPost = document.getElementById("post");

    if (cat == "gray") {
        chooseCat = 0;
        changeCat();
    }
    else if (cat == "black") {
        chooseCat = 1;
        changeCat();
    }
    else if (cat == "white") {
        chooseCat = 2;
        changeCat();
    }

    getPre.onclick = function () {
        if (chooseCat <= 0) {
            chooseCat = 3;
        }
        chooseCat--;
        console.log(chooseCat);
        changeCat();
    }
    getPost.onclick = function () {
        if (chooseCat > 1) {
            chooseCat = -1;
        }
        chooseCat++;
        console.log(chooseCat);
        changeCat();
    }
}

function changeCat() {
    const getcat = document.getElementById("catForChoose");

    if (chooseCat == 0) {
        getcat.src = "css/pic/graySit.png";
    }
    else if (chooseCat == 1) {
        getcat.src = "css/pic/blackSit.png";
    }
    else if (chooseCat == 2) {
        getcat.src = "css/pic/whiteSit.png";
    }
}

let selectedCat;
function saveSelectedCat() {
    if (chooseCat == 0) {
        selectedCat = "gray";
    } else if (chooseCat == 1) {
        selectedCat = "black";
    } else if (chooseCat == 2) {
        selectedCat = "white";
    }
}

function updateSelectedCat() {
    // เรียกใช้ฟังก์ชันเพื่อบันทึกค่าแมวที่ถูกเลือกล่าสุด
    saveSelectedCat();
    countRe--;

    // ทำการส่งข้อมูลไปยังเซิร์ฟเวอร์เพื่ออัพเดทในฐานข้อมูล
    fetch('/updateSelectedCat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            cat: selectedCat, // นำค่าที่บันทึกไว้ไปใช้ในการส่งข้อมูล
        }),
    })
        .then(response => response.json())
    setTimeout(() => {
        getcat();
    }, 500);
}

//cat//
let x, y;
let draging = false;
let click;
let isDragging = false;
let walk, sitting, licking, waittodo;
let cat;

function getcat() {
    cat = getCookie('cat');
    const rantop = Math.floor(Math.random() * (270 - 16 + 1)) + 16;
    const ranleft = Math.floor(Math.random() * (624 - 16 + 1)) + 16;
    let catbox = document.getElementById("cat");
    //change cat here//
    catbox.style.backgroundImage = "url(css/pic/" + cat + "Sit.png)";
    catbox.style.left = ranleft + "px";
    catbox.style.top = rantop + "px";

    x = ranleft;
    y = rantop;
    fall();
}

function fall() {
    let TIMER_TICK = 1;
    let speed = 0.5;
    const spdinc = 0.06;
    let catbox = document.getElementById("cat");
    clearInterval(walk);
    clearTimeout(waittodo);
    let timerFall = setInterval(() => {
        if (y < 270) {
            y += speed;
            catbox.style.top = y + 'px';
            speed += spdinc;
            //change cat here//
            catbox.style.backgroundImage = "url(css/pic/" + cat + "Drop.png)";
        }
        else {
            //change cat here//
            catbox.style.backgroundImage = "url(css/pic/" + cat + "Sit.png)";
            clearInterval(timerFall);
            if (feedMode) {
                chaseFood();
            }
            else if (feedMode == false) {
                checkidle();
            }
        }
    }, TIMER_TICK);
}

function warpUp() {
    let catbox = document.getElementById("cat");
    if (y > 270 && y < 335) {
        clearTimeout(waittodo);
        clearInterval(walk);
        y = 269;
        catbox.style.top = y + 'px';
        catbox.style.backgroundImage = "url(css/pic/" + cat + "Sit.png)";
        if (feedMode) {
            chaseFood();
        }
        else if (feedMode == false) {
            checkidle();
        }
    }
}

function checkidle() {
    waittodo = setTimeout(() => {
        letdoSMT();
    }, 3000);
}

function letdoSMT() {
    const rannum = Math.floor(Math.random() * 4) + 1;
    if (rannum == 1) {
        move();
    }
    else if (rannum == 2) {
        sit();
    }
    else if (rannum == 3) {
        lick();
    }
    else {
        checkidle();
    }
}

function move() {
    let catbox = document.getElementById("cat");
    const ranspeed = 0.3 + Math.random() * 0.3;
    const rantime = Math.floor(Math.random() * 6) + 5 * 1000;
    const direct = Math.floor(Math.random() * 2) + 1;
    let countdown = 0;

    //change cat here//
    catbox.style.backgroundImage = "url(css/pic/" + cat + "Walk.gif)";
    // catbox.classList.remove(cat+"stand");
    // catbox.classList.add(cat+"Walk");
    if (direct == 1) {
        walk = setInterval(() => {
            catbox.style.transform = "scaleX(1)";
            x += ranspeed;
            catbox.style.left = x + 'px';
            countdown += 10;
            if (countdown >= rantime || x >= 624) {
                clearInterval(walk);
                catbox.style.backgroundImage = "url(css/pic/" + cat + "Sit.png)";
                checkidle();
            }
        }, 10);
    }
    else {
        walk = setInterval(() => {
            catbox.style.transform = "scaleX(-1)";
            x -= ranspeed;
            catbox.style.left = x + 'px';
            countdown += 10;
            if (countdown >= rantime || x <= 16) {
                clearInterval(walk);
                catbox.style.backgroundImage = "url(css/pic/" + cat + "Sit.png)";
                checkidle();
            }
        }, 10);
    }
}

function sit() {
    const rannum = Math.floor(Math.random() * 4) + 1;
    let catbox = document.getElementById("cat");
    catbox.style.backgroundImage = "url(css/pic/" + cat + "Sit.png)";
    // catbox.classList.add(cat+"Sit");
    sitting = setTimeout(() => {
        checkidle();
    }, rannum);
}

function lick() {
    const rannum = Math.floor(Math.random() * 4) + 1;
    let catbox = document.getElementById("cat");
    catbox.style.backgroundImage = "url(css/pic/" + cat + "Lick.gif)";
    // catbox.classList.add(cat+"Sit");
    licking = setTimeout(() => {
        checkidle();
    }, rannum);
}

//drag//
function checkclick() {
    click = document.querySelector('.cat');
    click.addEventListener('mousedown', mousedown);
}

function mousedown() {
    clearInterval(walk);
    clearInterval(chase);
    clearTimeout(waittodo);
    clearTimeout(sitting);
    clearTimeout(licking);
    clearTimeout(eating);
    let catbox = document.getElementById("cat")
    catbox.style.backgroundImage = "url(css/pic/" + cat + "Hold.png)"
    catbox.style.transform = "scaleX(1)";

    click.addEventListener('mousemove', mousemove);
    click.addEventListener('mouseup', mouseup);
}

function mousemove(e) {
    const deltaX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    const deltaY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

    x += deltaX;
    y += deltaY;

    console.log("x = " + deltaX);
    console.log("y = " + deltaX);
    const move = document.getElementById("cat")
    move.style.left = x + 'px';
    move.style.top = y + 'px';
    if (x <= 18 || x >= 622 || y <= 18) {
        click.removeEventListener('mousemove', mousemove);
        fall();
    }
    else if (y >= 334) {
        click.removeEventListener('mousemove', mousemove);
        warpUp();
    }
}

function mouseup() {
    click.removeEventListener('mousemove', mousemove);
    click.removeEventListener('mouseup', mouseup);
    if (y > 270) {
        warpUp();
    }
    else {
        fall();
    }
}

//food//
let foodSelected;
let feedMode = false;
let eating;

function setFood(foodId) {
    feedMode = true;
    foodSelected = foodId;
}

function selectFood() {
    document.getElementById("bagicon").addEventListener("click", function () {
        if (feedMode == false) {
            if (foodSelected != 1) {
                setFood(1);
                console.log("Selected Food: " + foodSelected);
                changeBG();
            }
        }
    });

    document.getElementById("fishicon").addEventListener("click", function () {
        if (feedMode == false) {
            if (foodSelected != 2) {
                setFood(2);
                console.log("Selected Food: " + foodSelected);
                changeBG();
            }
        }
    });

    document.getElementById("donuticon").addEventListener("click", function () {
        if (feedMode == false) {
            if (foodSelected != 3) {
                setFood(3);
                console.log("Selected Food: " + foodSelected);
                changeBG();
            }
        }
    });
}

function changeBG() {
    let get1box = document.getElementById("bagicon");
    let get2box = document.getElementById("fishicon");
    let get3box = document.getElementById("donuticon");

    if (foodSelected == 1) {
        console.log("bag");
        get1box.src = " ";
        get2box.src = "css/pic/fish.png";
        get3box.src = "css/pic/donut.png";
        createFood();
    }
    else if (foodSelected == 2) {
        console.log("fish");
        get1box.src = "css/pic/bag.png";
        get2box.src = " ";
        get3box.src = "css/pic/donut.png";
        createFood();
    }
    else if (foodSelected == 3) {
        console.log("donut");
        get1box.src = "css/pic/bag.png";
        get2box.src = "css/pic/fish.png";
        get3box.src = " ";
        createFood();
    }
    else {
        get1box.src = "css/pic/bag.png";
        get2box.src = "css/pic/fish.png";
        get3box.src = "css/pic/donut.png";
        checkidle();
    }
}

let foodY, foodX;
let chase;

function createFood() {
    clearInterval(walk);
    clearTimeout(waittodo);
    clearTimeout(sitting);
    clearTimeout(licking);
    const ranfoodY = Math.floor(Math.random() * (270 - 16 + 1)) + 16;
    const ranfoodX = Math.floor(Math.random() * (624 - 16 + 1)) + 16;
    const display = document.getElementById('display');
    const fooddiv = document.createElement("div");
    fooddiv.id = "feedFood";
    fooddiv.classList = "feedFood";
    console.log(ranfoodX);
    console.log(ranfoodY);

    foodX = ranfoodX;
    foodY = ranfoodY;
    fooddiv.style.top = foodY + "px";
    fooddiv.style.left = foodX + "px";


    if (foodSelected == 1) {
        fooddiv.style.backgroundImage = "url(css/pic/bag.png)";
        display.appendChild(fooddiv);
        foodfall();
    }
    else if (foodSelected == 2) {
        fooddiv.style.backgroundImage = "url(css/pic/fish.png)";
        display.appendChild(fooddiv);
        foodfall();
    }
    else {
        fooddiv.style.backgroundImage = "url(css/pic/donut.png)";
        display.appendChild(fooddiv);
        foodfall();
    }
}

function foodfall() {
    let TIMER_TICK = 1;
    let speed = 0.5;
    const spdinc = 0.06;
    let letfall = document.getElementById("feedFood");
    let foodsetFall = setInterval(() => {
        if (foodY < 320) {
            // letfall.style.backgroundImage = "url(css/pic/" + cat + "Drop.png)" 
            foodY += speed;
            letfall.style.top = foodY + 'px';
            speed += spdinc;
        }
        else {
            clearInterval(foodsetFall);
            // letfall.style.backgroundImage = "url(css/pic/" + cat + "Stand.png)"
            chaseFood();
        }
    }, TIMER_TICK);
}

function chaseFood() {
    let catbox = document.getElementById("cat");
    const ranspeed = 2;
    let distance = Math.abs((foodX + 25) - (x + 50));
    //change cat here//
    catbox.style.backgroundImage = "url(css/pic/" + cat + "Walk.gif)";
    // catbox.classList.remove(cat+"stand");
    // catbox.classList.add(cat+"Walk");
    if (foodX > x + 50) {
        chase = setInterval(() => {
            catbox.style.transform = "scaleX(1)";
            x += ranspeed;
            distance -= ranspeed;
            catbox.style.left = x + 'px';
            if (distance <= 10) {
                clearInterval(chase);
                catbox.style.backgroundImage = "url(css/pic/" + cat + "Eat.gif)";
                catEat();
            }
        }, 10);
    }
    else if (foodX < x) {
        chase = setInterval(() => {
            catbox.style.transform = "scaleX(-1)";
            x -= ranspeed;
            catbox.style.left = x + 'px';
            distance -= ranspeed;
            if (distance <= 10) {
                clearInterval(chase);
                catbox.style.backgroundImage = "url(css/pic/" + cat + "Eat.gif)";
                catEat();
            }
        }, 10);
    }
}

function catEat() {
    let catbox = document.getElementById("cat");
    const display = document.querySelector('.display');
    const feedfoodDivs = document.querySelectorAll('.feedFood');
    eating = setTimeout(() => {
        catbox.style.backgroundImage = "url(css/pic/" + cat + "Sit.png)";
        feedMode = false;
        foodSelected = 0;
        if(menu == true){
            changeBG();
        }
        feedfoodDivs.forEach(feedfoodDivs => {
            display.removeChild(feedfoodDivs);
        });
    }, 2000);
}

//comment//
function attachClickListeners() {
    const userElements = document.querySelectorAll('.scoreboard .score #Uname');
    let getname = getCookie('username');

    userElements.forEach((userElement) => {
        userElement.addEventListener('click', () => {
            const sentboxExists = display.querySelector('.sentBox') !== null;
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
    const sentBox = document.createElement('div');
    sentBox.classList.add('sentBox');

    sentBox.innerHTML = `
        <p>sent to ${userName}</p>
        <div class="commentator">
            <textarea name="msg" id="textmsg" value="" placeholder=""></textarea>
            <button class="pawpost" id="postbutton"><img src="css/pic/paw.png"></button>
        </div>
    `;
    
    const postButton = sentBox.querySelector('#postbutton');
    postButton.addEventListener('click', () => {
        const commentMessage = sentBox.querySelector('#textmsg').value;
        let sender = getCookie('id');
        postComment(userName, commentMessage, sender);
        sentBox.remove();
    });
    display.appendChild(sentBox);
}

function postComment(userName, commentMessage, sender) {
    countRe--;
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