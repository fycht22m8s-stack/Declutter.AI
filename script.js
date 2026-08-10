let selectedCategory = "";
let uploadedImage = null;


/* =========================================================
   DECLUTTER.AI — DECISION FRAMEWORK v0.4
   The goal is NOT to tell people what to throw away.
   The goal is to help them understand whether an item
   still belongs in their life.
========================================================= */


/* =========================================================
   QUESTIONS
========================================================= */

const questionsByCategory = {

    Clothing: [

        {
            question: "When did you last wear this?",
            weight: 1,
            answers: [
                { text: "Within the last week", score: 2 },
                { text: "Within the last month", score: 1 },
                { text: "1–6 months ago", score: 0 },
                { text: "6–12 months ago", score: -1 },
                { text: "More than a year ago", score: -2 },
                { text: "I don't remember", score: -1 }
            ]
        },

        {
            question: "Why did you last wear it?",
            weight: 2,
            answers: [
                { text: "I genuinely wanted to", score: 2 },
                { text: "It was right for a specific occasion", score: 1 },
                { text: "I needed something practical to wear", score: 0 },
                { text: "I felt like I had to wear it", score: -1 },
                { text: "Someone else chose it for me", score: -1 },
                { text: "I don't remember", score: 0 }
            ]
        },

        {
            question: "If you didn't already own this, would you choose to bring it into your life today?",
            weight: 3,
            answers: [
                { text: "Definitely", score: 3 },
                { text: "Probably", score: 2 },
                { text: "I'm not sure", score: 0 },
                { text: "Probably not", score: -2 },
                { text: "Definitely not", score: -3 }
            ]
        },

        {
            question: "Do you own something that already fills the same role?",
            weight: 2,
            answers: [
                { text: "No", score: 2 },
                { text: "Yes, one similar item", score: -1 },
                { text: "Yes, several similar items", score: -2 }
            ]
        },

        {
            question: "Would you genuinely miss this if it disappeared tomorrow?",
            weight: 3,
            answers: [
                { text: "Definitely", score: 3 },
                { text: "Probably", score: 2 },
                { text: "I'm not sure", score: 0 },
                { text: "Probably not", score: -2 },
                { text: "Not at all", score: -3 }
            ]
        }
    ],


    Electronics: [

        {
            question: "When did you last use this because you wanted to?",
            weight: 1,
            answers: [
                { text: "Within the last week", score: 2 },
                { text: "Within the last month", score: 1 },
                { text: "1–6 months ago", score: 0 },
                { text: "6–12 months ago", score: -1 },
                { text: "More than a year ago", score: -2 },
                { text: "I don't remember", score: -1 }
            ]
        },

        {
            question: "Does it still work the way you need it to?",
            weight: 2,
            answers: [
                { text: "Yes, perfectly", score: 2 },
                { text: "Mostly", score: 1 },
                { text: "It has some limitations", score: -1 },
                { text: "Not really", score: -2 },
                { text: "No", score: -3 }
            ]
        },

        {
            question: "If you didn't already own this, would you choose to buy it today?",
            weight: 3,
            answers: [
                { text: "Definitely", score: 3 },
                { text: "Probably", score: 2 },
                { text: "I'm not sure", score: 0 },
                { text: "Probably not", score: -2 },
                { text: "Definitely not", score: -3 }
            ]
        },

        {
            question: "Do you already have another device that does the same job?",
            weight: 2,
            answers: [
                { text: "No", score: 2 },
                { text: "Yes, but this one has a unique advantage", score: 1 },
                { text: "Yes, and they are mostly interchangeable", score: -2 }
            ]
        },

        {
            question: "Would you notice its absence in your everyday life?",
            weight: 3,
            answers: [
                { text: "Definitely", score: 3 },
                { text: "Probably", score: 2 },
                { text: "I'm not sure", score: 0 },
                { text: "Probably not", score: -2 },
                { text: "Not at all", score: -3 }
            ]
        }
    ],


    Books: [

        {
            question: "When did you last read this?",
            weight: 1,
            answers: [
                { text: "Within the last week", score: 1 },
                { text: "Within the last month", score: 1 },
                { text: "1–6 months ago", score: 0 },
                { text: "6–12 months ago", score: -1 },
                { text: "More than a year ago", score: -2 },
                { text: "I don't remember", score: -1 }
            ]
        },

        {
            question: "Why did you last read it?",
            weight: 2,
            answers: [
                { text: "I genuinely wanted to", score: 2 },
                { text: "For school", score: -1 },
                { text: "For work", score: -1 },
                { text: "Someone recommended it", score: 1 },
                { text: "I had to", score: -2 },
                { text: "I don't remember", score: 0 }
            ]
        },

        {
            question: "If nobody expected you to read this again, would you choose to?",
            weight: 3,
            answers: [
                { text: "Definitely", score: 3 },
                { text: "Probably", score: 2 },
                { text: "I'm not sure", score: 0 },
                { text: "Probably not", score: -2 },
                { text: "Definitely not", score: -3 }
            ]
        },

        {
            question: "If this disappeared tomorrow, would you feel the need to replace it?",
            weight: 3,
            answers: [
                { text: "Definitely", score: 3 },
                { text: "Probably", score: 2 },
                { text: "I'm not sure", score: 0 },
                { text: "Probably not", score: -2 },
                { text: "Definitely not", score: -3 }
            ]
        },

        {
            question: "Does this book have personal or sentimental value to you?",
            weight: 2,
            answers: [
                { text: "A lot", score: 3 },
                { text: "Some", score: 1 },
                { text: "Very little", score: 0 },
                { text: "None", score: -2 }
            ]
        }
    ],


    Beauty: [

        {
            question: "When did you last use this because you wanted to?",
            weight: 1,
            answers: [
                { text: "Within the last week", score: 2 },
                { text: "Within the last month", score: 1 },
                { text: "1–6 months ago", score: 0 },
                { text: "More than 6 months ago", score: -2 },
                { text: "I don't remember", score: -1 }
            ]
        },

        {
            question: "How do you actually feel about using this?",
            weight: 2,
            answers: [
                { text: "I genuinely enjoy it", score: 2 },
                { text: "I like it", score: 1 },
                { text: "I'm neutral", score: 0 },
                { text: "I don't really like it", score: -1 },
                { text: "I actively avoid it", score: -2 }
            ]
        },

        {
            question: "If you didn't already own this, would you buy it today?",
            weight: 3,
            answers: [
                { text: "Definitely", score: 3 },
                { text: "Probably", score: 2 },
                { text: "I'm not sure", score: 0 },
                { text: "Probably not", score: -2 },
                { text: "Definitely not", score: -3 }
            ]
        },

        {
            question: "Do you already have another product that does essentially the same thing?",
            weight: 2,
            answers: [
                { text: "No", score: 2 },
                { text: "Yes, one", score: -1 },
                { text: "Yes, several", score: -2 }
            ]
        },

        {
            question: "Would you notice if this disappeared tomorrow?",
            weight: 3,
            answers: [
                { text: "Definitely", score: 3 },
                { text: "Probably", score: 2 },
                { text: "I'm not sure", score: 0 },
                { text: "Probably not", score: -2 },
                { text: "Not at all", score: -3 }
            ]
        }
    ],


    Home: [

        {
            question: "How often do you intentionally use this?",
            weight: 1,
            answers: [
                { text: "Every day", score: 2 },
                { text: "Every week", score: 1 },
                { text: "Every few months", score: 0 },
                { text: "Almost never", score: -2 },
                { text: "Never", score: -3 }
            ]
        },

        {
            question: "When did you last use it because you genuinely wanted to?",
            weight: 2,
            answers: [
                { text: "Within the last week", score: 2 },
                { text: "Within the last month", score: 1 },
                { text: "Several months ago", score: 0 },
                { text: "More than a year ago", score: -2 },
                { text: "I don't remember", score: -1 }
            ]
        },

        {
            question: "If you didn't own this, would you notice its absence?",
            weight: 3,
            answers: [
                { text: "Definitely", score: 3 },
                { text: "Probably", score: 2 },
                { text: "I'm not sure", score: 0 },
                { text: "Probably not", score: -2 },
                { text: "Not at all", score: -3 }
            ]
        },

        {
            question: "Does another item already do essentially the same job?",
            weight: 2,
            answers: [
                { text: "No", score: 2 },
                { text: "Yes, but this has a unique advantage", score: 1 },
                { text: "Yes, almost completely", score: -2 }
            ]
        },

        {
            question: "If you saw this in a store today, would you choose to buy it?",
            weight: 3,
            answers: [
                { text: "Definitely", score: 3 },
                { text: "Probably", score: 2 },
                { text: "I'm not sure", score: 0 },
                { text: "Probably not", score: -2 },
                { text: "Definitely not", score: -3 }
            ]
        }
    ],


    Hobby: [

        {
            question: "When did you last use this because you genuinely wanted to?",
            weight: 1,
            answers: [
                { text: "Within the last week", score: 2 },
                { text: "Within the last month", score: 1 },
                { text: "1–6 months ago", score: 0 },
                { text: "6–12 months ago", score: -1 },
                { text: "More than a year ago", score: -2 },
                { text: "I don't remember", score: -1 }
            ]
        },

        {
            question: "Are you still genuinely interested in this hobby?",
            weight: 3,
            answers: [
                { text: "Very much", score: 3 },
                { text: "Yes, somewhat", score: 1 },
                { text: "I'm not sure", score: 0 },
                { text: "Not really", score: -2 },
                { text: "No", score: -3 }
            ]
        },

        {
            question: "Do you realistically expect to use this again?",
            weight: 3,
            answers: [
                { text: "Definitely", score: 3 },
                { text: "Probably", score: 2 },
                { text: "I'm not sure", score: 0 },
                { text: "Probably not", score: -2 },
                { text: "Definitely not", score: -3 }
            ]
        },

        {
            question: "Do you own other equipment that can do essentially the same thing?",
            weight: 2,
            answers: [
                { text: "No", score: 2 },
                { text: "Yes, one alternative", score: -1 },
                { text: "Yes, several alternatives", score: -2 }
            ]
        },

        {
            question: "If you didn't already own this, would you spend money on it today?",
            weight: 3,
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


/* =========================================================
   START
========================================================= */

function startApp() {

    document.getElementById("landing").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    showStep(1);
}


/* =========================================================
   IMAGE UPLOAD
========================================================= */

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


/* =========================================================
   STEP NAVIGATION
========================================================= */

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

    const target = document.getElementById(`step${step}`);

    if (target) {
        target.classList.remove("hidden");
    }

    const progress = document.getElementById("progress");

    if (progress) {
        progress.style.width = `${step * 25}%`;
    }

    const label = document.getElementById("step-label");

    if (label) {
        label.textContent = `Step ${step} of 4`;
    }
}


/* =========================================================
   CATEGORY
========================================================= */

function selectCategory(button, category) {

    document
        .querySelectorAll(".category-grid button")
        .forEach(btn => btn.classList.remove("selected"));

    button.classList.add("selected");

    selectedCategory = category;

    document.getElementById("categoryContinue").disabled = false;
}


/* =========================================================
   QUESTIONS
========================================================= */

function generateQuestions() {

    const container =
        document.getElementById("questions");

    container.innerHTML = "";

    const questions =
        questionsByCategory[selectedCategory];

    if (!questions) {
        console.error("No questions found for:", selectedCategory);
        return;
    }

    questions.forEach((question, index) => {

        const wrapper =
            document.createElement("div");

        wrapper.className = "question";

        let options = `
            <option value="">
                Choose an answer
            </option>
        `;

        question.answers.forEach((answer, answerIndex) => {

            options += `
                <option value="${answerIndex}">
                    ${answer.text}
                </option>
            `;
        });

        wrapper.innerHTML = `
            <label>${question.question}</label>

            <select
                class="answer"
                data-question="${index}"
            >
                ${options}
            </select>
        `;

        container.appendChild(wrapper);
    });

    nextStep(3);
}


/* =========================================================
   DECISION ENGINE
========================================================= */

function analyzeItem() {

    const selects =
        document.querySelectorAll(".answer");

    const questions =
        questionsByCategory[selectedCategory];

    let weightedScore = 0;
    let totalWeight = 0;

    let answeredQuestions = 0;

    questions.forEach((question, index) => {

        const select = selects[index];

        if (!select || select.value === "") {
            return;
        }

        const answerIndex =
            Number(select.value);

        const answer =
            question.answers[answerIndex];

        weightedScore +=
            answer.score * question.weight;

        totalWeight +=
            3 * question.weight;

        answeredQuestions++;
    });


    /* -----------------------------------------
       Require every question
    ----------------------------------------- */

    if (answeredQuestions < questions.length) {

        alert(
            "Please answer every question before continuing."
        );

        return;
    }


    /* -----------------------------------------
       Normalize score to -3 → +3
    ----------------------------------------- */

    const normalizedScore =
        weightedScore /
        (totalWeight / 3);


    /* -----------------------------------------
       CLASSIFY
    ----------------------------------------- */

    let result;
    let resultClass;
    let reasoning;
    let reflection;


    if (normalizedScore >= 1.7) {

        result = "CLEAR KEEP";
        resultClass = "keep";

        reasoning =
            "Your answers consistently suggest that this item " +
            "still adds meaningful value to your life. You use it " +
            "intentionally, value what it provides, or would notice " +
            "its absence.";

        reflection =
            "What specifically makes this item worth keeping? " +
            "That may be the reason you should continue making space for it.";

    }

    else if (normalizedScore >= 0.7) {

        result = "KEEP — BUT THINK";
        resultClass = "consider";

        reasoning =
            "There are meaningful reasons to keep this item, " +
            "but some of your answers suggest that its role in " +
            "your life may have changed.";

        reflection =
            "Are you keeping this because it still serves you, " +
            "or because it once did?";

    }

    else if (normalizedScore > -0.7) {

        result = "UNCERTAIN";
        resultClass = "uncertain";

        reasoning =
            "Your answers point in different directions. " +
            "There are reasons to keep this item, but also reasons " +
            "to question whether it still belongs in your life.";

        reflection =
            "You don't need to make a decision today. " +
            "Try asking yourself what you would actually miss about it.";

    }

    else if (normalizedScore > -1.7) {

        result = "LEANING TOWARD LETTING GO";
        resultClass = "let-go";

        reasoning =
            "Most of your answers suggest that this item may no " +
            "longer provide enough value to justify keeping it, " +
            "although there are still some reasons to hold onto it.";

        reflection =
            "Are you keeping it for what it currently gives you, " +
            "or for a possible future use?";

    }

    else {

        result = "CLEAR LET GO";
        resultClass = "strong-let-go";

        reasoning =
            "Your answers consistently point away from keeping this item. " +
            "You don't seem to use it intentionally, value it strongly, " +
            "or expect it to play an important role in your future.";

        reflection =
            "If this disappeared tomorrow, what would you actually lose?";

    }


    /* -----------------------------------------
       CONFIDENCE
    ----------------------------------------- */

    const distance =
        Math.abs(normalizedScore);

    let confidence;

    if (distance >= 2) {
        confidence = "High";
    }

    else if (distance >= 1) {
        confidence = "Moderate";
    }

    else {
        confidence = "Low";
    }


    /* -----------------------------------------
       UPDATE RESULT UI
    ----------------------------------------- */

    const recommendation =
        document.getElementById("recommendation");

    if (recommendation) {
        recommendation.textContent = result;
    }

    const confidenceElement =
        document.getElementById("confidence");

    if (confidenceElement) {
        confidenceElement.textContent =
            `${confidence} confidence`;
    }

    const reasoningElement =
        document.getElementById("reasoningText");

    if (reasoningElement) {
        reasoningElement.textContent =
            reasoning;
    }

    const icon =
        document.getElementById("resultIcon");

    if (icon) {

        if (resultClass === "keep") {
            icon.textContent = "✓";
        }

        else if (resultClass === "consider") {
            icon.textContent = "○";
        }

        else if (resultClass === "uncertain") {
            icon.textContent = "?";
        }

        else {
            icon.textContent = "↘";
        }
    }


    /* -----------------------------------------
       Add reflection if HTML supports it
    ----------------------------------------- */

    let reflectionElement =
        document.getElementById("reflectionText");

    if (!reflectionElement) {

        const reasoningContainer =
            document.getElementById("reasoningText");

        if (reasoningContainer) {

            reflectionElement =
                document.createElement("p");

            reflectionElement.id =
                "reflectionText";

            reflectionElement.className =
                "reflection-text";

            reasoningContainer.parentNode.appendChild(
                reflectionElement
            );
        }
    }

    if (reflectionElement) {
        reflectionElement.textContent =
            reflection;
    }


    showStep(4);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   NEW ITEM
========================================================= */

function newItem() {

    uploadedImage = null;
    selectedCategory = "";

    const imageInput =
        document.getElementById("imageInput");

    if (imageInput) {
        imageInput.value = "";
    }

    const preview =
        document.getElementById("imagePreview");

    if (preview) {
        preview.classList.add("hidden");
    }

    const uploadContent =
        document.getElementById("uploadContent");

    if (uploadContent) {
        uploadContent.classList.remove("hidden");
    }

    const imageContinue =
        document.getElementById("imageContinue");

    if (imageContinue) {
        imageContinue.disabled = true;
    }

    document
        .querySelectorAll(".category-grid button")
        .forEach(btn =>
            btn.classList.remove("selected")
        );

    const categoryContinue =
        document.getElementById("categoryContinue");

    if (categoryContinue) {
        categoryContinue.disabled = true;
    }

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
        "Saved! A personal item history will be available in a future version."
    );
}
