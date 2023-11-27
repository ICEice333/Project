const express = require('express');
const app = express();
const fs = require('fs');
const hostname = 'localhost';
const port = 3001;
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const mysql = require('mysql');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "CatUserDB"
})

con.connect((err) => {
    if (err) throw err;
    console.log("MySQL connected");

    // สร้าง table หากยังไม่มี
    const createTableUsers = `
      CREATE TABLE IF NOT EXISTS users (
        id int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        cat VARCHAR(10) NOT NULL,
        point INT,
        love INT
      )
    `;

    const createTableLoves = `
        CREATE TABLE IF NOT EXISTS love_history (
            id int(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
            lover_id int(6) NOT NULL,
            loved_id int(6) NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const createTableComment = `
        CREATE TABLE IF NOT EXISTS comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_id INT,
            receiver_id INT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            message TEXT,
            FOREIGN KEY (sender_id) REFERENCES users(id),
            FOREIGN KEY (receiver_id) REFERENCES users(id)
        )
    `;

    con.query(createTableUsers, (err, result) => {
        if (err) throw err;
        console.log("Table users created or already exists");
    });

    con.query(createTableLoves, (err, result) => {
        if (err) throw err;
        console.log("Table loves created or already exists");
    });
    con.query(createTableComment, (err, result) => {
        if (err) throw err;
        console.log("Table comment created or already exists");
    });
});

app.post('/postComment', (req, res) => {
    const { userName, commentMessage ,sender} = req.body;

    // ตรวจสอบข้อมูลที่ได้รับ
    if (!userName || !commentMessage) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    // ทำส่วนที่เกี่ยวข้องกับบันทึกคอมเมนต์ลงในฐานข้อมูลของคุณ
    const insertCommentQuery = `
            INSERT INTO comments (sender_id, receiver_id, message)
            VALUES (?, ?, ?)
        `;

    // ในที่นี้คุณต้องทำการดึงข้อมูลผู้ใช้ที่รับคอมเมนต์โดย userName จากดาตาเบส
    // เพื่อนำ ID ของผู้รับมาใช้ในการบันทึก
    const getReceiverIdQuery = `
            SELECT id FROM users WHERE username = ?
        `;

    con.query(getReceiverIdQuery, [userName], (err, result) => {
        if (err) {
            console.error('Error getting receiver ID:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const receiverId = result[0].id;

        // ทำการบันทึกคอมเมนต์ลงในฐานข้อมูล
        con.query(insertCommentQuery, [sender, receiverId, commentMessage], (err, result) => {
            if (err) {
                console.error('Error inserting comment:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            console.log('Comment inserted successfully');
            res.status(200).json({ success: true });
        });
    });
});

app.get('/getComments', (req, res) => {
    // ทำการดึงข้อมูลคอมเมนต์และข้อมูลผู้ส่งจากฐานข้อมูลของคุณ
    const getCommentsQuery = `
        SELECT comments.*, users.username AS sender_username, users.point, users.love
        FROM comments
        INNER JOIN users ON comments.sender_id = users.id
    `;

    con.query(getCommentsQuery, (err, result) => {
        if (err) {
            console.error('Error getting comments:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // ส่งข้อมูลคอมเมนต์ทั้งหมดกลับไปที่ไคลเอนต์
        res.status(200).json({ comments: result });
    });
});


app.post('/updateSelectedCat', async (req, res) => {
    const { cat } = req.body;
    const userId = req.cookies.id;

    try {
        // ดึงค่า 'cat' จากฐานข้อมูล
        const currentCat = await getCatFromDatabase(userId);

        // ทำการอัพเดทค่า 'cat' ในฐานข้อมูล
        const updateCatQuery = 'UPDATE users SET cat = ? WHERE id = ?';

        con.query(updateCatQuery, [cat, userId], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal Server Error" });
                return;
            }

            // ทำการอัพเดทคุกกี้ 'cat' เพื่อตรงกับค่าในฐานข้อมูล
            res.cookie("cat", cat);

            console.log(`Selected cat updated for user with id ${userId}`);
            res.json({ success: true });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// สร้างฟังก์ชันเพื่อดึงข้อมูล 'cat' จากฐานข้อมูล
function getCatFromDatabase(userId) {
    return new Promise((resolve, reject) => {
        const getCatQuery = 'SELECT cat FROM users WHERE id = ?';

        con.query(getCatQuery, [userId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                const cat = result[0].cat;
                resolve(cat);
            }
        });
    });
}

app.get('/logout', (req, res) => {
    res.clearCookie('username');
    res.clearCookie('id');
    res.clearCookie('cat');
    res.clearCookie('point');
    res.clearCookie('love');
    return res.redirect('start.html');
})

app.get('/comment', (req, res) => {
    return res.redirect('comment.html');
})

function updateLoveInUsers(userId) {
    // คำสั่ง SQL เพื่ออัพเดทค่า "love" ในตาราง users
    const updateLoveQuery = 'UPDATE users SET love = (SELECT COUNT(*) FROM love_history WHERE loved_id = ?) WHERE id = ?';

    con.query(updateLoveQuery, [userId, userId], (err, result) => {
        if (err) {
            console.error(err);
            // คุณอาจจะต้องจัดการข้อผิดพลาดในที่นี้
        }

        console.log(`Love updated for user with id ${userId}`);
    });
}

// ฟังก์ชัน "lovePlayer" ที่ได้รับการอัพเดท
app.post('/lovePlayerAndUpdate', (req, res) => {
    const { lover_id, loved_id } = req.body;
    con.query('SELECT * FROM love_history WHERE lover_id = ? AND loved_id = ?', [lover_id, loved_id], (err, rows) => {
        if (err) {
            return;
        }
        // ถ้าเคย "love" กันแล้ว
        if (rows.length > 0) {
            return;
        }

        // เพิ่มประวัติการ "love" ลงในฐานข้อมูล
        const insertLoveQuery = 'INSERT INTO love_history (lover_id, loved_id) VALUES (?, ?)';
        con.query(insertLoveQuery, [lover_id, loved_id], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Internal Server Error" });
                return;
            }

            // เมื่อ "love" เสร็จสิ้น, เรียกใช้ฟังก์ชันอัพเดท
            updateLoveInUsers(loved_id);

            res.json({ success: true });
        });
    });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Check if the username already exists
    con.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
            return;
        }

        // If the username already exists, return an error response
        if (rows.length > 0) {
            console.log("Username is already taken");
            res.redirect('/usernameTaken.html');
            return;
        }

        // If the username is not taken, proceed with the registration
        const insertDataQuery = `INSERT INTO users (username, password, cat, point, love) VALUES (?, ?, ?, ?, ?)`;
        const values = [username, password, "gray", 0, 0];

        con.query(insertDataQuery, values, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send("Internal Server Error");
                return;
            }

            console.log(username + " adopted a cat");

            res.redirect('/start.html');
        });
    });
});

app.post('/getTopUsers', async (req, res) => {
    // เขียนคำสั่ง SQL เพื่อดึงข้อมูลผู้ใช้ที่มี "point" สูงสุด 3 คน
    const getTopUsersQuery = 'SELECT id, username, cat, point, love FROM users ORDER BY point DESC LIMIT 3';

    con.query(getTopUsersQuery, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
            return;
        }
        // ส่งข้อมูลผู้ใช้กลับไปยังหน้าเกม
        res.json({ topUsers: result });
    });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Check if the username and password match
    const checkLoginQuery = 'SELECT * FROM users WHERE username = ? AND password = ?';
    con.query(checkLoginQuery, [username, password], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
            return;
        }

        if (rows.length > 0) {
            console.log("Login successful");
            console.log("Welcome " + username);
            res.cookie("id", rows[0].id);
            res.cookie("username", username);
            res.cookie("cat", rows[0].cat);
            res.cookie("point", rows[0].point);
            res.cookie("love", rows[0].love);
            return res.redirect('/home.html');
        }

        console.log("Login failed");
        return res.redirect('/wrongpw.html');
    });
});

app.post('/updateScore', (req, res) => {
    const { username, newScore } = req.body;

    const updateScoreQuery = 'UPDATE users SET point = ? WHERE username = ?';

    con.query(updateScoreQuery, [newScore, username]);
});

app.get('/', (req, res) => {
    res.redirect('/start.html');
});

app.listen(port, hostname, () => {
    console.log(`Server running at   http://${hostname}:${port}/`);
});