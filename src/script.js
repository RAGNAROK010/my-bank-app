function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  if (menu) menu.classList.toggle("hidden");
}

function openLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.remove("hidden");
}

function closeLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.add("hidden");
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const identifierInput = document.getElementById("login-identifier");
  const passwordInput = document.getElementById("login-password");

  if (!identifierInput || !passwordInput) return;

  const identifier = identifierInput.value.trim().toLowerCase();
  const password = passwordInput.value.trim();

  // Retrieve stored users or initialize default user profile
  let users = JSON.parse(localStorage.getItem("reenBankUsers")) || [];

  // Default user fallback
  const defaultUser = {
    name: "Ismaheel Mubarak",
    email: "mubarakismaheel67@gmail.com",
    accountNo: "1234567890",
    phone: "+234 812 345 6789",
    password: "password123",
  };

  if (users.length === 0) {
    users.push(defaultUser);
    localStorage.setItem("reenBankUsers", JSON.stringify(users));
  }

  // Find matching user by email or account number
  const matchedUser = users.find(
    (u) => u.email.toLowerCase() === identifier || u.accountNo === identifier,
  );

  if (matchedUser) {
    // Save current active session
    localStorage.setItem("currentUser", JSON.stringify(matchedUser));
    localStorage.setItem("isLoggedIn", "true");
    alert(
      `Welcome back, ${matchedUser.name}! Redirecting to your dashboard...`,
    );
    window.location.href = "./dashboard.html";
  } else {
    // If credentials don't match strict stored data, allow fallback login for testing demo state
    if (identifier.length >= 5 && password.length >= 4) {
      const demoUser = {
        name: "Ismaheel Mubarak",
        email: identifier.includes("@")
          ? identifier
          : "mubarakismaheel67@gmail.com",
        accountNo: identifier.length === 10 ? identifier : "1234567890",
        phone: "+234 812 345 6789",
      };
      localStorage.setItem("currentUser", JSON.stringify(demoUser));
      localStorage.setItem("isLoggedIn", "true");
      alert("Login successful! Redirecting to dashboard...");
      window.location.href = "./dashboard.html";
    } else {
      alert("Invalid email, account number, or password. Please try again.");
    }
  }

  closeLoginModal();
}

function handleNewsletterSubmit(e) {
  e.preventDefault();
  alert("Thank you for getting started with Reen Bank!");
}

// Dynamic FAQ Data Array
const faqsData = [
  {
    id: 1,
    question: "What types of accounts does Reen Bank offer?",
    answer:
      "Reen Bank offers a variety of accounts to suit your financial needs including savings accounts, checking accounts and credit cards. We also offer loans, investment services and other financial products.",
  },
  {
    id: 2,
    question: "How do I sign up for an account with Reen Bank?",
    answer:
      "You can sign up for an account with Reen Bank online by visiting our website and filling out the online application form. Once your application is approved, you will receive instructions for setting up your account.",
  },
  {
    id: 3,
    question: "Is Reen Bank FDIC insured?",
    answer:
      "Yes, Reen Bank is FDIC insured, which means that your deposits are insured up to $250,000 per depositor, per insured bank, for each account ownership category.",
  },
  {
    id: 4,
    question: "How can I access my Reen Bank account online?",
    answer:
      "You can access your Reen Bank account online by logging into our secure online banking platform using your username and password. From there, you can view account balances, transfer funds, pay bills, and more.",
  },
  {
    id: 5,
    question:
      "What security measures does Reen Bank have in place to protect my financial information?",
    answer:
      "Reen Bank takes the security of your financial information seriously and has a number of measures in place to protect against unauthorized access and fraud. These measures include encryption, two-factor authentication, fraud detection, and regular security updates and monitoring.",
  },
];

let activeFaqId = 1; // Default selected FAQ ID

function renderFaqs() {
  const activeFaqContainer = document.getElementById("faqActiveContent");
  const listContainer = document.getElementById("faqList");
  if (!activeFaqContainer || !listContainer) return;

  // 1. Get active FAQ item
  const activeFaq =
    faqsData.find((faq) => faq.id === activeFaqId) || faqsData[0];

  // 2. Render Left Container (Active Question & Answer)
  activeFaqContainer.innerHTML = `
    <h3 class="text-xl sm:text-2xl font-extrabold text-[#00B074] mb-4 underline decoration-[#00B074] underline-offset-4">
      ${activeFaq.question}
    </h3>
    <p class="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-[480px]">
      ${activeFaq.answer}
    </p>
  `;

  // 3. Render Right Container (Interactive List)
  listContainer.innerHTML = faqsData
    .map((faq) => {
      const isActive = faq.id === activeFaqId;
      return `
        <div
          onclick="selectFaq(${faq.id})"
          class="flex items-center justify-between border-b border-gray-300/80 pb-3 cursor-pointer group transition-colors"
        >
          <span class="text-xs sm:text-sm font-semibold transition-colors ${
            isActive
              ? "text-[#00B074]"
              : "text-gray-800 group-hover:text-[#00B074]"
          }">
            ${faq.question}
          </span>
          <span class="material-symbols-outlined text-[#00B074] !text-lg shrink-0 ml-2">
            ${isActive ? "expand_more" : "arrow_forward"}
          </span>
        </div>
      `;
    })
    .join("");
}

function selectFaq(id) {
  activeFaqId = id;
  renderFaqs();
}

// Initialize FAQ component on DOM load
document.addEventListener("DOMContentLoaded", renderFaqs);
