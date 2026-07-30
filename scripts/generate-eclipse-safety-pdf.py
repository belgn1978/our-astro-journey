from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, Table, TableStyle, Frame, PageTemplate, BaseDocTemplate
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER

output_path = Path(__file__).resolve().parent.parent / 'downloads' / 'solar-eclipse-safety-guide.pdf'

styles = getSampleStyleSheet()
styles['Title'].fontName = 'Helvetica-Bold'
styles['Title'].fontSize = 22
styles['Title'].textColor = colors.HexColor('#0f4c81')
styles['Heading1'].fontName = 'Helvetica-Bold'
styles['Heading1'].fontSize = 14
styles['Heading1'].textColor = colors.HexColor('#1d4d7a')
styles['BodyText'].fontName = 'Helvetica'
styles['BodyText'].fontSize = 10
styles['BodyText'].leading = 13
styles['BodyText'].textColor = colors.HexColor('#2f3b4a')
styles['Bullet'].fontName = 'Helvetica'
styles['Bullet'].fontSize = 10
styles['Bullet'].leading = 12
styles['Bullet'].textColor = colors.HexColor('#2f3b4a')

story = []

# Cover page with a colored panel
cover_panel = Table(
    [[Paragraph('Solar Eclipse Safety And Imaging Guide', styles['Title'])]],
    colWidths=[6.5 * inch],
    style=[('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#eaf4fb')), ('BOX', (0, 0), (-1, -1), 1.2, colors.HexColor('#7fa8c9')), ('PADDING', (0, 0), (-1, -1), 18)]
)
story.append(cover_panel)
story.append(Spacer(1, 0.2 * inch))
story.append(Paragraph('Professional field booklet for safe viewing, imaging, and family experiments', styles['BodyText']))
story.append(Spacer(1, 0.1 * inch))
story.append(Paragraph('A practical guide for safe eclipse viewing, simple household experiments, and memorable family observations.', styles['BodyText']))
story.append(Spacer(1, 0.2 * inch))
story.append(Paragraph('Cover', styles['Heading1']))
story.append(PageBreak())

checklist = [
    'Certified eclipse glasses or handheld viewers for direct viewing.',
    'Front-mounted solar filters for cameras, binoculars, or telescopes.',
    'A practiced plan for removing and replacing camera filters only during totality, if you will be inside the path.',
    'A simple imaging plan that leaves time to actually watch the eclipse.',
    'One or two safe household experiments for children or first-time observers.'
]

checklist_panel = Table(
    [[Paragraph('Fast Checklist', styles['Heading1'])]],
    colWidths=[6.5 * inch],
    style=[('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f7f3d0')), ('BOX', (0, 0), (-1, -1), 1.0, colors.HexColor('#d4b24c')), ('PADDING', (0, 0), (-1, -1), 10)]
)
story.append(checklist_panel)
story.append(Spacer(1, 0.1 * inch))
for bullet in checklist:
    story.append(Paragraph(f'• {bullet}', styles['Bullet']))
story.append(Spacer(1, 0.12 * inch))
story.append(Paragraph('Use this page as a quick reference before you head outside.', styles['BodyText']))
story.append(PageBreak())

experiments = [
    {
        'title': 'Colander Projection',
        'description': 'Hold a kitchen colander or slotted spoon so sunlight falls onto paper or paving, and watch each bright spot turn into a tiny crescent.',
        'image': 'images/colander-projection.png',
        'steps': [
            'Place the colander or spoon between the Sun and a flat sheet of paper.',
            'Watch the pattern change as the eclipse deepens.',
            'Take photos every 10 to 15 minutes to compare the shapes.'
        ]
    },
    {
        'title': 'Cereal-Box Pinhole Viewer',
        'description': 'Use a cereal box, foil, tape, and white paper to create a simple projection viewer for the Sun.',
        'image': 'images/box-pinhole.png',
        'steps': [
            'Tape white paper inside one end of the box.',
            'Make a tiny pinhole in the foil at the opposite end.',
            'Stand with your back to the Sun and view the projection inside the box.'
        ]
    },
    {
        'title': 'Leaf-Shadow Test',
        'description': 'Stand under a tree and look at the small gaps between leaves on the ground.',
        'image': 'images/leaf-shadow-test.png',
        'steps': [
            'Observe the ground under the leaves during the partial phases.',
            'Notice how each gap projects a tiny crescent.',
            'Compare the pattern before and near maximum eclipse.'
        ]
    },
    {
        'title': 'Temperature And Light Log',
        'description': 'Record how the environment changes as the eclipse proceeds.',
        'image': 'images/temperature-light-log.png',
        'steps': [
            'Record temperature, brightness, and wind every 5 to 10 minutes.',
            'Note any changes in birds, insects, or ambient sound.',
            'Compare the readings after the eclipse to see the pattern.'
        ]
    },
    {
        'title': 'Shadow-Shape Challenge',
        'description': 'Place round household objects on white card and trace how their shadows change.',
        'image': 'images/shadow-shape-challenge.png',
        'steps': [
            'Lay coins, jar lids, or cups onto white card.',
            'Trace the outlines of the shadows as the eclipse progresses.',
            'Compare the shapes and sharpness at different times.'
        ]
    }
]

for index, experiment in enumerate(experiments):
    if index > 0:
        story.append(PageBreak())
    story.append(Paragraph(experiment['title'], styles['Heading1']))
    story.append(Paragraph(experiment['description'], styles['BodyText']))
    story.append(Spacer(1, 0.1 * inch))
    image_path = Path(__file__).resolve().parent.parent / experiment['image']
    image_panel = Table(
        [[Image(str(image_path), width=4.6 * inch, height=3.0 * inch)]],
        colWidths=[4.6 * inch],
        style=[('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fbff')), ('BOX', (0, 0), (-1, -1), 1.0, colors.HexColor('#8db3d9')), ('PADDING', (0, 0), (-1, -1), 8)]
    )
    story.append(image_panel)
    story.append(Spacer(1, 0.12 * inch))
    story.append(Paragraph('How to do it', styles['Heading1']))
    for step in experiment['steps']:
        story.append(Paragraph(f'• {step}', styles['Bullet']))
    story.append(PageBreak())
    findings_panel = Table(
        [[Paragraph(f'{experiment["title"]} Findings', styles['Heading1'])]],
        colWidths=[6.5 * inch],
        style=[('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#eef7ee')), ('BOX', (0, 0), (-1, -1), 1.0, colors.HexColor('#7aa66d')), ('PADDING', (0, 0), (-1, -1), 10)]
    )
    story.append(findings_panel)
    story.append(Spacer(1, 0.08 * inch))
    fields = [
        ('Date:', '____________________________________'),
        ('Time observed:', '____________________________________'),
        ('Location:', '____________________________________'),
        ('What I noticed:', '____________________________________'),
        ('Sketch / notes:', '____________________________________'),
    ]
    for label, placeholder in fields:
        story.append(Paragraph(label, styles['BodyText']))
        story.append(Spacer(1, 0.03 * inch))
        field_box = Table(
            [[Paragraph(placeholder, styles['BodyText'])]],
            colWidths=[6.2 * inch],
            style=[('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#ffffff')), ('BOX', (0, 0), (-1, -1), 0.7, colors.HexColor('#b4c7d8')), ('PADDING', (0, 0), (-1, -1), 6)]
        )
        story.append(field_box)
        story.append(Spacer(1, 0.06 * inch))
    story.append(Paragraph('• Brightness change', styles['Bullet']))
    story.append(Paragraph('• Temperature change', styles['Bullet']))
    story.append(Paragraph('• Shape change', styles['Bullet']))
    story.append(Paragraph('• Questions / follow-up', styles['Bullet']))

output_path.parent.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(str(output_path), pagesize=letter, rightMargin=0.75 * inch, leftMargin=0.75 * inch, topMargin=0.75 * inch, bottomMargin=0.75 * inch)
doc.build(story)
print(f'Wrote {output_path}')
