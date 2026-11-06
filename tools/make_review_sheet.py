"""Builds the coach review spreadsheet: one row per card, straight from the app's content.

Run after changing any card:  .venv/bin/python tools/make_review_sheet.py
Writes coach-review/Heads-Up-Card-Review.xlsx.  (one-time: .venv/bin/pip install openpyxl)
"""
import json
import subprocess
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'coach-review' / 'Heads-Up-Card-Review.xlsx'

rows = json.loads(subprocess.run(['node', str(ROOT / 'tools' / 'review_cards.mjs')], capture_output=True, text=True, check=True).stdout)

COLS = [
    ('Your call', 16, None),
    ('Your notes (what should it say?)', 40, None),
    ('Unit', 14, 'unit'),
    ('Topic', 24, 'topic'),
    ('Coach question', 34, 'coachCheck'),
    ('Game situation', 26, 'sit'),
    ('Question', 46, 'question'),
    ('Right answer', 34, 'right'),
    ('Wrong answers', 34, 'wrong'),
    ('The lesson (Skip explains this after)', 50, 'lesson'),
    ('Type', 14, 'type'),
    ('Source', 14, 'tags'),
    ('Card ID', 22, 'id'),
]

wb = Workbook()
ws = wb.active
ws.title = 'Cards'
ws['A1'] = ('Heads Up Baseball IQ: every card in the app. Pick a call in column A for any card you check '
            '(blank = not checked yet) and write what it should say in column B. Rows with a Coach question '
            'need your answer most. Filter any column with the arrows in row 2.')
ws['A1'].font = Font(bold=True, size=12)
ws['A1'].alignment = Alignment(wrap_text=True, vertical='top')
ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(COLS))
ws.row_dimensions[1].height = 48

head_fill = PatternFill('solid', fgColor='1B2A4A')
for i, (name, width, _) in enumerate(COLS, start=1):
    cell = ws.cell(row=2, column=i, value=name)
    cell.font = Font(bold=True, color='FFFFFF')
    cell.fill = head_fill
    cell.alignment = Alignment(wrap_text=True, vertical='center')
    ws.column_dimensions[cell.column_letter].width = width

ask_fill = PatternFill('solid', fgColor='FFF4D6')
call_fill = PatternFill('solid', fgColor='EAF2FF')
right_font = Font(bold=True, color='1E7B34')
for r, row in enumerate(rows, start=3):
    for i, (_, _, key) in enumerate(COLS, start=1):
        cell = ws.cell(row=r, column=i, value=row[key] if key else None)
        cell.alignment = Alignment(wrap_text=True, vertical='top')
        if i <= 2:
            cell.fill = call_fill
    ws.cell(row=r, column=8).font = right_font
    if row['coachCheck']:
        ws.cell(row=r, column=5).fill = ask_fill

dv = DataValidation(type='list', formula1='"Looks right,Reword it,Wrong"', allow_blank=True)
ws.add_data_validation(dv)
dv.add(f'A3:A{len(rows) + 2}')
ws.freeze_panes = 'C3'
ws.auto_filter.ref = f'A2:{ws.cell(row=2, column=len(COLS)).column_letter}{len(rows) + 2}'

OUT.parent.mkdir(exist_ok=True)
wb.save(OUT)
print(f'{len(rows)} cards → {OUT.relative_to(ROOT)} ({sum(1 for r in rows if r["coachCheck"])} with a coach question)')
