const subjectsContainer = document.getElementById("subjectsContainer");
const addSubjectBtn = document.getElementById("addSubject");
const cgpaForm = document.getElementById("cgpaForm");
const cgpaResult = document.getElementById("cgpaResult");

function createSubjectElement() {
  const div = document.createElement("div");
  div.classList.add("subject");
  div.innerHTML = `
    <label>
      Subject Name
      <input type="text" name="subject[]" placeholder="Enter subject name" required />
    </label>
    <label>
      Credits
      <input type="number" name="credits[]" placeholder="Enter credits" min="1" required />
    </label>
    <label>
      Grade
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
    </label>
    <button type="button" class="removeSubject" title="Remove Subject">-</button>
  `;
  return div;
}

// Add subject button
addSubjectBtn.addEventListener("click", () => {
  const newSubject = createSubjectElement();
  subjectsContainer.appendChild(newSubject);
  cgpaResult.textContent = ""; // clear result on adding new subject
});

// Remove subject buttons
subjectsContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("removeSubject")) {
    e.target.parentElement.remove();
    cgpaResult.textContent = ""; // clear result on removal
  }
});

// Calculate CGPA submit
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
    cgpaResult.style.color = "black";
  }
});
