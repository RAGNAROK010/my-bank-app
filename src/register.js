document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const registerStep = document.getElementById("registerStep");
  const verifyStep = document.getElementById("verifyStep");
  const successStep = document.getElementById("successStep");
  const mainContainer = document.getElementById("mainContainer");
  const displayEmail = document.getElementById("displayEmail");
  const changeEmailBtn = document.getElementById("changeEmailBtn");
  const otpInputs = document.querySelectorAll(".otp-input");
  const timerDisplay = document.getElementById("timer");
  const resendBtn = document.getElementById("resendBtn");
  const verifyBtn = document.getElementById("verifyBtn");
  const otpErrorMsg = document.getElementById("otpErrorMsg");
  const createdName = document.getElementById("createdName");

  let currentOtp = null;
  let userEmail = "";
  let userName = "";
  let userPassword = "";
  let countdownInterval = null;

  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  function startTimer() {
    let seconds = 60;
    clearInterval(countdownInterval);
    if (resendBtn) resendBtn.disabled = true;
    if (timerDisplay) {
      timerDisplay.textContent = `0:${seconds < 10 ? "0" : ""}${seconds}`;
    }
    countdownInterval = setInterval(() => {
      seconds--;
      if (seconds >= 0) {
        if (timerDisplay) {
          timerDisplay.textContent = `0:${seconds < 10 ? "0" : ""}${seconds}`;
        }
      } else {
        clearInterval(countdownInterval);
        if (timerDisplay) timerDisplay.textContent = "0:00";
        if (resendBtn) resendBtn.disabled = false;
      }
    }, 1000);
  }

  async function sendVerificationEmail() {
    currentOtp = generateOTP();
    const templateParams = {
      email: userEmail,
      to_email: userEmail,
      reply_to: userEmail,
      to_name: userName || "Customer",
      otp_code: currentOtp,
      passcode: currentOtp,
    };
    console.log("Generated OTP Code:", currentOtp);
    startTimer();
    try {
      if (typeof emailjs === "undefined") {
        throw new Error("EmailJS SDK is not loaded properly.");
      }
      await emailjs.send("service_w2b38g2", "template_ngasw7h", templateParams);
    } catch (error) {
      console.error("EmailJS Error:", error);
    }
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailField = document.getElementById("email");
      const nameField = document.getElementById("name");
      const passwordField = document.getElementById("password");
      userEmail = emailField ? emailField.value.trim() : "";
      userName = nameField ? nameField.value.trim() : "";
      userPassword = passwordField ? passwordField.value : "";
      if (!userEmail) return;

      const parts = userEmail.split("@");
      if (parts.length === 2 && displayEmail) {
        const namePart = parts[0];
        const masked =
          namePart.length > 2
            ? namePart[0] + "****" + namePart[namePart.length - 1]
            : namePart + "****";
        displayEmail.textContent = `${masked}@${parts[1]}`;
      } else if (displayEmail) {
        displayEmail.textContent = userEmail;
      }

      if (registerStep) registerStep.classList.add("hidden");
      if (verifyStep) verifyStep.classList.remove("hidden");
      sendVerificationEmail();
      if (otpInputs.length > 0) otpInputs[0].focus();
    });
  }

  if (resendBtn) {
    resendBtn.addEventListener("click", () => {
      if (otpErrorMsg) otpErrorMsg.classList.add("hidden");
      otpInputs.forEach((input) => (input.value = ""));
      sendVerificationEmail();
    });
  }

  // Handle OTP Verification Button Click
  if (verifyBtn) {
    verifyBtn.addEventListener("click", () => {
      let enteredOtp = "";
      otpInputs.forEach((input) => (enteredOtp += input.value));
      if (enteredOtp.length < 6) {
        if (otpErrorMsg) {
          otpErrorMsg.textContent = "Please enter all 6 digits.";
          otpErrorMsg.classList.remove("hidden");
        }
        return;
      }
      if (enteredOtp === currentOtp) {
        if (otpErrorMsg) otpErrorMsg.classList.add("hidden");
        const users = JSON.parse(localStorage.getItem("reenBankUsers")) || [];
        const newUser = {
          name: userName,
          email: userEmail.toLowerCase(),
          password: userPassword,
        };
        users.push(newUser);
        localStorage.setItem("reenBankUsers", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(newUser));
        localStorage.setItem("isLoggedIn", "true");

        if (createdName && userName) {
          createdName.textContent = userName;
        }

        // Hide main page content & reveal success modal
        if (mainContainer) mainContainer.style.display = "none";
        if (successStep) successStep.classList.remove("hidden");
      } else {
        if (otpErrorMsg) {
          otpErrorMsg.textContent =
            "Invalid verification code. Please try again.";
          otpErrorMsg.classList.remove("hidden");
        }
      }
    });
  }

  if (changeEmailBtn) {
    changeEmailBtn.addEventListener("click", () => {
      clearInterval(countdownInterval);
      if (otpErrorMsg) otpErrorMsg.classList.add("hidden");
      if (verifyStep) verifyStep.classList.add("hidden");
      if (registerStep) registerStep.classList.remove("hidden");
    });
  }

  // Auto-focus move across 6 OTP input boxes
  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      if (otpErrorMsg) otpErrorMsg.classList.add("hidden");
      if (e.target.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });
});
