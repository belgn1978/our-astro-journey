from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, Table, TableStyle
from reportlab.lib.units import inch

output_path = Path(__file__).resolve().parent.parent / 'downloads' / 'solar-eclipse-safety-guide.pdf'

styles = getSampleStyleSheet()
styles['Title'].fontName = 'Helvetica-Bold'
styles['Title'].fontSize = 20
styles['Heading1'].fontName = 'Helvetica-Bold'
styles['Heading1'].fontSize = 14
styles['BodyText'].fontName = 'Helvetica'
styles['BodyText'].fontSize = 10

story = []

story.append(Paragraph('Solar Eclipse Safety And Imaging Guide', styles['Title']))
story.append(Paragraph('Professional field booklet for safe viewing, imaging, and family experiments', styles['BodyText']))
story.append(Spacer(1, 0.2 * inch))

sections = [
    ('Fast Checklist', [
        'Certified eclipse glasses or handheld viewers for direct viewing.',
        'Front-mounted solar filters for cameras, binoculars, or telescopes.',
        'A practiced plan for removing and replacing camera filters only during totality, if you will be inside the path.',
        'A simple imaging plan that leaves time to actually watch the eclipse.',
        'One or two safe household experiments for children or first-time observers.'
    ]),
    ('Five Simple Eclipse Experiments', [
        'Colander projection: hold a kitchen colander or slotted spoon so sunlight falls onto paving or paper and watch each bright spot turn into a tiny crescent.',
        'Cereal-box pinhole projector: use a cereal box, foil, white paper, and tape to make a simple projection viewer and compare the crescent every 10 to 15 minutes.',
        'Leaf-shadow test: stand under a tree and watch the little gaps between leaves project many tiny eclipse crescents onto the ground.',
        'Temperature and light log: use a notebook and household thermometer or phone weather readout to record changes in brightness, temperature, wind, and bird activity.',
        'Shadow-shape challenge: put jar lids, cups, or coins on white card and trace how their shadows sharpen and change as the eclipse progresses.'
    ])
]

for title, bullets in sections:
    story.append(Paragraph(title, styles['Heading1']))
    for bullet in bullets:
        story.append(Paragraph(f'• {bullet}', styles['BodyText']))
    story.append(Spacer(1, 0.12 * inch))

image_files = [
    ('Colander Projection', 'images/colander-projection.png'),
    ('Cereal-Box Pinhole Viewer', 'images/box-pinhole.png'),
    ('Leaf-Shadow Test', 'images/leaf-shadow-test.png'),
    ('Temperature And Light Log', 'images/temperature-light-log.png'),
    ('Shadow-Shape Challenge', 'images/shadow-shape-challenge.png'),
]

for title, image_path in image_files:
    story.append(Paragraph(title, styles['Heading1']))
    img = Image(str(Path(__file__).resolve().parent.parent / image_path), width=2.8 * inch, height=1.8 * inch)
    story.append(img)
    story.append(Spacer(1, 0.1 * inch))

output_path.parent.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(str(output_path), pagesize=letter, rightMargin=0.75 * inch, leftMargin=0.75 * inch, topMargin=0.75 * inch, bottomMargin=0.75 * inch)
doc.build(story)
print(f'Wrote {output_path}')
