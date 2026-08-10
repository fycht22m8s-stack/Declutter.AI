let selectedCategory = "";
let selectedRole = "";
let uploadedImage = null;
let currentQuestions = [];


/* =========================================================
   DECLUTTER.AI — QUESTION ENGINE v0.5
========================================================= */


/* =========================================================
   CATEGORY → ROLE
========================================================= */

const rolesByCategory = {

    Clothing: [
        "Everyday",
        "Special occasion",
        "Work / school",
        "Sports",
        "Seasonal",
        "Sentimental",
        "Other"
    ],

    Books: [
        "School / work",
        "Entertainment",
        "Reference",
        "Hobby / learning",
        "Planned reading",
        "Sentimental",
        "Other"
    ],

    Electronics: [
        "Daily use",
        "Occasional use",
        "Backup",
        "Work / school",
        "Hobby",
        "Sentimental",
        "Other"
    ],

    Beauty: [
        "Everyday",
        "Occasional",
        "Special occasion",
        "Experimental",
        "Backup",
        "Other"
    ],

    Home: [
        "Daily necessity",
        "Occasional use",
        "Decoration",
        "Storage / organization",
        "Seasonal",
        "Sentimental",
        "Other"
    ],

    Hobby: [
        "Active hobby",
        "Occasional hobby",
        "Former hobby",
        "Collection",
        "Creative project",
        "Other"
    ]
};


/* =========================================================
   QUESTION ENGINE
========================================================= */

const questionEngine = {

    /* =====================================================
       CLOTHING
    ===================================================== */

    Clothing: {

        "Everyday": [

            {
                question: "How often do you realistically wear this?",
                weight: 2,
                answers: [
                    ["Almost every day", 3],
                    ["Every week", 2],
                    ["Every few weeks", 1],
                    ["Rarely", -1],
                    ["Almost never", -2]
                ]
            },

            {
                question: "When you have other options, would you choose this?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Usually", 2],
                    ["Sometimes", 0],
                    ["Rarely", -2],
                    ["Never", -3]
                ]
            },

            {
                question: "How do you feel when you wear it?",
                weight: 2,
                answers: [
                    ["I love wearing it", 3],
                    ["I like wearing it", 2],
                    ["Neutral", 0],
                    ["I don't really like it", -2],
                    ["I actively avoid it", -3]
                ]
            },

            {
                question: "Does something else already fill the same role?",
                weight: 2,
                answers: [
                    ["No", 2],
                    ["Yes, but this is different", 1],
                    ["Yes, very similarly", -1],
                    ["Yes, and I prefer the alternative", -2]
                ]
            },

            {
                question: "If you didn't own this, would you want something similar?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["Definitely not", -3]
                ]
            }
        ],


        "Special occasion": [

            {
                question: "How often do you realistically have occasions where this could be useful?",
                weight: 3,
                answers: [
                    ["Several times a year", 3],
                    ["About once a year", 2],
                    ["Every few years", 1],
                    ["Very rarely", -1],
                    ["Almost never", -2]
                ]
            },

            {
                question: "Do you realistically expect to need something like this again?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["Definitely not", -3]
                ]
            },

            {
                question: "If that occasion happened, would you choose this?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["Definitely not", -3]
                ]
            },

            {
                question: "Do you have a realistic alternative for the same occasion?",
                weight: 2,
                answers: [
                    ["No", 2],
                    ["Yes, but I prefer this", 1],
                    ["Yes, equally good", -1],
                    ["Yes, and I prefer the alternative", -2]
                ]
            },

            {
                question: "Would you regret not having this when you eventually needed it?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["Maybe", 0],
                    ["Probably not", -2],
                    ["Not at all", -3]
                ]
            }
        ],


        "Work / school": [

            {
                question: "Does this still fit your current work or school life?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Mostly", 2],
                    ["I'm not sure", 0],
                    ["Not really", -2],
                    ["No", -3]
                ]
            },

            {
                question: "How often do you realistically need clothing like this?",
                weight: 2,
                answers: [
                    ["Very often", 3],
                    ["Regularly", 2],
                    ["Sometimes", 1],
                    ["Rarely", -1],
                    ["Almost never", -2]
                ]
            },

            {
                question: "Would you choose this over your alternatives?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["Sometimes", 0],
                    ["Probably not", -2],
                    ["Definitely not", -3]
                ]
            },

            {
                question: "Would you replace this if it disappeared?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["No", -3]
                ]
            }
        ],


        "Sports": [

            {
                question: "Are you still actively involved in the activity this is for?",
                weight: 3,
                answers: [
                    ["Yes, regularly", 3],
                    ["Yes, occasionally", 2],
                    ["I'm not sure", 0],
                    ["Not really", -2],
                    ["No", -3]
                ]
            },

            {
                question: "How often do you realistically use this?",
                weight: 2,
                answers: [
                    ["Every week", 3],
                    ["Every month", 2],
                    ["Every few months", 1],
                    ["Rarely", -1],
                    ["Never", -2]
                ]
            },

            {
                question: "Would you choose this over your alternatives?",
                weight: 2,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["Sometimes", 0],
                    ["Probably not", -2],
                    ["Never", -3]
                ]
            },

            {
                question: "Would you need to replace this if you wanted to continue the activity?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["Maybe", 0],
                    ["Probably not", -2],
                    ["No", -3]
                ]
            }
        ],


        "Seasonal": [

            {
                question: "Is this still appropriate for the seasons or conditions you expect to use it in?",
                weight: 2,
                answers: [
                    ["Definitely", 3],
                    ["Mostly", 2],
                    ["I'm not sure", 0],
                    ["Not really", -2],
                    ["No", -3]
                ]
            },

            {
                question: "How often does the season or situation actually occur for you?",
                weight: 2,
                answers: [
                    ["Very often", 3],
                    ["Regularly", 2],
                    ["Sometimes", 1],
                    ["Rarely", -1],
                    ["Almost never", -2]
                ]
            },

            {
                question: "Would you want this available when that season arrives?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["Definitely not", -3]
                ]
            },

            {
                question: "Do you already have a better alternative?",
                weight: 2,
                answers: [
                    ["No", 2],
                    ["Yes, but I prefer this", 1],
                    ["Yes, equally good", -1],
                    ["Yes, better", -2]
                ]
            }
        ],


        "Sentimental": [

            {
                question: "How emotionally connected are you to this item?",
                weight: 4,
                answers: [
                    ["Very connected", 3],
                    ["Quite connected", 2],
                    ["A little", 1],
                    ["Not much", -1],
                    ["Not at all", -3]
                ]
            },

            {
                question: "Would you be genuinely upset if this disappeared?",
                weight: 4,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["Maybe", 0],
                    ["Probably not", -2],
                    ["Not at all", -3]
                ]
            },

            {
                question: "Does this remind you of a person, place or period of your life?",
                weight: 3,
                answers: [
                    ["Very strongly", 3],
                    ["Somewhat", 2],
                    ["A little", 1],
                    ["Not really", 0],
                    ["No", -2]
                ]
            },

            {
                question: "Would you choose to keep the memory even without the physical item?",
                weight: 2,
                answers: [
                    ["Yes, but I still want the item", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -1],
                    ["No, the physical item is what matters", 2]
                ]
            }
        ],


        "Other": [

            {
                question: "Does this still serve a meaningful purpose in your life?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["Not at all", -3]
                ]
            },

            {
                question: "If you didn't already own this, would you choose to have something like it?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["Definitely not", -3]
                ]
            },

            {
                question: "Would you notice if this disappeared tomorrow?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["Not at all", -3]
                ]
            }
        ]
    },


    /* =====================================================
       BOOKS
    ===================================================== */

    Books: {

        "School / work": [

            {
                question: "Do you still realistically need this for school or work?",
                weight: 4,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["No", -3]
                ]
            },

            {
                question: "If you needed the information again, would you use this book?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["Maybe", 0],
                    ["Probably not", -2],
                    ["Definitely not", -3]
                ]
            },

            {
                question: "Would you choose to read this again if nobody required you to?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["Definitely not", -3]
                ]
            },

            {
                question: "Could you easily access the same information somewhere else?",
                weight: 2,
                answers: [
                    ["No", 2],
                    ["Maybe", 0],
                    ["Yes", -2]
                ]
            },

            {
                question: "Would you notice if this disappeared?",
                weight: 2,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["Not at all", -3]
                ]
            }
        ],


        "Entertainment": [

            {
                question: "Do you genuinely enjoy reading this?",
                weight: 3,
                answers: [
                    ["A lot", 3],
                    ["Yes", 2],
                    ["Sometimes", 0],
                    ["Not really", -2],
                    ["No", -3]
                ]
            },

            {
                question: "Would you choose to read it again?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["Maybe", 0],
                    ["Probably not", -2],
                    ["Definitely not", -3]
                ]
            },

            {
                question: "If it disappeared, would you want to replace it?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["No", -3]
                ]
            },

            {
                question: "Do you prefer having a physical copy?",
                weight: 2,
                answers: [
                    ["Definitely", 3],
                    ["Yes", 2],
                    ["I don't care", 0],
                    ["Probably not", -1],
                    ["No", -2]
                ]
            }
        ],


        "Reference": [

            {
                question: "Do you still expect to need the information in this?",
                weight: 4,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["No", -3]
                ]
            },

            {
                question: "Would you actually use this as a reference instead of looking elsewhere?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["Maybe", 0],
                    ["Probably not", -2],
                    ["No", -3]
                ]
            },

            {
                question: "Is the information still current and useful?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Mostly", 2],
                    ["I'm not sure", 0],
                    ["Not really", -2],
                    ["No", -3]
                ]
            },

            {
                question: "Would you notice if this disappeared?",
                weight: 2,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["Not at all", -3]
                ]
            }
        ],


        "Hobby / learning": [

            {
                question: "Are you still genuinely interested in this subject?",
                weight: 4,
                answers: [
                    ["Very much", 3],
                    ["Yes", 2],
                    ["Somewhat", 1],
                    ["Not really", -2],
                    ["No", -3]
                ]
            },

            {
                question: "Do you realistically expect to return to this book?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["Definitely not", -3]
                ]
            },

            {
                question: "If you didn't own it, would you want to get it now?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["Definitely not", -3]
                ]
            },

            {
                question: "Would you regret not having access to it?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["Maybe", 0],
                    ["Probably not", -2],
                    ["Not at all", -3]
                ]
            }
        ],


        "Planned reading": [

            {
                question: "Do you genuinely still want to read this?",
                weight: 4,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["No", -3]
                ]
            },

            {
                question: "When do you realistically expect to read it?",
                weight: 3,
                answers: [
                    ["Very soon", 3],
                    ["Within a few months", 2],
                    ["Sometime this year", 1],
                    ["I have no real plan", -1],
                    ["Probably never", -3]
                ]
            },

            {
                question: "If you didn't already own it, would you still want to read it?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["Definitely not", -3]
                ]
            },

            {
                question: "Would you regret losing the opportunity to read this?",
                weight: 2,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["Maybe", 0],
                    ["Probably not", -2],
                    ["Not at all", -3]
                ]
            }
        ],


        "Sentimental": [

            {
                question: "How emotionally connected are you to this book?",
                weight: 4,
                answers: [
                    ["Very connected", 3],
                    ["Quite connected", 2],
                    ["A little", 1],
                    ["Not much", -1],
                    ["Not at all", -3]
                ]
            },

            {
                question: "Would you be genuinely upset if it disappeared?",
                weight: 4,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["Maybe", 0],
                    ["Probably not", -2],
                    ["Not at all", -3]
                ]
            },

            {
                question: "Does it represent an important person, memory or period of your life?",
                weight: 3,
                answers: [
                    ["Very strongly", 3],
                    ["Yes", 2],
                    ["A little", 1],
                    ["Not really", 0],
                    ["No", -2]
                ]
            }
        ],


        "Other": [

            {
                question: "Does this book still have a meaningful role in your life?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["No", -3]
                ]
            },

            {
                question: "If it disappeared tomorrow, would you want to replace it?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["Definitely not", -3]
                ]
            },

            {
                question: "Would you choose to own it again today?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["Definitely not", -3]
                ]
            }
        ]
    }

};


/* =========================================================
   START APP
========================================================= */

function startApp() {

    document.getElementById("landing").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    showStep(1);
}


/* =========================================================
   IMAGE
========================================================= */

function previewImage(event) {

    const file = event.target.files[0];

    if (!file) return;

    uploadedImage = file;

    const preview =
        document.getElementById("imagePreview");

    const content =
        document.getElementById("uploadContent");

    if (preview) {
        preview.src = URL.createObjectURL(file);
        preview.classList.remove("hidden");
    }

    if (content) {
        content.classList.add("hidden");
    }

    const button =
        document.getElementById("imageContinue");

    if (button) {
        button.disabled = false;
    }
}


/* =========================================================
   STEPS
========================================================= */

function showStep(step) {

    document
        .querySelectorAll(".app-step")
        .forEach(section =>
            section.classList.add("hidden")
        );

    const target =
        document.getElementById(`step${step}`);

    if (target) {
        target.classList.remove("hidden");
    }

    const progress =
        document.getElementById("progress");

    if (progress) {
        progress.style.width =
            `${step * 25}%`;
    }

    const label =
        document.getElementById("step-label");

    if (label) {
        label.textContent =
            `Step ${step} of 4`;
    }
}


function nextStep(step) {

    showStep(step);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   CATEGORY
========================================================= */

function selectCategory(button, category) {

    document
        .querySelectorAll(".category-grid button")
        .forEach(btn =>
            btn.classList.remove("selected")
        );

    button.classList.add("selected");

    selectedCategory = category;

    const continueButton =
        document.getElementById("categoryContinue");

    if (continueButton) {
        continueButton.disabled = false;
    }
}


/* =========================================================
   ROLE SCREEN
========================================================= */

function generateRoles() {

    const container =
        document.getElementById("roles");

    if (!container) {
        console.error(
            "Missing #roles element in HTML."
        );
        return;
    }

    container.innerHTML = "";

    const roles =
        rolesByCategory[selectedCategory];

    if (!roles) {
        console.error(
            "No roles found for:",
            selectedCategory
        );
        return;
    }

    roles.forEach(role => {

        const button =
            document.createElement("button");

        button.textContent = role;

        button.className =
            "role-button";

        button.onclick = () =>
            selectRole(button, role);

        container.appendChild(button);
    });

    showStep(3);
}


function selectRole(button, role) {

    document
        .querySelectorAll(".role-button")
        .forEach(btn =>
            btn.classList.remove("selected")
        );

    button.classList.add("selected");

    selectedRole = role;

    const continueButton =
        document.getElementById("roleContinue");

    if (continueButton) {
        continueButton.disabled = false;
    }
}


/* =========================================================
   GENERATE CONTEXT QUESTIONS
========================================================= */

function generateQuestions() {

    const container =
        document.getElementById("questions");

    if (!container) {
        console.error(
            "Missing #questions element."
        );
        return;
    }

    container.innerHTML = "";

    currentQuestions =
        questionEngine[selectedCategory]?.[selectedRole];


    /*
       Fallback if this category/role does not yet
       have a specialized question set.
    */

    if (!currentQuestions) {

        currentQuestions = [

            {
                question:
                    "Does this item still have a meaningful role in your life?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["No", -3]
                ]
            },

            {
                question:
                    "If this disappeared tomorrow, would you want to replace it?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["Definitely not", -3]
                ]
            },

            {
                question:
                    "Would you choose to own this again today?",
                weight: 3,
                answers: [
                    ["Definitely", 3],
                    ["Probably", 2],
                    ["I'm not sure", 0],
                    ["Probably not", -2],
                    ["Definitely not", -3]
                ]
            }
        ];
    }


    currentQuestions.forEach(
        (question, index) => {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "question";

            const label =
                document.createElement("label");

            label.textContent =
                question.question;

            const select =
                document.createElement("select");

            select.className =
                "answer";

            select.dataset.question =
                index;

            const placeholder =
                document.createElement("option");

            placeholder.value = "";

            placeholder.textContent =
                "Choose an answer";

            select.appendChild(
                placeholder
            );


            question.answers.forEach(
                (answer, answerIndex) => {

                    const option =
                        document.createElement("option");

                    option.value =
                        answerIndex;

                    option.textContent =
                        answer[0];

                    select.appendChild(
                        option
                    );
                }
            );

            wrapper.appendChild(label);
            wrapper.appendChild(select);

            container.appendChild(wrapper);
        }
    );

    showStep(4);
}


/* =========================================================
   DECISION ENGINE
========================================================= */

async function analyzeItem() {

    const selects = document.querySelectorAll(".answer");

    if (!currentQuestions || currentQuestions.length === 0) {
        return;
    }

    const answers = [];
    let answered = 0;

    currentQuestions.forEach((question, index) => {

        const select = selects[index];

        if (!select || select.value === "") {
            return;
        }

        const answerIndex = Number(select.value);
        const answer = question.answers[answerIndex];

        answers.push({
            question: question.question,
            answer: answer[0]
        });

        answered++;
    });

    if (answered < currentQuestions.length) {

        alert(
            "Please answer every question before continuing."
        );

        return;
    }


    /* =========================================
       LOADING STATE
    ========================================= */

    const button =
        document.querySelector(
            "#step3 .primary-button"
        );

    if (button) {
        button.disabled = true;
        button.textContent = "Thinking... ✦";
    }


    /* =========================================
       BUILD AI PROMPT
    ========================================= */

    const prompt = `
You are analyzing an item for Declutter.AI.

Your job is NOT simply to tell the user to get rid of things.

Declutter.AI helps people gain perspective about their possessions.

The user should feel that the recommendation is based on THEIR answers.

Consider:
- current usefulness
- actual frequency of use
- emotional value
- future usefulness
- alternatives
- whether the item would be missed
- whether the user would choose to own it again
- contradictions between answers

Category:
${selectedCategory}

Role:
${selectedRole}

Answers:

${answers
    .map(
        (item, index) =>
            `${index + 1}. ${item.question}
Answer: ${item.answer}`
    )
    .join("\n\n")}

Give a thoughtful recommendation.

Possible recommendations:

CLEAR KEEP
KEEP — BUT THINK
UNCERTAIN
LEANING TOWARD LETTING GO
CLEAR LET GO

Do NOT automatically recommend getting rid of something.

If the answers are contradictory, acknowledge that.

Return ONLY valid JSON in this exact format:

{
  "result": "CLEAR KEEP",
  "confidence": "High",
  "reasoning": "2-4 sentences explaining the decision using the user's answers.",
  "reflection": "One thoughtful question that helps the user reflect."
}
`;


    /* =========================================
       CALL CLOUDFLARE WORKER
    ========================================= */

    try {

        const response = await fetch(
            "https://declutter-ai-api.plewko-olga.workers.dev/",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: prompt
                })
            }
        );


        if (!response.ok) {

            throw new Error(
                `AI request failed: ${response.status}`
            );

        }


        const data = await response.json();


        /* =========================================
           GET AI TEXT
        ========================================= */

        const aiText =
            data?.choices?.[0]?.message?.content;


        if (!aiText) {
            throw new Error(
                "AI returned no response."
            );
        }


        /* =========================================
           PARSE JSON
        ========================================= */

        let result;

        try {

            result =
                JSON.parse(aiText);

        } catch {

            /*
               Some models may wrap JSON
               inside ```json ... ```
            */

            const cleaned =
                aiText
                    .replace(/```json/gi, "")
                    .replace(/```/g, "")
                    .trim();

            result =
                JSON.parse(cleaned);
        }


        /* =========================================
           RESULT UI
        ========================================= */

        const recommendation =
            document.getElementById(
                "recommendation"
            );

        if (recommendation) {

            recommendation.textContent =
                result.result || "UNCERTAIN";

        }


        const confidenceElement =
            document.getElementById(
                "confidence"
            );

        if (confidenceElement) {

            confidenceElement.textContent =
                `${result.confidence || "Moderate"} confidence`;

        }


        const reasoningElement =
            document.getElementById(
                "reasoningText"
            );

        if (reasoningElement) {

            reasoningElement.textContent =
                result.reasoning ||
                "Your answers suggest there are several things worth considering.";

        }


        let reflectionElement =
            document.getElementById(
                "reflectionText"
            );


        if (!reflectionElement) {

            const parent =
                reasoningElement?.parentNode;

            if (parent) {

                reflectionElement =
                    document.createElement("p");

                reflectionElement.id =
                    "reflectionText";

                reflectionElement.className =
                    "reflection-text";

                parent.appendChild(
                    reflectionElement
                );

            }

        }


        if (reflectionElement) {

            reflectionElement.textContent =
                result.reflection ||
                "What would you actually miss if this disappeared?";
        }


        /* =========================================
           SHOW RESULT
        ========================================= */

        showStep(4);


    } catch (error) {

        console.error(
            "Declutter AI error:",
            error.message,
    error
        );

        alert(
            "Something went wrong while analyzing your item. Please try again."
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Analyze my item →";

        }

    }

}


/* =========================================================
   RESET
========================================================= */

function newItem() {

    selectedCategory = "";
    selectedRole = "";
    uploadedImage = null;
    currentQuestions = [];


    const input =
        document.getElementById(
            "imageInput"
        );

    if (input) {
        input.value = "";
    }


    const preview =
        document.getElementById(
            "imagePreview"
        );

    if (preview) {
        preview.classList.add("hidden");
    }


    const content =
        document.getElementById(
            "uploadContent"
        );

    if (content) {
        content.classList.remove("hidden");
    }


    document
        .querySelectorAll(
            ".category-grid button"
        )
        .forEach(btn =>
            btn.classList.remove(
                "selected"
            )
        );


    showStep(1);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   SAVE
========================================================= */

function saveItem() {

    alert(
        "Saving items will be available in a future version."
    );
}
