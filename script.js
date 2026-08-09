let selectedCategory = "";
let uploadedImage = null;

const questionsByCategory = {

    Clothing: [
        "When did you last wear this?",
        "Do you own something similar?",
        "Would you buy it again today?",
        "Does it have sentimental value?"
    ],

    Electronics: [
        "When did you last use this?",
        "Do you own a newer alternative?",
        "Does it still work properly?",
        "Would you buy it again today?"
    ],

    Books: [
        "Have you read this book?",
        "Will you realistically read it?",
        "Would you recommend it to someone?",
        "Does it have sentimental value?"
    ],

    Beauty: [
        "When did you last use it?",
        "Is it still within its usable period?",
        "Do you own a similar product?",
        "Would you buy it again?"
    ],

    Home: [
        "How often do you use this?",
        "Do you own something similar?",
        "Does it have a specific purpose?",
        "Would you buy it again today?"
    ],

    Hobby: [
        "When did you last use this?",
        "Are you still interested in this hobby?",
        "Do you own similar equipment?",
        "Do you expect to use it again?"
    ]
};


/* START APP */

function startApp() {

    document.getElementById("landing").classList.add("hidden");

    document.getElementById("app").classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    showStep(1);
}


/* IMAGE */

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


/* STEP NAVIGATION */

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


/* CATEGORY */

function selectCategory(button, category) {

    document
        .querySelectorAll(".category-grid button")
        .forEach(btn => btn.classList.remove("selected"));

    button.classList.add("selected");

    selectedCategory = category;

    document.getElementById("categoryContinue").disabled = false;
}


/* GENERATE QUESTIONS */

function generateQuestions() {

    const container = document.getElementById("questions");

    container.innerHTML = "";

    const questions =
        questionsByCategory[selectedCategory];

    questions.forEach((question, index) => {

        const wrapper = document.createElement("div");

        wrapper.className = "question";

        wrapper.innerHTML = `
            <label>${question}</label>

            <select class="answer">

                <option value="">
                    Select an answer
                </option>

                <option value="yes">
                    Yes
                </option>

                <option value="no">
                    No
                </option>

                <option value="sometimes">
                    Sometimes
                </option>

            </select>
        `;

        container.appendChild(wrapper);
    });

    nextStep(3);
}


/* ANALYSIS */

function analyzeItem() {

    showStep(4);

    /*
        TEMPORARY DEMO LOGIC

        This is NOT real AI yet.

        Later this function will send:
        - image
        - category
        - answers

        to your backend + AI API.
    */

    let recommendation = "SELL";
    let confidence = "87%";

    let reasoning =
        "You haven't used this item recently, " +
        "you own similar items, and it may still " +
        "have useful resale value.";

    let icon = "↗";

    if (selectedCategory === "Books") {

        recommendation = "DONATE";
        confidence = "82%";

        reasoning =
            "You don't expect to read this soon, " +
            "and passing it on could give someone else " +
            "the chance to enjoy it.";

        icon = "♡";
    }

    if (selectedCategory === "Electronics") {

        recommendation = "SELL";
        confidence = "91%";

        reasoning =
            "You rarely use this device and already have " +
            "a newer alternative.";

        icon = "↗";
    }

    if (selectedCategory === "Hobby") {

        recommendation = "STORE";
        confidence = "74%";

        reasoning =
            "You still see value in this hobby, but " +
            "you don't currently use the item often.";

        icon = "□";
    }

    document.getElementById("recommendation").textContent =
        recommendation;

    document.getElementById("confidence").textContent =
        confidence;

    document.getElementById("reasoningText").textContent =
        reasoning;

    document.getElementById("resultIcon").textContent =
        icon;
}


/* NEW ITEM */

function newItem() {

    uploadedImage = null;
    selectedCategory = "";

    document.getElementById("imageInput").value = "";

    document.getElementById("imagePreview").classList.add("hidden");

    document.getElementById("uploadContent").classList.remove("hidden");

    document.getElementById("imageContinue").disabled = true;

    document
        .querySelectorAll(".category-grid button")
        .forEach(btn => btn.classList.remove("selected"));

    document.getElementById("categoryContinue").disabled = true;

    showStep(1);
}


/* SAVE */

function saveItem() {

    alert(
        "Saved! Inventory functionality will be added in a future version."
    );
}s