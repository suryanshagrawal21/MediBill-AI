from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
import io

def generate_pdf_report(analysis_results: list, total_bill: float, total_overcharge: float):
    """
    Generates a PDF report using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    header_style = styles['Heading1']
    header_style.alignment = 1 # Center
    
    elements.append(Paragraph("MediBill AI Analysis Report", header_style))
    elements.append(Spacer(1, 20))
    
    # Summary
    elements.append(Paragraph(f"Total Bill: ₹{total_bill:.2f}", styles['Normal']))
    elements.append(Paragraph(f"Total Overcharge: ₹{total_overcharge:.2f}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    # Table data
    data = [["Item", "Charged Price", "Benchmark", "Difference", "Status"]]
    for item in analysis_results:
        status = "🚨 Overcharged" if item.is_overcharged else "✅ Fair"
        data.append([
            item.item_name,
            f"₹{item.charged_price:.2f}",
            f"₹{item.benchmark_price:.2f}",
            f"₹{item.difference:.2f}",
            status
        ])
        
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.lightgrey])
    ]))
    
    elements.append(table)
    doc.build(elements)
    
    buffer.seek(0)
    return buffer
