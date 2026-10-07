const generateReportHtml = (patient, name, assessment, patientData = {}) => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const riskLevel = assessment?.riskLevel || 'Unknown';
    const explanation = assessment?.explanation || 'No details available.';
    
    let riskColor = '#3b82f6'; // default blue
    if (riskLevel.toLowerCase() === 'mild') riskColor = '#eab308'; // yellow
    if (riskLevel.toLowerCase() === 'moderate') riskColor = '#f97316'; // orange
    if (riskLevel.toLowerCase() === 'severe') riskColor = '#ef4444'; // red
    if (riskLevel.toLowerCase() === 'critical') riskColor = '#991b1b'; // dark red
    
    // Extract explanation details if they exist (added in the new AI explainability)
    let explanationDetailsHtml = '';
    if (assessment?.explanationDetails && Array.isArray(assessment.explanationDetails)) {
        explanationDetailsHtml = `
            <div class="section-title">Risk Factors Breakdown</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Vital Sign</th>
                        <th>Recorded Value</th>
                        <th>Baseline</th>
                        <th>Impact</th>
                    </tr>
                </thead>
                <tbody>
                    ${assessment.explanationDetails.map(detail => `
                        <tr>
                            <td><strong>${detail.feature}</strong></td>
                            <td>${detail.value}</td>
                            <td>${detail.normal_median}</td>
                            <td style="color: ${detail.contribution.includes('High') ? '#ef4444' : '#f97316'}; font-weight: bold;">
                                ${detail.contribution}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Medical Assessment Report</title>
        <style>
            body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                color: #333333;
                margin: 0;
                padding: 0;
                background-color: #f9fafb;
            }
            .container {
                max-width: 800px;
                margin: 40px auto;
                background-color: #ffffff;
                padding: 50px;
                border-radius: 8px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: 900;
                color: #2563eb;
                letter-spacing: -0.5px;
            }
            .report-meta {
                text-align: right;
                font-size: 14px;
                color: #6b7280;
            }
            .patient-info {
                display: flex;
                flex-wrap: wrap;
                background-color: #f3f4f6;
                padding: 20px;
                border-radius: 6px;
                margin-bottom: 30px;
            }
            .info-block {
                flex: 1 1 50%;
                margin-bottom: 10px;
                font-size: 15px;
            }
            .info-label {
                font-size: 12px;
                text-transform: uppercase;
                color: #6b7280;
                font-weight: 600;
                display: block;
                margin-bottom: 2px;
            }
            .info-value {
                font-weight: 600;
                color: #111827;
            }
            .risk-banner {
                background-color: ${riskColor}15;
                border-left: 4px solid ${riskColor};
                padding: 20px;
                border-radius: 0 6px 6px 0;
                margin-bottom: 30px;
            }
            .risk-title {
                font-size: 14px;
                text-transform: uppercase;
                color: ${riskColor};
                font-weight: 700;
                margin-bottom: 5px;
            }
            .risk-value {
                font-size: 28px;
                font-weight: 800;
                color: #111827;
                margin: 0 0 10px 0;
            }
            .risk-explanation {
                font-size: 15px;
                line-height: 1.5;
                color: #4b5563;
                margin: 0;
            }
            .section-title {
                font-size: 18px;
                font-weight: 700;
                color: #111827;
                margin-bottom: 15px;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 8px;
            }
            .table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            .table th {
                background-color: #f9fafb;
                text-align: left;
                padding: 12px;
                font-size: 13px;
                text-transform: uppercase;
                color: #6b7280;
                border-bottom: 1px solid #e5e7eb;
            }
            .table td {
                padding: 12px;
                border-bottom: 1px solid #e5e7eb;
                font-size: 15px;
                color: #374151;
            }
            .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #9ca3af;
                text-align: center;
                line-height: 1.6;
            }
            .signature-box {
                margin-top: 40px;
                display: flex;
                justify-content: flex-end;
            }
            .signature-line {
                width: 250px;
                border-top: 1px solid #111827;
                padding-top: 8px;
                text-align: center;
                font-size: 14px;
                color: #374151;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">
                    MedRisk AI
                    <div style="font-size: 14px; font-weight: 500; color: #6b7280; letter-spacing: normal; margin-top: 4px;">
                        Clinical Decision Support
                    </div>
                </div>
                <div class="report-meta">
                    <strong>Date of Assessment:</strong> ${today}<br>
                    <strong>Report ID:</strong> REP-${Math.random().toString(36).substr(2, 9).toUpperCase()}
                </div>
            </div>

            <div class="patient-info">
                <div class="info-block">
                    <span class="info-label">Patient Name</span>
                    <span class="info-value">${name || 'Unknown Patient'}</span>
                </div>
                <div class="info-block">
                    <span class="info-label">Patient ID</span>
                    <span class="info-value">${patient?._id ? patient._id.toString().substring(0,8).toUpperCase() : patientData?.patientId || 'N/A'}</span>
                </div>
                <div class="info-block">
                    <span class="info-label">Age</span>
                    <span class="info-value">${patient?.age || patientData?.age || 'N/A'}</span>
                </div>
                <div class="info-block">
                    <span class="info-label">Condition Under Assessment</span>
                    <span class="info-value">${patientData?.condition || 'General Assessment'}</span>
                </div>
            </div>

            <div class="risk-banner">
                <div class="risk-title">AI Assessment Result</div>
                <h2 class="risk-value">Risk Level: ${riskLevel.toUpperCase()}</h2>
                <p class="risk-explanation">${explanation}</p>
            </div>

            ${explanationDetailsHtml}

            <div class="section-title">Recorded Vital Signs</div>
            <table class="table">
                <tbody>
                    <tr>
                        <td width="30%"><strong>Heart Rate</strong></td>
                        <td>${patient?.vitalSigns?.includes('HR:') ? patient.vitalSigns.match(/HR:\s*(\d+)/)[1] + ' bpm' : (patientData?.heartRate ? patientData.heartRate + ' bpm' : 'N/A')}</td>
                    </tr>
                    <tr>
                        <td><strong>Blood Pressure</strong></td>
                        <td>${patient?.vitalSigns?.includes('BP_SYS:') ? patient.vitalSigns.match(/BP_SYS:\s*(\d+)/)[1] + '/' + patient.vitalSigns.match(/BP_DIA:\s*(\d+)/)[1] + ' mmHg' : (patientData?.systolicBP && patientData?.diastolicBP ? `${patientData.systolicBP}/${patientData.diastolicBP} mmHg` : 'N/A')}</td>
                    </tr>
                    <tr>
                        <td><strong>Temperature</strong></td>
                        <td>${patient?.vitalSigns?.includes('TEMP:') ? patient.vitalSigns.match(/TEMP:\s*([\d.]+)/)[1] + ' °C' : (patientData?.temperature ? patientData.temperature + ' °C' : 'N/A')}</td>
                    </tr>
                    <tr>
                        <td><strong>Oxygen Saturation (SpO₂)</strong></td>
                        <td>${patient?.vitalSigns?.includes('SPO2:') ? patient.vitalSigns.match(/SPO2:\s*(\d+)/)[1] + ' %' : (patientData?.spo2 ? patientData.spo2 + ' %' : 'N/A')}</td>
                    </tr>
                </tbody>
            </table>

            <div class="signature-box">
                <div class="signature-line">
                    Attending Physician Signature
                </div>
            </div>

            <div class="footer">
                <strong>Disclaimer:</strong> This report is generated by the MedRisk AI Decision Support System.<br>
                It is intended to augment, not replace, clinical judgment. All AI-driven risk assessments should be verified by a qualified healthcare professional before taking medical action.<br>
                Confidential Medical Document.
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { generateReportHtml };
