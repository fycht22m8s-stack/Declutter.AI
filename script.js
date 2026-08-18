/* =========================================================
   DECLUTTER.AI — FINAL CHAT + IMAGE ENGINE
========================================================= */

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
let identificationBusy = false;

let questionCount = 0;
let maxQuestions = 7;

let waitingTimer = null;
let waitingStartedAt = null;


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
   IMAGE PREVIEW + BASE64
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
        document.getElementById("imagePreview");

    const content =
        document.getElementById("uploadContent");

    if (preview) {

        const objectURL =
            URL.createObjectURL(file);

        preview.src = objectURL;

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

    /*
       Convert image to base64.
       This is IMPORTANT because the Worker
       needs the actual image data.
    */

    const reader =
        new FileReader();

    reader.onload = () => {

        uploadedImageData =
            reader.result || "";

        console.log(
            "Image loaded for AI:",
            uploadedImageData.substring(0, 80) + "..."
        );
    };

    reader.onerror = () => {

        uploadedImageData = "";

        console.error(
            "Could not read image."
        );
    };

    reader.readAsDataURL(file);
}


/* =========================================================
   STEP SYSTEM
========================================================= */

function showStep(step) {

    document
        .querySelectorAll(".app-step")
        .forEach(section => {

            section.classList.add("hidden");

        });

    const target =
        document.getElementById(
            `step${step}`
        );

    if (target) {
        target.classList.remove("hidden");
    }

    const progress =
        document.getElementById("progress");

    if (progress) {

        const percentage =
            Math.min(
                ((step - 1) / 4) * 100,
                100
            );

        progress.style.width =
            `${percentage}%`;
    }

    const label =
        document.getElementById("step-label");

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

    button.classList.add("selected");

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
        document.getElementById("roles");

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
            document.createElement("button");

        button.type = "button";

        button.textContent = role;

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

    questionCount = 0;

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
            "Identifying your item…";
    }

    showStep(4);

    /*
       FIRST:
       identify the actual object from image.
    */

    await identifyItem();

    /*
       THEN:
       start adaptive conversation.
    */

    if (itemType) {

        if (confirmation) {

            confirmation.textContent =
                `${itemType} · ${selectedCategory} · ${selectedRole}`;
        }

        await askAI();
    }
}


/* =========================================================
   IDENTIFY ITEM
========================================================= */

async function identifyItem() {

    if (identificationBusy) {
        return;
    }

    identificationBusy = true;

    startWaitingIndicator(
        "Looking closely at your item…"
    );

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

                        mode: "identify",

                        category:
                            selectedCategory,

                        role:
                            selectedRole,

                        image:
                            uploadedImageData,

                        description:
                            ""

                    })
                }
            );

        const data =
            await response.json();

        console.log(
            "RAW IDENTIFICATION:",
            data
                ?.result
                ?.choices?.[0]
                ?.message
                ?.content
        );

        if (!response.ok) {

            throw new Error(
                "Identification request failed."
            );
        }

        const content =
            data
                ?.result
                ?.choices?.[0]
                ?.message
                ?.content;

        if (!content) {

            throw new Error(
                "AI returned no identification."
            );
        }

        const parsed =
            parseAIResponse(
                content
            );

        if (!parsed) {

            throw new Error(
                "Could not understand identification."
            );
        }

        /*
           Sometimes the AI may accidentally
           return a question.
        */

        if (
            parsed.type === "question" &&
            !parsed.itemType
        ) {

            console.warn(
                "AI asked a question instead of identifying."
            );

            /*
               Do not completely break the app.
               Use category as temporary context.
            */

            itemType =
                categoryFallback(
                    selectedCategory
                );

            return;
        }

        if (parsed.itemType) {

            itemType =
                String(
                    parsed.itemType
                ).trim();

            itemIdentificationConfidence =
                Number(
                    parsed.confidence || 0
                );

            console.log(
                "Identified item:",
                itemType,
                "confidence:",
                itemIdentificationConfidence
            );

            return;
        }

        throw new Error(
            "AI returned no item type."
        );

    } catch (error) {

        console.error(
            "Identification error:",
            error
        );

        /*
           Do NOT stop the entire app.
           We can still use the category and
           ask the user about the object.
        */

        itemType =
            categoryFallback(
                selectedCategory
            );

    } finally {

        identificationBusy = false;

        stopWaitingIndicator();
    }
}


/* =========================================================
   FALLBACK ITEM TYPE
========================================================= */

function categoryFallback(category) {

    const fallback = {

        Clothing: "clothing item",
        Electronics: "electronic device",
        Books: "book",
        Beauty: "beauty product",
        Home: "home item",
        Hobby: "hobby item"

    };

    return (
        fallback[category] ||
        "physical item"
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

    startWaitingIndicator(
        questionCount === 0
            ? "Thinking about the best questions…"
            : "Thinking about your answer…"
    );

    try {

        /*
           Safety limit:
           AI should normally decide within
           5–7 questions.
        */

        if (
            questionCount >= maxQuestions
        ) {

            await requestFinalDecision();

            return;
        }

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
                            itemType,

                        image:
                            uploadedImageData,

                        conversation:
                            conversation,

                        questionCount:
                            questionCount

                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

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

        console.log(
            "RAW AI RESPONSE:",
            aiContent
        );

        if (!aiContent) {

            throw new Error(
                "AI returned no content."
            );
        }

        const parsed =
            parseAIResponse(
                aiContent
            );

        if (!parsed) {

            /*
               Retry once if the AI returned
               malformed output.
            */

            console.warn(
                "Could not parse AI response. Retrying…"
            );

            await retryAI();

            return;
        }

        /*
           QUESTION
        */

        if (
            parsed.type === "question"
        ) {

            if (!parsed.question) {

                throw new Error(
                    "AI question was empty."
                );
            }

            questionCount++;

            const question =
                cleanQuestion(
                    parsed.question
                );

            addChatMessage(
                "ai",
                question
            );

            conversation.push({

                role: "assistant",

                content: question

            });

            return;
        }

        /*
           RESULT
        */

        if (
            parsed.type === "result"
        ) {

            /*
               Prevent ridiculously early
               conclusions.
            */

            if (
                questionCount < 4
            ) {

                console.warn(
                    "AI attempted early result. Asking for more information."
                );

                await requestMoreInformation();

                return;
            }

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

        console.error(
            "Declutter AI error:",
            error
        );

        addChatMessage(
            "ai",
            "I had trouble processing that. Give me a second and try again."
        );

    } finally {

        stopWaitingIndicator();

        chatBusy = false;

        updateChatButton();
    }
}


/* =========================================================
   RETRY AI
========================================================= */

async function retryAI() {

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
                            itemType,

                        image:
                            uploadedImageData,

                        conversation:
                            conversation,

                        questionCount:
                            questionCount,

                        retry: true

                    })
                }
            );

        const data =
            await response.json();

        const content =
            data
                ?.result
                ?.choices?.[0]
                ?.message
                ?.content;

        console.log(
            "RAW AI RETRY:",
            content
        );

        const parsed =
            parseAIResponse(
                content
            );

        if (!parsed) {

            throw new Error(
                "Retry response could not be parsed."
            );
        }

        if (
            parsed.type === "question"
        ) {

            questionCount++;

            const question =
                cleanQuestion(
                    parsed.question
                );

            addChatMessage(
                "ai",
                question
            );

            conversation.push({

                role: "assistant",

                content: question

            });

            return;
        }

        if (
            parsed.type === "result"
        ) {

            if (
                questionCount < 4
            ) {

                await requestMoreInformation();

                return;
            }

            showResult(
                parsed
            );

            return;
        }

    } catch (error) {

        console.error(
            "Retry failed:",
            error
        );

        addChatMessage(
            "ai",
            "I'm still processing your item. Please try your answer again."
        );
    }
}


/* =========================================================
   REQUEST MORE INFORMATION
========================================================= */

async function requestMoreInformation() {

    const forcedQuestion =
        createFollowUpQuestion();

    questionCount++;

    addChatMessage(
        "ai",
        forcedQuestion
    );

    conversation.push({

        role: "assistant",

        content:
            forcedQuestion

    });
}


/* =========================================================
   FALLBACK FOLLOW-UP QUESTION
========================================================= */

function createFollowUpQuestion() {

    const type =
        itemType.toLowerCase();

    if (
        selectedCategory === "Beauty"
    ) {

        return `Before I make a decision about your ${itemType}, how long have you had it or when did you first open it?`;
    }

    if (
        selectedCategory === "Clothing"
    ) {

        return `Before deciding about your ${itemType}, when was the last time you actually wore it?`;
    }

    if (
        selectedCategory === "Electronics"
    ) {

        return `Before deciding about your ${itemType}, does it currently work the way you need it to?`;
    }

    if (
        selectedCategory === "Books"
    ) {

        return `Before deciding about your ${itemType}, do you realistically expect to read or use it again?`;
    }

    if (
        selectedCategory === "Home"
    ) {

        return `Before deciding about your ${itemType}, when was the last time you actually used it?`;
    }

    return `Before I make a decision about your ${itemType}, would you genuinely miss having it if it were gone tomorrow?`;
}


/* =========================================================
   FINAL DECISION REQUEST
========================================================= */

async function requestFinalDecision() {

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
                            itemType,

                        image:
                            uploadedImageData,

                        conversation:
                            conversation,

                        questionCount:
                            questionCount,

                        forceDecision:
                            true

                    })
                }
            );

        const data =
            await response.json();

        const content =
            data
                ?.result
                ?.choices?.[0]
                ?.message
                ?.content;

        console.log(
            "RAW FINAL RESPONSE:",
            content
        );

        const parsed =
            parseAIResponse(
                content
            );

        if (
            parsed &&
            parsed.type === "result"
        ) {

            showResult(
                parsed
            );

            return;
        }

        /*
           If the AI still asks a question,
           display it rather than crashing.
        */

        if (
            parsed &&
            parsed.type === "question"
        ) {

            const question =
                cleanQuestion(
                    parsed.question
                );

            addChatMessage(
                "ai",
                question
            );

            conversation.push({

                role: "assistant",

                content: question

            });

            return;
        }

        throw new Error(
            "Could not obtain final decision."
        );

    } catch (error) {

        console.error(
            "Final decision error:",
            error
        );

        addChatMessage(
            "ai",
            "I couldn't finalize the decision yet. Please try sending your last answer again."
        );
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

        role: "user",

        content: text

    });

    input.value = "";

    autoResizeInput();

    updateChatButton();

    await askAI();
}


/* =========================================================
   CLEAN QUESTION
========================================================= */

function cleanQuestion(text) {

    if (!text) {
        return "Could you tell me a little more about this item?";
    }

    return String(text)
        .replace(
            /^["']|["']$/g,
            ""
        )
        .trim();
}


/* =========================================================
   PARSE AI RESPONSE
========================================================= */

function parseAIResponse(content) {

    if (!content) {
        return null;
    }

    let cleaned =
        String(content)
            .trim();

    console.log(
        "RAW AI RESPONSE:",
        cleaned
    );

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

        } catch (error) {

            console.warn(
                "JSON extraction failed."
            );
        }
    }

    /*
       Sometimes models return only
       a plain question despite the prompt.
    */

    if (
        looksLikeQuestion(cleaned)
    ) {

        console.warn(
            "AI returned a plain question. Converting automatically."
        );

        return {

            type: "question",

            question:
                cleanQuestion(
                    cleaned
                )

        };
    }

    /*
       Sometimes the model returns a plain
       recommendation sentence.
    */

    const recommendation =
        extractRecommendation(
            cleaned
        );

    if (recommendation) {

        return {

            type: "result",

            recommendation:
                recommendation,

            confidence: 65,

            reasoning:
                cleaned,

            reflection:
                "This recommendation was generated from the information available in the conversation."

        };
    }

    console.error(
        "Could not parse AI response:",
        cleaned
    );

    return null;
}


/* =========================================================
   QUESTION DETECTION
========================================================= */

function looksLikeQuestion(text) {

    if (!text) {
        return false;
    }

    const lower =
        text.toLowerCase();

    if (
        text.includes("?")
    ) {
        return true;
    }

    const starts = [

        "how ",
        "what ",
        "when ",
        "where ",
        "why ",
        "which ",
        "do you ",
        "does it ",
        "is it ",
        "are you ",
        "have you ",
        "would you ",
        "can you ",
        "did you "

    ];

    return starts.some(
        phrase =>
            lower.startsWith(
                phrase
            )
    );
}


/* =========================================================
   EXTRACT RECOMMENDATION
========================================================= */

function extractRecommendation(text) {

    const upper =
        text.toUpperCase();

    const recommendations = [

        "KEEP",
        "SELL",
        "DONATE",
        "DISCARD",
        "RECYCLE"

    ];

    for (
        const recommendation
        of recommendations
    ) {

        if (
            upper.includes(
                recommendation
            )
        ) {

            return recommendation;
        }
    }

    return null;
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
   TYPING / WAITING INDICATOR
========================================================= */

function addTypingMessage(
    text = "Thinking…"
) {

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
        text;

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
   SMART WAITING INDICATOR
========================================================= */

function startWaitingIndicator(
    initialText
) {

    waitingStartedAt =
        Date.now();

    addTypingMessage(
        initialText
    );

    clearInterval(
        waitingTimer
    );

    waitingTimer =
        setInterval(() => {

            const elapsed =
                Math.floor(
                    (
                        Date.now() -
                        waitingStartedAt
                    ) / 1000
                );

            let message;

            if (elapsed < 4) {

                message =
                    initialText;

            } else if (elapsed < 8) {

                message =
                    "Still thinking…";

            } else if (elapsed < 15) {

                message =
                    "Almost there…";

            } else if (elapsed < 25) {

                message =
                    "Taking a little longer than usual…";

            } else {

                message =
                    "Still working on it — please wait…";
            }

            addTypingMessage(
                message
            );

        }, 3000);
}


function stopWaitingIndicator() {

    clearInterval(
        waitingTimer
    );

    waitingTimer = null;

    waitingStartedAt = null;

    removeTypingMessage();
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

    /*
       Recommendation
    */

    const recommendationValue =
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
            recommendationValue;
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
            !Number.isFinite(value)
        ) {
            value = 65;
        }

        value =
            Math.max(
                0,
                Math.min(
                    100,
                    Math.round(value)
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
            "The recommendation is based on your answers and the information gathered about this item.";
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
       Icon
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
   OLD HTML COMPATIBILITY
========================================================= */

async function analyzeItem() {

    /*
       The new chat engine handles
       the analysis automatically.
    */

    if (
        conversation.length >= 4
    ) {

        await requestFinalDecision();

    } else {

        await askAI();

    }
}


/* =========================================================
   RESET / NEW ITEM
========================================================= */

function newItem() {

    selectedCategory = "";

    selectedRole = "";

    uploadedImage = null;

    uploadedImageData = "";

    itemType = "";

    itemIdentificationConfidence = 0;

    conversation = [];

    chatBusy = false;

    identificationBusy = false;

    questionCount = 0;

    clearInterval(
        waitingTimer
    );

    waitingTimer = null;


    /*
       File input
    */

    const input =
        document.getElementById(
            "imageInput"
        );

    if (input) {
        input.value = "";
    }


    /*
       Image preview
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


    /*
       Upload content
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
       Image button
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
       Category buttons
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


    const categoryButton =
        document.getElementById(
            "categoryContinue"
        );

    if (categoryButton) {

        categoryButton.disabled =
            true;
    }


    /*
       Roles
    */

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


    /*
       Chat
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
       Item confirmation
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
       Result
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
   DEBUG HELPER
========================================================= */

window.DeclutterAI = {

    getState: () => ({

        selectedCategory,

        selectedRole,

        itemType,

        itemIdentificationConfidence,

        questionCount,

        conversationLength:
            conversation.length

    }),

    reset:
        newItem

};

console.log(
    "Declutter.AI final script loaded."
);
