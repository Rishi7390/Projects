document.addEventListener("DOMContentLoaded", () => {

  const API_URL = "  https://cb2e2152c1dd.ngrok-free.app ";

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
    const username = localStorage.getItem("username");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn && username) {
      showGradeSection(username);
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
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    showButtonsForLoggedOut();
    showInitialModal();
  };

  // ===== Register Form =====
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = e.target.username.value.trim();
      const email = e.target.email.value.trim();
      const password = e.target.password.value.trim();
      if (!username || !email || !password) return;

      try {
        const res = await fetch(`${API_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("username", username);
          hideAllModals();
          showGradeSection(username);
        }
        alert(data.message);
      } catch (err) {
        console.error("Register Error:", err);
        alert("Cannot reach server. Make sure Flask is running.");
      }
    });
  }

  // ===== Login Form =====
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = e.target.email.value.trim();
      const password = e.target.password.value.trim();

      try {
        const res = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("username", data.username);
          hideAllModals();
          showGradeSection(data.username);
        } else {
          const loginMsg = document.getElementById("loginMessage");
          if (loginMsg) {
            loginMsg.textContent = data.message;
            loginMsg.style.color = "red";
          } else {
            alert(data.message);
          }
        }
      } catch (err) {
        console.error("Login Error:", err);
        alert("Cannot reach server. Make sure Flask is running.");
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
    forgotPasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = e.target.email.value.trim();

      try {
        const res = await fetch(`${API_URL}/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });

        const data = await res.json();

        alert(data.message);

        if (res.ok) {
          hideAllModals();
          loginModal.style.display = "flex";
        }
      } catch (err) {
        console.error("Forgot Password Error:", err);
        alert("Cannot reach server. Make sure Flask is running.");
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
