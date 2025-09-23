document.addEventListener("DOMContentLoaded", () => {

  const loginIcon = document.getElementById("loginIcon");
  const registerIcon = document.getElementById("registerIcon");
  const logoutIcon = document.getElementById("logoutIcon");

  const loginModal = document.getElementById("loginModal");
  const registerModal = document.getElementById("registerModal");
  const forgotPasswordModal = document.getElementById("forgotPasswordModal");

  const gradeSection = document.getElementById("gradeSection");
  const userNameDisplay = document.getElementById("userNameDisplay");

  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");

  const cgpaForm = document.getElementById("cgpaForm");
  const subjectsContainer = document.getElementById("subjectsContainer");
  const addSubjectBtn = document.getElementById("addSubject");
  const cgpaResult = document.getElementById("cgpaResult");

  function hideAllModals() {
    loginModal.style.display = "none";
    registerModal.style.display = "none";
    forgotPasswordModal.style.display = "none";
  }

  function showButtonsForLoggedOut() {
    loginIcon.style.display = "block";
    registerIcon.style.display = "block";
    logoutIcon.style.display = "none";
  }

  function showButtonsForLoggedIn() {
    loginIcon.style.display = "none";
    registerIcon.style.display = "none";
    logoutIcon.style.display = "block";
  }

  function showGradeSection(username) {
    gradeSection.style.display = "block";
    userNameDisplay.textContent = username;
    showButtonsForLoggedIn();
  }

  function showInitialModal() {
    hideAllModals();
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    const loggedInEmail = localStorage.getItem("loggedInEmail");
    if (loggedInEmail && users[loggedInEmail]) {
      showGradeSection(users[loggedInEmail].username);
    } else {
      showButtonsForLoggedOut();
      loginModal.style.display = "flex";
    }
  }

  showInitialModal();

  loginIcon.onclick = () => { hideAllModals(); loginModal.style.display = "flex"; };
  registerIcon.onclick = () => { hideAllModals(); registerModal.style.display = "flex"; };
  logoutIcon.onclick = () => {
    gradeSection.style.display = "none";
    localStorage.removeItem("loggedInEmail");
    showButtonsForLoggedOut();
    showInitialModal();
  };

  // ===== Register Form =====
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = e.target.username.value.trim();
      const email = e.target.email.value.trim();
      const password = e.target.password.value.trim();
      if (!username || !email || !password) return;

      let users = JSON.parse(localStorage.getItem("users") || "{}");
      if (users[email]) {
        const registerMsg = document.getElementById("registerMessage");
        if (registerMsg) {
          registerMsg.textContent = "Email already registered.";
          registerMsg.style.color = "red";
        }
        return;
      }
      users[email] = { username, password };
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("loggedInEmail", email);

      hideAllModals();
      showGradeSection(username);
      registerForm.reset();
      alert("Registered and logged in successfully!");
    });
  }

  // ===== Login Form =====
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = e.target.email.value.trim();
      const password = e.target.password.value.trim();

      const users = JSON.parse(localStorage.getItem("users") || "{}");

      if (users[email] && users[email].password === password) {
        localStorage.setItem("loggedInEmail", email);
        hideAllModals();
        showGradeSection(users[email].username);
        loginForm.reset();
        const loginMsg = document.getElementById("loginMessage");
        if (loginMsg) loginMsg.textContent = "";
      } else {
        const loginMsg = document.getElementById("loginMessage");
        if (loginMsg) {
          loginMsg.textContent = "Invalid email or password.";
          loginMsg.style.color = "red";
        } else {
          alert("Invalid email or password.");
        }
      }
    });
  }

  // ===== Forgot Password =====
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  if (forgotPasswordLink) {
    forgotPasswordLink.onclick = (e) => {
      e.preventDefault();
      hideAllModals();
      forgotPasswordModal.style.display = "flex";
    };
  }

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = e.target.email.value.trim();

      const users = JSON.parse(localStorage.getItem("users") || "{}");
      if (users[email]) {
        alert(`Password recovery: Your password is '${users[email].password}'`);
        hideAllModals();
        loginModal.style.display = "flex";
      } else {
        alert("Email not found.");
      }
    });
  }

  document.getElementById("goToRegister").onclick = (e) => {
    e.preventDefault();
    hideAllModals();
    registerModal.style.display = "flex";
  };

  document.getElementById("goToLogin").onclick = (e) => {
    e.preventDefault();
    hideAllModals();
    loginModal.style.display = "flex";
  };

  // ===== CGPA Calculator =====
  if (addSubjectBtn) {
    addSubjectBtn.addEventListener("click", () => {
      const div = document.createElement("div");
      div.classList.add("subject");
      div.innerHTML = `
        <input type="text" name="subject[]" placeholder="Subject Name" required>
        <input type="number" name="credits[]" placeholder="Credits" min="1" required>
        <select name="grade[]" required>
          <option value="">Select Grade</option>
          <option value="10">A+</option>
          <option value="9">A</option>
          <option value="8">B+</option>
          <option value="7">B</option>
          <option value="6">C+</option>
          <option value="5">C</option>
          <option value="4">D</option>
          <option value="3">E</option>
          <option value="2">F</option>
        </select>
      `;
      subjectsContainer.appendChild(div);
    });
  }

  if (cgpaForm) {
    cgpaForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const credits = [...document.getElementsByName("credits[]")].map(c => Number(c.value));
      const grades = [...document.getElementsByName("grade[]")].map(g => Number(g.value));

      let totalCredits = 0, totalPoints = 0, hasFail = false;
      for (let i = 0; i < credits.length; i++) {
        totalCredits += credits[i];
        totalPoints += credits[i] * grades[i];
        if (grades[i] <= 2) hasFail = true;
      }

      if (totalCredits > 0) {
        const cgpa = (totalPoints / totalCredits).toFixed(2);
        cgpaResult.textContent = hasFail
          ? `Your CGPA is: ${cgpa} ⚠️ (Fail in one or more subjects)`
          : `Your CGPA is: ${cgpa}`;
        cgpaResult.style.color = hasFail ? "red" : "green";
      } else {
        cgpaResult.textContent = "Please enter valid subjects.";
      }
    });
  }
});
