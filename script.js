let selectedCategory = "";
let uploadedImage = null;


/* =========================
   QUESTIONS
========================= */

const questionsByCategory = {

    Clothing: [
        {
            question: "When did you last wear this?",
            answers: [
                { text: "Within the last week", score: 3 },
                { text: "Within the last month", score: 2 },
                { text: "1–6 months ago", score: 1 },
                { text: "6–12 months ago", score: -1 },
                { text: "More than a year ago", score: -3 },
                { text: "I don't remember", score: -2 }
            ]
        },

        {
            question: "Do you own something similar?",
            answers: [
                { text: "No", score: 2 },
                { text: "Yes, one similar item", score: -1 },
                { text: "Yes, several similar items", score: -3 }
            ]
        },

        {
            question: "Would you buy it again today?",
            answers: [
                { text: "Definitely", score: 3 },
                { text: "Probably", score: 2 },
                { text: "I'm not sure", score: 0 },
                { text: "Probably not", score: -2 },
                { text: "Definitely not", score: -3 }
            ]
        },

        {
            question: "How much sentimental value does it have?",
            answers: [
                { text: "A lot", score: 3 },
                { text: "Some", score: 1 },
                { text: "Very little", score: 0 },
                { text: "None", score: -1 }
            ]
        }
    ],


    Electronics: [
        {
            question: "When did you last use it?",
            answers: [
                { text: "Within the last week", score: 3 },
                { text: "Within the last month", score: 2 },
                { text: "1–6 months ago", score: 1 },
                { text: "6–12 months ago", score: -1 },
                { text: "More than a year ago", score: -3 }
            ]
        },

        {
            question: "Do you own a newer alternative?",
            answers: [
                { text: "No", score: 2 },
                { text: "Yes, but I still use this one", score: 1 },
                { text: "Yes, and I almost never use this", score: -3 }
            ]
        },

        {
            question: "Does it still work properly?",
            answers: [
                { text: "Yes, perfectly", score: 2 },
                { text: "Mostly", score: 1 },
                { text: "It has some problems", score: -1 },
                { text: "No", score: -3 }
            ]
        },

        {
            question: "Would you buy it again today?",
            answers: [
                { text: "Definitely", score: 3 },
                { text: "Probably", score: 2 },
                { text: "I'm not sure", score: 0 },
                { text: "Probably not", score: -2 },
                { text: "Definitely not", score: -3 }
            ]
        }
    ],


 Books: [
    {
        question: "When did you last read this?",
        answers: [
            { text: "Within the last week", score: 1 },
            { text: "Within the last month", score: 1 },
            { text: "1–6 months ago", score: 0 },
            { text: "6–12 months ago", score: -1 },
            { text: "More than a year ago", score: -2 },
            { text: "I don't remember", score: -1 }
        ],
        weight: 1
    },

    {
        question: "Why did you last read this?",
        answers: [
            { text: "I genuinely wanted to", score: 2 },
            { text: "For school", score: -1 },
            { text: "For work", score: -1 },
            { text: "Someone recommended it", score: 1 },
            { text: "I had to", score: -2 },
            { text: "Other", score: 0 }
        ],
        weight: 2
    },

    {
        question: "Would you choose to read it again?",
        answers: [
            { text: "Definitely", score: 3 },
            { text: "Probably", score: 2 },
            { text: "I'm not sure", score: 0 },
            { text: "Probably not", score: -2 },
            { text: "Definitely not", score: -3 }
        ],
        weight: 3
    },

    {
        question: "Do you realistically expect to read it again within the next 2 years?",
        answers: [
            { text: "Definitely", score: 3 },
            { text: "Probably", score: 2 },
            { text: "I'm not sure", score: 0 },
            { text: "Probably not", score: -2 },
            { text: "Definitely not", score: -3 }
        ],
        weight: 3
    },

    {
        question: "Does this book have sentimental or personal value to you?",
        answers: [
            { text: "A lot", score: 3 },
            { text: "Some", score: 1 },
            { text: "Very little", score: 0 },
            { text: "None", score: -2 }
        ],
        weight: 2
    }
],

    Beauty: [
        {
            question: "When did you last use it?",
            answers: [
                { text: "Within the last week", score: 3 },
                { text: "Within the last month", score: 2 },
                { text: "1–6 months ago", score: 0 },
                { text: "More than 6 months ago", score: -2 }
            ]
        },

        {
            question: "Do you own a similar product?",
            answers: [
                { text: "No", score: 2 },
                { text: "Yes, one", score: -1 },
                { text: "Yes, several", score: -3 }
            ]
        },

        {
            question: "Would you buy it again?",
            answers: [
                { text: "Definitely", score: 3 },
                { text: "Probably", score: 2 },
                { text: "I'm not sure", score: 0 },
                { text: "Probably not", score: -2 },
                { text: "Definitely not", score: -3 }
            ]
        },

        {
            question: "Is there anything preventing you from using it?",
            answers: [
                { text: "No", score: 2 },
                { text: "A small issue", score: 0 },
                { text: "Yes, a major issue", score: -2 }
            ]
        }
    ],


    Home: [
        {
            question: "How often do you use it?",
            answers: [
                { text: "Every day", score: 3 },
                { text: "Every week", score: 2 },
                { text: "Every few months", score: 0 },
                { text: "Almost never", score: -2 },
                { text: "Never", score: -3 }
            ]
        },

        {
            question: "Do you own something that serves the same purpose?",
            answers: [
                { text: "No", score: 2 },
                { text: "Yes, one", score: -1 },
                { text: "Yes, several", score: -3 }
            ]
        },

        {
            question: "Would you buy it again today?",
            answers: [
                { text: "Definitely", score: 3 },
                { text: "Probably", score: 2 },
                { text: "I'm not sure", score: 0 },
                { text: "Probably not", score: -2 },
                { text: "Definitely not", score: -3 }
            ]
        },

        {
            question: "Does it have sentimental value?",
            answers: [
                { text: "A lot", score: 3 },
                { text: "Some", score: 1 },
                { text: "Very little", score: 0 },
                { text: "None", score: -1 }
            ]
        }
    ],


    Hobby: [
        {
            question: "When did you last use it?",
            answers: [
                { text: "Within the last week", score: 3 },
                { text: "Within the last month", score: 2 },
                { text: "1–6 months ago", score: 1 },
                { text: "6–12 months ago", score: -1 },
                { text: "More than a year ago", score: -3 }
            ]
        },

        {
            question: "Are you still interested in this hobby?",
            answers: [
                { text: "Very much", score: 3 },
                { text: "Yes, somewhat", score: 1 },
                { text: "I'm not sure", score: 0 },
                { text: "Not really", score: -2 },
                { text: "No", score: -3 }
            ]
        },

        {
            question: "Do you own similar equipment?",
            answers: [
                { text: "No", score: 2 },
                { text: "Yes, one", score: -1 },
                { text: "Yes, several", score: -3 }
            ]
        },

        {
            question: "Do you realistically expect to use it again?",
            answers: [
                { text: "Definitely", score: 3 },
                { text: "Probably", score: 2 },
                { text: "I'm not sure", score: 0 },
                { text: "Probably not", score: -2 },
                { text: "Definitely not", score: -3 }
            ]
        }
    ]
};


/* =========================
   START APP
========================= */

function startApp() {

    document.getElementById("landing").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    showStep(1);
}


/* =========================
   IMAGE UPLOAD
========================= */

function previewImage(event) {

    const file = event.target.files[0];

    if (!file) return;

    uploadedImage = file;

    const preview = document.getElementById("imagePreview");
    const content = document.getElementById("uploadContent");

    preview.src = URL.createObjectURL(file);

    preview.classList.remove("hidden");
    content.classList.add("hidden");

    document.getElementById("imageContinue").disabled = false;
}


/* =========================
   STEP NAVIGATION
========================= */

function nextStep(step) {

    showStep(step);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function showStep(step) {

    document.querySelectorAll(".app-step").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(`step${step}`).classList.remove("hidden");

    document.getElementById("progress").style.width =
        `${step * 25}%`;

    document.getElementById("step-label").textContent =
        `Step ${step} of 4`;
}


/* =========================
   CATEGORY
========================= */

function selectCategory(button, category) {

    document
        .querySelectorAll(".category-grid button")
        .forEach(btn => btn.classList.remove("selected"));

    button.classList.add("selected");

    selectedCategory = category;

    document.getElementById("categoryContinue").disabled = false;
}


/* =========================
   GENERATE QUESTIONS
========================= */

function generateQuestions() {

    const container = document.getElementById("questions");

    container.innerHTML = "";

    const questions =
        questionsByCategory[selectedCategory];

    questions.forEach((question, index) => {

        const wrapper = document.createElement("div");

        wrapper.className = "question";

        let options = `
            <option value="">
                Choose an answer
            </option>
        `;

        question.answers.forEach((answer, answerIndex) => {

            options += `
                <option value="${answer.score}">
                    ${answer.text}
                </option>
            `;

        });

        wrapper.innerHTML = `
            <label>${question.question}</label>

            <select class="answer">
                ${options}
            </select>
        `;

        container.appendChild(wrapper);
    });

    nextStep(3);
}


/* =========================
   ANALYZE
========================= */

function analyzeItem() {

    const selects =
        document.querySelectorAll(".answer");

    let totalScore = 0;
    let answeredQuestions = 0;

    selects.forEach(select => {

        if (select.value !== "") {

            totalScore += Number(select.value);
            answeredQuestions++;

        }
    });


    /*
        If the user didn't answer everything,
        don't generate a result yet.
    */

    if (answeredQuestions < selects.length) {

        alert(
            "Please answer all questions before continuing."
        );

        return;
    }


    /*
        Calculate average score.

        Maximum possible score = 3
        Minimum possible score = -3
    */

    const averageScore =
        totalScore / selects.length;


    let recommendation;
    let reasoning;
    let icon;


    /* =========================
       DECISION ENGINE
    ========================= */

    if (averageScore >= 1.5) {

        recommendation = "KEEP";
        icon = "✓";

        reasoning =
            "You use this item regularly, see value in keeping it, " +
            "and don't have strong reasons to replace or remove it.";

    }

    else if (averageScore >= 0.3) {

        recommendation = "KEEP";
        icon = "✓";

        reasoning =
            "There are good reasons to keep this item, although " +
            "it may not be something you use constantly.";

    }

    else if (averageScore >= -0.7) {

        recommendation = "STORE";
        icon = "□";

        reasoning =
            "Your answers are mixed. You don't seem ready to let " +
            "this item go, but you also don't use it enough to justify " +
            "keeping it immediately accessible.";

    }

    else if (averageScore >= -1.7) {

        recommendation = "DONATE";
        icon = "♡";

        reasoning =
            "Your answers suggest that you don't use this item often " +
            "and don't see enough personal value in keeping it.";

    }

    else {

        recommendation = "SELL";
        icon = "↗";

        reasoning =
            "You rarely use this item, have limited attachment to it, " +
            "and don't see yourself choosing it again. If it has resale " +
            "value, selling it could be the best option.";

    }


    /*
        Confidence based on how strongly
        the answers point in one direction.
    */

    let confidence =
        Math.round(
            60 + Math.min(Math.abs(averageScore) / 3 * 35, 35)
        );


    /*
        Update UI
    */

    document.getElementById("recommendation").textContent =
        recommendation;

    document.getElementById("confidence").textContent =
        `${confidence}%`;

    document.getElementById("reasoningText").textContent =
        reasoning;

    document.getElementById("resultIcon").textContent =
        icon;


    showStep(4);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================
   NEW ITEM
========================= */

function newItem() {

    uploadedImage = null;
    selectedCategory = "";

    document.getElementById("imageInput").value = "";

    document
        .getElementById("imagePreview")
        .classList.add("hidden");

    document
        .getElementById("uploadContent")
        .classList.remove("hidden");

    document
        .getElementById("imageContinue")
        .disabled = true;

    document
        .querySelectorAll(".category-grid button")
        .forEach(btn => btn.classList.remove("selected"));

    document
        .getElementById("categoryContinue")
        .disabled = true;

    showStep(1);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================
   SAVE
========================= */

function saveItem() {

    alert(
        "Saved! Your personal inventory will be available in a future version."
    );
}
