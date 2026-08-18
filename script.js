/* =========================================================
   DECLUTTER.AI — ADAPTIVE CHAT ENGINE
   Full replacement script.js
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

let questionCount = 0;

let lastAIQuestion = "";

let identificationConfirmed = false;


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
        event.target.files &&
        event.target.files[0];

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

        if (preview.src) {
            URL.revokeObjectURL(preview.src);
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
   STEP NAVIGATION
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
                Math.max(
                    (step - 1) * 25,
                    0
                ),
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

    if (button) {

        button.classList.add(
            "selected"
        );
    }

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

    if (!selectedCategory) {

        alert(
            "Please choose a category first."
        );

        return;
    }

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

    selectedRole = "";

    const roleContinue =
        document.getElementById(
            "roleContinue"
        );

    if (roleContinue) {
        roleContinue.disabled = true;
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

    if (button) {

        button.classList.add(
            "selected"
        );
    }

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
   START CHAT
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

    questionCount = 0;

    lastAIQuestion = "";

    identificationConfirmed = false;

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

    updateChatButton();

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


        let data = null;

        try {

            data =
                await response.json();

        } catch (jsonError) {

            console.error(
                "Could not read API JSON:",
                jsonError
            );

            throw new Error(
                "The server returned an invalid response."
            );
        }


        removeTypingMessage();


        if (!response.ok) {

            console.error(
                "API error:",
                data
            );

            throw new Error(
                data?.error ||
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

            /*
               Last-resort fallback.

               If the AI returned plain text,
               treat it as a conversational
               question instead of crashing.
            */

            const plainText =
                extractPlainAIText(
                    aiContent
                );

            if (
                plainText &&
                looksLikeQuestion(
                    plainText
                )
            ) {

                console.warn(
                    "AI returned a plain question. Using it as a question."
                );

                handleAIQuestion(
                    plainText
                );

                return;
            }


            /*
               Try detecting a textual
               recommendation.
            */

            const fallbackResult =
                parseTextualRecommendation(
                    plainText
                );

            if (fallbackResult) {

                console.warn(
                    "AI returned a textual recommendation. Converting it automatically."
                );

                showResult(
                    fallbackResult
                );

                return;
            }


            console.error(
                "Could not parse AI response:",
                aiContent
            );

            throw new Error(
                "Could not understand AI response."
            );
        }


        /* =====================================
           AI QUESTION
        ===================================== */

        if (
            parsed.type ===
            "question"
        ) {

            handleAIQuestion(
                parsed.question
            );

            return;
        }


        /* =====================================
           AI RESULT
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


        /*
           Some models may return an object
           without the "type" field.
        */

        if (
            parsed.question
        ) {

            handleAIQuestion(
                parsed.question
            );

            return;
        }


        if (
            parsed.recommendation
        ) {

            showResult({

                type: "result",

                recommendation:
                    parsed.recommendation,

                confidence:
                    parsed.confidence ||
                    70,

                reasoning:
                    parsed.reasoning ||
                    "Based on the information you provided.",

                reflection:
                    parsed.reflection ||
                    ""

            });

            return;
        }


        throw new Error(
            "Unknown AI response format."
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
   HANDLE AI QUESTION
========================================================= */

function handleAIQuestion(
    question
) {

    if (!question) {
        return;
    }

    const cleanedQuestion =
        String(question)
            .trim();

    if (!cleanedQuestion) {
        return;
    }


    /*
       Prevent exact duplicate questions.
    */

    if (
        lastAIQuestion &&
        normalizeText(
            lastAIQuestion
        ) ===
        normalizeText(
            cleanedQuestion
        )
    ) {

        console.warn(
            "Duplicate AI question ignored."
        );

        return;
    }


    lastAIQuestion =
        cleanedQuestion;

    questionCount++;


    addChatMessage(
        "ai",
        cleanedQuestion
    );


    conversation.push({

        role: "assistant",

        content:
            cleanedQuestion

    });


    updateChatButton();
}


/* =========================================================
   PARSE AI RESPONSE
========================================================= */

function parseAIResponse(
    content
) {

    if (
        content === null ||
        content === undefined
    ) {

        return null;
    }


    let cleaned =
        String(content)
            .trim();


    if (!cleaned) {
        return null;
    }


    /*
       Remove common markdown wrappers.
    */

    cleaned =
        cleaned
            .replace(
                /^```json\s*/i,
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


    /*
       Remove accidental "JSON:" prefix.
    */

    cleaned =
        cleaned.replace(
            /^json\s*:/i,
            ""
        )
        .trim();


    /*
       Direct JSON.
    */

    try {

        const direct =
            JSON.parse(
                cleaned
            );

        if (
            direct &&
            typeof direct === "object"
        ) {

            return direct;
        }

    } catch (error) {

        console.warn(
            "Direct JSON parsing failed."
        );
    }


    /*
       Extract the first complete
       JSON object from surrounding text.
    */

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

            const extracted =
                JSON.parse(
                    jsonPart
                );

            if (
                extracted &&
                typeof extracted ===
                    "object"
            ) {

                return extracted;
            }

        } catch (error) {

            console.error(
                "JSON extraction failed:",
                error
            );
        }
    }


    /*
       Try repairing simple JSON
       formatting mistakes.
    */

    try {

        const repaired =
            repairSimpleJSON(
                cleaned
            );

        if (repaired) {
            return repaired;
        }

    } catch (error) {

        console.warn(
            "JSON repair failed."
        );
    }


    return null;
}


/* =========================================================
   SIMPLE JSON REPAIR
========================================================= */

function repairSimpleJSON(
    text
) {

    let candidate =
        text.trim();


    /*
       Extract object again.
    */

    const start =
        candidate.indexOf("{");

    const end =
        candidate.lastIndexOf("}");


    if (
        start === -1 ||
        end === -1
    ) {

        return null;
    }


    candidate =
        candidate.substring(
            start,
            end + 1
        );


    /*
       Remove trailing commas.
    */

    candidate =
        candidate.replace(
            /,\s*([}\]])/g,
            "$1"
        );


    try {

        return JSON.parse(
            candidate
        );

    } catch (error) {

        return null;
    }
}


/* =========================================================
   EXTRACT PLAIN AI TEXT
========================================================= */

function extractPlainAIText(
    content
) {

    if (
        content === null ||
        content === undefined
    ) {

        return "";
    }

    let text =
        String(content)
            .trim();


    text =
        text
            .replace(
                /^```[\w-]*\s*/i,
                ""
            )
            .replace(
                /\s*```$/i,
                ""
            )
            .trim();


    return text;
}


/* =========================================================
   QUESTION DETECTION
========================================================= */

function looksLikeQuestion(
    text
) {

    if (!text) {
        return false;
    }

    const value =
        text.trim();


    if (
        value.endsWith("?")
    ) {

        return true;
    }


    const lower =
        value.toLowerCase();


    const questionStarters = [

        "how ",
        "what ",
        "when ",
        "where ",
        "why ",
        "which ",
        "who ",
        "is ",
        "are ",
        "do ",
        "does ",
        "did ",
        "have ",
        "has ",
        "can ",
        "could ",
        "would ",
        "will ",
        "was ",
        "were ",
        "tell me ",
        "how often ",
        "how long ",
        "how much ",
        "how many "

    ];


    return questionStarters.some(
        starter =>
            lower.startsWith(
                starter
            )
    );
}


/* =========================================================
   TEXTUAL RECOMMENDATION PARSER
========================================================= */

function parseTextualRecommendation(
    text
) {

    if (!text) {
        return null;
    }

    const lower =
        text.toLowerCase();


    let recommendation =
        null;


    if (
        /\bkeep\b/.test(
            lower
        ) &&
        !/\b(shouldn't|not|don't|do not)\s+keep\b/.test(
            lower
        )
    ) {

        recommendation =
            "KEEP";
    }


    if (
        /\bsell\b/.test(
            lower
        )
    ) {

        recommendation =
            "SELL";
    }


    if (
        /\bdonate\b/.test(
            lower
        )
    ) {

        recommendation =
            "DONATE";
    }


    if (
        /\bdiscard\b/.test(
            lower
        ) ||
        /\bthrow (it|this) away\b/.test(
            lower
        )
    ) {

        recommendation =
            "DISCARD";
    }


    if (
        /\brecycle\b/.test(
            lower
        ) ||
        /\brecycling\b/.test(
            lower
        )
    ) {

        recommendation =
            "RECYCLE";
    }


    if (!recommendation) {
        return null;
    }


    let confidence =
        70;


    const percentage =
        text.match(
            /(\d{1,3})\s*%/
        );


    if (percentage) {

        confidence =
            Math.min(
                100,
                Math.max(
                    0,
                    Number(
                        percentage[1]
                    )
                )
            );
    }


    return {

        type: "result",

        recommendation,

        confidence,

        reasoning:
            text,

        reflection:
            ""

    };
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


    /*
       Display user message.
    */

    addChatMessage(
        "user",
        text
    );


    /*
       Store user message.
    */

    conversation.push({

        role: "user",

        content: text

    });


    /*
       Clear input.
    */

    input.value = "";

    autoResizeInput();

    updateChatButton();


    /*
       Ask AI.
    */

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

        console.warn(
            "Missing #chatWindow element."
        );

        return;
    }


    if (
        text === null ||
        text === undefined
    ) {

        return;
    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        `chat-message ${type}`;


    message.textContent =
        String(text);


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
   TEXT NORMALIZATION
========================================================= */

function normalizeText(
    text
) {

    return String(
        text || ""
    )
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}


/* =========================================================
   KEYBOARD / INPUT EVENTS
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

                /*
                   Enter = send
                   Shift + Enter = newline
                */

                if (
                    event.key ===
                    "Enter" &&
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

    if (!result) {
        return;
    }


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


    /*
       Recommendation
    */

    let recommendationValue =
        String(
            result.recommendation ||
            "UNCERTAIN"
        )
            .trim()
            .toUpperCase();


    recommendationValue =
        recommendationValue.replace(
            /[\s-]+/g,
            "_"
        );


    const validRecommendations = [

        "KEEP",
        "SELL",
        "DONATE",
        "DISCARD",
        "RECYCLE"

    ];


    if (
        !validRecommendations.includes(
            recommendationValue
        )
    ) {

        recommendationValue =
            "UNCERTAIN";
    }


    if (recommendation) {

        recommendation.textContent =
            recommendationValue
                .replace(
                    /_/g,
                    " "
                );
    }


    /*
       Confidence
    */

    if (confidence) {

        let value =
            Number(
                result.confidence
            );


        if (
            !Number.isFinite(
                value
            )
        ) {

            value = 70;
        }


        value =
            Math.round(
                Math.min(
                    100,
                    Math.max(
                        0,
                        value
                    )
                )
            );


        confidence.textContent =
            `${value}% confidence`;
    }


    /*
       Reasoning
    */

    if (reasoning) {

        reasoning.textContent =
            result.reasoning ||
            "Based on the information you provided.";
    }


    /*
       Reflection
    */

    if (reflection) {

        reflection.textContent =
            result.reflection ||
            "";
    }


    /*
       Result icon
    */

    const icon =
        document.getElementById(
            "resultIcon"
        );


    if (icon) {

        const icons = {

            KEEP: "♡",

            SELL: "↗",

            DONATE: "♡",

            DISCARD: "×",

            RECYCLE: "↻",

            UNCERTAIN: "✦"

        };


        icon.textContent =
            icons[
                recommendationValue
            ] || "✦";
    }


    /*
       Save the final AI result
       in conversation.
    */

    conversation.push({

        role: "assistant",

        content:
            JSON.stringify({

                type: "result",

                recommendation:
                    recommendationValue,

                confidence:
                    result.confidence,

                reasoning:
                    result.reasoning,

                reflection:
                    result.reflection

            })

    });


    showStep(5);
}


/* =========================================================
   OLD FUNCTION COMPATIBILITY
========================================================= */

async function analyzeItem() {

    /*
       The new adaptive chat handles
       analysis automatically.

       Kept here so old HTML does not
       throw an error.
    */

    if (
        conversation.length === 0
    ) {

        await askAI();

        return;
    }


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

    questionCount = 0;

    lastAIQuestion = "";

    identificationConfirmed = false;


    /*
       Reset file input.
    */

    const input =
        document.getElementById(
            "imageInput"
        );


    if (input) {

        input.value = "";
    }


    /*
       Reset image preview.
    */

    const preview =
        document.getElementById(
            "imagePreview"
        );


    if (preview) {

        if (
            preview.src &&
            preview.src.startsWith(
                "blob:"
            )
        ) {

            try {

                URL.revokeObjectURL(
                    preview.src
                );

            } catch (error) {

                console.warn(
                    "Could not revoke image URL."
                );
            }
        }


        preview.src = "";

        preview.classList.add(
            "hidden"
        );
    }


    /*
       Restore upload content.
    */

    const content =
        document.getElementById(
            "uploadContent"
        );


    if (content) {

        content.classList.remove(
            "hidden"
        );
    }


    /*
       Reset image button.
    */

    const imageButton =
        document.getElementById(
            "imageContinue"
        );


    if (imageButton) {

        imageButton.disabled =
            true;
    }


    /*
       Reset category buttons.
    */

    document
        .querySelectorAll(
            ".category-grid button"
        )
        .forEach(button => {

            button.classList.remove(
                "selected"
            );

        });


    /*
       Reset category button.
    */

    const categoryButton =
        document.getElementById(
            "categoryContinue"
        );


    if (categoryButton) {

        categoryButton.disabled =
            true;
    }


    /*
       Reset roles.
    */

    const roles =
        document.getElementById(
            "roles"
        );


    if (roles) {

        roles.innerHTML = "";
    }


    /*
       Reset role button.
    */

    const roleButton =
        document.getElementById(
            "roleContinue"
        );


    if (roleButton) {

        roleButton.disabled =
            true;
    }


    /*
       Reset chat.
    */

    const chatWindow =
        document.getElementById(
            "chatWindow"
        );


    if (chatWindow) {

        chatWindow.innerHTML = "";
    }


    /*
       Reset chat input.
    */

    const chatInput =
        document.getElementById(
            "chatInput"
        );


    if (chatInput) {

        chatInput.value = "";

        chatInput.style.height =
            "auto";
    }


    /*
       Reset item context.
    */

    const confirmation =
        document.getElementById(
            "itemConfirmationText"
        );


    if (confirmation) {

        confirmation.textContent =
            "Getting ready...";
    }


    /*
       Reset result.
    */

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


    const resultIcon =
        document.getElementById(
            "resultIcon"
        );


    if (resultIcon) {

        resultIcon.textContent =
            "✦";
    }


    updateChatButton();

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


/* =========================================================
   OPTIONAL DEBUG HELPER
========================================================= */

window.DeclutterAI = {

    getState() {

        return {

            selectedCategory,

            selectedRole,

            itemType,

            questionCount,

            conversation,

            chatBusy

        };

    },

    reset() {

        newItem();

    }

};
