const H = 100;
const W = 100;
const L = 50;
const DISTANCE = L*6;
const PX_SYMBOL = '*';
const ROT_AMOUNT = 0.1;

var canvas;
var cube;

function init(){
    canvas = new Canvas(document.getElementById("out"));
    cube = new Shape([
        [-L/2, -L/2, -L/2],
        [-L/2,  L/2, -L/2],
        [ L/2,  L/2, -L/2],
        [ L/2, -L/2, -L/2],
        [-L/2, -L/2,  L/2],
        [-L/2,  L/2,  L/2],
        [ L/2,  L/2,  L/2],
        [ L/2, -L/2,  L/2]
    ],[
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],

        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],

        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4]
    ], canvas);

    cube.draw();
}

function Shape(vertices, edges, canvas){
    this.vertices = vertices;
    this.edges = edges;
    this.canvas = canvas;
    this.persp = true;

    this.draw = function(){
        this.canvas.clearBuf();
        let doll;
        if (this.persp) {
            doll = this.apply_persp();
        } else {
            doll = this.vertices;
        }
        for (i = 0; i < this.edges.length; i++) {
            let v1 = this.edges[i][0];
            let v2 = this.edges[i][1];
            this.canvas.line(doll[v1], doll[v2]);
        }
        this.canvas.render();
    }

    this.apply_persp = function() {
        let perspMatrix = [
            [1, 0,        0        , 0],
            [0, 1,        0        , 0],
            [0, 0,        1        , 0],
            [0, 0, -1/DISTANCE, 1]
        ];

        let res = [];
        let V = this.vertices;

        for (i = 0; i < V.length; i++) {
            V[i].push(1);
            res[i] = this.applyOp(perspMatrix, V[i]);
            for (n = 0; n < 3; n++) {
                res[i][n] /= res[i][3];
            }
            V[i].pop();
        }

        return res;
    }

    this.rot = function(axis, ang){
        if (axis == 'x') {
            rotMatrix = [
                [1,       0      ,       0       ],
                [0, Math.cos(ang), -Math.sin(ang)],
                [0, Math.sin(ang),  Math.cos(ang)],
            ];
        } else if (axis == 'y') {
            rotMatrix = [
                [ Math.cos(ang), 0, Math.sin(ang)],
                [       0      , 1,       0      ],
                [-Math.sin(ang), 0, Math.cos(ang)],
            ];
        } else if (axis == 'z') {
            rotMatrix = [
                [Math.cos(ang), -Math.sin(ang), 0],
                [Math.sin(ang),  Math.cos(ang), 0],
                [      0      ,        0      , 1]
            ];
        }

        for(i = 0; i < this.vertices.length; i++){
            this.vertices[i] = this.applyOp(rotMatrix, this.vertices[i]);
        }

        this.draw();
    }

    this.switchPersp = function() {
        this.persp = !this.persp;
        this.draw();
    }

    this.applyOp = function(op, vect) {
        let res = [];
        for (u = 0; u < op.length; u++) {
            res[u] = 0;
            for (v = 0; v < op.length; v++) {
                res[u] += op[u][v] * vect[v];
            }
        }
        return res;
    }
}

function Canvas(output_element) {
    this.out = output_element;
    this.buf = [];
    for (i = 0; i < H; i++) {
        this.buf[i] = [];
    }

    this.render = function() {
        let str_buf = '';
        for (i = 0; i < H; i++) {
            str_buf += this.buf[i].join('') + '\n';
        }
        this.out.innerHTML = str_buf;
    }

    this.clearBuf = function() {
        for (i = 0; i < H; i++) {
            for (j = 0; j < W; j++) {
                this.buf[i][j] = ' ';
            }
        }
    }

    this.setPx = function(x, y) {
        this.buf[y][x] = PX_SYMBOL;
    }

    this.line = function(a, b) {
        let x1 = Math.round(a[0] + W/2);
        let y1 = Math.round(a[1] + H/2);
        let x2 = Math.round(b[0] + W/2);
        let y2 = Math.round(b[1] + H/2);

        let x, y, t;
        let steep = false;

        if (Math.abs(y2 - y1) > Math.abs(x2 - x1)) {
            x1 = y1 + (y1 = x1, 0);
            x2 = y2 + (y2 = x2, 0);
            steep = true;
        }

        if (x1 > x2) {
            x1 = x2 + (x2 = x1, 0);
            y1 = y2 + (y2 = y1, 0);
        }

        if (x1 != x2) {
            for (x = x1; x <= x2; x++) {
                t = (x - x1) / (x2 - x1);
                y = y1 + Math.round(t*(y2 - y1));
                if (steep) {
                    this.setPx(y, x);
                } else {
                    this.setPx(x, y);
                }
            }
        } else {
            this.setPx(x1, y1);
        }
    }
}

function handleInput(event) {
    let key = event.keyCode;

    switch (key) {
        case 38:
            cube.rot('x', ROT_AMOUNT);
            break;
        case 40:
            cube.rot('x', -ROT_AMOUNT);
            break;
        case 37:
            cube.rot('y', -ROT_AMOUNT);
            break;
        case 39:
            cube.rot('y', ROT_AMOUNT);
            break;
        case 69:
            cube.rot('z', ROT_AMOUNT);
            break;
        case 82:
            cube.rot('z', -ROT_AMOUNT);
            break;
        case 80:
            cube.switchPersp();
            break;
    }
}
