let courses = [];

/* ---------- THEME ---------- */
function toggleTheme() {
  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");
  document.getElementById("themeIcon").innerText = isLight ? "☀️" : "🌙";

  localStorage.setItem("theme", isLight ? "light" : "dark");
}

// Load saved theme
window.onload = () => {
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
    document.getElementById("themeIcon").innerText = "☀️";
  }
};

/* ---------- MANUAL INPUT ---------- */
function addCourse() {
  const credits = Number(document.getElementById("courseCredits").value);
  const grade = Number(document.getElementById("courseGrade").value);

  if (!credits || document.getElementById("courseGrade").value === "") {
    alert("Enter credits and grade");
    return;
  }

  courses.push({ credits, grade });
  displayCourses();

  document.getElementById("courseCredits").value = "";
  document.getElementById("courseGrade").value = "";
}

function displayCourses() {
  const tbody = document.getElementById("courseList");
  tbody.innerHTML = "";

  courses.forEach((c, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${c.credits}</td>
        <td>${c.grade}</td>
        <td><button onclick="removeCourse(${i})">Remove</button></td>
      </tr>`;
  });
}

function removeCourse(index) {
  courses.splice(index, 1);
  displayCourses();
}

/* ---------- CALCULATION ---------- */
function calculate() {
  let totalCredits = 0;
  let totalPoints = 0;

  courses.forEach(c => {
    totalCredits += c.credits;
    totalPoints += c.credits * c.grade;
  });

  const gpa = (totalPoints / totalCredits).toFixed(2);
  const cgpa = gpa;

  document.getElementById("gpaResult").innerText = `GPA: ${gpa}`;
  document.getElementById("cgpaResult").innerText = `CGPA: ${cgpa}`;

  return { gpa, cgpa };
}

/* ---------- OCR ---------- */
function processImage() {
  const file = document.getElementById("resultImage").files[0];
  if (!file) return alert("Select an image");

  document.getElementById("ocrStatus").innerText = "Scanning image...";

  Tesseract.recognize(file, "eng").then(({ data: { text } }) => {
    const gradeMap = { O:10,"A+":9,A:8,"B+":7,B:6,C:5,U:0,SA:0,WD:0 };
    const grades = text.match(/\b(O|A\+|A|B\+|B|C|U|SA|WD)\b/g);

    if (!grades) return alert("No grades detected");

    courses = [];
    grades.forEach(g => courses.push({ credits: 3, grade: gradeMap[g] }));

    displayCourses();
    calculate();
    document.getElementById("ocrStatus").innerText = "OCR Completed";
  });
}

/* ---------- PDF ---------- */
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("CGPA & GPA Report", 105, 15, null, null, "center");

  let y = 30;
  doc.setFontSize(12);
  doc.text("S.No   Credits   Grade", 20, y);

  courses.forEach((c, i) => {
    y += 10;
    doc.text(`${i+1}      ${c.credits}        ${c.grade}`, 20, y);
  });

  const { gpa, cgpa } = calculate();
  y += 20;
  doc.text(`GPA: ${gpa}`, 20, y);
  y += 10;
  doc.text(`CGPA: ${cgpa}`, 20, y);

  doc.save("CGPA_Report.pdf");
}
