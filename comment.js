function checkCookie() {
    var username = "";
    if (getCookie("username") == false) {
        window.location = "login.html";
    }
}
checkCookie();

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

let getCMT = getCookie('id');
document.addEventListener('DOMContentLoaded', () => {
    // ใช้ Fetch API เพื่อดึงข้อมูลคอมเมนต์
    fetch('/getComments')
        .then(response => response.json())
        .then(data => {
            // เรียกฟังก์ชันสำหรับแสดงข้อมูลคอมเมนต์
            displayComments(data.comments);
            console.log(data.comments);
            console.log(getCMT);
        })
        .catch(error => {
            console.error('Error fetching comments:', error);
        });
        
    
    // ฟังก์ชันสำหรับแสดงข้อมูลคอมเมนต์
    function displayComments(comments) {
        const commentContainer = document.getElementById('worldchat');
        const ourSenderId = getCMT; // ให้เป็น id ของผู้ใช้ที่เป็นเรา (ต้องแทนที่ด้วยค่าจริง)

        comments.forEach(comment => {
            // ตรวจสอบว่าเป็นคอมเมนต์ที่ส่งมาหาเราหรือไม่
            if (comment.receiver_id == ourSenderId) {
                const commentDiv = document.createElement('div');
                commentDiv.classList.add('comment');

                const senderInfo = `${comment.sender_username} ${comment.timestamp} <img id="star" src="css/pic/star.png"> ${comment.point} <img id="heart" src="css/pic/heart.png"> ${comment.love}`;
                const commentText = comment.message;

                commentDiv.innerHTML = `
                    <p id="sender">${senderInfo}</p>
                    <div id="CMTtext">${commentText}</div>
                `;

                commentContainer.appendChild(commentDiv);
            }
        });
    }
});
