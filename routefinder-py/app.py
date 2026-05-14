from flask import Flask, render_template, request, jsonify
from dijkstra import run_dijkstra

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/solve', methods=['POST'])
def solve():
    data = request.json
    grid = data['grid']
    start = tuple(data['start'])
    exit_node = tuple(data['exit'])
    
    visited_order, path = run_dijkstra(grid, start, exit_node)
    
    return jsonify({
        'visited_order': visited_order,
        'path': path
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
