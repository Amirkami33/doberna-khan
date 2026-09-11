/* =========================================================
   دبرنا خان
   Virtual Coin Demo
   ========================================================= */

const STARTING_COINS = 500;
const DAILY_REWARD = 100;

let currentGame = null;
let gameTimer = null;
let countdownTimer = null;

let speechReady = false;
let availableVoices = [];


/* =========================================================
   STORAGE
   ========================================================= */

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem("doberna_users")) || {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(
    "doberna_users",
    JSON.stringify(users)
  );
}

function getCurrentUser() {
  const username = localStorage.getItem(
    "doberna_current_user"
  );

  if (!username) return null;

  const users = getUsers();

  return users[username] || null;
}

function saveCurrentUser(user) {
  const users = getUsers();

  users[user.username] = user;

  saveUsers(users);

  localStorage.setItem(
    "doberna_current_user",
    user.username
  );
}


/* =========================================================
   PAGE START
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadVoices();

    if ("speechSynthesis" in window) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    setupRegister();
    setupLogin();

    updateUserUI();
    updateDailyRewardButton();

  }
);


/* =========================================================
   VOICE
   ========================================================= */

function loadVoices() {

  if (!("speechSynthesis" in window)) {
    return;
  }

  availableVoices =
    speechSynthesis.getVoices() || [];
}


function unlockSpeech() {

  if (!("speechSynthesis" in window)) {
    speechReady = false;
    return;
  }

  try {

    speechSynthesis.cancel();

    const unlock = new SpeechSynthesisUtterance(
      "شروع بازی"
    );

    unlock.lang = "fa-IR";
    unlock.volume = 0;
    unlock.rate = 1;

    speechSynthesis.speak(unlock);

    speechReady = true;

  } catch (error) {

    speechReady = false;

  }
}


/* =========================================================
   REGISTER
   ========================================================= */

function setupRegister() {

  const form =
    document.getElementById(
      "registerForm"
    );

  if (!form) return;

  form.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();

      const username =
        document.getElementById(
          "registerUsername"
        ).value
        .trim()
        .toLowerCase();

      const password =
        document.getElementById(
          "registerPassword"
        ).value;

      const password2 =
        document.getElementById(
          "registerPassword2"
        ).value;

      const message =
        document.getElementById(
          "registerMessage"
        );

      const users = getUsers();

      if (username.length < 3) {

        showFormMessage(
          message,
          "نام کاربری حداقل ۳ کاراکتر باشد."
        );

        return;
      }

      if (password.length < 6) {

        showFormMessage(
          message,
          "رمز عبور باید حداقل ۶ کاراکتر باشد."
        );

        return;
      }

      if (password !== password2) {

        showFormMessage(
          message,
          "تکرار رمز عبور درست نیست."
        );

        return;
      }

      if (users[username]) {

        showFormMessage(
          message,
          "این نام کاربری قبلاً ثبت شده."
        );

        return;
      }


      const user = {

        username: username,

        password: password,

        coins: STARTING_COINS,

        createdAt:
          Date.now(),

        lastDailyReward: 0

      };


      users[username] = user;

      saveUsers(users);

      localStorage.setItem(
        "doberna_current_user",
        username
      );


      showFormSuccess(
        message,
        "حساب ساخته شد! در حال ورود..."
      );


      setTimeout(
        () => {
          window.location.href =
            "index.html";
        },
        800
      );

    }
  );
}


/* =========================================================
   LOGIN
   ========================================================= */

function setupLogin() {

  const form =
    document.getElementById(
      "loginForm"
    );

  if (!form) return;

  form.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();

      const username =
        document.getElementById(
          "loginUsername"
        ).value
        .trim()
        .toLowerCase();

      const password =
        document.getElementById(
          "loginPassword"
        ).value;

      const message =
        document.getElementById(
          "loginMessage"
        );

      const users = getUsers();

      const user =
        users[username];


      if (!user) {

        showFormMessage(
          message,
          "نام کاربری یا رمز عبور اشتباه است."
        );

        return;
      }


      if (user.password !== password) {

        showFormMessage(
          message,
          "نام کاربری یا رمز عبور اشتباه است."
        );

        return;
      }


      localStorage.setItem(
        "doberna_current_user",
        username
      );


      showFormSuccess(
        message,
        "ورود موفق بود..."
      );


      setTimeout(
        () => {
          window.location.href =
            "index.html";
        },
        600
      );

    }
  );
}


/* =========================================================
   FORM MESSAGE
   ========================================================= */

function showFormMessage(
  element,
  text
) {

  if (!element) return;

  element.textContent = text;

  element.style.color =
    "#df6974";
}


function showFormSuccess(
  element,
  text
) {

  if (!element) return;

  element.textContent = text;

  element.style.color =
    "#59d597";
}


/* =========================================================
   USER UI
   ========================================================= */

function updateUserUI() {

  const user =
    getCurrentUser();

  if (!user) {

    const coin =
      document.getElementById(
        "coinBalance"
      );

    if (coin) {
      coin.textContent = "0";
    }

    return;
  }


  const coin =
    document.getElementById(
      "coinBalance"
    );

  if (coin) {

    coin.textContent =
      formatNumber(user.coins);

  }


  const profileCoins =
    document.getElementById(
      "profileCoins"
    );

  if (profileCoins) {

    profileCoins.textContent =
      formatNumber(user.coins);

  }


  const profileUsername =
    document.getElementById(
      "profileUsername"
    );

  if (profileUsername) {

    profileUsername.textContent =
      user.username;

  }
}


function formatNumber(number) {

  return Number(number || 0)
    .toLocaleString("fa-IR");

}


/* =========================================================
   DAILY REWARD
   ========================================================= */

function claimDailyReward() {

  const user =
    getCurrentUser();

  if (!user) {

    showToast(
      "ابتدا وارد حساب شو."
    );

    return;
  }


  const now = Date.now();

  const last =
    Number(
      user.lastDailyReward || 0
    );

  const oneDay =
    24 * 60 * 60 * 1000;


  if (
    last &&
    now - last < oneDay
  ) {

    const remaining =
      oneDay -
      (now - last);

    showToast(
      "پاداش امروز رو قبلاً گرفتی 🎁"
    );

    return;
  }


  user.coins += DAILY_REWARD;

  user.lastDailyReward =
    now;


  saveCurrentUser(user);

  updateUserUI();

  updateDailyRewardButton();


  showToast(
    "۱۰۰ سکه به موجودی اضافه شد 🎁"
  );
}


function updateDailyRewardButton() {

  const button =
    document.getElementById(
      "dailyRewardBtn"
    );

  if (!button) return;


  const user =
    getCurrentUser();

  if (!user) return;


  const now =
    Date.now();

  const last =
    Number(
      user.lastDailyReward || 0
    );

  const oneDay =
    24 * 60 * 60 * 1000;


  if (
    last &&
    now - last < oneDay
  ) {

    button.disabled = true;

    button.textContent =
      "دریافت شد";

  } else {

    button.disabled = false;

    button.textContent =
      "دریافت";

  }
}


/* =========================================================
   ENTER ROOM
   ========================================================= */

function enterRoom(
  fee,
  roomName
) {

  const user =
    getCurrentUser();

  if (!user) {

    showToast(
      "برای ورود به بازی ابتدا وارد حساب شو."
    );

    setTimeout(
      () => {
        window.location.href =
          "login.html";
      },
      900
    );

    return;
  }


  fee = Number(fee);


  if (user.coins < fee) {

    showToast(
      "سکه کافی نداری 🪙"
    );

    return;
  }


  user.coins -= fee;

  saveCurrentUser(user);

  updateUserUI();


  openGame(
    fee,
    roomName
  );
}


/* =========================================================
   OPEN GAME
   ========================================================= */

function openGame(
  fee,
  roomName
) {

  const modal =
    document.getElementById(
      "gameModal"
    );

  if (!modal) return;


  currentGame = {

    fee: Number(fee),

    roomName:
      roomName || "اتاق بازی",

    numbers: [],

    calledNumbers: new Set(),

    card: [],

    gameStarted: false,

    gameOver: false,

    win: false

  };


  const room =
    document.getElementById(
      "gameRoomName"
    );

  if (room) {
    room.textContent =
      currentGame.roomName;
  }


  const number =
    document.getElementById(
      "calledNumber"
    );

  if (number) {
    number.textContent =
      "--";
  }


  const status =
    document.getElementById(
      "spokenStatus"
    );

  if (status) {

    status.textContent =
      "آماده شروع...";

  }


  const message =
    document.getElementById(
      "gameMessage"
    );

  if (message) {

    message.textContent =
      "";

    message.className =
      "game-message";

  }


  const startButton =
    document.getElementById(
      "startGameBtn"
    );

  if (startButton) {

    startButton.style.display =
      "block";

    startButton.textContent =
      "شروع بازی";

  }


  createBingoCard();

  modal.classList.remove(
    "hidden"
  );
}


/* =========================================================
   BINGO CARD
   ========================================================= */

function createBingoCard() {

  const container =
    document.getElementById(
      "bingoCard"
    );

  if (!container) return;


  container.innerHTML = "";


  const numbers =
    generateUniqueNumbers(24);


  currentGame.card =
    numbers.slice();


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
          "div"
        );

      cell.className =
        "bingo-cell";


      if (
        row === 2 &&
        col === 2
      ) {

        cell.classList.add(
          "free",
          "marked"
        );

        cell.textContent =
          "★";

        cell.dataset.free =
          "true";

      } else {

        const value =
          numbers[index++];

        cell.textContent =
          value.toLocaleString(
            "fa-IR"
          );

        cell.dataset.number =
          value;

      }


      container.appendChild(
        cell
      );

    }

  }
}


/* =========================================================
   RANDOM NUMBERS
   ========================================================= */

function generateUniqueNumbers(
  count
) {

  const result = [];

  while (
    result.length < count
  ) {

    const number =
      Math.floor(
        Math.random() * 99
      ) + 1;

    if (
      !result.includes(number)
    ) {

      result.push(number);

    }

  }

  return result;
}


function generateCallNumbers() {

  const numbers = [];

  for (
    let i = 1;
    i <= 99;
    i++
  ) {

    numbers.push(i);

  }


  for (
    let i = numbers.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() *
        (i + 1)
      );

    [
      numbers[i],
      numbers[j]
    ] = [
      numbers[j],
      numbers[i]
    ];

  }


  return numbers;
}


/* =========================================================
   START AUTOMATIC GAME
   ========================================================= */

function startAutomaticGame() {

  if (!currentGame) {
    return;
  }


  if (
    currentGame.gameStarted
  ) {
    return;
  }


  currentGame.gameStarted =
    true;

  currentGame.gameOver =
    false;


  const button =
    document.getElementById(
      "startGameBtn"
    );

  if (button) {

    button.style.display =
      "none";

  }


  unlockSpeech();


  currentGame.numbers =
    generateCallNumbers();


  currentGame.calledNumbers =
    new Set();


  setGameStatus(
    "بازی شروع شد..."
  );


  startCountdown();

}


/* =========================================================
   COUNTDOWN
   ========================================================= */

function startCountdown() {

  const countdown =
    document.getElementById(
      "countdown"
    );

  if (!countdown) {

    callNextNumber();

    return;
  }


  let value = 3;


  countdown.textContent =
    toPersianDigits(value);


  countdownTimer =
    setInterval(
      () => {

        value--;


        if (value <= 0) {

          clearInterval(
            countdownTimer
          );

          countdown.textContent =
            "";

          callNextNumber();

          return;
        }


        countdown.textContent =
          toPersianDigits(value);

      },
      1000
    );

}


/* =========================================================
   CALL NEXT NUMBER
   ========================================================= */

function callNextNumber() {

  if (!currentGame) {
    return;
  }


  if (
    currentGame.gameOver
  ) {
    return;
  }


  if (
    currentGame.numbers.length === 0
  ) {

    finishNoWinner();

    return;
  }


  const number =
    currentGame.numbers.shift();


  currentGame.calledNumbers.add(
    number
  );


  displayCalledNumber(
    number
  );


  markNumber(
    number
  );


  speakNumber(
    number
  );


  if (
    checkHorizontalWin()
  ) {

    setTimeout(
      () => {
        winGame();
      },
      700
    );

    return;
  }


  gameTimer =
    setTimeout(
      () => {

        callNextNumber();

      },
      2300
    );

}


/* =========================================================
   DISPLAY NUMBER
   ========================================================= */

function displayCalledNumber(
  number
) {

  const element =
    document.getElementById(
      "calledNumber"
    );

  if (element) {

    element.textContent =
      number.toLocaleString(
        "fa-IR"
      );

  }

}


/* =========================================================
   MARK NUMBER
   ========================================================= */

function markNumber(
  number
) {

  const cells =
    document.querySelectorAll(
      ".bingo-cell"
    );


  cells.forEach(
    cell => {

      const value =
        Number(
          cell.dataset.number
        );


      if (
        value === number
      ) {

        cell.classList.add(
          "marked"
        );

      }

    }
  );

}


/* =========================================================
   HORIZONTAL WIN
   ========================================================= */

function checkHorizontalWin() {

  const cells =
    document.querySelectorAll(
      ".bingo-cell"
    );


  if (
    cells.length !== 25
  ) {

    return false;

  }


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
        !cell.classList.contains(
          "marked"
        )
      ) {

        complete = false;

        break;

      }

    }


    if (complete) {

      for (
        let col = 0;
        col < 5;
        col++
      ) {

        const index =
          row * 5 + col;

        cells[index]
          .classList.add(
            "winner"
          );

      }


      return true;

    }

  }


  return false;

}


/* =========================================================
   WIN
   ========================================================= */

function winGame() {

  if (!currentGame) {
    return;
  }


  if (
    currentGame.gameOver
  ) {
    return;
  }


  currentGame.gameOver =
    true;

  currentGame.win =
    true;


  clearGameTimers();


  const reward =
    currentGame.fee * 2;


  const user =
    getCurrentUser();


  if (user) {

    user.coins += reward;

    saveCurrentUser(user);

    updateUserUI();

  }


  setGameStatus(
    `🎉 برنده شدی! ${formatNumber(reward)} سکه جایزه گرفتی.`,
    true
  );


  const status =
    document.getElementById(
      "spokenStatus"
    );

  if (status) {

    status.textContent =
      "برنده شدی 👑";

  }


  speakText(
    "تبریک میگم، شما برنده شدید"
  );

}


/* =========================================================
   NO WINNER
   ========================================================= */

function finishNoWinner() {

  if (!currentGame) {
    return;
  }


  currentGame.gameOver =
    true;


  setGameStatus(
    "تمام عددها اعلام شد، برنده‌ای پیدا نشد."
  );

}


/* =========================================================
   SPEECH
   ========================================================= */

function speakNumber(
  number
) {

  const text =
    `عدد ${persianNumber(number)}`;


  setGameStatus(
    `در حال اعلام ${number.toLocaleString("fa-IR")}`
  );


  speakText(
    text
  );

}


function speakText(
  text
) {

  if (
    !("speechSynthesis" in window)
  ) {

    setSpeechStatus(
      "اعلام صوتی در این مرورگر فعال نیست"
    );

    return;

  }


  try {

    speechSynthesis.cancel();


    const utterance =
      new SpeechSynthesisUtterance(
        text
      );


    utterance.lang =
      "fa-IR";

    utterance.rate =
      0.85;

    utterance.pitch =
      1;

    utterance.volume =
      1;


    const faVoice =
      availableVoices.find(
        voice =>
          voice.lang &&
          voice.lang
            .toLowerCase()
            .startsWith("fa")
      );


    if (faVoice) {

      utterance.voice =
        faVoice;

    }


    utterance.onstart =
      () => {

        setSpeechStatus(
          "🔊 در حال خواندن عدد..."
        );

      };


    utterance.onend =
      () => {

        setSpeechStatus(
          "منتظر عدد بعدی..."
        );

      };


    utterance.onerror =
      () => {

        setSpeechStatus(
          "عدد اعلام شد"
        );

      };


    speechSynthesis.speak(
      utterance
    );

  } catch (error) {

    setSpeechStatus(
      "عدد اعلام شد"
    );

  }

}


/* =========================================================
   PERSIAN NUMBERS
   ========================================================= */

function persianNumber(
  number
) {

  const ones = [

    "",
    "یک",
    "دو",
    "سه",
    "چهار",
    "پنج",
    "شش",
    "هفت",
    "هشت",
    "نه"

  ];


  const teens = [

    "ده",
    "یازده",
    "دوازده",
    "سیزده",
    "چهارده",
    "پانزده",
    "شانزده",
    "هفده",
    "هجده",
    "نوزده"

  ];


  const tens = [

    "",
    "",
    "بیست",
    "سی",
    "چهل",
    "پنجاه",
    "شصت",
    "هفتاد",
    "هشتاد",
    "نود"

  ];


  number =
    Number(number);


  if (number < 10) {

    return ones[number];

  }


  if (number < 20) {

    return teens[number - 10];

  }


  const ten =
    Math.floor(
      number / 10
    );

  const one =
    number % 10;


  if (one === 0) {

    return tens[ten];

  }


  return (
    tens[ten] +
    " و " +
    ones[one]
  );

}


/* =========================================================
   PERSIAN DIGITS
   ========================================================= */

function toPersianDigits(
  value
) {

  return String(value)
    .replace(
      /\d/g,
      digit =>
        "۰۱۲۳۴۵۶۷۸۹"[
          digit
        ]
    );

}


/* =========================================================
   GAME STATUS
   ========================================================= */

function setGameStatus(
  text,
  success = false
) {

  const element =
    document.getElementById(
      "gameMessage"
    );

  if (!element) return;


  element.textContent =
    text;


  element.className =
    success
      ? "game-message success"
      : "game-message";

}


function setSpeechStatus(
  text
) {

  const element =
    document.getElementById(
      "spokenStatus"
    );

  if (element) {

    element.textContent =
      text;

  }

}


/* =========================================================
   CLOSE GAME
   ========================================================= */

function closeGame() {

  clearGameTimers();


  if (
    "speechSynthesis" in window
  ) {

    speechSynthesis.cancel();

  }


  const modal =
    document.getElementById(
      "gameModal"
    );


  if (modal) {

    modal.classList.add(
      "hidden"
    );

  }


  currentGame =
    null;

}


/* =========================================================
   CLEAR TIMERS
   ========================================================= */

function clearGameTimers() {

  if (gameTimer) {

    clearTimeout(
      gameTimer
    );

    gameTimer = null;

  }


  if (countdownTimer) {

    clearInterval(
      countdownTimer
    );

    countdownTimer = null;

  }

}


/* =========================================================
   PROFILE
   ========================================================= */

function openProfile() {

  const modal =
    document.getElementById(
      "profileModal"
    );

  if (!modal) return;


  updateUserUI();

  modal.classList.remove(
    "hidden"
  );

}


function closeProfile() {

  const modal =
    document.getElementById(
      "profileModal"
    );

  if (modal) {

    modal.classList.add(
      "hidden"
    );

  }

}


/* =========================================================
   LOGOUT
   ========================================================= */

function logout() {

  closeProfile();

  localStorage.removeItem(
    "doberna_current_user"
  );


  showToast(
    "از حساب خارج شدی."
  );


  setTimeout(
    () => {

      window.location.href =
        "login.html";

    },
    700
  );

}


/* =========================================================
   HOME
   ========================================================= */

function showHome() {

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer = null;


function showToast(
  message
) {

  const toast =
    document.getElementById(
      "toast"
    );

  if (!toast) return;


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  if (toastTimer) {

    clearTimeout(
      toastTimer
    );

  }


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2500
    );

}


/* =========================================================
   ESC KEY
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closeProfile();
      closeGame();

    }

  }
);
