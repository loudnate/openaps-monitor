import os
import sys

from flask import Flask, render_template, request

from openapscontrib.predict.predict import Schedule

from chart import glucose_line_chart
from chart import input_history_area_chart

from openaps_reports import OpenAPS


app = Flask(__name__)


@app.route('/')
def monitor():
    aps = app.config['OPENAPS']

    recent_glucose = aps.recent_glucose()
    predicted_glucose = aps.predicted_glucose()
    targets = Schedule(aps.read_bg_targets()['targets'])
    normalized_history = aps.normalized_history()
    recent_dose = aps.recent_dose()

    glucose_cols, glucose_rows = glucose_line_chart(recent_glucose, predicted_glucose, targets)
    history_cols, history_rows = input_history_area_chart(normalized_history)

    return render_template(
        'monitor.html',
        openaps=aps,
        glucose_cols=glucose_cols,
        glucose_rows=glucose_rows,
        history_cols=history_cols,
        history_rows=history_rows
    )


if __name__ == '__main__':
    path = sys.argv[1]

    if os.path.exists(path):
        path = os.path.abspath(path)
        app.config['OPENAPS'] = OpenAPS(path)
        app.debug = True
        app.run(host='0.0.0.0')
    else:
        exit(1)
