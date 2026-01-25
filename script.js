const gradePoints = {
  "O": 10, "A+": 9, "A": 8,
  "B+": 7, "B": 6, "C": 5,
  "U": 0, "SA": 0, "WD": 0
};

let subjects = {};
let semesters = [];

/* ➕ Manual */
function addManual() {
  const credit = Number(document.getElementById("credit").value);
  const grade = document.getElementById("grade").value;
  if (!credit) return alert("Enter credits");
  addSubject(`M-${Date.now()}`, credit, grade);
}

/* 📷 OCR */
async function readImage() {
  const img = document.getElementById("imageInput").files[0];
  if (!img) return alert("Upload screenshot");
  const { data } = await Tesseract.recognize(img, "eng");
  document.getElementById("ocrText").value = data.text;
}

/* 🧠 OCR Parse */
function addFromOCR() {
  const lines = document.getElementById("ocrText").value.toUpperCase().split("\n");
  lines.forEach((line, i) => {
    if (line.includes("CREDIT")) {
      const c = line.match(/\d+/);
      const g = (lines[i + 1] || "").match(/O|A\+|A|B\+|B|C|U|SA|WD/);
      if (c && g) addSubject(`O-${i}`, Number(c[0]), g[0]);
    }
  });
}

/* 🗑️ Best grade wins */
function addSubject(key, credit, grade) {
  if (!subjects[key] || gradePoints[grade] > gradePoints[subjects[key].grade]) {
    subjects[key] = { credit, grade };
  }
  renderSubjects();
}

/* 🖥️ Render */
function renderSubjects() {
  const ul = document.getElementById("subjectList");
  ul.innerHTML = "";
  Object.values(subjects).forEach(s => {
    const li = document.createElement("li");
    li.textContent = `Credits: ${s.credit} | Grade: ${s.grade}`;
    ul.appendChild(li);
  });
}

/* 📊 GPA */
function calculateGPA() {
  let tc = 0, tp = 0;
  Object.values(subjects).forEach(s => {
    tc += s.credit;
    tp += s.credit * gradePoints[s.grade];
  });
  if (!tc) return;
  document.getElementById("gpa").innerText =
    "Semester GPA: " + (tp / tc).toFixed(2);
  return { gpa: (tp / tc).toFixed(2), credits: tc };
}

/* 💾 Save Semester */
function saveSemester() {
  const result = calculateGPA();
  if (!result) return;
  semesters.push(result);
  subjects = {};
  renderSubjects();
  renderSemesters();
}

/* 🎓 CGPA */
function renderSemesters() {
  let tc = 0, tp = 0;
  const list = document.getElementById("semesterList");
  list.innerHTML = "";

  semesters.forEach((s, i) => {
    tc += s.credits;
    tp += s.credits * s.gpa;
    const div = document.createElement("div");
    div.className = "semester";
    div.textContent = `Semester ${i + 1} – GPA: ${s.gpa}`;
    list.appendChild(div);
  });

  document.getElementById("cgpa").innerText =
    "CGPA: " + (tp / tc).toFixed(2);
}

/* 📄 PDF */
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("GPA & CGPA Report", 20, 20);

  let y = 40;
  semesters.forEach((s, i) => {
    doc.text(`Semester ${i + 1} GPA: ${s.gpa}`, 20, y);
    y += 10;
  });

  doc.text(document.getElementById("cgpa").innerText, 20, y + 10);
  doc.save("GPA_CGPA_Report.pdf");
}

/* ♻️ Reset */
function clearAll() {
  subjects = {};
  semesters = [];
  renderSubjects();
  document.getElementById("semesterList").innerHTML = "";
  document.getElementById("gpa").innerText = "";
  document.getElementById("cgpa").innerText = "";
  document.getElementById("ocrText").value = "";
}
