// ==========================================
// STATE MANAGEMENT & USER DETECTION
// ==========================================
let isHidden = false;
let activeTab = "overview";
let currentUser = null;
let lookupTimeout = null;
const defaultAccounts = [
  { id: 1, name: "Main Account", balance: 44500, type: "main" },
  { id: 2, name: "School Savings", balance: 44500, type: "sub" },
  { id: 3, name: "Holiday Plan", balance: 44500, type: "sub" },
];
const defaultTransactions = [
  {
    id: 1,
    name: "Oluwaben Jamin",
    type: "Bank Transfer",
    date: "06.Mar.2026 - 09:39",
    amount: -10000,
    status: "Pending",
    accountId: 1,
  },
  {
    id: 2,
    name: "Oluwaben Jamin",
    type: "Direct Pay",
    date: "06.Mar.2026 - 09:39",
    amount: 10000,
    status: "Completed",
    accountId: 1,
  },
  {
    id: 3,
    name: "Oluwaben Jamin",
    type: "Bank Transfer",
    date: "06.Mar.2026 - 09:39",
    amount: -10000,
    status: "Canceled",
    accountId: 1,
  },
  {
    id: 4,
    name: "Oluwaben Jamin",
    type: "Credit Card",
    date: "06.Mar.2026 - 09:39",
    amount: 10000,
    status: "Completed",
    accountId: 2,
  },
  {
    id: 5,
    name: "Oluwaben Jamin",
    type: "Bank Transfer",
    date: "06.Mar.2026 - 09:39",
    amount: -10000,
    status: "Pending",
    accountId: 2,
  },
  {
    id: 6,
    name: "Oluwaben Jamin",
    type: "Direct Pay",
    date: "06.Mar.2026 - 08:30",
    amount: 10000,
    status: "Completed",
    accountId: 3,
  },
];
let accounts = [];
let transactions = [];

// ==========================================
// APPLICATION INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
  loadUserData();
  setupPhotoUploadListener();
  renderAccounts();
  renderTransactions();
  updateTotals();
});

function loadUserProfile() {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
  } else {
    currentUser = {
      name: "Ismaheel Mubarak",
      email: "mubarakismaheel67@gmail.com",
      accountNo: "1234567890",
      phone: "+234 812 345 6789",
    };
  }
  const headerName = document.getElementById("user-header-name");
  const headerAccNo = document.getElementById("user-header-account-no");
  if (headerName) headerName.innerText = currentUser.name || "User";
  if (headerAccNo)
    headerAccNo.innerText = currentUser.accountNo || "1234567890";
  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");
  const profilePhone = document.getElementById("profile-phone");
  const profileAccNo = document.getElementById("profile-account-no");
  const resetEmail = document.getElementById("reset-email");
  if (profileName) profileName.innerText = currentUser.name || "User";
  if (profileEmail) profileEmail.innerText = currentUser.email || "";
  if (profilePhone)
    profilePhone.innerText = currentUser.phone || "+234 812 345 6789";
  if (profileAccNo)
    profileAccNo.innerText = currentUser.accountNo || "1234567890";
  if (resetEmail) resetEmail.value = currentUser.email || "";
  renderProfilePhoto();
}

function loadUserData() {
  const userKey = currentUser ? currentUser.email : "guest";
  const savedAccounts = localStorage.getItem(`accounts_${userKey}`);
  const savedTransactions = localStorage.getItem(`transactions_${userKey}`);
  accounts = savedAccounts ? JSON.parse(savedAccounts) : [...defaultAccounts];
  transactions = savedTransactions
    ? JSON.parse(savedTransactions)
    : [...defaultTransactions];
}

function saveUserData() {
  const userKey = currentUser ? currentUser.email : "guest";
  localStorage.setItem(`accounts_${userKey}`, JSON.stringify(accounts));
  localStorage.setItem(`transactions_${userKey}`, JSON.stringify(transactions));
}

// ==========================================
// MOBILE RESPONSIVE SIDEBAR TOGGLE
// ==========================================
function toggleMobileSidebar(forceClose = false) {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  const icon = document.getElementById("mobile-menu-icon");
  if (!sidebar) return;
  if (forceClose || !sidebar.classList.contains("-translate-x-full")) {
    sidebar.classList.add("-translate-x-full");
    if (backdrop) backdrop.classList.add("hidden");
    if (icon) icon.className = "fa-solid fa-bars";
  } else {
    sidebar.classList.remove("-translate-x-full");
    if (backdrop) backdrop.classList.remove("hidden");
    if (icon) icon.className = "fa-solid fa-xmark";
  }
}

// ==========================================
// REAL-TIME BACKEND ACCOUNT RESOLUTION
// ==========================================
async function fetchAccountNameFromAPI(accountNumber, bankCode) {
  const response = await fetch(
    `http://localhost:5000/api/resolve-account?accountNumber=${accountNumber}&bankCode=${bankCode}`,
  );
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Invalid Account");
  }
  return data.accountName;
}

async function triggerAccountLookup() {
  const accountNoInput = document.getElementById("transfer-account-no");
  const recipientInput = document.getElementById("transfer-recipient-name");
  const loader = document.getElementById("lookup-loader");
  const bankSelect = document.getElementById("transfer-bank-select");
  const sendBtn = document.getElementById("btn-send-money");
  if (!accountNoInput || !recipientInput) return;
  const accountNo = accountNoInput.value.trim();
  const bankCode = bankSelect ? bankSelect.value : "";
  if (typeof lookupTimeout !== "undefined" && lookupTimeout)
    clearTimeout(lookupTimeout);
  if (accountNo.length < 10) {
    recipientInput.value = "";
    recipientInput.placeholder =
      "Enters automatically when 10 digits are typed";
    if (loader) loader.classList.add("hidden");
    if (sendBtn) sendBtn.disabled = true;
    return;
  }
  if (accountNo.length >= 10 && bankCode !== "") {
    if (loader) loader.classList.remove("hidden");
    recipientInput.value = "";
    recipientInput.placeholder = "Querying bank database...";
    lookupTimeout = setTimeout(async () => {
      try {
        const resolvedName = await fetchAccountNameFromAPI(
          accountNo.slice(0, 10),
          bankCode,
        );
        recipientInput.value = resolvedName;
        if (sendBtn) sendBtn.disabled = false;
      } catch (err) {
        recipientInput.value = "";
        recipientInput.placeholder = err.message || "Account name not found";
        if (sendBtn) sendBtn.disabled = true;
      } finally {
        if (loader) loader.classList.add("hidden");
      }
    }, 300);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const accountNoInput = document.getElementById("transfer-account-no");
  const bankSelect = document.getElementById("transfer-bank-select");
  if (accountNoInput) {
    accountNoInput.addEventListener("input", triggerAccountLookup);
  }
  if (bankSelect) {
    bankSelect.addEventListener("change", triggerAccountLookup);
  }
});

function openTransferModal() {
  const transferSelect = document.getElementById("transfer-source-account");
  const accountNoInput = document.getElementById("transfer-account-no");
  const recipientInput = document.getElementById("transfer-recipient-name");
  const amountInput = document.getElementById("transfer-amount");
  const sendBtn = document.getElementById("btn-send-money");
  if (accountNoInput) accountNoInput.value = "";
  if (recipientInput) {
    recipientInput.value = "";
    recipientInput.placeholder =
      "Enters automatically when 10 digits are typed";
  }
  if (amountInput) amountInput.value = "";
  if (sendBtn) sendBtn.disabled = true;
  if (transferSelect) {
    transferSelect.innerHTML = "";
    accounts.forEach((acc) => {
      const opt = document.createElement("option");
      opt.value = acc.id;
      opt.innerText = `${acc.name} (₦${acc.balance.toLocaleString()})`;
      transferSelect.appendChild(opt);
    });
  }
  openModal("modal-transfer");
}

function handleBankTransfer() {
  const sourceSelect = document.getElementById("transfer-source-account");
  const bankSelect = document.getElementById("transfer-bank-select");
  const accountNoInput = document.getElementById("transfer-account-no");
  const recipientNameInput = document.getElementById("transfer-recipient-name");
  const amountInput = document.getElementById("transfer-amount");
  if (
    !sourceSelect ||
    !bankSelect ||
    !accountNoInput ||
    !recipientNameInput ||
    !amountInput
  )
    return;
  const accId = parseInt(sourceSelect.value);
  const selectedBankName = bankSelect.options[bankSelect.selectedIndex].text;
  const accountNo = accountNoInput.value.trim();
  const recipientName = recipientNameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  if (!accountNo || accountNo.length < 10) {
    return alert("Please enter a valid 10-digit account number.");
  }
  if (!recipientName) {
    return alert("Please wait for account name verification.");
  }
  if (!amount || amount <= 0) {
    return alert("Please enter a valid transfer amount.");
  }
  const sourceAccount = accounts.find((a) => a.id === accId);
  if (sourceAccount) {
    if (sourceAccount.balance < amount) {
      return alert("Insufficient balance in the selected account.");
    }
    sourceAccount.balance -= amount;
    const formattedDate =
      new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      " - " +
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    transactions.unshift({
      id: Date.now(),
      name: `${recipientName} (${selectedBankName})`,
      type: "Bank Transfer",
      date: formattedDate,
      amount: -amount,
      status: "Completed",
      accountId: accId,
    });
  }
  saveUserData();
  closeModal("modal-transfer");
  renderAccounts();
  renderTransactions();
  updateTotals();
  alert(
    `Transfer of ₦${amount.toLocaleString()} to ${recipientName} (${selectedBankName}) was Successful!`,
  );
}

// ==========================================
// PROFILE EDIT CONTROLLER
// ==========================================
function openEditProfileModal() {
  const editName = document.getElementById("edit-profile-name");
  const editEmail = document.getElementById("edit-profile-email");
  const editPhone = document.getElementById("edit-profile-phone");
  if (editName) editName.value = currentUser.name || "";
  if (editEmail) editEmail.value = currentUser.email || "";
  if (editPhone) editPhone.value = currentUser.phone || "+234 812 345 6789";
  openModal("modal-edit-profile");
}

function handleSaveProfile() {
  const editName = document.getElementById("edit-profile-name");
  const editEmail = document.getElementById("edit-profile-email");
  const editPhone = document.getElementById("edit-profile-phone");
  const newName = editName ? editName.value.trim() : "";
  const newEmail = editEmail ? editEmail.value.trim().toLowerCase() : "";
  const newPhone = editPhone ? editPhone.value.trim() : "";
  if (!newName || !newEmail) {
    return alert("Please enter both a valid name and email address.");
  }
  currentUser.name = newName;
  currentUser.email = newEmail;
  currentUser.phone = newPhone;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  const users = JSON.parse(localStorage.getItem("reenBankUsers")) || [];
  const userIndex = users.findIndex(
    (u) => u.email === newEmail || u.name === newName,
  );
  if (userIndex !== -1) {
    users[userIndex].name = newName;
    users[userIndex].email = newEmail;
    users[userIndex].phone = newPhone;
    localStorage.setItem("reenBankUsers", JSON.stringify(users));
  }
  loadUserProfile();
  closeModal("modal-edit-profile");
}

// ==========================================
// PROFILE PHOTO UPLOAD
// ==========================================
function triggerPhotoUpload() {
  const input = document.getElementById("profile-photo-input");
  if (input) input.click();
}

function setupPhotoUploadListener() {
  const input = document.getElementById("profile-photo-input");
  if (input) {
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          const photoBase64 = event.target.result;
          const userKey = currentUser ? currentUser.email : "guest";
          localStorage.setItem(`photo_${userKey}`, photoBase64);
          renderProfilePhoto();
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

function renderProfilePhoto() {
  const userKey = currentUser ? currentUser.email : "guest";
  const photoBase64 = localStorage.getItem(`photo_${userKey}`);
  const smallIcon = document.getElementById("user-avatar-small-icon");
  const smallImg = document.getElementById("user-avatar-small-img");
  const largeIcon = document.getElementById("user-avatar-large-icon");
  const largeImg = document.getElementById("user-avatar-large-img");
  if (photoBase64) {
    if (smallIcon) smallIcon.classList.add("hidden");
    if (smallImg) {
      smallImg.src = photoBase64;
      smallImg.classList.remove("hidden");
    }
    if (largeIcon) largeIcon.classList.add("hidden");
    if (largeImg) {
      largeImg.src = photoBase64;
      largeImg.classList.remove("hidden");
    }
  } else {
    if (smallIcon) smallIcon.classList.remove("hidden");
    if (smallImg) smallImg.classList.add("hidden");
    if (largeIcon) largeIcon.classList.remove("hidden");
    if (largeImg) largeImg.classList.add("hidden");
  }
}

// ==========================================
// NAVIGATION & TAB SWITCHING
// ==========================================
function switchTab(tabName) {
  activeTab = tabName;
  document
    .querySelectorAll(".tab-content")
    .forEach((el) => el.classList.add("hidden"));
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("bg-brand-500", "text-white", "shadow-md");
    btn.classList.add(
      "text-gray-500",
      "hover:bg-emerald-50",
      "hover:text-brand-600",
    );
  });
  const targetTab = document.getElementById(`tab-${tabName}`);
  if (targetTab) {
    targetTab.classList.remove("hidden");
  }
  const activeNav = document.getElementById(`nav-${tabName}`);
  if (activeNav) {
    activeNav.classList.add("bg-brand-500", "text-white", "shadow-md");
    activeNav.classList.remove(
      "text-gray-500",
      "hover:bg-emerald-50",
      "hover:text-brand-600",
    );
  }
  const pageTitle = document.getElementById("page-title");
  if (pageTitle) {
    pageTitle.innerText = tabName.charAt(0).toUpperCase() + tabName.slice(1);
  }
}

// ==========================================
// GLOBAL SEARCH BAR & NOTIFICATIONS
// ==========================================
function handleGlobalSearch(query) {
  if (!query) return;
  switchTab("transactions");
  const filterElement = document.getElementById("tx-filter");
  if (filterElement) filterElement.value = "all";
  renderTransactions(query);
}

function showNotifications() {
  alert(
    "You have 1 new security notification: Active session verified successfully on Reen Bank.",
  );
}

// ==========================================
// PRIVACY & VISIBILITY TOGGLE
// ==========================================
function toggleVisibility() {
  isHidden = !isHidden;
  const eyeIcon = document.getElementById("eye-icon");
  if (eyeIcon) {
    eyeIcon.className = isHidden
      ? "fa-regular fa-eye"
      : "fa-regular fa-eye-slash";
  }
  updateTotals();
  renderAccounts();
}

function formatCurrency(amount) {
  if (isHidden) return "₦ ••••••";
  const prefix = amount < 0 ? "- ₦ " : "₦ ";
  return (
    prefix +
    Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })
  );
}

function updateTotals() {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const mainBalanceText = document.getElementById("main-balance-text");
  if (mainBalanceText) {
    mainBalanceText.innerText = formatCurrency(totalBalance);
  }
  const totalIncome = transactions
    .filter((t) => t.amount > 0 && t.status === "Completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.amount < 0 && t.status === "Completed")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const incomeText = document.getElementById("income-text");
  const expenseText = document.getElementById("expense-text");
  const incomeBarVal = document.getElementById("income-bar-val");
  const expenseBarVal = document.getElementById("expense-bar-val");
  const incomeBar = document.getElementById("income-bar");
  const expenseBar = document.getElementById("expense-bar");
  if (incomeText) incomeText.innerText = formatCurrency(totalIncome);
  if (expenseText) expenseText.innerText = formatCurrency(totalExpense);
  if (incomeBarVal) incomeBarVal.innerText = formatCurrency(totalIncome);
  if (expenseBarVal) expenseBarVal.innerText = formatCurrency(totalExpense);
  const grandTotal = totalIncome + totalExpense || 1;
  if (incomeBar)
    incomeBar.style.width = `${Math.min(100, Math.round((totalIncome / grandTotal) * 100))}%`;
  if (expenseBar)
    expenseBar.style.width = `${Math.min(100, Math.round((totalExpense / grandTotal) * 100))}%`;
}

// ==========================================
// RENDER DYNAMIC DATA (ACCOUNTS)
// ==========================================
function renderAccounts() {
  const previewContainer = document.getElementById("accounts-grid-preview");
  const fullContainer = document.getElementById("accounts-grid-full");
  if (previewContainer) previewContainer.innerHTML = "";
  if (fullContainer) fullContainer.innerHTML = "";
  accounts.forEach((acc) => {
    if (previewContainer) {
      const previewCard = document.createElement("div");
      previewCard.className =
        "bg-brand-50/60 p-5 rounded-2xl border border-brand-100 flex flex-col justify-between hover:shadow-md transition";
      previewCard.innerHTML = `
        <p class="text-xs font-semibold text-gray-500">${acc.name}</p>
        <p class="text-xl font-bold text-gray-900 mt-2">${formatCurrency(acc.balance)}</p>
      `;
      previewContainer.appendChild(previewCard);
    }
    if (fullContainer) {
      const fullCard = document.createElement("div");
      fullCard.className =
        "bg-brand-50/80 p-6 rounded-3xl border border-brand-200/60 shadow-sm space-y-4";
      fullCard.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-gray-500 tracking-wider uppercase">${acc.name}</span>
          <i class="fa-solid fa-wallet text-brand-600"></i>
        </div>
        <h3 class="text-2xl font-extrabold text-gray-900">${formatCurrency(acc.balance)}</h3>
        <div class="flex items-center gap-2 pt-2">
          <button onclick="openFundModal(${acc.id})" class="flex-1 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer">Fund</button>
          <button onclick="openWithdrawModal(${acc.id})" class="flex-1 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition cursor-pointer">Withdraw</button>
        </div>
      `;
      fullContainer.appendChild(fullCard);
    }
  });
}

// ==========================================
// RENDER DYNAMIC DATA (TRANSACTIONS)
// ==========================================
function renderTransactions(searchQuery = "") {
  const listContainer = document.getElementById("full-transactions-list");
  const activityContainer = document.getElementById("accounts-activity-list");
  const filterElement = document.getElementById("tx-filter");
  const filter = filterElement ? filterElement.value : "all";
  if (listContainer) listContainer.innerHTML = "";
  if (activityContainer) activityContainer.innerHTML = "";

  const filtered = transactions.filter((t) => {
    const matchesType =
      filter === "all" ||
      (filter === "credit" && t.amount > 0) ||
      (filter === "debit" && t.amount < 0);
    const matchesSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  filtered.forEach((t) => {
    const isCredit = t.amount > 0;
    const amountColor = isCredit ? "text-emerald-600" : "text-rose-500";
    const sign = isCredit ? "+" : "-";
    let statusClass = "bg-gray-100 text-gray-600";
    if (t.status === "Completed")
      statusClass = "bg-emerald-100 text-emerald-700";
    if (t.status === "Canceled") statusClass = "bg-rose-100 text-rose-700";
    if (t.status === "Pending") statusClass = "bg-amber-100 text-amber-700";
    if (listContainer) {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-gray-50/80 transition";
      tr.innerHTML = `
        <td class="py-3 px-4">
          <div class="w-8 h-8 rounded-full ${isCredit ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-500"} flex items-center justify-center font-bold text-xs">
            ${isCredit ? "+" : "-"}
          </div>
        </td>
        <td class="py-3 px-4 font-semibold text-gray-800">${t.name}</td>
        <td class="py-3 px-4 text-gray-500">${t.type}</td>
        <td class="py-3 px-4 text-gray-400 text-xs">${t.date}</td>
        <td class="py-3 px-4 font-bold ${amountColor}">${sign} ₦ ${Math.abs(t.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
        <td class="py-3 px-4"><span class="px-2.5 py-1 rounded-full text-xs font-medium ${statusClass}">${t.status}</span></td>
      `;
      listContainer.appendChild(tr);
    }
  });

  // Render recent activity snippet on accounts/overview tabs
  if (activityContainer) {
    transactions.slice(0, 3).forEach((t) => {
      const isCredit = t.amount > 0;
      const amountColor = isCredit ? "text-emerald-600" : "text-rose-500";
      const sign = isCredit ? "+" : "-";
      const activityItem = document.createElement("div");
      activityItem.className = "py-3 flex items-center justify-between text-sm";
      activityItem.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full ${isCredit ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-500"} flex items-center justify-center font-bold text-xs">
            ${isCredit ? "+" : "-"}
          </div>
          <div>
            <p class="font-bold text-gray-800 text-xs">${t.name}</p>
            <p class="text-[10px] text-gray-400">${t.date}</p>
          </div>
        </div>
        <span class="font-bold text-xs ${amountColor}">${sign} ₦ ${Math.abs(t.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
      `;
      activityContainer.appendChild(activityItem);
    });
  }
}

// ==========================================
// MODAL CONTROLLERS
// ==========================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("hidden");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("hidden");
}

function populateAccountSelects() {
  const fundSelect = document.getElementById("fund-target-account");
  const withdrawSelect = document.getElementById("withdraw-source-account");
  if (fundSelect) fundSelect.innerHTML = "";
  if (withdrawSelect) withdrawSelect.innerHTML = "";
  accounts.forEach((acc) => {
    if (fundSelect) {
      const opt1 = document.createElement("option");
      opt1.value = acc.id;
      opt1.innerText = `${acc.name} (₦${acc.balance.toLocaleString()})`;
      fundSelect.appendChild(opt1);
    }
    if (withdrawSelect) {
      const opt2 = document.createElement("option");
      opt2.value = acc.id;
      opt2.innerText = `${acc.name} (₦${acc.balance.toLocaleString()})`;
      withdrawSelect.appendChild(opt2);
    }
  });
}

function openFundModal(accId) {
  populateAccountSelects();
  if (accId) {
    const select = document.getElementById("fund-target-account");
    if (select) select.value = accId;
  }
  openModal("modal-fund");
}

function openWithdrawModal(accId) {
  populateAccountSelects();
  if (accId) {
    const select = document.getElementById("withdraw-source-account");
    if (select) select.value = accId;
  }
  openModal("modal-withdraw");
}

// ==========================================
// ACCOUNT OPERATIONS
// ==========================================
function handleAddAccount() {
  const nameInput = document.getElementById("input-acc-name");
  const depositInput = document.getElementById("input-acc-deposit");
  if (!nameInput || !nameInput.value.trim()) {
    return alert("Please enter a valid account name.");
  }
  const initialDeposit = parseFloat(depositInput.value) || 0;
  const newAcc = {
    id: Date.now(),
    name: nameInput.value.trim(),
    balance: initialDeposit,
    type: "sub",
  };
  accounts.push(newAcc);
  if (initialDeposit > 0) {
    transactions.unshift({
      id: Date.now() + 1,
      name: "Initial Deposit",
      type: "Direct Pay",
      date:
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        " - " +
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      amount: initialDeposit,
      status: "Completed",
      accountId: newAcc.id,
    });
  }
  nameInput.value = "";
  if (depositInput) depositInput.value = "";
  saveUserData();
  closeModal("modal-add-account");
  renderAccounts();
  renderTransactions();
  updateTotals();
}

function handleFund() {
  const select = document.getElementById("fund-target-account");
  const amountInput = document.getElementById("fund-amount");
  if (!select || !amountInput) return;
  const accId = parseInt(select.value);
  const amount = parseFloat(amountInput.value);
  if (!amount || amount <= 0) {
    return alert("Please enter a valid amount to fund.");
  }
  const targetAccount = accounts.find((a) => a.id === accId);
  if (targetAccount) {
    targetAccount.balance += amount;
    transactions.unshift({
      id: Date.now(),
      name: "Wallet Deposit",
      type: "Direct Pay",
      date:
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        " - " +
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      amount: amount,
      status: "Completed",
      accountId: accId,
    });
  }
  amountInput.value = "";
  saveUserData();
  closeModal("modal-fund");
  renderAccounts();
  renderTransactions();
  updateTotals();
}

function handleWithdraw() {
  const select = document.getElementById("withdraw-source-account");
  const amountInput = document.getElementById("withdraw-amount");
  if (!select || !amountInput) return;
  const accId = parseInt(select.value);
  const amount = parseFloat(amountInput.value);
  if (!amount || amount <= 0) {
    return alert("Please enter a valid withdrawal amount.");
  }
  const targetAccount = accounts.find((a) => a.id === accId);
  if (targetAccount) {
    if (targetAccount.balance < amount) {
      return alert("Insufficient funds in the selected account.");
    }
    targetAccount.balance -= amount;
    transactions.unshift({
      id: Date.now(),
      name: "Bank Withdrawal",
      type: "Bank Transfer",
      date:
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        " - " +
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      amount: -amount,
      status: "Completed",
      accountId: accId,
    });
  }
  amountInput.value = "";
  saveUserData();
  closeModal("modal-withdraw");
  renderAccounts();
  renderTransactions();
  updateTotals();
}

function handleLogout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("currentUser");
  window.location.href = "./login.html";
}

// ==========================================
// RESET PASSWORD MULTI-STEP WIZARD
// ==========================================
function goToResetStep(stepNumber) {
  for (let i = 1; i <= 4; i++) {
    const stepEl = document.getElementById(`reset-step-${i}`);
    if (stepEl) stepEl.classList.add("hidden");
  }
  const targetStep = document.getElementById(`reset-step-${stepNumber}`);
  if (targetStep) targetStep.classList.remove("hidden");
}
