/* =========================================================
   DECLUTTER.AI — SMART VISUAL CHAT ENGINE
========================================================= */

/* =========================================================
   GLOBAL STATE
========================================================= */

let selectedCategory = "";
let selectedRole = "";
let uploadedImage = null;

let imageDataUrl = "";
let itemType = "";
let itemConfidence = 0;

let conversation = [];

let chatBusy = false;
let identificationDone = false;


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

    /*
       Convert the image to a base64 data URL.
       This is what allows the Worker / vision model
       to actually see the uploaded image.
    */

    const reader =
        new FileReader();

    reader.onload = function () {

        imageDataUrl =
            reader.result;

        console.log(
            "Image loaded for AI:",
            imageDataUrl.substring(0, 50) + "..."
        );

    };

    reader.onerror = function (error) {

        console.error(
            "Could not read image:",
            error
        );

        imageDataUrl = "";
    };

    reader.readAsDataURL(file);


    /*
       Preview
    */

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


    /*
       Continue button
    */

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


    if (!imageDataUrl) {

        alert(
            "Please upload an image first."
        );

        showStep(1);

        return;
    }


    conversation = [];

    itemType = "";

    itemConfidence = 0;

    identificationDone = false;


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
       First request:
       identify the actual object from the image.
    */

    await identifyItem();
}


/* =========================================================
   IDENTIFY ITEM FROM IMAGE
========================================================= */

async function identifyItem() {

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

                        mode: "identify",

                        category:
                            selectedCategory,

                        role:
                            selectedRole,

                        image:
                            imageDataUrl

                    })

                }
            );


        const data =
            await response.json();


        removeTypingMessage();


        if (!response.ok) {

            console.error(
                "Identification API error:",
                data
            );

            throw new Error(
                "Image identification failed."
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
                "AI returned no identification."
            );
        }


        console.log(
            "RAW IDENTIFICATION:",
            aiContent
        );


        const parsed =
            parseAIResponse(
                aiContent
            );


        if (!parsed) {

            throw new Error(
                "Could not understand image identification."
            );
        }


        itemType =
            parsed.itemType ||
            "unknown item";


        itemConfidence =
            Number(
                parsed.confidence
            ) || 0;


        identificationDone =
            true;


        /*
           Show AI's identification as the first
           chat message.
        */

        if (parsed.openingQuestion) {

            addChatMessage(
                "ai",
                parsed.openingQuestion
            );


            conversation.push({

                role: "assistant",

                content:
                    parsed.openingQuestion

            });

        } else {

            const confirmationQuestion =
                `I think this is ${itemType}. Is that right?`;

            addChatMessage(
                "ai",
                confirmationQuestion
            );


            conversation.push({

                role: "assistant",

                content:
                    confirmationQuestion

            });

        }


    } catch (error) {

        removeTypingMessage();


        console.error(
            "Identification error:",
            error
        );


        addChatMessage(
            "ai",
            "I’m having trouble identifying the item from the photo. Could you describe what it is?"
        );

    } finally {

        chatBusy = false;

        updateChatButton();
    }
}


/* =========================================================
   ASK AI — CHAT
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


        /*
           QUESTION
        */

        if (
            parsed.type ===
            "question"
        ) {

            if (!parsed.question) {

                throw new Error(
                    "AI question was empty."
                );
            }


            addChatMessage(
                "ai",
                parsed.question
            );


            conversation.push({

                role: "assistant",

                content:
                    parsed.question

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
           Unknown JSON shape
        */

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

    if (!content) {
        return null;
    }


    let cleaned =
        String(content).trim();


    /*
       Remove markdown code fences.
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
       1. Direct JSON
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
       2. Extract JSON object from text.
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
       3. AI sometimes ignores the JSON instruction
       and returns a normal question.

       Instead of breaking the entire app,
       convert that text into a question object.
    */

    const looksLikeQuestion =
        cleaned.includes("?") ||
        /^(how|what|when|where|why|do|does|did|is|are|have|has|would|will|can|could|which)\b/i.test(
            cleaned
        );


    if (
        looksLikeQuestion &&
        cleaned.length > 3 &&
        cleaned.length < 500
    ) {

        console.warn(
            "AI returned a plain question. Converting automatically."
        );


        return {

            type: "question",

            question:
                cleaned

        };
    }


    /*
       4. Try to recognize a plain-text recommendation.
    */

    const upper =
        cleaned.toUpperCase();


    const recommendations = [
        "KEEP",
        "SELL",
        "DONATE",
        "DISCARD",
        "RECYCLE"
    ];


    const foundRecommendation =
        recommendations.find(
            recommendation =>
                upper.includes(
                    recommendation
                )
        );


    if (
        foundRecommendation &&
        cleaned.length < 1000
    ) {

        return {

            type: "result",

            recommendation:
                foundRecommendation,

            confidence: 70,

            reasoning:
                cleaned,

            reflection:
                ""

        };
    }


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


    /*
       Continue conversation.
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


    /*
       Recommendation
    */

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


    /*
       Confidence
    */

    if (confidence) {

        const value =
            Math.round(
                Number(
                    result.confidence
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
            "";
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
        "The chat engine handles analysis automatically."
    );
}


/* =========================================================
   RESET
========================================================= */

function newItem() {

    selectedCategory = "";

    selectedRole = "";

    uploadedImage = null;

    imageDataUrl = "";

    itemType = "";

    itemConfidence = 0;

    identificationDone = false;

    conversation = [];

    chatBusy = false;


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
       Preview
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
       Image continue
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
       Categories
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
       Context
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
