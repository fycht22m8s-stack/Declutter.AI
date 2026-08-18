/* =========================================================
   DECLUTTER.AI — ADAPTIVE CHAT ENGINE
========================================================= */


/* =========================================================
   GLOBAL STATE
========================================================= */

let selectedCategory = "";
let selectedRole = "";

let uploadedImage = null;

let itemType = "";

let conversation = [];

let chatBusy = false;


/* =========================================================
   API
========================================================= */

const API_URL =
    "https://declutter-ai-api.plewko-olga.workers.dev/";


/* =========================================================
   START APP
========================================================= */

function startApp() {

    const landing =
        document.getElementById("landing");

    const app =
        document.getElementById("app");


    if (landing) {
        landing.classList.add("hidden");
    }


    if (app) {
        app.classList.remove("hidden");
    }


    showStep(1);
}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

function previewImage(event) {

    const file =
        event.target.files?.[0];


    if (!file) {
        return;
    }


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

        if (
            preview.src &&
            preview.src.startsWith("blob:")
        ) {

            URL.revokeObjectURL(
                preview.src
            );
        }


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

        button.disabled =
            false;
    }
}


/* =========================================================
   STEPS
========================================================= */

function showStep(step) {

    document
        .querySelectorAll(".app-step")
        .forEach(section => {

            section.classList.add(
                "hidden"
            );

        });


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

        const percentage =
            Math.min(
                step * 25,
                100
            );


        progress.style.width =
            `${percentage}%`;
    }


    const label =
        document.getElementById(
            "step-label"
        );


    if (label) {

        label.textContent =
            `Step ${step} of 4`;
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   NEXT STEP
========================================================= */

function nextStep(step) {

    showStep(step);
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
        .forEach(btn => {

            btn.classList.remove(
                "selected"
            );

        });


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
   ROLES
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
   GENERATE ROLES
========================================================= */

function generateRoles() {

    const container =
        document.getElementById(
            "roles"
        );


    if (!container) {

        console.error(
            "Missing #roles element."
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


        button.type =
            "button";


        button.textContent =
            role;


        button.className =
            "role-button";


        button.onclick = () => {

            selectRole(
                button,
                role
            );

        };


        container.appendChild(
            button
        );

    });


    showStep(3);
}


/* =========================================================
   SELECT ROLE
========================================================= */

function selectRole(
    button,
    role
) {

    document
        .querySelectorAll(
            ".role-button"
        )
        .forEach(btn => {

            btn.classList.remove(
                "selected"
            );

        });


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
   START ADAPTIVE CHAT
========================================================= */

async function generateQuestions() {

    if (!selectedCategory) {

        alert(
            "Please choose a category first."
        );

        return;
    }


    if (!selectedRole) {

        alert(
            "Please choose the role of the item first."
        );

        return;
    }


    conversation = [];

    itemType = "";


    const chatWindow =
        document.getElementById(
            "chatWindow"
        );


    if (chatWindow) {

        chatWindow.innerHTML = "";
    }


    const confirmation =
        document.getElementById(
            "itemConfirmationText"
        );


    if (confirmation) {

        confirmation.textContent =
            `${selectedCategory} · ${selectedRole}`;
    }


    showStep(4);


    /*
       The AI starts the conversation.

       Important:
       At this stage the Worker should eventually
       receive the uploaded image and identify it.
    */

    await askAI();
}


/* =========================================================
   ASK AI
========================================================= */

async function askAI() {

    if (chatBusy) {
        return;
    }


    chatBusy = true;


    addTypingMessage();


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

                        mode: "chat",

                        category:
                            selectedCategory,

                        role:
                            selectedRole,

                        itemType:
                            itemType ||
                            "unknown item",

                        conversation:
                            conversation

                    })

                }
            );


        const data =
            await response.json();


        removeTypingMessage();


        if (!response.ok) {

            console.error(
                "API error:",
                data
            );


            throw new Error(
                "AI request failed."
            );
        }


        const aiContent =
            data
                ?.result
                ?.choices?.[0]
                ?.message
                ?.content;


        if (!aiContent) {

            console.error(
                "Empty AI response:",
                data
            );


            throw new Error(
                "AI returned no content."
            );
        }


        console.log(
            "RAW AI RESPONSE:",
            aiContent
        );


        const parsed =
            parseAIResponse(
                aiContent
            );


        if (!parsed) {

            throw new Error(
                "Could not understand AI response."
            );
        }


        /* =====================================
           QUESTION
        ===================================== */

        if (
            parsed.type ===
            "question"
        ) {

            const question =
                String(
                    parsed.question ||
                    ""
                ).trim();


            if (!question) {

                throw new Error(
                    "AI question was empty."
                );
            }


            addChatMessage(
                "ai",
                question
            );


            conversation.push({

                role: "assistant",

                content:
                    question

            });


            return;
        }


        /* =====================================
           ITEM IDENTIFICATION
        ===================================== */

        if (
            parsed.type ===
            "identification"
        ) {

            const detectedType =
                String(
                    parsed.itemType ||
                    ""
                ).trim();


            if (
                detectedType
            ) {

                itemType =
                    detectedType;
            }


            const message =
                parsed.question ||
                `I think this is ${detectedType}. Is that correct?`;


            addChatMessage(
                "ai",
                message
            );


            conversation.push({

                role: "assistant",

                content:
                    message

            });


            return;
        }


        /* =====================================
           RESULT
        ===================================== */

        if (
            parsed.type ===
            "result"
        ) {

            conversation.push({

                role: "assistant",

                content:
                    JSON.stringify(
                        parsed
                    )

            });


            showResult(
                parsed
            );


            return;
        }


        throw new Error(
            "Unknown AI response type."
        );


    } catch (error) {

        removeTypingMessage();


        console.error(
            "Declutter AI error:",
            error
        );


        addChatMessage(
            "ai",
            "Something went wrong while talking to the AI. Please try again."
        );

    } finally {

        chatBusy = false;

        updateChatButton();
    }
}


/* =========================================================
   PARSE AI RESPONSE
========================================================= */

function parseAIResponse(content) {

    if (!content) {
        return null;
    }


    let cleaned =
        String(content).trim();


    console.log(
        "RAW AI RESPONSE:",
        cleaned
    );


    /* ==========================================
       REMOVE MARKDOWN
    ========================================== */

    cleaned =
        cleaned
            .replace(
                /^```json\s*/i,
                ""
            )
            .replace(
                /^```javascript\s*/i,
                ""
            )
            .replace(
                /^```\s*/i,
                ""
            )
            .replace(
                /\s*```$/i,
                ""
            )
            .trim();


    /* ==========================================
       NORMALIZE QUOTES
    ========================================== */

    cleaned =
        cleaned
            .replace(
                /[“”]/g,
                '"'
            )
            .replace(
                /[‘’]/g,
                "'"
            );


    /* ==========================================
       1. DIRECT JSON
    ========================================== */

    try {

        const parsed =
            JSON.parse(
                cleaned
            );


        if (
            parsed &&
            typeof parsed ===
            "object"
        ) {

            return parsed;
        }

    } catch (error) {

        console.warn(
            "Direct JSON parsing failed."
        );
    }


    /* ==========================================
       2. JSON INSIDE TEXT
    ========================================== */

    const firstBrace =
        cleaned.indexOf("{");


    const lastBrace =
        cleaned.lastIndexOf("}");


    if (
        firstBrace !== -1 &&
        lastBrace !== -1 &&
        lastBrace > firstBrace
    ) {

        const jsonPart =
            cleaned.substring(
                firstBrace,
                lastBrace + 1
            );


        try {

            const parsed =
                JSON.parse(
                    jsonPart
                );


            if (
                parsed &&
                typeof parsed ===
                "object"
            ) {

                return parsed;
            }

        } catch (error) {

            console.warn(
                "JSON extraction failed."
            );
        }
    }


    /* ==========================================
       3. PLAIN QUESTION
    ========================================== */

    const questionMark =
        cleaned.indexOf("?");


    if (
        questionMark !== -1
    ) {

        let question =
            cleaned.substring(
                0,
                questionMark + 1
            ).trim();


        question =
            question
                .replace(
                    /^question\s*:\s*/i,
                    ""
                )
                .replace(
                    /^q\s*:\s*/i,
                    ""
                )
                .trim();


        if (
            question.length > 3
        ) {

            console.warn(
                "AI returned plain question. Converting automatically."
            );


            return {

                type: "question",

                question:
                    question

            };
        }
    }


    /* ==========================================
       4. QUESTION WITHOUT QUESTION MARK
    ========================================== */

    const questionStarters = [

        "how ",
        "what ",
        "why ",
        "when ",
        "where ",
        "which ",
        "who ",
        "do ",
        "does ",
        "did ",
        "is ",
        "are ",
        "can ",
        "could ",
        "would ",
        "will ",
        "have ",
        "has "

    ];


    const lower =
        cleaned.toLowerCase();


    const looksLikeQuestion =
        questionStarters.some(
            starter =>
                lower.startsWith(
                    starter
                )
        );


    if (
        looksLikeQuestion &&
        cleaned.length > 5
    ) {

        console.warn(
            "AI returned a question without JSON. Converting automatically."
        );


        return {

            type: "question",

            question:
                cleaned

        };
    }


    /* ==========================================
       5. NOTHING UNDERSTOOD
    ========================================== */

    console.error(
        "Could not parse AI response:",
        cleaned
    );


    return null;
}


/* =========================================================
   SEND USER MESSAGE
========================================================= */

async function sendChatMessage() {

    if (chatBusy) {
        return;
    }


    const input =
        document.getElementById(
            "chatInput"
        );


    if (!input) {
        return;
    }


    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    /* =====================================
       DISPLAY USER MESSAGE
    ===================================== */

    addChatMessage(
        "user",
        text
    );


    /* =====================================
       SAVE TO CONVERSATION
    ===================================== */

    conversation.push({

        role: "user",

        content:
            text

    });


    /* =====================================
       CLEAR INPUT
    ===================================== */

    input.value = "";

    autoResizeInput();

    updateChatButton();


    /* =====================================
       ASK AI
    ===================================== */

    await askAI();
}


/* =========================================================
   CHAT MESSAGE UI
========================================================= */

function addChatMessage(
    type,
    text
) {

    const chatWindow =
        document.getElementById(
            "chatWindow"
        );


    if (!chatWindow) {
        return;
    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        `chat-message ${type}`;


    message.textContent =
        text;


    chatWindow.appendChild(
        message
    );


    scrollChatToBottom();
}


/* =========================================================
   TYPING INDICATOR
========================================================= */

function addTypingMessage() {

    const chatWindow =
        document.getElementById(
            "chatWindow"
        );


    if (!chatWindow) {
        return;
    }


    removeTypingMessage();


    const typing =
        document.createElement(
            "div"
        );


    typing.id =
        "typingMessage";


    typing.className =
        "chat-message ai typing";


    typing.textContent =
        "Thinking…";


    chatWindow.appendChild(
        typing
    );


    scrollChatToBottom();
}


/* =========================================================
   REMOVE TYPING
========================================================= */

function removeTypingMessage() {

    const typing =
        document.getElementById(
            "typingMessage"
        );


    if (typing) {

        typing.remove();
    }
}


/* =========================================================
   SCROLL CHAT
========================================================= */

function scrollChatToBottom() {

    const chatWindow =
        document.getElementById(
            "chatWindow"
        );


    if (!chatWindow) {
        return;
    }


    requestAnimationFrame(() => {

        chatWindow.scrollTop =
            chatWindow.scrollHeight;

    });
}


/* =========================================================
   CHAT BUTTON
========================================================= */

function updateChatButton() {

    const button =
        document.getElementById(
            "chatSend"
        );


    const input =
        document.getElementById(
            "chatInput"
        );


    if (!button) {
        return;
    }


    if (chatBusy) {

        button.disabled =
            true;

        button.textContent =
            "Thinking…";

        return;
    }


    button.disabled =
        !input ||
        !input.value.trim();


    button.textContent =
        "Send →";
}


/* =========================================================
   INPUT AUTO RESIZE
========================================================= */

function autoResizeInput() {

    const input =
        document.getElementById(
            "chatInput"
        );


    if (!input) {
        return;
    }


    input.style.height =
        "auto";


    input.style.height =
        `${Math.min(
            input.scrollHeight,
            140
        )}px`;
}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const input =
            document.getElementById(
                "chatInput"
            );


        if (!input) {
            return;
        }


        input.addEventListener(
            "input",
            () => {

                autoResizeInput();

                updateChatButton();

            }
        );


        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendChatMessage();

                }

            }
        );


        updateChatButton();

    }
);


/* =========================================================
   SHOW RESULT
========================================================= */

function showResult(
    result
) {

    const recommendation =
        document.getElementById(
            "recommendation"
        );


    const confidence =
        document.getElementById(
            "confidence"
        );


    const reasoning =
        document.getElementById(
            "reasoningText"
        );


    const reflection =
        document.getElementById(
            "reflectionText"
        );


    /* =====================================
       RECOMMENDATION
    ===================================== */

    if (recommendation) {

        recommendation.textContent =
            String(
                result.recommendation ||
                "UNCERTAIN"
            )
                .replace(
                    /_/g,
                    " "
                )
                .toUpperCase();
    }


    /* =====================================
       CONFIDENCE
    ===================================== */

    if (confidence) {

        const numericConfidence =
            Number(
                result.confidence
            );


        if (
            Number.isFinite(
                numericConfidence
            )
        ) {

            confidence.textContent =
                `${Math.round(
                    numericConfidence
                )}% confidence`;

        } else {

            confidence.textContent =
                "Moderate confidence";
        }
    }


    /* =====================================
       REASONING
    ===================================== */

    if (reasoning) {

        reasoning.textContent =
            result.reasoning ||
            "";
    }


    /* =====================================
       REFLECTION
    ===================================== */

    if (reflection) {

        reflection.textContent =
            result.reflection ||
            "";
    }


    /* =====================================
       RESULT ICON
    ===================================== */

    const icon =
        document.getElementById(
            "resultIcon"
        );


    if (icon) {

        const recommendationValue =
            String(
                result.recommendation ||
                ""
            ).toUpperCase();


        const icons = {

            KEEP: "♡",

            SELL: "↗",

            DONATE: "♡",

            DISCARD: "×",

            RECYCLE: "↻"

        };


        icon.textContent =
            icons[
                recommendationValue
            ] || "✦";
    }


    showStep(5);
}


/* =========================================================
   OLD FUNCTION COMPATIBILITY
========================================================= */

async function analyzeItem() {

    console.log(
        "The adaptive chat engine handles analysis automatically."
    );
}


/* =========================================================
   RESET
========================================================= */

function newItem() {

    selectedCategory = "";

    selectedRole = "";

    uploadedImage = null;

    itemType = "";

    conversation = [];

    chatBusy = false;


    /* =====================================
       FILE INPUT
    ===================================== */

    const input =
        document.getElementById(
            "imageInput"
        );


    if (input) {

        input.value = "";
    }


    /* =====================================
       IMAGE PREVIEW
    ===================================== */

    const preview =
        document.getElementById(
            "imagePreview"
        );


    if (preview) {

        if (
            preview.src &&
            preview.src.startsWith("blob:")
        ) {

            URL.revokeObjectURL(
                preview.src
            );
        }


        preview.src = "";

        preview.classList.add(
            "hidden"
        );
    }


    /* =====================================
       UPLOAD CONTENT
    ===================================== */

    const content =
        document.getElementById(
            "uploadContent"
        );


    if (content) {

        content.classList.remove(
            "hidden"
        );
    }


    /* =====================================
       IMAGE BUTTON
    ===================================== */

    const imageButton =
        document.getElementById(
            "imageContinue"
        );


    if (imageButton) {

        imageButton.disabled =
            true;
    }


    /* =====================================
       CATEGORY
    ===================================== */

    document
        .querySelectorAll(
            ".category-grid button"
        )
        .forEach(button => {

            button.classList.remove(
                "selected"
            );

        });


    const categoryButton =
        document.getElementById(
            "categoryContinue"
        );


    if (categoryButton) {

        categoryButton.disabled =
            true;
    }


    /* =====================================
       ROLES
    ===================================== */

    const roles =
        document.getElementById(
            "roles"
        );


    if (roles) {

        roles.innerHTML = "";
    }


    const roleButton =
        document.getElementById(
            "roleContinue"
        );


    if (roleButton) {

        roleButton.disabled =
            true;
    }


    /* =====================================
       CHAT
    ===================================== */

    const chatWindow =
        document.getElementById(
            "chatWindow"
        );


    if (chatWindow) {

        chatWindow.innerHTML = "";
    }


    const chatInput =
        document.getElementById(
            "chatInput"
        );


    if (chatInput) {

        chatInput.value = "";

        chatInput.style.height =
            "auto";
    }


    /* =====================================
       ITEM CONTEXT
    ===================================== */

    const confirmation =
        document.getElementById(
            "itemConfirmationText"
        );


    if (confirmation) {

        confirmation.textContent =
            "Getting ready...";
    }


    /* =====================================
       RESULT
    ===================================== */

    const recommendation =
        document.getElementById(
            "recommendation"
        );


    if (recommendation) {

        recommendation.textContent =
            "UNCERTAIN";
    }


    const confidence =
        document.getElementById(
            "confidence"
        );


    if (confidence) {

        confidence.textContent =
            "—";
    }


    const reasoning =
        document.getElementById(
            "reasoningText"
        );


    if (reasoning) {

        reasoning.textContent =
            "Your reasoning will appear here.";
    }


    const reflection =
        document.getElementById(
            "reflectionText"
        );


    if (reflection) {

        reflection.textContent =
            "";
    }


    showStep(1);
}


/* =========================================================
   SAVE
========================================================= */

function saveItem() {

    alert(
        "Saving items will be available in a future version."
    );
}
