const abs = Math.abs;
const PI = Math.PI;

class Vector {
  x;
  y;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  norm() { // v - vector
    var norm_x = this.x / Math.sqrt(this.x * this.x + this.y * this.y);
    var norm_y = this.y / Math.sqrt(this.x * this.x + this.y * this.y);
    this.x = norm_x;
    this.y = norm_y;
  }

  angle () { // vector must be normalized.
    var asin_v = asin(this.y);
    var acos_v = acos(this.x);
    if (this.x >= 0 && this.y >= 0) {
      return asin_v;
    }
    if (this.x < 0 && this.y >= 0) {
      return acos_v;
    }
    if (this.x < 0 && this.y < 0) {
      return 2 * PI - acos_v;
    }
    if (this.x >= 0 && this.y < 0) {
      return 2 * PI + asin_v;
    }
  }
}

function setup() {
    C_WIDTH = windowWidth;
    C_HEIGHT = windowHeight;
    createCanvas(C_WIDTH, C_HEIGHT, WEBGL);
    x_speed = 0;
    y_speed = 0;
    g = 0.01;
    dir_default = PI / 2;
    dir = dir_default;
    ax = 29;
    ay = 0;
    bx = -14;
    by = 20;
    cx = -14;
    cy = -20;
    ship_x = 0.05 * C_WIDTH;
    ship_y = 0.6 * C_HEIGHT;
    soil_altitude = 0.05 * C_WIDTH;
    right_arrow_start_time = 0;
    left_arrow_start_time = 0;
    landed = false;
    functional = true;
    explosion_frame_count = 0;
    surfaces = [[[C_WIDTH / 2 + 101, C_HEIGHT / 3], [C_WIDTH / 2 + 100, C_HEIGHT / 3 - 100],
        [C_WIDTH / 2, C_HEIGHT / 3 - 100], [C_WIDTH / 2 + 1, C_HEIGHT / 3]], [[500, 500], [600, 600], [700, 500], [600, 400], [500, 500]]];
    landing_surfaces = [[[0, soil_altitude], [C_WIDTH, soil_altitude]], [[C_WIDTH / 2, C_HEIGHT / 3], [C_WIDTH / 2 + 100, C_HEIGHT / 3]]];
}

function draw() {
    background(0);
    translate(-C_WIDTH / 2, C_HEIGHT / 2);
    scale(1, -1);
    fill(155);
    rect(0, soil_altitude, C_WIDTH, -soil_altitude);
    //fill(0);
    if (functional) {
        fill(220);
        translate(ship_x, ship_y);
        rotate(dir);
        triangle(ax, ay, bx, by, cx, cy);
        fill(0);
        circle(ax - 10, ay, 5);
        if (keyIsDown(32)) {
            fill(255, 165, 0);
            translate(0, 0, -1);
            circle(ax - 51, ay, 10);
            translate(0, 0, 1);
        }
        rotate(-dir);
        translate(-ship_x, -ship_y);
    }
    else if (explosion_frame_count < 60) {
        fill(255, 165, 0);
        circle(ship_x, ship_y, 50);
        explosion_frame_count++;
    }
    if (!landed) {
        y_speed -= g;
    }
    ship_y += y_speed;
    ship_x += x_speed;
    if (keyIsDown(LEFT_ARROW) && !landed) {
        dir += PI / 128;
        if (dir - dir_default >= 2 * PI) {
            dir -= 2 * PI;
        }
    }
    else if (keyIsDown(RIGHT_ARROW) && !landed) {
        dir -= PI / 128;
        if (dir - dir_default <= -2 * PI) {
            dir += 2 * PI;
        }
    }
    if (keyIsDown(32) && functional) {
        y_speed += Math.sin(dir) / 5;
        x_speed += Math.cos(dir) / 5;
        if (landed) {
            landed = false;
        }
    }
    landing_check();
    collisions_check();
    stroke(255);
    line(500, 500, 600, 600);
    line(600, 600, 700, 500);
    line(700, 500, 600, 400);
    line(600, 400, 500, 500);
    fill(255);
    rect(C_WIDTH / 2, C_HEIGHT / 3, 100, -100);
    //circle(0, 200, 50);
}

function landing_check() {
    for (i = 0; i < landing_surfaces.length; i++) {
        if (abs(ship_y - 11 - landing_surfaces[i][0][1]) < 3 && y_speed < 0 && ship_x + 14 < landing_surfaces[i][1][0]
        && ship_x - 14 > landing_surfaces[i][0][0]) {
            if (y_speed < -2 || abs(x_speed) > 1 || abs(dir - dir_default) > PI / 16) {
                functional = false;
            }
            else {
                dir = dir_default;
            }
            landed = true;
            console.log("landed " + i + " " + ship_y + " " + landing_surfaces[i][0][1]);
            y_speed = 0;
            x_speed = 0;
        }
    }



    if (abs(ship_y - 11 - soil_altitude < 3) && y_speed < 0) {


    }

}

function slope_intercept(a_x, a_y, b_x, b_y) {
    // if (a_x > b_x) {
    //     [a_x, a_y, b_x, b_y] = [b_x, b_y, a_x, a_y];
    // }
    m = (b_y - a_y) / (b_x - a_x);
    if (isNaN(m)) {
        m = 999999;
        //n = a_y;
    }
    //else {
    n = a_y - m * a_x;
    //}
    // console.log("m = " + m);
    // console.log("n = " + n);
    return {m:m, n:n};
}

function segments_intersection(a_x, a_y, b_x, b_y, c_x, c_y, d_x, d_y) {
    s1 = slope_intercept(a_x, a_y, b_x, b_y);
    s2 = slope_intercept(c_x, c_y, d_x, d_y);
    if (s1.m - s2.m === 0) {
        return null;
    }
    else {
        i_x = (s2.n - s1.n) / (s1.m - s2.m);
        i_y = s1.m * i_x + s1.n;
        if ((i_x > a_x && i_x > b_x) || (i_x < a_x && i_x < b_x) || (i_x > c_x && i_x > d_x) || (i_x < c_x && i_x < d_x)) {
            return null;
        }
        else {
            if (isNaN(i_x) || isNaN(i_y)) {
                return null;
            }
            else {
                return {x: i_x, y: i_y};
            }
        }
    }
}

function collisions_check() {
    tri = [[ax, ay], [bx, by], [cx, cy], [ax, ay]];
    for (i = 0; i < surfaces.length; i++) {
        for (j = 0; j < surfaces[i].length - 1; j++) {
            for (k = 0; k < 3; k++) {
                corner1_vec = new Vector(tri[k][0], tri[k][1]);
                v_mod = v_module(corner1_vec.x, corner1_vec.y);
                corner1_vec.norm();
                corner1_vec_angle = corner1_vec.angle();
                corner1_vec_angle += dir;

                corner1_vec.x = cos(corner1_vec_angle) * v_mod;
                corner1_vec.y = sin(corner1_vec_angle) * v_mod;

                corner2_vec = new Vector(tri[k + 1][0], tri[k + 1][1]);
                v_mod = v_module(corner2_vec.x, corner2_vec.y);
                corner2_vec.norm();
                corner2_vec_angle = corner2_vec.angle();
                corner2_vec_angle += dir;

                corner2_vec.x = cos(corner2_vec_angle) * v_mod;
                corner2_vec.y = sin(corner2_vec_angle) * v_mod;

                x1 = corner1_vec.x;
                y1 = corner1_vec.y;
                x2 = corner2_vec.x;
                y2 = corner2_vec.y;
                stroke(255, 0, 0);
                translate(0, 0, 1);
                line(x1, y1, x2, y2);
                translate(0, 0, -1);
                // console.log("tr 1 = " + x1 + " " + y1);
                // console.log("tr 2 = " + x2 + " " + y2);
                if (segments_intersection(x1 + ship_x, y1 + ship_y, x2 + ship_x, y2 + ship_y,
                surfaces[i][j][0], surfaces[i][j][1], surfaces[i][j + 1][0], surfaces[i][j + 1][1]) !== null) {
                    functional = false;
                }
            }
        }

    }
}

function v_module(x, y) {
    return sqrt(x * x + y * y);
}