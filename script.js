/* =========================================================
   DECLUTTER.AI — PRODUCTION CHAT ENGINE
========================================================= */


/* =========================================================
   GLOBAL STATE
========================================================= */

let selectedCategory = "";
let selectedRole = "";

let uploadedImage = null;
let imageDataURL = "";

let itemType = "";
let identificationConfidence = 0;

let conversation = [];

let chatBusy = false;
let identificationBusy = false;

let progressValue = 0;


/* =========================================================
   API
========================================================= */

const API_URL =
    "https://declutter-ai-api.plewko-olga.workers.dev/";


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
   IMAGE PREVIEW + BASE64
========================================================= */

function previewImage(event) {

    const file =
        event.target.files?.[0];

    if (!file) {
        return;
    }

    uploadedImage = file;

    const preview =
        document.getElementById("imagePreview");

    const content =
        document.getElementById("uploadContent");

    const button =
        document.getElementById("imageContinue");


    if (preview) {

        preview.src =
            URL.createObjectURL(file);

        preview.classList.remove("hidden");
    }


    if (content) {
        content.classList.add("hidden");
    }


    if (button) {
        button.disabled = false;
    }


    /*
       Convert image to a data URL.

       This is what allows the Worker
       to actually send the image to the
       vision-capable model.
    */

    const reader =
        new FileReader();

    reader.onload = () => {

        imageDataURL =
            reader.result;

        console.log(
            "Image loaded for AI:",
            imageDataURL.substring(0, 80) + "..."
        );

    };

    reader.onerror = () => {

        console.error(
            "Could not read image."
        );

        imageDataURL = "";

    };

    reader.readAsDataURL(file);
}


/* =========================================================
   STEPS
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
            step === 1 ? 25 :
            step === 2 ? 40 :
            step === 3 ? 55 :
            step === 4 ? Math.max(65, progressValue) :
            100;

        progress.style.width =
            `${percentage}%`;
    }


    const label =
        document.getElementById("step-label");


    if (label) {

        label.textContent =
            step === 4
                ? "Understanding your item"
                : `Step ${step} of 4`;

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

    selectedRole = "";


    const roles =
        rolesByCategory[
            selectedCategory
        ];


    if (!roles) {
        return;
    }


    roles.forEach(role => {

        const button =
            document.createElement("button");

        button.type = "button";

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


    const continueButton =
        document.getElementById(
            "roleContinue"
        );

    if (continueButton) {
        continueButton.disabled = true;
    }


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
        continueButton.disabled = false;
    }
}


/* =========================================================
   GENERATE QUESTIONS
========================================================= */

async function generateQuestions() {

    if (!selectedCategory) {
        alert("Please choose a category first.");
        return;
    }


    if (!selectedRole) {
        alert("Please choose the role first.");
        return;
    }


    if (!imageDataURL) {

        alert(
            "Please upload an image first."
        );

        return;
    }


    conversation = [];

    itemType = "";

    identificationConfidence = 0;

    progressValue = 60;


    const chatWindow =
        document.getElementById(
            "chatWindow"
        );

    if (chatWindow) {
        chatWindow.innerHTML = "";
    }


    showStep(4);

    setThinkingState(
        "Looking closely at your item…",
        60
    );


    await identifyItem();
}


/* =========================================================
   IDENTIFY ITEM
========================================================= */

async function identifyItem() {

    identificationBusy = true;

    setThinkingState(
        "Looking closely at your item…",
        60
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

                    body:
                        JSON.stringify({

                            mode:
                                "identify",

                            category:
                                selectedCategory,

                            role:
                                selectedRole,

                            imageData:
                                imageDataURL

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "Identification API error:",
                data
            );

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

            console.error(
                "Identification response:",
                data
            );

            throw new Error(
                "AI returned no identification."
            );
        }


        console.log(
            "RAW IDENTIFICATION:",
            content
        );


        const parsed =
            parseAIResponse(
                content
            );


        if (
            !parsed ||
            !parsed.itemType
        ) {

            throw new Error(
                "Could not understand identification."
            );

        }


        itemType =
            parsed.itemType;


        identificationConfidence =
            Number(
                parsed.confidence
            ) || 0;


        progressValue = 68;


        setThinkingState(
            "I think I found it…",
            68
        );


        /*
           Show confirmation question.
        */

        showIdentificationConfirmation(
            parsed
        );


    } catch (error) {

        console.error(
            "Identification error:",
            error
        );


        /*
           Fallback.

           We do NOT silently pretend
           the item was identified.
        */

        itemType =
            "the item in your photo";


        addChatMessage(
            "ai",
            "I’m not completely sure what I’m looking at. What exactly is this item?"
        );


        conversation.push({

            role: "assistant",

            content:
                "I’m not completely sure what I’m looking at. What exactly is this item?"

        });


        progressValue = 65;


        setThinkingState(
            "Let’s identify it together.",
            65
        );

    } finally {

        identificationBusy = false;

        updateChatButton();

    }
}


/* =========================================================
   IDENTIFICATION CONFIRMATION
========================================================= */

function showIdentificationConfirmation(
    parsed
) {

    const question =
        parsed.confirmationQuestion ||
        `Is this a ${parsed.itemType}?`;


    addChatMessage(
        "ai",
        `I think this is a ${parsed.itemType}. ${question}`
    );


    conversation.push({

        role: "assistant",

        content:
            `I think this is a ${parsed.itemType}. ${question}`

    });


    /*
       The user can answer naturally.
       We then continue the normal chat.
    */

    progressValue = 70;

    setThinkingState(
        "Identification complete.",
        70
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


    const questionCount =
        conversation.filter(
            message =>
                message.role === "assistant"
        ).length;


    const estimatedProgress =
        Math.min(
            70 +
            questionCount * 5,
            90
        );


    progressValue =
        Math.max(
            progressValue,
            estimatedProgress
        );


    setThinkingState(
        getThinkingMessage(
            questionCount
        ),
        progressValue
    );


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

                    body:
                        JSON.stringify({

                            mode:
                                "chat",

                            category:
                                selectedCategory,

                            role:
                                selectedRole,

                            itemType:
                                itemType ||
                                "unknown item",

                            confirmed:
                                true,

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
            parsed.type === "question"
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


            progressValue =
                Math.min(
                    Number(
                        parsed.progress
                    ) || progressValue + 5,
                    90
                );


            setThinkingState(
                "More context needed…",
                progressValue
            );


            return;
        }


        /* =====================================
           RESULT
        ===================================== */

        if (
            parsed.type === "result"
        ) {

            /*
               Extra client-side safety:
               do not allow obviously premature
               results.
            */

            const userAnswers =
                conversation.filter(
                    message =>
                        message.role === "user"
                );


            if (
                userAnswers.length < 4
            ) {

                console.warn(
                    "AI attempted an early result. Asking for more information."
                );


                const fallbackQuestion =
                    getSafetyQuestion();


                addChatMessage(
                    "ai",
                    fallbackQuestion
                );


                conversation.push({

                    role:
                        "assistant",

                    content:
                        fallbackQuestion

                });


                progressValue =
                    Math.max(
                        progressValue,
                        75
                    );


                setThinkingState(
                    "I need a little more context…",
                    progressValue
                );


                return;
            }


            progressValue = 100;


            setThinkingState(
                "Decision ready.",
                100
            );


            conversation.push({

                role:
                    "assistant",

                content:
                    JSON.stringify(parsed)

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

function parseAIResponse(
    content
) {

    if (
        typeof content !== "string"
    ) {
        return null;
    }


    let cleaned =
        content.trim();


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
       Some free models occasionally ignore
       the JSON instruction and return only
       a question.

       Convert a plain question into the
       expected internal structure.
    */

    const looksLikeQuestion =
        cleaned.endsWith("?") &&
        cleaned.length > 5 &&
        cleaned.length < 500;


    if (looksLikeQuestion) {

        console.warn(
            "AI returned a plain question. Converting automatically."
        );


        return {

            type:
                "question",

            question:
                cleaned,

            progress:
                Math.min(
                    85,
                    progressValue + 5
                )

        };

    }


    /*
       Handle a plain-text recommendation
       as a LAST resort.

       We deliberately require enough
       conversation first.
    */

    const lower =
        cleaned.toLowerCase();


    const userAnswers =
        conversation.filter(
            message =>
                message.role === "user"
        );


    if (
        userAnswers.length >= 5
    ) {

        const recommendation =
            detectRecommendation(
                lower
            );


        if (recommendation) {

            return {

                type:
                    "result",

                recommendation,

                confidence:
                    70,

                reasoning:
                    cleaned,

                reflection:
                    "",

                progress:
                    100

            };

        }

    }


    console.error(
        "Could not parse AI response:",
        cleaned
    );


    return null;
}


/* =========================================================
   DETECT RECOMMENDATION
========================================================= */

function detectRecommendation(
    text
) {

    if (
        /\bdiscard\b/.test(text)
    ) {
        return "DISCARD";
    }

    if (
        /\brecycle\b/.test(text)
    ) {
        return "RECYCLE";
    }

    if (
        /\bdonate\b/.test(text)
    ) {
        return "DONATE";
    }

    if (
        /\bsell\b/.test(text)
    ) {
        return "SELL";
    }

    if (
        /\bkeep\b/.test(text)
    ) {
        return "KEEP";
    }

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


    typing.innerHTML =
        `
        <span>Thinking</span>
        <span class="typing-dots">
            <i></i><i></i><i></i>
        </span>
        `;


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


    requestAnimationFrame(() => {

        chatWindow.scrollTop =
            chatWindow.scrollHeight;

    });
}


/* =========================================================
   THINKING / PROGRESS
========================================================= */

function setThinkingState(
    message,
    value
) {

    progressValue =
        Math.max(
            0,
            Math.min(
                100,
                Number(value) || 0
            )
        );


    const progress =
        document.getElementById(
            "progress"
        );


    if (progress) {

        progress.style.width =
            `${progressValue}%`;

    }


    const label =
        document.getElementById(
            "step-label"
        );


    if (label) {

        label.textContent =
            message;

    }


    updateThinkingIndicator(
        message,
        progressValue
    );
}


/* =========================================================
   THINKING INDICATOR
========================================================= */

function updateThinkingIndicator(
    message,
    value
) {

    let indicator =
        document.getElementById(
            "aiThinkingStatus"
        );


    if (!indicator) {

        const step =
            document.getElementById(
                "step4"
            );


        if (!step) {
            return;
        }


        indicator =
            document.createElement(
                "div"
            );


        indicator.id =
            "aiThinkingStatus";


        indicator.style.cssText =
            `
            margin: 18px 0;
            padding: 12px 14px;
            border-radius: 14px;
            background: rgba(0,0,0,0.04);
            font-size: 13px;
            opacity: .85;
            `;


        const heading =
            step.querySelector(
                ".app-heading"
            );


        if (heading) {

            heading.appendChild(
                indicator
            );

        } else {

            step.prepend(
                indicator
            );

        }

    }


    indicator.innerHTML =
        `
        <div style="
            display:flex;
            justify-content:space-between;
            gap:12px;
            margin-bottom:8px;
        ">
            <span>${escapeHTML(message)}</span>
            <strong>${Math.round(value)}%</strong>
        </div>

        <div style="
            height:4px;
            width:100%;
            background:rgba(0,0,0,.08);
            border-radius:999px;
            overflow:hidden;
        ">
            <div style="
                height:100%;
                width:${value}%;
                background:currentColor;
                border-radius:999px;
                transition:width .5s ease;
            "></div>
        </div>
        `;

}


/* =========================================================
   THINKING MESSAGES
========================================================= */

function getThinkingMessage(
    questionCount
) {

    if (questionCount === 0) {
        return "Understanding your item…";
    }

    if (questionCount === 1) {
        return "Learning how you use it…";
    }

    if (questionCount === 2) {
        return "Looking at what else you have…";
    }

    if (questionCount === 3) {
        return "Understanding whether it still works for you…";
    }

    if (questionCount === 4) {
        return "Putting the bigger picture together…";
    }

    return "Thinking about your options…";
}


/* =========================================================
   SAFETY QUESTION
========================================================= */

function getSafetyQuestion() {

    const questions = {

        Beauty:
            "Do you have another product that you prefer over this one?",

        Clothing:
            "If you got rid of this, do you think you would genuinely miss wearing it?",

        Electronics:
            "Do you still have a reason to keep this device instead of using another one?",

        Books:
            "Do you realistically expect to read or use this book again?",

        Home:
            "If this disappeared from your home tomorrow, would you actually notice that you needed it?",

        Hobby:
            "Do you still see yourself using this for your hobby in the future?"

    };


    return (
        questions[
            selectedCategory
        ] ||
        "If you got rid of this item, do you think you would genuinely miss having it?"
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
   AUTO RESIZE
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


    const recommendationValue =
        String(
            result.recommendation ||
            "UNCERTAIN"
        )
            .toUpperCase()
            .replace(
                /[^A-Z_]/g,
                ""
            );


    if (recommendation) {

        recommendation.textContent =
            recommendationValue
                .replace(
                    /_/g,
                    " "
                );
    }


    if (confidence) {

        const value =
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
            `${value}% confidence`;
    }


    if (reasoning) {

        reasoning.textContent =
            result.reasoning ||
            "Your answers suggest this is the most reasonable option.";

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
       Kept intentionally.

       The current application uses
       the conversational AI flow.
    */

    if (!chatBusy) {
        await askAI();
    }

}


/* =========================================================
   RESET
========================================================= */

function newItem() {

    selectedCategory = "";

    selectedRole = "";

    uploadedImage = null;

    imageDataURL = "";

    itemType = "";

    identificationConfidence = 0;

    conversation = [];

    chatBusy = false;

    identificationBusy = false;

    progressValue = 0;


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


    const imageButton =
        document.getElementById(
            "imageContinue"
        );


    if (imageButton) {
        imageButton.disabled = true;
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
        categoryButton.disabled = true;
    }


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
        roleButton.disabled = true;
    }


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


    const status =
        document.getElementById(
            "aiThinkingStatus"
        );


    if (status) {
        status.remove();
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
        reflection.textContent = "";
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
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(value)
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
