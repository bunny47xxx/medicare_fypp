import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate a consultation notes PDF.
 * @param {object} note - The note/record object with all consultation fields.
 * @param {object} meta - { doctorName, appointmentDate, patientName }
 */
export function generateConsultationPdf(note, meta = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // ── Header bar ──────────────────────────────────────────────────────────────
  doc.setFillColor(8, 145, 178); // cyan-600
  doc.rect(0, 0, pageW, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Consultation Notes', margin, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Medicare Health Platform', pageW - margin, 14, { align: 'right' });
  y = 30;

  // ── Patient / Doctor info ────────────────────────────────────────────────────
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const infoRows = [
    ['Doctor', meta.doctorName || note.doctorName || 'N/A'],
    ['Patient', meta.patientName || 'N/A'],
    ['Date', formatDate(meta.appointmentDate || note.appointmentDate)],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [],
    body: infoRows,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 1.5 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30 } },
  });
  y = doc.lastAutoTable.finalY + 6;

  // ── Helper: section heading ──────────────────────────────────────────────────
  const sectionHeading = (title, r, g, b) => {
    if (y > 265) { doc.addPage(); y = margin; }
    doc.setFillColor(r, g, b);
    doc.roundedRect(margin, y, contentW, 7, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin + 3, y + 5);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'normal');
    y += 10;
  };

  // ── Helper: key-value block ──────────────────────────────────────────────────
  const kvBlock = (rows) => {
    const filtered = rows.filter(([, v]) => v);
    if (!filtered.length) return;
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [],
      body: filtered,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45, textColor: [80, 80, 80] } },
    });
    y = doc.lastAutoTable.finalY + 4;
  };

  // ── Helper: paragraph ────────────────────────────────────────────────────────
  const paragraph = (text) => {
    if (!text) return;
    const lines = doc.splitTextToSize(String(text), contentW);
    if (y + lines.length * 5 > 275) { doc.addPage(); y = margin; }
    doc.setFontSize(9);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 4;
  };

  // ── 1. Chief Complaint ───────────────────────────────────────────────────────
  if (note.chiefComplaint) {
    sectionHeading('Chief Complaint', 220, 38, 38);
    paragraph(note.chiefComplaint);
  }

  // ── 2. Medical History ───────────────────────────────────────────────────────
  if (note.pastIllnesses || note.ongoingConditions || note.allergies || note.currentMedications) {
    sectionHeading('Medical History', 234, 88, 12);
    kvBlock([
      ['Past Illnesses', note.pastIllnesses],
      ['Ongoing Conditions', note.ongoingConditions],
      ['Allergies', note.allergies],
      ['Current Medications', note.currentMedications],
    ]);
  }

  // ── 3. Doctor's Observations ─────────────────────────────────────────────────
  if (note.physicalFindings || (note.vitals && Object.values(note.vitals).some(v => v))) {
    sectionHeading("Doctor's Observations", 37, 99, 235);
    if (note.physicalFindings) {
      kvBlock([['Physical Findings', note.physicalFindings]]);
    }
    if (note.vitals && Object.values(note.vitals).some(v => v)) {
      const vitalRows = [
        ['Blood Pressure', note.vitals.bp],
        ['Heart Rate', note.vitals.hr],
        ['Temperature', note.vitals.temp],
        ['Weight', note.vitals.weight],
        ['SpO2', note.vitals.spo2],
      ].filter(([, v]) => v);
      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['Vital', 'Value']],
        body: vitalRows,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235], fontSize: 8 },
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { cellWidth: 50 } },
      });
      y = doc.lastAutoTable.finalY + 4;
    }
  }

  // ── 4. Diagnosis ─────────────────────────────────────────────────────────────
  if (note.diagnosis || note.symptoms) {
    sectionHeading('Diagnosis', 109, 40, 217);
    kvBlock([
      ['Condition(s)', note.diagnosis],
      ['Symptoms', note.symptoms],
    ]);
  }

  // ── 5. Treatment Plan ────────────────────────────────────────────────────────
  if (note.treatment) {
    sectionHeading('Treatment Plan', 22, 163, 74);
    paragraph(note.treatment);
  }

  // ── 6. Prescriptions ─────────────────────────────────────────────────────────
  const prescriptions = note.prescriptions;
  if (prescriptions?.length > 0) {
    sectionHeading('Prescriptions', 8, 145, 178);
    const presRows = prescriptions.map((p, i) => [
      i + 1,
      typeof p === 'string' ? p : (p.name || ''),
      typeof p === 'object' ? (p.dosage || '') : '',
      typeof p === 'object' ? (p.duration || '') : '',
      typeof p === 'object' ? (p.instructions || '') : '',
    ]);
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['#', 'Medicine', 'Dosage', 'Duration', 'Instructions']],
      body: presRows,
      theme: 'striped',
      headStyles: { fillColor: [8, 145, 178], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 8 } },
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // ── 7. Advice & Follow-up ────────────────────────────────────────────────────
  if (note.advice || note.testsRequired || note.followUpDate) {
    sectionHeading('Advice & Follow-up', 202, 138, 4);
    kvBlock([
      ['Advice', note.advice],
      ['Tests Required', note.testsRequired],
      ['Follow-up Date', note.followUpDate ? formatDate(note.followUpDate) : null],
    ]);
  }

  // ── 8. Additional Notes ──────────────────────────────────────────────────────
  const additionalNotes = note.additionalNotes || note.notes;
  if (additionalNotes) {
    sectionHeading('Additional Notes', 75, 85, 99);
    paragraph(additionalNotes);
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated by Medicare • ${new Date().toLocaleDateString()} • Page ${i} of ${totalPages}`,
      pageW / 2, 290, { align: 'center' }
    );
  }

  const fileName = `consultation_${(meta.patientName || 'patient').replace(/\s+/g, '_')}_${(meta.appointmentDate || '').slice(0, 10) || 'notes'}.pdf`;
  doc.save(fileName);
}
