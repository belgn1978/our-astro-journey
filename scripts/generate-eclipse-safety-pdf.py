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
story.append(Paragraph('A practical guide for safe eclipse viewing, simple household experiments, and memorable family observations.', styles['BodyText']))
story.append(Spacer(1, 0.25 * inch))
story.append(Paragraph('Cover', styles['Heading1']))
story.append(PageBreak())

checklist = [
    'Certified eclipse glasses or handheld viewers for direct viewing.',
    'Front-mounted solar filters for cameras, binoculars, or telescopes.',
    'A practiced plan for removing and replacing camera filters only during totality, if you will be inside the path.',
    'A simple imaging plan that leaves time to actually watch the eclipse.',
    'One or two safe household experiments for children or first-time observers.'
]

story.append(Paragraph('Fast Checklist', styles['Heading1']))
for bullet in checklist:
    story.append(Paragraph(f'• {bullet}', styles['BodyText']))
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
    story.append(Image(str(image_path), width=4.6 * inch, height=3.0 * inch))
    story.append(Spacer(1, 0.12 * inch))
    story.append(Paragraph('How to do it', styles['Heading1']))
    for step in experiment['steps']:
        story.append(Paragraph(f'• {step}', styles['BodyText']))

output_path.parent.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(str(output_path), pagesize=letter, rightMargin=0.75 * inch, leftMargin=0.75 * inch, topMargin=0.75 * inch, bottomMargin=0.75 * inch)
doc.build(story)
print(f'Wrote {output_path}')
