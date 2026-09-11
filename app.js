/* ==========================================
   DOBERNA KHAN
   Version 1
   Virtual Coins Only
========================================== */


/* ==========================================
   GLOBAL DATA
========================================== */

const STARTING_COINS = 500;
const DAILY_REWARD = 100;

const ROOMS = {
    50: "اتاق برنزی",
    100: "اتاق نقره‌ای",
    250: "اتاق طلایی",
    500: "اتاق ویژه"
};


/* ==========================================
   STORAGE
========================================== */

function getUsers() {

    return JSON.parse(
        localStorage.getItem("doberna_users") || "{}"
    );

}


function saveUsers(users) {

    localStorage.setItem(
        "doberna_users",
        JSON.stringify(users)
    );

}


function getCurrentUser() {

    return localStorage.getItem("doberna_current_user");

}


function setCurrentUser(username) {

    localStorage.setItem(
        "doberna_current_user",
        username
    );

}


function getUserData() {

    const username = getCurrentUser();

    if (!username) {
        return null;
    }

    const users = getUsers();

    return users[username] || null;

}


function updateUserData(data) {

    const username = getCurrentUser();

    if (!username) {
        return;
    }

    const users = getUsers();

    users[username] = data;

    saveUsers(users);

}


/* ==========================================
   PAGE DETECTION
========================================== */

const currentPage =
    window.location.pathname
        .split("/")
        .pop();


/* ==========================================
   AUTH REDIRECT
========================================== */

function checkAuth() {

    const user = getCurrentUser();

    if (
        currentPage === "index.html" ||
        currentPage === ""
    ) {

        if (!user) {

            window.location.href = "login.html";

            return false;
        }

    }

    return true;
}


checkAuth();


/* ==========================================
   REGISTER
========================================== */

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const username =
                document
                    .getElementById("registerUsername")
                    .value
                    .trim()
                    .toLowerCase();

            const password =
                document
                    .getElementById("registerPassword")
                    .value;

            const password2 =
                document
                    .getElementById("registerPassword2")
                    .value;

            const message =
                document.getElementById(
                    "registerMessage"
                );


            if (username.length < 3) {

                showMessage(
                    message,
                    "نام کاربری حداقل باید ۳ حرف باشد.",
                    "error"
                );

                return;
            }


            if (password.length < 6) {

                showMessage(
                    message,
                    "رمز عبور باید حداقل ۶ کاراکتر باشد.",
                    "error"
                );

                return;
            }


            if (password !== password2) {

                showMessage(
                    message,
                    "رمزهای عبور یکسان نیستند.",
                    "error"
                );

                return;
            }


            const users = getUsers();


            if (users[username]) {

                showMessage(
                    message,
                    "این نام کاربری قبلاً ثبت شده است.",
                    "error"
                );

                return;
            }


            users[username] = {

                username: username,

                password: password,

                coins: STARTING_COINS,

                createdAt:
                    new Date().toISOString(),

                lastDailyReward: null,

                history: []

            };


            saveUsers(users);

            setCurrentUser(username);


            showMessage(
                message,
                "حساب با موفقیت ساخته شد 🎉",
                "success"
            );


            setTimeout(
                function () {

                    window.location.href =
                        "index.html";

                },
                700
            );

        }
    );

}


/* ==========================================
   LOGIN
========================================== */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const username =
                document
                    .getElementById("loginUsername")
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            const users = getUsers();


            if (!users[username]) {

                showMessage(
                    message,
                    "کاربری با این نام پیدا نشد.",
                    "error"
                );

                return;
            }


            if (users[username].password !== password) {

                showMessage(
                    message,
                    "رمز عبور اشتباه است.",
                    "error"
                );

                return;
            }


            setCurrentUser(username);


            showMessage(
                message,
                "ورود موفق بود 🎉",
                "success"
            );


            setTimeout(
                function () {

                    window.location.href =
                        "index.html";

                },
                500
            );

        }
    );

}


/* ==========================================
   HOME INIT
========================================== */

if (
    currentPage === "index.html" ||
    currentPage === ""
) {

    initializeHome();

}


function initializeHome() {

    const user = getUserData();

    if (!user) {
        return;
    }


    const welcome =
        document.getElementById(
            "welcomeUser"
        );

    const balance =
        document.getElementById(
            "coinBalance"
        );


    if (welcome) {

        welcome.textContent =
            `سلام ${user.username} 👑`;

    }


    if (balance) {

        balance.textContent =
            formatNumber(user.coins);

    }


    updateDailyRewardUI();

}


/* ==========================================
   DAILY REWARD
========================================== */

function canClaimDailyReward() {

    const user = getUserData();

    if (!user) {
        return false;
    }


    if (!user.lastDailyReward) {
        return true;
    }


    const last =
        new Date(user.lastDailyReward);


    const now =
        new Date();


    const difference =
        now.getTime() -
        last.getTime();


    const oneDay =
        24 * 60 * 60 * 1000;


    return difference >= oneDay;

}


function claimDailyReward() {

    const user = getUserData();

    if (!user) {
        return;
    }


    if (!canClaimDailyReward()) {

        showTemporaryMessage(
            "پاداش امروز رو قبلاً گرفتی 🎁"
        );

        return;
    }


    user.coins += DAILY_REWARD;

    user.lastDailyReward =
        new Date().toISOString();


    updateUserData(user);


    updateBalanceDisplay();

    updateDailyRewardUI();


    showTemporaryMessage(
        `🎁 ${DAILY_REWARD} سکه به موجودی شما اضافه شد`
    );

}


function updateDailyRewardUI() {

    const button =
        document.getElementById(
            "dailyButton"
        );

    const text =
        document.getElementById(
            "dailyText"
        );


    if (!button || !text) {
        return;
    }


    if (canClaimDailyReward()) {

        button.disabled = false;

        button.textContent = "دریافت";

        text.textContent =
            `امروز ${DAILY_REWARD} سکه رایگان داری`;

    } else {

        button.disabled = true;

        button.textContent = "دریافت شد";

        text.textContent =
            "پاداش امروز دریافت شده";

    }

}


/* ==========================================
   ROOMS
========================================== */

function goToRooms() {

    const section =
        document.getElementById(
            "roomsSection"
        );


    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });

    }

}


function enterRoom(entryFee) {

    const user = getUserData();

    if (!user) {
        return;
    }


    if (user.coins < entryFee) {

        showTemporaryMessage(
            "سکه کافی نداری 🪙"
        );

        return;
    }


    /*
       فعلاً هزینه ورود از سکه کم می‌شود.
       در نسخه Firebase این عملیات باید
       سمت سرور/Database امن انجام شود.
    */

    user.coins -= entryFee;


    user.history =
        user.history || [];


    user.history.unshift({

        type: "entry",

        room: ROOMS[entryFee],

        amount: entryFee,

        date:
            new Date().toISOString()

    });


    updateUserData(user);

    updateBalanceDisplay();


    openGame(
        entryFee
    );

}


/* ==========================================
   GAME
========================================== */

let currentGame = null;


function openGame(entryFee) {

    currentGame = {

        entryFee: entryFee,

        numbers: [],

        called: [],

        gameOver: false

    };


    const modal =
        document.getElementById(
            "gameModal"
        );


    const roomTitle =
        document.getElementById(
            "roomTitle"
        );


    const gameCoins =
        document.getElementById(
            "gameCoins"
        );


    if (roomTitle) {

        roomTitle.textContent =
            ROOMS[entryFee];

    }


    if (gameCoins) {

        const user =
            getUserData();

        gameCoins.textContent =
            formatNumber(user.coins);

    }


    createBingoCard();


    document.getElementById(
        "calledNumber"
    ).textContent = "--";


    document.getElementById(
        "gameMessage"
    ).textContent =
        "عددها را یکی‌یکی اعلام کن";


    document.getElementById(
        "callNumberBtn"
    ).disabled = false;


    modal.classList.remove(
        "hidden"
    );

}


function closeGame() {

    const modal =
        document.getElementById(
            "gameModal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


/* ==========================================
   BINGO CARD
========================================== */

function createBingoCard() {

    const card =
        document.getElementById(
            "bingoCard"
        );


    if (!card) {
        return;
    }


    card.innerHTML = "";


    /*
       کارت ۵ × ۵
       خانه وسط FREE
    */

    const numbers =
        generateUniqueNumbers(
            24,
            1,
            99
        );


    currentGame.numbers =
        numbers;


    let index = 0;


    for (
        let row = 0;
        row < 5;
        row++
    ) {

        for (
            let col = 0;
            col < 5;
            col++
        ) {

            const cell =
                document.createElement(
                    "button"
                );


            cell.className =
                "bingo-cell";


            if (
                row === 2 &&
                col === 2
            ) {

                cell.textContent =
                    "FREE";

                cell.classList.add(
                    "free"
                );

                cell.dataset.marked =
                    "true";

            } else {

                const number =
                    numbers[index];

                index++;

                cell.textContent =
                    number;

                cell.dataset.number =
                    number;

            }


            card.appendChild(
                cell
            );

        }

    }

}


/* ==========================================
   CALL NUMBER
========================================== */

function callNextNumber() {

    if (
        !currentGame ||
        currentGame.gameOver
    ) {

        return;
    }


    if (
        currentGame.called.length >= 99
    ) {

        return;
    }


    let number;


    do {

        number =
            Math.floor(
                Math.random() * 99
            ) + 1;

    } while (
        currentGame.called.includes(
            number
        )
    );


    currentGame.called.push(
        number
    );


    const display =
        document.getElementById(
            "calledNumber"
        );


    display.textContent =
        number;


    markNumber(
        number
    );


    checkWin();

}


/* ==========================================
   MARK NUMBER
========================================== */

function markNumber(number) {

    const cells =
        document.querySelectorAll(
            ".bingo-cell"
        );


    cells.forEach(
        function (cell) {

            if (
                Number(
                    cell.dataset.number
                ) === number
            ) {

                cell.classList.add(
                    "marked"
                );

                cell.dataset.marked =
                    "true";

            }

        }
    );

}


/* ==========================================
   CHECK HORIZONTAL WIN
========================================== */

function checkWin() {

    const cells =
        Array.from(
            document.querySelectorAll(
                ".bingo-cell"
            )
        );


    for (
        let row = 0;
        row < 5;
        row++
    ) {

        let complete = true;


        for (
            let col = 0;
            col < 5;
            col++
        ) {

            const index =
                row * 5 + col;


            const cell =
                cells[index];


            if (
                cell.dataset.marked !==
                "true"
            ) {

                complete = false;

                break;
            }

        }


        if (complete) {

            winGame();

            return;
        }

    }

}


/* ==========================================
   WIN GAME
========================================== */

function winGame() {

    if (
        !currentGame ||
        currentGame.gameOver
    ) {

        return;
    }


    currentGame.gameOver =
        true;


    /*
       فعلاً جایزه برد را
       ۲ برابر ورودی در نظر گرفتیم.
    */

    const reward =
        currentGame.entryFee * 2;


    const user =
        getUserData();


    user.coins += reward;


    user.history =
        user.history || [];


    user.history.unshift({

        type: "win",

        room:
            ROOMS[
                currentGame.entryFee
            ],

        amount: reward,

        date:
            new Date().toISOString()

    });


    updateUserData(user);

    updateBalanceDisplay();


    const gameCoins =
        document.getElementById(
            "gameCoins"
        );


    if (gameCoins) {

        gameCoins.textContent =
            formatNumber(user.coins);

    }


    const message =
        document.getElementById(
            "gameMessage"
        );


    message.innerHTML =
        `🏆 برنده شدی! <br> +${formatNumber(reward)} سکه`;


    document.getElementById(
        "callNumberBtn"
    ).disabled = true;

}


/* ==========================================
   PROFILE
========================================== */

function showProfile() {

    const user =
        getUserData();


    if (!user) {
        return;
    }


    document.getElementById(
        "profileName"
    ).textContent =
        user.username;


    document.getElementById(
        "profileCoins"
    ).textContent =
        formatNumber(user.coins);


    document.getElementById(
        "profileModal"
    ).classList.remove(
        "hidden"
    );

}


/* ==========================================
   HISTORY
========================================== */

function showHistory() {

    const user =
        getUserData();


    if (!user) {
        return;
    }


    const list =
        document.getElementById(
            "historyList"
        );


    if (
        !user.history ||
        user.history.length === 0
    ) {

        list.innerHTML =
            "<p>هنوز سابقه‌ای نداری.</p>";

    } else {

        list.innerHTML =
            user.history
                .slice(0, 10)
                .map(
                    function (item) {

                        const sign =
                            item.type === "win"
                                ? "+"
                                : "-";


                        const icon =
                            item.type === "win"
                                ? "🏆"
                                : "🎲";


                        return `
                            <div style="
                                display:flex;
                                justify-content:space-between;
                                padding:12px 0;
                                border-bottom:1px solid #222;
                            ">
                                <span>
                                    ${icon}
                                    ${item.room}
                                </span>

                                <strong style="
                                    color:${item.type === "win"
                                        ? "#43d17c"
                                        : "#e85b5b"};
                                ">
                                    ${sign}${formatNumber(item.amount)} 🪙
                                </strong>
                            </div>
                        `;

                    }
                )
                .join("");

    }


    document.getElementById(
        "historyModal"
    ).classList.remove(
        "hidden"
    );

}


/* ==========================================
   CLOSE MODAL
========================================== */

function closeModal() {

    document
        .querySelectorAll(".modal")
        .forEach(
            function (modal) {

                modal.classList.add(
                    "hidden"
                );

            }
        );

}


/* ==========================================
   LOGOUT
========================================== */

function logoutUser() {

    localStorage.removeItem(
        "doberna_current_user"
    );


    window.location.href =
        "login.html";

}


/* ==========================================
   BALANCE
========================================== */

function updateBalanceDisplay() {

    const user =
        getUserData();


    if (!user) {
        return;
    }


    const balance =
        document.getElementById(
            "coinBalance"
        );


    if (balance) {

        balance.textContent =
            formatNumber(
                user.coins
            );

    }


    const profileCoins =
        document.getElementById(
            "profileCoins"
        );


    if (profileCoins) {

        profileCoins.textContent =
            formatNumber(
                user.coins
            );

    }

}


/* ==========================================
   UTILITIES
========================================== */

function generateUniqueNumbers(
    count,
    min,
    max
) {

    const numbers = [];


    while (
        numbers.length < count
    ) {

        const number =
            Math.floor(
                Math.random() *
                (max - min + 1)
            ) + min;


        if (
            !numbers.includes(
                number
            )
        ) {

            numbers.push(
                number
            );

        }

    }


    return numbers;

}


function formatNumber(number) {

    return Number(number)
        .toLocaleString("fa-IR");

}


function showMessage(
    element,
    text,
    type
) {

    if (!element) {
        return;
    }


    element.textContent =
        text;


    element.className =
        `form-message ${type}`;

}


function showTemporaryMessage(
    text
) {

    let toast =
        document.getElementById(
            "toastMessage"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "toastMessage";


        toast.style.position =
            "fixed";

        toast.style.bottom =
            "25px";

        toast.style.left =
            "50%";

        toast.style.transform =
            "translateX(-50%)";

        toast.style.zIndex =
            "9999";

        toast.style.padding =
            "12px 18px";

        toast.style.borderRadius =
            "14px";

        toast.style.background =
            "#222";

        toast.style.border =
            "1px solid #555";

        toast.style.color =
            "white";

        toast.style.fontSize =
            "13px";

        toast.style.boxShadow =
            "0 10px 30px rgba(0,0,0,.5)";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        text;


    clearTimeout(
        window.toastTimer
    );


    window.toastTimer =
        setTimeout(
            function () {

                toast.remove();

            },
            2500
        );

}
