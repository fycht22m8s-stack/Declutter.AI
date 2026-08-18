/* =========================================================
   DECLUTTER.AI — PRODUCTION CHAT ENGINE
========================================================= */


/* =========================================================
   GLOBAL STATE
========================================================= */

let selectedCategory = "";
let selectedRole = "";

let uploadedImage = null;
let uploadedImageData = null;

let itemType = "";
let itemIdentificationConfidence = 0;

let conversation = [];

let chatBusy = false;

let questionCount = 0;
let minimumQuestions = 5;
let maximumQuestions = 8;

let analysisStarted = false;


/* =========================================================
   API
========================================================= */

const API_URL =
    "https://declutter-ai-api.plewko-olga.workers.dev/";


/* =========================================================
   REQUEST SETTINGS
========================================================= */

const REQUEST_TIMEOUT = 45000;


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
        document.getElementById("imagePreview");

    const content =
        document.getElementById("uploadContent");

    if (preview) {

        const imageURL =
            URL.createObjectURL(file);

        preview.src = imageURL;

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
       Convert image to a data URL.
       This allows the Worker to receive the actual image.
    */

    convertImageToDataURL(file)
        .then(dataURL => {

            uploadedImageData =
                dataURL;

            console.log(
                "Image loaded for AI:",
                dataURL.substring(0, 80) + "..."
            );

        })
        .catch(error => {

            console.error(
                "Could not load image:",
                error
            );

            uploadedImageData = null;

        });
}


/* =========================================================
   IMAGE → DATA URL
========================================================= */

function convertImageToDataURL(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload = () => {

                resolve(
                    reader.result
                );

            };

            reader.onerror = reject;

            reader.readAsDataURL(file);

        }
    );
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
   START QUESTIONS
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

    itemIdentificationConfidence = 0;

    questionCount = 0;

    analysisStarted = false;

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
       First identify the object.
    */

    await identifyItem();

}


/* =========================================================
   IDENTIFY ITEM
========================================================= */

async function identifyItem() {

    if (chatBusy) {
        return;
    }

    chatBusy = true;

    setLoadingState(
        "Looking closely at your item…",
        15
    );

    addTypingMessage(
        "Looking at the photo…"
    );

    try {

        const response =
            await fetchWithTimeout(
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
                            uploadedImageData || null

                    })
                },
                REQUEST_TIMEOUT
            );

        const data =
            await response.json();

        removeTypingMessage();

        if (!response.ok) {

            throw new Error(
                data?.error ||
                "Identification request failed."
            );
        }

        const content =
            extractAIContent(data);

        if (!content) {

            throw new Error(
                "AI returned no identification."
            );
        }

        console.log(
            "RAW IDENTIFICATION:",
            content
        );

        const parsed =
            parseAIResponse(content);

        /*
           If the AI returns proper identification JSON.
        */

        if (
            parsed &&
            parsed.itemType
        ) {

            itemType =
                parsed.itemType;

            itemIdentificationConfidence =
                Number(
                    parsed.confidence
                ) || 0;

            addChatMessage(
                "ai",
                parsed.openingQuestion ||
                `I think this is a ${itemType}. Is that correct?`
            );

            conversation.push({

                role: "assistant",

                content:
                    parsed.openingQuestion ||
                    `I think this is a ${itemType}. Is that correct?`

            });

            setLoadingState(
                "Ready",
                100
            );

            return;
        }

        /*
           If AI somehow returns a question,
           treat it as an identification confirmation.
        */

        if (
            parsed &&
            parsed.type === "question"
        ) {

            itemType =
                inferItemTypeFromQuestion(
                    parsed.question
                );

            addChatMessage(
                "ai",
                parsed.question
            );

            conversation.push({

                role: "assistant",

                content:
                    parsed.question

            });

            setLoadingState(
                "Ready",
                100
            );

            return;
        }

        /*
           Fallback.
        */

        itemType =
            "the item shown in the photo";

        const fallbackQuestion =
            "What exactly is this item, and what do you normally use it for?";

        addChatMessage(
            "ai",
            fallbackQuestion
        );

        conversation.push({

            role: "assistant",

            content:
                fallbackQuestion

        });

        setLoadingState(
            "Ready",
            100
        );

    } catch (error) {

        removeTypingMessage();

        console.error(
            "Identification error:",
            error
        );

        /*
           Do not kill the entire app
           if visual identification fails.
        */

        itemType =
            "the item shown in the photo";

        const fallback =
            "I couldn't identify the exact item from the photo. What is it?";

        addChatMessage(
            "ai",
            fallback
        );

        conversation.push({

            role: "assistant",

            content:
                fallback

        });

        setLoadingState(
            "Ready",
            100
        );

    } finally {

        chatBusy = false;

        updateChatButton();
    }
}


/* =========================================================
   ASK AI
========================================================= */

async function askAI() {

    if (chatBusy) {
        return;
    }

    chatBusy = true;

    const progress =
        calculateThinkingProgress();

    setLoadingState(
        getThinkingMessage(),
        progress
    );

    addTypingMessage();

    try {

        const response =
            await fetchWithTimeout(
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
                            conversation,

                        questionCount:
                            questionCount

                    })

                },
                REQUEST_TIMEOUT
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
                data?.error ||
                "AI request failed."
            );
        }

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

        let parsed =
            parseAIResponse(
                aiContent
            );

        /*
           Plain-text fallback.
        */

        if (!parsed) {

            const plainQuestion =
                extractQuestionFromText(
                    aiContent
                );

            if (plainQuestion) {

                parsed = {

                    type: "question",

                    question:
                        plainQuestion

                };

                console.warn(
                    "AI returned a plain question. Converting automatically."
                );

            }

        }

        if (!parsed) {

            console.error(
                "Could not parse AI response:",
                aiContent
            );

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

            questionCount++;

            /*
               NEVER allow a final result
               before enough information exists.
            */

            if (
                questionCount <
                minimumQuestions
            ) {

                parsed =
                    forceUsefulQuestion(
                        parsed
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

            setLoadingState(
                `Question ${questionCount} of ${minimumQuestions}…`,
                calculateThinkingProgress()
            );

            return;
        }


        /* =====================================
           RESULT
        ===================================== */

        if (
            parsed.type ===
            "result"
        ) {

            /*
               AI tried to finish too early.
               Ask another question instead.
            */

            if (
                questionCount <
                minimumQuestions
            ) {

                const forced =
                    buildNextQuestion();

                questionCount++;

                addChatMessage(
                    "ai",
                    forced
                );

                conversation.push({

                    role: "assistant",

                    content:
                        forced

                });

                setLoadingState(
                    `Question ${questionCount} of ${minimumQuestions}…`,
                    calculateThinkingProgress()
                );

                return;
            }

            analysisStarted =
                true;

            setLoadingState(
                "Putting everything together…",
                90
            );

            showResult(
                parsed
            );

            setLoadingState(
                "Done",
                100
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

        setLoadingState(
            "Something went wrong — you can try again.",
            0
        );

    } finally {

        chatBusy = false;

        updateChatButton();

    }
}


/* =========================================================
   EXTRACT AI CONTENT
========================================================= */

function extractAIContent(data) {

    if (!data) {
        return "";
    }

    /*
       OpenRouter structure.
    */

    const content =
        data
            ?.result
            ?.choices?.[0]
            ?.message
            ?.content;

    if (
        typeof content ===
        "string"
    ) {

        return content.trim();
    }

    /*
       Some Worker responses
       may return content directly.
    */

    if (
        typeof data.content ===
        "string"
    ) {

        return data.content.trim();
    }

    /*
       Some models may return
       a message object.
    */

    if (
        typeof data.message?.content ===
        "string"
    ) {

        return data.message.content.trim();
    }

    return "";
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
       Remove common model prefixes.
    */

    cleaned =
        cleaned.replace(
            /^Here(?:'s| is).*?:\s*/is,
            ""
        );

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
       Find JSON object anywhere
       inside the response.
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

    return null;
}


/* =========================================================
   EXTRACT PLAIN QUESTION
========================================================= */

function extractQuestionFromText(
    text
) {

    if (
        !text ||
        typeof text !== "string"
    ) {

        return null;
    }

    let cleaned =
        text
            .trim()
            .replace(
                /\s+/g,
                " "
            );

    /*
       Remove safety metadata
       sometimes returned by models.
    */

    cleaned =
        cleaned.replace(
            /User Safety:.*$/i,
            ""
        ).trim();

    cleaned =
        cleaned.replace(
            /Response Safety:.*$/i,
            ""
        ).trim();

    if (!cleaned) {
        return null;
    }

    /*
       If there is a question mark,
       use the sentence containing it.
    */

    const questionMatch =
        cleaned.match(
            /[^.!?]*\?/
        );

    if (questionMatch) {

        const question =
            questionMatch[0].trim();

        if (
            question.length >= 10 &&
            question.length <= 300
        ) {

            return question;
        }
    }

    return null;
}


/* =========================================================
   INFER ITEM TYPE
========================================================= */

function inferItemTypeFromQuestion(
    question
) {

    if (!question) {
        return "the item shown in the photo";
    }

    const lower =
        question.toLowerCase();

    const knownItems = [

        "lip gloss",
        "lipstick",
        "lip balm",
        "mascara",
        "foundation",
        "concealer",
        "blush",
        "eyeshadow",
        "moisturizer",
        "shampoo",
        "conditioner",
        "perfume",
        "jacket",
        "coat",
        "shirt",
        "dress",
        "jeans",
        "shoes",
        "sneakers",
        "book",
        "laptop",
        "phone",
        "headphones",
        "camera",
        "keyboard",
        "mouse"

    ];

    for (
        const item of knownItems
    ) {

        if (
            lower.includes(item)
        ) {

            return item;
        }
    }

    return "the item shown in the photo";
}


/* =========================================================
   FORCE USEFUL QUESTION
========================================================= */

function forceUsefulQuestion(
    parsed
) {

    /*
       If
