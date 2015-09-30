import os
import urllib2
import sys

from flask import Flask, render_template

from openapscontrib.predict.predict import Schedule

from chart import glucose_line_chart
from chart import input_history_area_chart

from openaps_reports import OpenAPS, Settings


app = Flask(__name__)

@app.route('/')
def monitor():
    aps = app.config['OPENAPS']

    recent_glucose = aps.recent_glucose()
    predicted_glucose = aps.predicted_glucose()
    targets = Schedule(aps.read_bg_targets()['targets'])
    normalized_history = aps.normalized_history()
    iob = aps.iob()
    recent_dose = aps.recent_dose()

    glucose_cols, glucose_rows = glucose_line_chart(recent_glucose, predicted_glucose, targets, Settings.DISPLAY_UNIT)
    history_cols, history_rows = input_history_area_chart(normalized_history, iob, Settings.DISPLAY_UNIT)

    return render_template(
        'monitor.html',
        openaps=aps,
        glucose_cols=glucose_cols,
        glucose_rows=glucose_rows,
        history_cols=history_cols,
        history_rows=history_rows,
        CSS_ASSETS=CSS_ASSETS,
        JS_ASSETS=JS_ASSETS,
        display_unit=Settings.DISPLAY_UNIT
    )


CSS_ASSETS = (
    ('static/bootstrap.css', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css'),
    ('static/tooltip.css', 'https://ajax.googleapis.com/ajax/static/modules/gviz/1.0/core/tooltip.css'),
    ('static/styles.css', None)
)


FONT_ASSETS = (
    ('static/Roboto.ttf', 'http://fonts.gstatic.com/s/roboto2/v5/Nd9v8a6GbXQiNddD22JCiwLUuEpTyoUstqEm5AMlJo4.ttf'),
)


JS_ASSETS = (
    ('static/jquery.js', 'https://code.jquery.com/jquery-2.1.4.min.js'),
    ('static/bootstrap.js', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js'),
    ('static/jsapi.js', 'https://www.google.com/jsapi'),
    ('static/chart.js', 'https://www.google.com/uds/api/visualization/1.1/9543863e4f7c29aa0bc62c0051a89a8a/'
                        'dygraph,webfontloader,format+en,default+en,ui+en,line+en,corechart+en.I.js'),
    ('static/monitor.js', None)
)


def preload_assets():
    for filename, url in (JS_ASSETS + CSS_ASSETS + FONT_ASSETS):
        if not os.path.exists(filename):
            print '{} not found, downloading from {}'.format(filename, url)
            try:
                contents = urllib2.urlopen(url).read()
            except ValueError, urllib2.HTTPError:
                pass
            else:
                with open(filename, mode='w') as fp:
                    fp.write(contents)


if __name__ == '__main__':
    path = sys.argv[1]
    preload_assets()

    if os.path.exists(path):
        path = os.path.abspath(path)
        app.config['OPENAPS'] = OpenAPS(path)
        app.debug = True
        app.run(host='0.0.0.0')
    else:
        exit(1)
