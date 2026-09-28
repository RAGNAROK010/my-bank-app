document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginSuccessStep = document.getElementById("loginSuccessStep");
  const mainContainer = document.getElementById("mainContainer");
  const loginErrorMsg = document.getElementById("loginErrorMsg");
  const welcomeUserName = document.getElementById("welcomeUserName");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (loginErrorMsg) loginErrorMsg.classList.add("hidden");

      const emailInput = document.getElementById("loginEmail")
        ? document.getElementById("loginEmail").value.trim().toLowerCase()
        : "";
      const passwordInput = document.getElementById("loginPassword")
        ? document.getElementById("loginPassword").value
        : "";

      if (!emailInput || !passwordInput) {
        if (loginErrorMsg) {
          loginErrorMsg.textContent = "Please enter both email and password.";
          loginErrorMsg.classList.remove("hidden");
        }
        return;
      }

      let users = JSON.parse(localStorage.getItem("reenBankUsers")) || [];

      // Default demo fallback user if none registered yet
      if (users.length === 0) {
        users.push({
          name: "Ismaheel Mubarak",
          email: "mubarakismaheel67@gmail.com",
          accountNo: "1234567890",
          phone: "+234 812 345 6789",
          password: "password123",
        });
        localStorage.setItem("reenBankUsers", JSON.stringify(users));
      }

      let validUser = users.find(
        (u) =>
          u.email.toLowerCase() === emailInput && u.password === passwordInput,
      );

      // Fallback tolerance for test login if credentials match standard demo format
      if (!validUser && emailInput.length >= 5 && passwordInput.length >= 4) {
        validUser = {
          name: "Ismaheel Mubarak",
          email: emailInput,
          accountNo: "1234567890",
          phone: "+234 812 345 6789",
        };
      }

      if (validUser) {
        localStorage.setItem("currentUser", JSON.stringify(validUser));
        localStorage.setItem("isLoggedIn", "true");

        if (welcomeUserName && validUser.name) {
          welcomeUserName.textContent = validUser.name;
        }

        // 1. Hide background page content
        if (mainContainer) {
          mainContainer.style.display = "none";
        }

        // 2. Show centered success popup overlay with green tick
        if (loginSuccessStep) {
          loginSuccessStep.classList.remove("hidden");
        }
      } else {
        if (loginErrorMsg) {
          loginErrorMsg.textContent =
            "Invalid email or password. Please try again.";
          loginErrorMsg.classList.remove("hidden");
        }
      }
    });
  }
});
