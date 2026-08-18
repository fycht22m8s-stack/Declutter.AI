/* =========================================================
   DECLUTTER.AI — PRODUCTION CHAT ENGINE
   ========================================================= */

"use strict";


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let selectedCategory = "";
let selectedRole = "";

let uploadedImage = null;
let uploadedImageData = "";

let itemType = "";
let itemIdentificationConfidence = 0;

let conversation = [];

let chatBusy = false;
let currentAbortController = null;

let currentStep = 1;

let loadingTimer = null;
let loadingStartedAt = 0;

let identificationCache = null;


/* =========================================================
   API
   ========================================================= */

const API_URL =
    "https://declutter-ai-api.plewko-olga.workers.dev/";


/* =========================================================
   CONFIG
   ========================================================= */

const REQUEST_TIMEOUT = 60000;

const IMAGE_MAX_WIDTH = 1400;

const MAX_IMAGE_DATA_LENGTH = 1800000;


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
   STEP SYSTEM
   ========================================================= */

function showStep(step) {

    currentStep = step;

    document
        .querySelectorAll(".app-step")
        .forEach(section => {
            section.classList.add("hidden");
        });

    const target =
        document.getElementById(`step${step}`);

    if (target) {
        target.classList.remove("hidden");
    }

    updateProgress(step);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function nextStep(step) {
    showStep(step);
}


/* =========================================================
   PROGRESS
   ========================================================= */

function updateProgress(step) {

    const progress =
        document.getElementById("progress");

    const label =
        document.getElementById("step-label");

    if (progress) {

        const percentage =
            Math.min(
                ((step - 1) / 4) * 100,
                100
            );

        progress.style.width =
            `${percentage}%`;
    }

    if (label) {
        label.textContent =
            `Step ${step} of 5`;
    }
}


/* =========================================================
   IMAGE PREVIEW
   ========================================================= */

async function previewImage(event) {

    const file =
        event.target.files?.[0];

    if (!file) {
        return;
    }

    uploadedImage = file;

    try {

        uploadedImageData =
            await prepareImage(file);

        console.log(
            "Image loaded for AI:",
            uploadedImageData.substring(0, 80) + "..."
        );

    } catch (error) {

        console.error(
            "Image preparation failed:",
            error
        );

        uploadedImageData = "";

        alert(
            "I couldn't prepare this image. Please try another image."
        );

        return;
    }


    const preview =
        document.getElementById("imagePreview");

    const content =
        document.getElementById("uploadContent");

    if (preview) {

        preview.src =
            uploadedImageData;

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
   IMAGE PREPARATION
   ========================================================= */

function prepareImage(file) {

    return new Promise((resolve, reject) => {

        const reader =
            new FileReader();

        reader.onload = () => {

            const image =
                new Image();

            image.onload = () => {

                let width =
                    image.naturalWidth;

                let height =
                    image.naturalHeight;


                if (width > IMAGE_MAX_WIDTH) {

                    const ratio =
                        IMAGE_MAX_WIDTH / width;

                    width =
                        IMAGE_MAX_WIDTH;

                    height =
                        Math.round(
                            height * ratio
                        );
                }


                const canvas =
                    document.createElement("canvas");

                canvas.width =
                    width;

                canvas.height =
                    height;


                const context =
                    canvas.getContext("2d");

                context.drawImage(
                    image,
                    0,
                    0,
                    width,
                    height
                );


                let data =
                    canvas.toDataURL(
                        "image/webp",
                        0.82
                    );


                if (
                    data.length >
                    MAX_IMAGE_DATA_LENGTH
                ) {

                    data =
                        canvas.toDataURL(
                            "image/jpeg",
                            0.72
                        );
                }


                resolve(data);
            };


            image.onerror =
                reject;

            image.src =
                reader.result;
        };


        reader.onerror =
            reject;

        reader.readAsDataURL(file);
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
        continueButton.disabled = false;
    }
}


/* =========================================================
   GENERATE ROLES
   ========================================================= */

function generateRoles() {

    const container =
        document.getElementById("roles");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const roles =
        rolesByCategory[selectedCategory] || [];

    roles.forEach(role => {

        const button =
            document.createElement("button");

        button.type =
            "button";

        button.className =
            "role-button";

        button.textContent =
            role;

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
        .querySelectorAll(".role-button")
        .forEach(btn => {
            btn.classList.remove("selected");
        });

    button.classList.add("selected");

    selectedRole =
        role;

    const continueButton =
        document.getElementById(
            "roleContinue"
        );

    if (continueButton) {
        continueButton.disabled = false;
    }
}


/* =========================================================
   START ANALYSIS
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

    if (!uploadedImageData) {

        alert(
            "Please upload an image first."
        );

        return;
    }


    conversation = [];

    itemType = "";

    itemIdentificationConfidence = 0;


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
       First identify the object visually.
    */

    await identifyItem();
}


/* =========================================================
   IDENTIFY ITEM
   ========================================================= */

async function identifyItem() {

    if (!uploadedImageData) {

        addChatMessage(
            "ai",
            "I couldn't access the image. Please upload it again."
        );

        return;
    }


    /*
       Session cache.
    */

    const cacheKey =
        createImageCacheKey(
            uploadedImageData,
            selectedCategory,
            selectedRole
        );


    if (
        identificationCache &&
        identificationCache.key === cacheKey
    ) {

        itemType =
            identificationCache.itemType;

        itemIdentificationConfidence =
            identificationCache.confidence;

        addIdentificationMessage(
            identificationCache.itemType,
            identificationCache.confidence
        );

        await askAI();

        return;
    }


    startLoading(
        "Looking at your item…",
        "Identifying the object"
    );


    try {

        const data =
            await apiRequest(
                "identify",
                {
                    category:
                        selectedCategory,

                    role:
                        selectedRole,

                    image:
                        uploadedImageData
                }
            );


        const identification =
            extractIdentification(data);


        if (!identification) {

            throw new Error(
                "AI returned no identification."
            );
        }


        itemType =
            identification.itemType;

        itemIdentificationConfidence =
            Number(
                identification.confidence || 0
            );


        identificationCache = {

            key:
                cacheKey,

            itemType:
                itemType,

            confidence:
                itemIdentificationConfidence

        };


        stopLoading();


        addIdentificationMessage(
            itemType,
            itemIdentificationConfidence
        );


        /*
           Ask for confirmation if confidence
           is not very high.
        */

        if (
            itemIdentificationConfidence < 80
        ) {

            addChatMessage(
                "ai",
                identification.openingQuestion ||
                `I think this is ${itemType}. Did I identify it correctly?`
            );

            conversation.push({

                role:
                    "assistant",

                content:
                    identification.openingQuestion ||
                    `I think this is ${itemType}. Did I identify it correctly?`

            });

            return;
        }


        /*
           High confidence.
        */

        conversation.push({

            role:
                "assistant",

            content:
                `I identified the item as: ${itemType}.`

        });


        await askAI();


    } catch (error) {

        stopLoading();

        console.error(
            "Identification error:",
            error
        );


        addChatMessage(
            "ai",
            "I couldn't identify the item clearly enough. Tell me what it is, and I'll continue from there."
        );


        conversation.push({

            role:
                "assistant",

            content:
                "I couldn't identify the item clearly enough."

        });

    }
}


/* =========================================================
   IDENTIFICATION UI
   ========================================================= */

function addIdentificationMessage(
    type,
    confidence
) {

    const confidenceText =
        confidence >= 85
            ? "I'm fairly confident."
            : confidence >= 65
                ? "I'm reasonably confident."
                : "I'm not completely sure.";

    addChatMessage(
        "ai",
        `I think this is a ${type}. ${confidenceText}`
    );
}


/* =========================================================
   ASK AI
   ========================================================= */

async function askAI() {

    if (chatBusy) {
        return;
    }


    chatBusy = true;


    startLoading(
        "Thinking…",
        "Choosing the next useful question"
    );


    addTypingMessage();


    try {

        const data =
            await apiRequest(
                "chat",
                {
                    category:
                        selectedCategory,

                    role:
                        selectedRole,

                    itemType:
                        itemType ||
                        "unknown item",

                    conversation:
                        conversation
                }
            );


        removeTypingMessage();

        stopLoading();


        const aiContent =
            extractAIContent(data);


        if (!aiContent) {

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
               If the model ignored JSON and
               returned a plain question, keep
               the conversation alive.
            */

            if (
                looksLikeQuestion(
                    aiContent
                )
            ) {

                console.warn(
                    "AI returned a plain question. Converting automatically."
                );


                const question =
                    cleanPlainQuestion(
                        aiContent
                    );


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


                return;
            }


            /*
               If the model gave a textual
               recommendation, do not blindly
               throw away the conversation.
            */

            const textualResult =
                parseTextualRecommendation(
                    aiContent
                );


            if (textualResult) {

                showResult(
                    textualResult
                );

                return;
            }


            throw new Error(
                "Could not understand AI response."
            );
        }


        /*
           QUESTION
        */

        if (
            parsed.type ===
            "question"
        ) {

            const question =
                String(
                    parsed.question || ""
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


            return;
        }


        /*
           RESULT
        */

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

        removeTypingMessage();

        stopLoading();


        console.error(
            "Declutter AI error:",
            error
        );


        addChatMessage(
            "ai",
            "Something went wrong while talking to the AI. You can try sending your answer again."
        );


    } finally {

        chatBusy = false;

        updateChatButton();
    }
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


    addChatMessage(
        "user",
        text
    );


    conversation.push({

        role:
            "user",

        content:
            text

    });


    input.value = "";

    autoResizeInput();

    updateChatButton();


    await askAI();
}


/* =========================================================
   API REQUEST
   ========================================================= */

async function apiRequest(
    mode,
    payload
) {

    if (currentAbortController) {

        currentAbortController.abort();
    }


    currentAbortController =
        new AbortController();


    const timeout =
        setTimeout(() => {

            currentAbortController.abort();

        }, REQUEST_TIMEOUT);


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            mode,
                            ...payload
                        }),

                    signal:
                        currentAbortController.signal
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data?.error ||
                `API error ${response.status}`
            );
        }


        if (
            data?.error
        ) {

            throw new Error(
                data.error
            );
        }


        return data;


    } catch (error) {

        if (
            error.name ===
            "AbortError"
        ) {

            throw new Error(
                "The AI request took too long."
            );
        }


        throw error;


    } finally {

        clearTimeout(timeout);

        currentAbortController =
            null;
    }
}


/* =========================================================
   EXTRACT IDENTIFICATION
   ========================================================= */

function extractIdentification(
    data
) {

    const content =
        extractAIContent(
            data
        );


    if (!content) {
        return null;
    }


    const parsed =
        parseAIResponse(
            content
        );


    if (
        parsed &&
        parsed.itemType
    ) {

        return {

            itemType:
                String(
                    parsed.itemType
                ).trim(),

            confidence:
                Number(
                    parsed.confidence || 0
                ),

            openingQuestion:
                parsed.openingQuestion || ""

        };
    }


    /*
       Sometimes the identify endpoint
       may return fields directly.
    */

    if (
        data?.itemType
    ) {

        return {

            itemType:
                String(
                    data.itemType
                ).trim(),

            confidence:
                Number(
                    data.confidence || 0
                ),

            openingQuestion:
                data.openingQuestion || ""

        };
    }


    return null;
}


/* =========================================================
   EXTRACT OPENROUTER CONTENT
   ========================================================= */

function extractAIContent(
    data
) {

    if (
        typeof data ===
        "string"
    ) {
        return data;
    }


    return (
        data?.result
            ?.choices?.[0]
            ?.message
            ?.content
        ||
        data?.choices?.[0]
            ?.message
            ?.content
        ||
        data?.content
        ||
        ""
    );
}


/* =========================================================
   PARSE AI RESPONSE
   ========================================================= */

function parseAIResponse(
    content
) {

    if (
        !content ||
        typeof content !== "string"
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

    } catch (_) {

        console.warn(
            "Direct JSON parsing failed."
        );
    }


    /*
       Extract first JSON object.
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

            return JSON.parse(
                jsonPart
            );

        } catch (_) {

            console.warn(
                "JSON extraction failed."
            );
        }
    }


    return null;
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


    const questionStarters = [

        "how ",
        "what ",
        "when ",
        "where ",
        "why ",
        "which ",
        "do ",
        "does ",
        "did ",
        "is ",
        "are ",
        "have ",
        "has ",
        "can ",
        "would ",
        "will "

    ];


    const lower =
        value.toLowerCase();


    return questionStarters.some(
        starter =>
            lower.startsWith(starter)
    );
}


/* =========================================================
   CLEAN PLAIN QUESTION
   ========================================================= */

function cleanPlainQuestion(
    text
) {

    return String(
        text
    )
        .replace(
            /^["']|["']$/g,
            ""
        )
        .replace(
            /\n+/g,
            " "
        )
        .trim();
}


/* =========================================================
   TEXTUAL RESULT FALLBACK
   ========================================================= */

function parseTextualRecommendation(
    text
) {

    const lower =
        text.toLowerCase();


    const recommendations = [

        "KEEP",
        "SELL",
        "DONATE",
        "DISCARD",
        "RECYCLE"

    ];


    /*
       We only accept a textual recommendation
       when it is explicitly stated.
    */

    for (
        const recommendation
        of recommendations
    ) {

        if (
            lower.includes(
                recommendation.toLowerCase()
            )
        ) {

            return {

                type:
                    "result",

                recommendation:
                    recommendation,

                confidence:
                    60,

                reasoning:
                    text.trim(),

                reflection:
                    "This recommendation was extracted from the AI's response."

            };
        }
    }


    return null;
}


/* =========================================================
   CHAT UI
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
   TYPING
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
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendChatMessage();
                }

            }
        );


        updateChatButton();

        injectLoadingStyles();

    }
);


/* =========================================================
   PRODUCTION LOADING UI
   ========================================================= */

function injectLoadingStyles() {

    if (
        document.getElementById(
            "declutterLoadingStyles"
        )
    ) {
        return;
    }


    const style =
        document.createElement("style");


    style.id =
        "declutterLoadingStyles";


    style.textContent = `

        #declutterLoader {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: none;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,.82);
            backdrop-filter: blur(10px);
        }

        #declutterLoader.visible {
            display: flex;
        }

        .declutter-loader-card {
            width: min(420px, calc(100vw - 40px));
            padding: 28px;
            border-radius: 22px;
            background: white;
            box-shadow: 0 20px 60px rgba(0,0,0,.12);
            text-align: center;
        }

        .declutter-loader-icon {
            width: 46px;
            height: 46px;
            margin: 0 auto 18px;
            border-radius: 50%;
            border: 4px solid rgba(0,0,0,.08);
            border-top-color: currentColor;
            animation: declutterSpin .8s linear infinite;
        }

        @keyframes declutterSpin {
            to {
                transform: rotate(360deg);
            }
        }

        .declutter-loader-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 7px;
        }

        .declutter-loader-status {
            font-size: 14px;
            opacity: .65;
            margin-bottom: 18px;
        }

        .declutter-loader-track {
            width: 100%;
            height: 7px;
            border-radius: 999px;
            background: rgba(0,0,0,.08);
            overflow: hidden;
        }

        .declutter-loader-fill {
            width: 5%;
            height: 100%;
            border-radius: inherit;
            background: currentColor;
            transition: width .7s ease;
        }

        .declutter-loader-percent {
            margin-top: 10px;
            font-size: 13px;
            font-weight: 600;
            opacity: .65;
        }

        .declutter-loader-note {
            margin-top: 13px;
            font-size: 12px;
            opacity: .45;
        }

    `;


    document.head.appendChild(
        style
    );
}


/* =========================================================
   START LOADING
   ========================================================= */

function startLoading(
    title,
    status
) {

    injectLoadingStyles();


    let loader =
        document.getElementById(
            "declutterLoader"
        );


    if (!loader) {

        loader =
            document.createElement("div");

        loader.id =
            "declutterLoader";


        loader.innerHTML = `

            <div class="declutter-loader-card">

                <div class="declutter-loader-icon"></div>

                <div
                    class="declutter-loader-title"
                    id="declutterLoaderTitle"
                >
                </div>

                <div
                    class="declutter-loader-status"
                    id="declutterLoaderStatus"
                >
                </div>

                <div class="declutter-loader-track">

                    <div
                        class="declutter-loader-fill"
                        id="declutterLoaderFill"
                    ></div>

                </div>

                <div
                    class="declutter-loader-percent"
                    id="declutterLoaderPercent"
                >
                    5%
                </div>

                <div class="declutter-loader-note">
                    This can take a little while if the AI is busy.
                </div>

            </div>
        `;


        document.body.appendChild(
            loader
        );
    }


    const titleElement =
        document.getElementById(
            "declutterLoaderTitle"
        );

    const statusElement =
        document.getElementById(
            "declutterLoaderStatus"
        );


    if (titleElement) {
        titleElement.textContent =
            title || "Thinking…";
    }


    if (statusElement) {
        statusElement.textContent =
            status || "Working on it";
    }


    loader.classList.add(
        "visible"
    );


    loadingStartedAt =
        Date.now();


    let percentage =
        5;


    updateLoadingPercentage(
        percentage
    );


    clearInterval(
        loadingTimer
    );


    /*
       This is intentionally an ESTIMATE.
       It never reaches 100% until the request
       actually finishes.
    */

    loadingTimer =
        setInterval(() => {

            const elapsed =
                Date.now() -
                loadingStartedAt;


            if (elapsed < 4000) {
                percentage = 25;
            }

            else if (elapsed < 10000) {
                percentage = 45;
            }

            else if (elapsed < 20000) {
                percentage = 62;
            }

            else if (elapsed < 35000) {
                percentage = 76;
            }

            else if (elapsed < 50000) {
                percentage = 87;
            }

            else {
                percentage = 94;
            }


            updateLoadingPercentage(
                percentage
            );

        }, 900);
}


/* =========================================================
   UPDATE LOADING
   ========================================================= */

function updateLoadingPercentage(
    percentage
) {

    const fill =
        document.getElementById(
            "declutterLoaderFill"
        );

    const percent =
        document.getElementById(
            "declutterLoaderPercent"
        );


    if (fill) {

        fill.style.width =
            `${percentage}%`;
    }


    if (percent) {

        percent.textContent =
            `${percentage}%`;
    }
}


/* =========================================================
   STOP LOADING
   ========================================================= */

function stopLoading() {

    clearInterval(
        loadingTimer
    );


    const loader =
        document.getElementById(
            "declutterLoader"
        );


    if (!loader) {
        return;
    }


    updateLoadingPercentage(
        100
    );


    setTimeout(() => {

        loader.classList.remove(
            "visible"
        );

    }, 250);
}


/* =========================================================
   IMAGE CACHE KEY
   ========================================================= */

function createImageCacheKey(
    image,
    category,
    role
) {

    return [

        category,

        role,

        image.length,

        image.substring(
            image.length - 120
        )

    ].join("|");
}


/* =========================================================
   SHOW RESULT
   ========================================================= */

function showResult(
    result
) {

    let recommendation =
        String(
            result.recommendation ||
            "UNCERTAIN"
        )
            .toUpperCase()
            .trim();


    const allowed = [
        "KEEP",
        "SELL",
        "DONATE",
        "DISCARD",
        "RECYCLE"
    ];


    if (
        !allowed.includes(
            recommendation
        )
    ) {

        recommendation =
            "UNCERTAIN";
    }


    const recommendationElement =
        document.getElementById(
            "recommendation"
        );


    const confidenceElement =
        document.getElementById(
            "confidence"
        );


    const reasoningElement =
        document.getElementById(
            "reasoningText"
        );


    const reflectionElement =
        document.getElementById(
            "reflectionText"
        );


    if (recommendationElement) {

        recommendationElement.textContent =
            recommendation.replace(
                /_/g,
                " "
            );
    }


    if (confidenceElement) {

        const confidence =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(
                        result.confidence || 0
                    )
                )
            );


        confidenceElement.textContent =
            `${Math.round(confidence)}% confidence`;
    }


    if (reasoningElement) {

        reasoningElement.textContent =
            result.reasoning ||
            "";
    }


    if (reflectionElement) {

        reflectionElement.textContent =
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
                recommendation
            ] || "✦";
    }


    showStep(5);
}


/* =========================================================
   LEGACY COMPATIBILITY
   ========================================================= */

async function analyzeItem() {

    console.log(
        "Declutter.AI now uses adaptive chat."
    );

}


/* =========================================================
   NEW ITEM
   ========================================================= */

function newItem() {

    if (currentAbortController) {

        currentAbortController.abort();

        currentAbortController =
            null;
    }


    clearInterval(
        loadingTimer
    );


    selectedCategory = "";

    selectedRole = "";

    uploadedImage = null;

    uploadedImageData = "";

    itemType = "";

    itemIdentificationConfidence = 0;

    conversation = [];

    chatBusy = false;


    /*
       File.
    */

    const fileInput =
        document.getElementById(
            "imageInput"
        );

    if (fileInput) {
        fileInput.value = "";
    }


    /*
       Preview.
    */

    const preview =
        document.getElementById(
            "imagePreview"
        );

    if (preview) {

        preview.src = "";

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


    /*
       Buttons.
    */

    const imageButton =
        document.getElementById(
            "imageContinue"
        );

    if (imageButton) {
        imageButton.disabled = true;
    }


    const categoryButton =
        document.getElementById(
            "categoryContinue"
        );

    if (categoryButton) {
        categoryButton.disabled = true;
    }


    const roleButton =
        document.getElementById(
            "roleContinue"
        );

    if (roleButton) {
        roleButton.disabled = true;
    }


    /*
       Category selection.
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
       Roles.
    */

    const roles =
        document.getElementById(
            "roles"
        );

    if (roles) {
        roles.innerHTML = "";
    }


    /*
       Chat.
    */

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


    /*
       Result.
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
        reflection.textContent = "";
    }


    const loader =
        document.getElementById(
            "declutterLoader"
        );

    if (loader) {
        loader.classList.remove(
            "visible"
        );
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
