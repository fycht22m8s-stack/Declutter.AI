/* =========================================================
   DECLUTTER.AI — CHAT ENGINE
   Vision + Adaptive AI Chat
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

let declutterImageData = null;


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
   PREPARE IMAGE FOR AI
========================================================= */

function prepareImageForAI(file) {

    return new Promise(
        (resolve, reject) => {

            if (!file) {

                reject(
                    new Error(
                        "No image selected."
                    )
                );

                return;
            }

            const reader =
                new FileReader();

            reader.onload = event => {

                const img =
                    new Image();

                img.onload = () => {

                    /*
                     * Resize large images so the request
                     * is smaller and easier for the API
                     * to handle.
                     */

                    const maxSize =
                        1200;

                    let width =
                        img.width;

                    let height =
                        img.height;

                    if (
                        width > maxSize ||
                        height > maxSize
                    ) {

                        if (
                            width > height
                        ) {

                            height =
                                Math.round(
                                    height *
                                    (
                                        maxSize /
                                        width
                                    )
                                );

                            width =
                                maxSize;

                        } else {

                            width =
                                Math.round(
                                    width *
                                    (
                                        maxSize /
                                        height
                                    )
                                );

                            height =
                                maxSize;
                        }
                    }

                    const canvas =
                        document.createElement(
                            "canvas"
                        );

                    canvas.width =
                        width;

                    canvas.height =
                        height;

                    const ctx =
                        canvas.getContext(
                            "2d"
                        );

                    if (!ctx) {

                        reject(
                            new Error(
                                "Could not create image canvas."
                            )
                        );

                        return;
                    }

                    ctx.drawImage(
                        img,
                        0,
                        0,
                        width,
                        height
                    );

                    /*
                     * Convert to compressed JPEG.
                     */

                    const compressed =
                        canvas.toDataURL(
                            "image/jpeg",
                            0.82
                        );

                    resolve(
                        compressed
                    );
                };

                img.onerror = () => {

                    reject(
                        new Error(
                            "Could not read image."
                        )
                    );
                };

                img.src =
                    event.target.result;
            };

            reader.onerror = () => {

                reject(
                    new Error(
                        "Could not load image file."
                    )
                );
            };

            reader.readAsDataURL(
                file
            );
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
   START AI CHAT
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

    if (!uploadedImage) {

        alert(
            "Please upload an image first."
        );

        return;
    }

    conversation = [];

    itemType = "";

    declutterImageData = null;

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

    try {

        /*
         * Prepare the actual uploaded image.
         */

        declutterImageData =
            await prepareImageForAI(
                uploadedImage
            );

        /*
         * Now ask the AI.
         */

        await askAI();

    } catch (error) {

        console.error(
            "Image preparation error:",
            error
        );

        addChatMessage(
            "ai",
            "I couldn't prepare the image for analysis. Please try uploading it again."
        );
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

                        mode:
                            "chat",

                        category:
                            selectedCategory,

                        role:
                            selectedRole,

                        itemType:
                            itemType ||
                            "unknown item",

                        /*
                         * THIS IS THE IMPORTANT PART:
                         * the actual image is sent to Worker.
                         */

                        imageData:
                            declutterImageData ||
                            null,

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
            "AI RAW RESPONSE:",
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
           AI QUESTION
        ===================================== */

        if (
            parsed.type ===
            "question"
        ) {

            if (!parsed.question) {

                throw new Error(
                    "AI returned an empty question."
                );
            }

            addChatMessage(
                "ai",
                parsed.question
            );

            conversation.push({

                role:
                    "assistant",

                content:
                    parsed.question

            });

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
        typeof content !==
        "string"
    ) {

        return null;
    }

    let cleaned =
        content.trim();


    /*
     * Remove markdown fences.
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
     * Direct JSON.
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
     * Try to locate JSON object.
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

            console.error(
                "JSON extraction failed:",
                error
            );
        }
    }


    /*
     * Last attempt:
     * sometimes models return JSON with
     * accidental leading/trailing text.
     */

    try {

        const match =
            cleaned.match(
                /\{[\s\S]*\}/
            );

        if (match) {

            return JSON.parse(
                match[0]
            );
        }

    } catch (error) {

        console.error(
            "Final JSON parsing failed:",
            error
        );
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


    /*
     * Display user message.
     */

    addChatMessage(
        "user",
        text
    );


    /*
     * Save user message.
     */

    conversation.push({

        role:
            "user",

        content:
            text

    });


    /*
     * Clear input.
     */

    input.value = "";

    autoResizeInput();

    updateChatButton();


    /*
     * Ask AI for the next
     * personalized question.
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

                /*
                 * Enter = send
                 * Shift + Enter = new line
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
     * Recommendation
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
     * Confidence
     */

    if (confidence) {

        const rawConfidence =
            Number(
                result.confidence
            );

        const value =
            Number.isFinite(
                rawConfidence
            )
                ? Math.round(
                    rawConfidence
                )
                : 0;

        confidence.textContent =
            `${value}% confidence`;
    }


    /*
     * Reasoning
     */

    if (reasoning) {

        reasoning.textContent =
            result.reasoning ||
            "";
    }


    /*
     * Reflection
     */

    if (reflection) {

        reflection.textContent =
            result.reflection ||
            "";
    }


    /*
     * Result icon
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
                recommendationValue
            ] || "✦";
    }


    showStep(5);
}


/* =========================================================
   OLD FUNCTION COMPATIBILITY
========================================================= */

async function analyzeItem() {

    /*
     * Kept so old HTML references
     * do not cause errors.
     */

    console.log(
        "The new chat engine handles analysis automatically."
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

    declutterImageData = null;


    /*
     * Reset file input.
     */

    const input =
        document.getElementById(
            "imageInput"
        );

    if (input) {

        input.value = "";
    }


    /*
     * Reset image preview.
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
     * Restore upload content.
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
     * Reset image button.
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
     * Reset category buttons.
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
     * Reset category continue.
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
     * Reset roles.
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
     * Reset chat.
     */

    const chatWindow =
        document.getElementById(
            "chatWindow"
        );

    if (chatWindow) {

        chatWindow.innerHTML = "";
    }


    /*
     * Reset chat input.
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
     * Reset item context.
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
     * Reset result.
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
