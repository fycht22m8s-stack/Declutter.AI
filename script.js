/* =========================================================
   DECLUTTER.AI — FINAL CHAT ENGINE
========================================================= */


/* =========================================================
   GLOBAL STATE
========================================================= */

let selectedCategory = "";
let selectedRole = "";

let uploadedImage = null;
let uploadedImageData = "";

let itemType = "";

let conversation = [];

let questionCount = 0;

let chatBusy = false;

let currentStep = 1;

let loadingTimer = null;


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
        event?.target?.files?.[0];

    if (!file) {
        return;
    }

    uploadedImage =
        file;


    const preview =
        document.getElementById(
            "imagePreview"
        );

    const content =
        document.getElementById(
            "uploadContent"
        );


    if (preview) {

        const objectURL =
            URL.createObjectURL(file);

        preview.src =
            objectURL;

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


    /*
       Convert image to base64
       so Worker can send it to
       the vision model.
    */

    const reader =
        new FileReader();


    reader.onload =
        function () {

            uploadedImageData =
                reader.result;

            console.log(
                "Image loaded for AI:",
                uploadedImageData.slice(
                    0,
                    80
                ) + "..."
            );
        };


    reader.onerror =
        function () {

            console.error(
                "Could not read image."
            );

            uploadedImageData =
                "";
        };


    reader.readAsDataURL(file);
}


/* =========================================================
   STEPS
========================================================= */

function showStep(step) {

    currentStep =
        step;


    document
        .querySelectorAll(
            ".app-step"
        )
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

    if (!selectedCategory) {
        return;
    }


    const container =
        document.getElementById(
            "roles"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    const roles =
        rolesByCategory[
            selectedCategory
        ] || [
            "Everyday",
            "Occasional",
            "Sentimental",
            "Other"
        ];


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


        button.onclick =
            () => {

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
   GENERATE QUESTIONS
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
            "Please choose the role first."
        );

        return;
    }


    conversation =
        [];

    itemType =
        "";

    questionCount =
        0;


    const chatWindow =
        document.getElementById(
            "chatWindow"
        );


    if (chatWindow) {

        chatWindow.innerHTML =
            "";
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
       Wait until FileReader has finished.
    */

    if (
        uploadedImage &&
        !uploadedImageData
    ) {

        setLoadingStatus(
            "Preparing your image..."
        );

        await waitForImage();
    }


    await identifyItem();
}


/* =========================================================
   WAIT FOR IMAGE
========================================================= */

function waitForImage() {

    return new Promise(
        resolve => {

            let attempts =
                0;


            const timer =
                setInterval(
                    () => {

                        attempts++;


                        if (
                            uploadedImageData ||
                            attempts > 50
                        ) {

                            clearInterval(
                                timer
                            );

                            resolve();
                        }

                    },
                    100
                );
        }
    );
}


/* =========================================================
   IDENTIFY ITEM
========================================================= */

async function identifyItem() {

    setLoadingStatus(
        "Looking closely at your item..."
    );


    try {

        const data =
            await apiRequest(
                {
                    mode: "identify",

                    category:
                        selectedCategory,

                    role:
                        selectedRole,

                    image:
                        uploadedImageData

                },
                true
            );


        const aiContent =
            extractAIContent(
                data
            );


        console.log(
            "RAW IDENTIFICATION:",
            aiContent
        );


        const parsed =
            parseAIResponse(
                aiContent,
                "identification"
            );


        if (
            !parsed ||
            parsed.type !==
            "identification"
        ) {

            throw new Error(
                "Could not understand identification."
            );
        }


        itemType =
            parsed.itemType ||
            "unknown item";


        console.log(
            "Identified item:",
            itemType,
            "confidence:",
            parsed.confidence
        );


        /*
           Add identification to chat.
        */

        const opening =
            parsed.openingQuestion ||
            `I think this is a ${itemType}. Is that right?`;


        addChatMessage(
            "ai",
            `I think this is a ${itemType}. ${opening}`
        );


        conversation.push({

            role: "assistant",

            content:
                `I think this is a ${itemType}. ${opening}`

        });


        /*
           We don't count confirmation
           as a real decision question.
        */

        return;


    } catch (error) {

        console.error(
            "Identification error:",
            error
        );


        /*
           Even if identification fails,
           allow the user to continue.
        */

        itemType =
            "the item shown in the photo";


        addChatMessage(
            "ai",
            "I couldn't identify the item with enough confidence. Tell me what it is, and I'll take it from there."
        );


        conversation.push({

            role: "assistant",

            content:
                "I couldn't identify the item with enough confidence. Tell me what it is, and I'll take it from there."

        });

    }
}


/* =========================================================
   ASK AI
========================================================= */

async function askAI() {

    if (chatBusy) {
        return;
    }


    chatBusy =
        true;


    setLoadingStatus(
        getThinkingStatus()
    );


    try {

        const data =
            await apiRequest(
                {
                    mode: "chat",

                    category:
                        selectedCategory,

                    role:
                        selectedRole,

                    itemType:
                        itemType ||
                        "unknown item",

                    questionCount:
                        questionCount,

                    conversation:
                        conversation

                },
                false
            );


        const aiContent =
            extractAIContent(
                data
            );


        console.log(
            "RAW AI RESPONSE:",
            aiContent
        );


        const parsed =
            parseAIResponse(
                aiContent,
                "chat"
            );


        if (!parsed) {

            throw new Error(
                "Could not understand AI response."
            );
        }


        /* =========================================
           MESSAGE
        ========================================= */

        if (
            parsed.type ===
            "message"
        ) {

            const question =
                String(
                    parsed.question ||
                    ""
                ).trim();


            const text =
                String(
                    parsed.text ||
                    ""
                ).trim();


            if (text) {

                addChatMessage(
                    "ai",
                    text
                );

                conversation.push({

                    role:
                        "assistant",

                    content:
                        text

                });
            }


            if (question) {

                addChatMessage(
                    "ai",
                    question
                );


                conversation.push({

                    role:
                        "assistant",

                    content:
                        question

                });


                questionCount++;

                return;
            }
        }


        /* =========================================
           QUESTION FALLBACK
        ========================================= */

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
                    "AI returned an empty question."
                );
            }


            addChatMessage(
                "ai",
                question
            );


            conversation.push({

                role:
                    "assistant",

                content:
                    question

            });


            questionCount++;

            return;
        }


        /* =========================================
           RESULT
        ========================================= */

        if (
            parsed.type ===
            "result"
        ) {

            conversation.push({

                role:
                    "assistant",

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

        console.error(
            "Declutter AI error:",
            error
        );


        addChatMessage(
            "ai",
            getFriendlyError(
                error
            )
        );

    } finally {

        chatBusy =
            false;

        removeLoadingStatus();

        updateChatButton();
    }
}


/* =========================================================
   API REQUEST WITH CLIENT RETRY
========================================================= */

async function apiRequest(
    payload,
    identification = false
) {

    const maxAttempts =
        3;


    for (
        let attempt = 0;
        attempt < maxAttempts;
        attempt++
    ) {

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

                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );


            const data =
                await response.json();


            if (
                response.ok
            ) {

                return data;
            }


            /*
               429 = rate limit.
            */

            if (
                response.status ===
                429
            ) {

                if (
                    attempt <
                    maxAttempts - 1
                ) {

                    const seconds =
                        Math.min(
                            2 +
                            attempt * 2,
                            6
                        );


                    setLoadingStatus(
                        `AI is busy right now — retrying in ${seconds}s...`
                    );


                    await sleep(
                        seconds * 1000
                    );


                    continue;
                }


                throw new Error(
                    "RATE_LIMIT"
                );
            }


            throw new Error(
                data?.error ||
                `API error ${response.status}`
            );


        } catch (error) {

            if (
                error.message ===
                "RATE_LIMIT"
            ) {

                throw error;
            }


            if (
                attempt <
                maxAttempts - 1
            ) {

                setLoadingStatus(
                    "Connection hiccup — trying again..."
                );


                await sleep(
                    1500 *
                    (attempt + 1)
                );


                continue;
            }


            throw error;
        }
    }


    throw new Error(
        "AI request failed."
    );
}


/* =========================================================
   PARSE AI RESPONSE
========================================================= */

function parseAIResponse(
    content,
    context = "chat"
) {

    if (
        !content ||
        typeof content !==
        "string"
    ) {

        return null;
    }


    let cleaned =
        content.trim();


    /*
       Remove markdown fences.
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
       Direct JSON.
    */

    try {

        return JSON.parse(
            cleaned
        );

    } catch (error) {

        console.warn(
            "Direct JSON parsing failed."
        );
    }


    /*
       Extract first JSON object.
    */

    const firstBrace =
        cleaned.indexOf(
            "{"
        );

    const lastBrace =
        cleaned.lastIndexOf(
            "}"
        );


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

            return JSON.parse(
                jsonPart
            );

        } catch (error) {

            console.warn(
                "JSON extraction failed."
            );
        }
    }


    /*
       Some models occasionally
       return a plain question.
    */

    if (
        context ===
        "chat"
    ) {

        const looksLikeQuestion =
            cleaned.includes(
                "?"
            );


        if (
            looksLikeQuestion &&
            cleaned.length <
            500
        ) {

            console.warn(
                "AI returned a plain question. Converting automatically."
            );


            return {

                type:
                    "question",

                question:
                    cleaned

            };
        }
    }


    console.error(
        "Could not parse AI response:",
        content
    );


    return null;
}


/* =========================================================
   EXTRACT AI CONTENT
========================================================= */

function extractAIContent(
    data
) {

    return (
        data
            ?.result
            ?.choices?.[0]
            ?.message
            ?.content ||
        data
            ?.choices?.[0]
            ?.message
            ?.content ||
        ""
    );
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
       Show user message.
    */

    addChatMessage(
        "user",
        text
    );


    /*
       Save user message.
    */

    conversation.push({

        role:
            "user",

        content:
            text

    });


    input.value =
        "";


    autoResizeInput();


    await askAI();
}


/* =========================================================
   CHAT MESSAGE
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
   THINKING STATUS
========================================================= */

function setLoadingStatus(
    text
) {

    let element =
        document.getElementById(
            "aiLoadingStatus"
        );


    if (!element) {

        const chatWindow =
            document.getElementById(
                "chatWindow"
            );


        if (!chatWindow) {
            return;
        }


        element =
            document.createElement(
                "div"
            );


        element.id =
            "aiLoadingStatus";


        element.className =
            "ai-loading-status";


        chatWindow.appendChild(
            element
        );
    }


    element.innerHTML = `

        <div class="ai-loading-spinner"></div>

        <div class="ai-loading-content">

            <strong>
                Declutter.AI
            </strong>

            <span id="aiLoadingText">
                ${escapeHTML(text)}
            </span>

            <div class="ai-loading-dots">
                <i></i>
                <i></i>
                <i></i>
            </div>

        </div>

    `;


    scrollChatToBottom();


    /*
       Small rotating status text.
    */

    clearInterval(
        loadingTimer
    );


    const statuses = [

        "Thinking about your answer...",

        "Looking for what matters...",

        "Personalizing the next question...",

        "Checking the bigger picture..."

    ];


    let index =
        0;


    loadingTimer =
        setInterval(
            () => {

                const textElement =
                    document.getElementById(
                        "aiLoadingText"
                    );


                if (
                    textElement &&
                    chatBusy
                ) {

                    textElement.textContent =
                        statuses[
                            index %
                            statuses.length
                        ];

                    index++;
                }

            },
            2500
        );
}


function removeLoadingStatus() {

    clearInterval(
        loadingTimer
    );


    loadingTimer =
        null;


    const element =
        document.getElementById(
            "aiLoadingStatus"
        );


    if (element) {

        element.remove();
    }
}


/* =========================================================
   THINKING TEXT
========================================================= */

function getThinkingStatus() {

    if (
        questionCount ===
        0
    ) {

        return "Thinking about where to start...";
    }


    if (
        questionCount <
        3
    ) {

        return "Getting to know your item...";
    }


    if (
        questionCount <
        6
    ) {

        return "Looking at the bigger picture...";
    }


    return "Figuring out what makes the most sense...";
}


/* =========================================================
   FRIENDLY ERRORS
========================================================= */

function getFriendlyError(
    error
) {

    if (
        error?.message ===
        "RATE_LIMIT"
    ) {

        return "The AI is a little busy right now. Give it a few seconds and try sending your answer again.";
    }


    return "I hit a temporary connection problem. Your conversation is still here — try sending your answer again.";
}


/* =========================================================
   TYPING COMPATIBILITY
========================================================= */

function addTypingMessage() {

    setLoadingStatus(
        "Thinking..."
    );
}


function removeTypingMessage() {

    removeLoadingStatus();
}


/* =========================================================
   SCROLL
========================================================= */

function scrollChatToBottom() {

    const chatWindow =
        document.getElementById(
            "chatWindow"
        );


    if (!chatWindow) {
        return;
    }


    requestAnimationFrame(
        () => {

            chatWindow.scrollTop =
                chatWindow.scrollHeight;

        }
    );
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
   INPUT RESIZE
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


    const value =
        String(
            result.recommendation ||
            "UNCERTAIN"
        )
            .replace(
                /_/g,
                " "
            )
            .toUpperCase();


    if (recommendation) {

        recommendation.textContent =
            value;
    }


    if (confidence) {

        const number =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(
                        result.confidence
                    ) || 0
                )
            );


        confidence.textContent =
            `${number}% confidence`;
    }


    if (reasoning) {

        reasoning.textContent =
            result.reasoning ||
            "The AI could not provide detailed reasoning.";
    }


    if (reflection) {

        reflection.textContent =
            result.reflection ||
            "";
    }


    const icon =
        document.getElementById(
            "resultIcon"
        );


    if (icon) {

        const icons = {

            KEEP:
                "♡",

            SELL:
                "↗",

            DONATE:
                "♡",

            DISCARD:
                "×",

            RECYCLE:
                "↻"

        };


        icon.textContent =
            icons[
                value.replace(
                    " ",
                    "_"
                )
            ] ||
            "✦";
    }


    showStep(5);
}


/* =========================================================
   OLD HTML COMPATIBILITY
========================================================= */

async function analyzeItem() {

    /*
       Old HTML may still call this.
       The new chat engine performs
       the analysis automatically.
    */

    if (
        !chatBusy &&
        conversation.length > 0
    ) {

        await askAI();
    }
}


/* =========================================================
   RESET
========================================================= */

function newItem() {

    selectedCategory =
        "";

    selectedRole =
        "";

    uploadedImage =
        null;

    uploadedImageData =
        "";

    itemType =
        "";

    conversation =
        [];

    questionCount =
        0;

    chatBusy =
        false;


    removeLoadingStatus();


    const fileInput =
        document.getElementById(
            "imageInput"
        );


    if (fileInput) {

        fileInput.value =
            "";
    }


    const preview =
        document.getElementById(
            "imagePreview"
        );


    if (preview) {

        preview.src =
            "";

        preview.classList.add(
            "hidden"
        );
    }


    const uploadContent =
        document.getElementById(
            "uploadContent"
        );


    if (uploadContent) {

        uploadContent.classList.remove(
            "hidden"
        );
    }


    const imageButton =
        document.getElementById(
            "imageContinue"
        );


    if (imageButton) {

        imageButton.disabled =
            true;
    }


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


    const roles =
        document.getElementById(
            "roles"
        );


    if (roles) {

        roles.innerHTML =
            "";
    }


    const roleButton =
        document.getElementById(
            "roleContinue"
        );


    if (roleButton) {

        roleButton.disabled =
            true;
    }


    const chatWindow =
        document.getElementById(
            "chatWindow"
        );


    if (chatWindow) {

        chatWindow.innerHTML =
            "";
    }


    const chatInput =
        document.getElementById(
            "chatInput"
        );


    if (chatInput) {

        chatInput.value =
            "";

        chatInput.style.height =
            "auto";
    }


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


/* =========================================================
   UTILITIES
========================================================= */

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}


function escapeHTML(
    value
) {

    return String(
        value
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


console.log(
    "Declutter.AI final script loaded."
);
