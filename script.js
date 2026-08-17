let selectedCategory = "";
let selectedRole = "";
let uploadedImage = null;
let currentQuestions = [];


/* =========================================================
   DECLUTTER.AI — QUESTION ENGINE
   AI-FIRST + LOCAL FALLBACK
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
   LOCAL FALLBACK QUESTIONS
   Used if AI question generation fails.
========================================================= */

const fallbackQuestions = [

    {
        question:
            "Does this item still have a meaningful role in your life?",
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
        question:
            "How often do you realistically use this?",
        weight: 3,
        answers: [
            ["Very often", 3],
            ["Regularly", 2],
            ["Sometimes", 0],
            ["Rarely", -2],
            ["Almost never", -3]
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
            "Do you already have something that fills the same role?",
        weight: 2,
        answers: [
            ["No", 2],
            ["Yes, but this is different", 1],
            ["Yes, equally useful", 0],
            ["Yes, very similarly", -2],
            ["Yes, and I prefer the alternative", -3]
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


/* =========================================================
   API
========================================================= */

const API_URL =
    "https://declutter-ai-api.plewko-olga.workers.dev/";


/* =========================================================
   START APP
========================================================= */

function startApp() {

    document
        .getElementById("landing")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.remove("hidden");

    showStep(1);
}


/* =========================================================
   IMAGE
========================================================= */

function previewImage(event) {

    const file =
        event.target.files[0];

    if (!file) return;

    uploadedImage = file;

    const preview =
        document.getElementById(
            "imagePreview"
        );

    const content =
        document.getElementById(
            "uploadContent"
        );

    if (preview) {

        preview.src =
            URL.createObjectURL(file);

        preview.classList.remove(
            "hidden"
        );
    }

    if (content) {

        content.classList.add(
            "hidden"
        );
    }

    const button =
        document.getElementById(
            "imageContinue"
        );

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
        document.getElementById(
            `step${step}`
        );

    if (target) {

        target.classList.remove(
            "hidden"
        );
    }

    const progress =
        document.getElementById(
            "progress"
        );

    if (progress) {

        progress.style.width =
            `${step * 25}%`;
    }

    const label =
        document.getElementById(
            "step-label"
        );

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

function selectCategory(
    button,
    category
) {

    document
        .querySelectorAll(
            ".category-grid button"
        )
        .forEach(btn =>
            btn.classList.remove(
                "selected"
            )
        );

    button.classList.add(
        "selected"
    );

    selectedCategory =
        category;

    const continueButton =
        document.getElementById(
            "categoryContinue"
        );

    if (continueButton) {

        continueButton.disabled =
            false;
    }
}


/* =========================================================
   ROLE SCREEN
========================================================= */

function generateRoles() {

    const container =
        document.getElementById(
            "roles"
        );

    if (!container) {

        console.error(
            "Missing #roles element in HTML."
        );

        return;
    }

    container.innerHTML = "";

    const roles =
        rolesByCategory[
            selectedCategory
        ];

    if (!roles) {

        console.error(
            "No roles found for:",
            selectedCategory
        );

        return;
    }

    roles.forEach(role => {

        const button =
            document.createElement(
                "button"
            );

        button.textContent =
            role;

        button.className =
            "role-button";

        button.onclick = () =>
            selectRole(
                button,
                role
            );

        container.appendChild(
            button
        );
    });

    showStep(3);
}


function selectRole(
    button,
    role
) {

    document
        .querySelectorAll(
            ".role-button"
        )
        .forEach(btn =>
            btn.classList.remove(
                "selected"
            )
        );

    button.classList.add(
        "selected"
    );

    selectedRole =
        role;

    const continueButton =
        document.getElementById(
            "roleContinue"
        );

    if (continueButton) {

        continueButton.disabled =
            false;
    }
}


/* =========================================================
   LOADING UI
========================================================= */

function showQuestionLoading() {

    const container =
        document.getElementById(
            "questions"
        );

    if (!container) return;

    container.innerHTML = `
        <div class="question-loading">
            <p>Declutter.AI is thinking...</p>
        </div>
    `;
}


/* =========================================================
   NORMALIZE AI QUESTIONS
========================================================= */

function normalizeAIQuestions(
    questions
) {

    if (!Array.isArray(questions)) {

        throw new Error(
            "AI did not return a questions array."
        );
    }

    if (questions.length === 0) {

        throw new Error(
            "AI returned no questions."
        );
    }

    return questions
        .slice(0, 5)
        .map(question => {

            if (
                !question ||
                typeof question.question !==
                    "string" ||
                !Array.isArray(
                    question.answers
                )
            ) {

                throw new Error(
                    "Invalid AI question format."
                );
            }

            const answers =
                question.answers
                    .slice(0, 5)
                    .map(answer => {

                        if (
                            typeof answer ===
                            "string"
                        ) {
                            return [
                                answer,
                                0
                            ];
                        }

                        if (
                            Array.isArray(
                                answer
                            )
                        ) {
                            return [
                                String(
                                    answer[0]
                                ),
                                Number(
                                    answer[1]
                                ) || 0
                            ];
                        }

                        return null;
                    })
                    .filter(Boolean);

            if (
                answers.length < 2
            ) {

                throw new Error(
                    "AI question has too few answers."
                );
            }

            return {

                question:
                    question.question,

                weight: 1,

                answers:
                    answers
            };
        });
}


/* =========================================================
   AI QUESTION GENERATION
========================================================= */

async function generateAIQuestions() {

    const response =
        await fetch(
            API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    mode:
                        "generate_questions",

                    category:
                        selectedCategory,

                    role:
                        selectedRole
                })
            }
        );

    const data =
        await response.json();

    if (
        !response.ok ||
        !data.result
    ) {

        throw new Error(
            "Question generation request failed."
        );
    }

    const content =
        data.result
            ?.choices?.[0]
            ?.message?.content;

    if (!content) {

        throw new Error(
            "AI returned no question content."
        );
    }

    const cleaned =
        content
            .replace(
                /```json/gi,
                ""
            )
            .replace(
                /```/g,
                ""
            )
            .trim();

    const parsed =
        JSON.parse(cleaned);

    return normalizeAIQuestions(
        parsed.questions
    );
}


/* =========================================================
   RENDER QUESTIONS
========================================================= */

function renderQuestions() {

    const container =
        document.getElementById(
            "questions"
        );

    if (!container) {

        console.error(
            "Missing #questions element."
        );

        return;
    }

    container.innerHTML = "";

    currentQuestions.forEach(
        (question, index) => {

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "question";


            const label =
                document.createElement(
                    "label"
                );

            label.textContent =
                question.question;


            const select =
                document.createElement(
                    "select"
                );

            select.className =
                "answer";

            select.dataset.question =
                index;


            const placeholder =
                document.createElement(
                    "option"
                );

            placeholder.value = "";

            placeholder.textContent =
                "Choose an answer";

            select.appendChild(
                placeholder
            );


            question.answers.forEach(
                (
                    answer,
                    answerIndex
                ) => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        answerIndex;

                    option.textContent =
                        answer[0];

                    select.appendChild(
                        option
                    );
                }
            );


            wrapper.appendChild(
                label
            );

            wrapper.appendChild(
                select
            );

            container.appendChild(
                wrapper
            );
        }
    );

    showStep(4);
}


/* =========================================================
   GENERATE QUESTIONS
   AI FIRST
   FALLBACK SECOND
========================================================= */

async function generateQuestions() {

    showQuestionLoading();

    try {

        currentQuestions =
            await generateAIQuestions();

        console.log(
            "Declutter.AI generated questions:",
            currentQuestions
        );

        renderQuestions();

    } catch (error) {

        console.warn(
            "AI question generation failed. Using fallback.",
            error
        );

        currentQuestions =
            fallbackQuestions;

        renderQuestions();
    }
}


/* =========================================================
   COLLECT ANSWERS
========================================================= */

function collectAnswers() {

    const selects =
        document.querySelectorAll(
            ".answer"
        );

    const answers = [];

    currentQuestions.forEach(
        (
            question,
            index
        ) => {

            const select =
                selects[index];

            if (
                !select ||
                select.value === ""
            ) {
                return;
            }

            const answerIndex =
                Number(
                    select.value
                );

            const answer =
                question.answers[
                    answerIndex
                ];

            if (!answer) return;

            answers.push({

                question:
                    question.question,

                answer:
                    answer[0]
            });
        }
    );

    return answers;
}


/* =========================================================
   CLEAN AI JSON
========================================================= */

function cleanAIJSON(content) {

    return content
        .replace(
            /```json/gi,
            ""
        )
        .replace(
            /```/g,
            ""
        )
        .trim();
}


/* =========================================================
   ANALYZE ITEM
========================================================= */

async function analyzeItem() {

    const answers =
        collectAnswers();


    if (
        answers.length <
        currentQuestions.length
    ) {

        alert(
            "Please answer every question before continuing."
        );

        return;
    }


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        mode:
                            "analyze",

                        category:
                            selectedCategory,

                        role:
                            selectedRole,

                        answers:
                            answers
                    })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.result
        ) {

            throw new Error(
                "AI analysis request failed."
            );
        }


        const aiContent =
            data.result
                ?.choices?.[0]
                ?.message?.content;


        if (!aiContent) {

            throw new Error(
                "AI returned no analysis."
            );
        }


        const cleanedContent =
            cleanAIJSON(
                aiContent
            );


        const aiResult =
            JSON.parse(
                cleanedContent
            );


        /* =====================================
           RECOMMENDATION
        ===================================== */

        const recommendation =
            document.getElementById(
                "recommendation"
            );

        if (recommendation) {

            recommendation.textContent =
                String(
                    aiResult.recommendation ||
                    "UNCERTAIN"
                )
                    .replace(
                        /_/g,
                        " "
                    );
        }


        /* =====================================
           CONFIDENCE
        ===================================== */

        const confidenceElement =
            document.getElementById(
                "confidence"
            );

        if (confidenceElement) {

            let confidence =
                Number(
                    aiResult.confidence
                );

            if (
                !Number.isFinite(
                    confidence
                )
            ) {

                confidence = 0;
            }

            confidence =
                Math.max(
                    0,
                    Math.min(
                        100,
                        Math.round(
                            confidence
                        )
                    )
                );

            confidenceElement.textContent =
                `${confidence}%`;
        }


        /* =====================================
           REASONING
        ===================================== */

        const reasoningElement =
            document.getElementById(
                "reasoningText"
            );

        if (reasoningElement) {

            reasoningElement.textContent =
                aiResult.reasoning ||
                "Your answers suggest this recommendation based on the item's current role in your life.";
        }


        /* =====================================
           REFLECTION
        ===================================== */

        const reflectionElement =
            document.getElementById(
                "reflectionText"
            );

        if (reflectionElement) {

            reflectionElement.textContent =
                aiResult.reflection ||
                "";
        }


        showStep(5);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(
            "Declutter AI error:",
            error
        );

        alert(
            "Something went wrong while analyzing your item. Please try again."
        );
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

        preview.classList.add(
            "hidden"
        );
    }


    const content =
        document.getElementById(
            "uploadContent"
        );

    if (content) {

        content.classList.remove(
            "hidden"
        );
    }


    const categoryButtons =
        document.querySelectorAll(
            ".category-grid button"
        );

    categoryButtons.forEach(
        button =>
            button.classList.remove(
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
         
