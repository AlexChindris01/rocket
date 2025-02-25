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
    surfaces = [[[C_WIDTH / 2 + 100, C_HEIGHT / 3], [C_WIDTH / 2 + 100, C_HEIGHT / 3 - 100],
        [C_WIDTH / 2, C_HEIGHT / 3 - 100], [C_WIDTH / 2, C_HEIGHT / 3]], [[500, 500], [600, 600], [700, 500], [600, 400], [500, 500]],
        [[C_WIDTH + 500, soil_altitude], [C_WIDTH + 500, -soil_altitude], [-500, -soil_altitude], [-500, soil_altitude]]];
    landing_surfaces = [[[-500, soil_altitude], [C_WIDTH + 500, soil_altitude]], [[C_WIDTH / 2, C_HEIGHT / 3], [C_WIDTH / 2 + 100, C_HEIGHT / 3]]];
    payload_x = ship_x - 50;
    payload_y = ship_y + 50;
    payload_y_speed = 0;
    p_angle = 0;
    g_p_speed = 0;
    g_p_speed_i = 0;
    camera_x_translation = 0;
    camera_y_translation = 0;
    stars_drawn = false;
    pg = createGraphics(2 * C_WIDTH, 2 * C_HEIGHT);
    pg.background(0);
    for (i = 0; i < 400; i++) {
        pg.stroke(255);
        pg.fill(255);
        pg.circle(Math.random() * 2 * C_WIDTH, Math.random() * 2 * C_HEIGHT, 1);
    }
}

function draw() {
    background(0);
    translate(-C_WIDTH / 2, C_HEIGHT / 2);
    scale(1, -1);
    camera_translation();
    translate(0, 0, -1);
    //image(pg, - C_WIDTH, - C_HEIGHT);
    translate(0, 0, 1);
    if (!stars_drawn) {

        stars_drawn = true;
    }
    if (!functional && explosion_frame_count < 30 && explosion_frame_count % 3 === 0) {
        // translate(Math.round((2 * Math.random() - 1) * (20 -  2 * explosion_frame_count / 3)), Math.round((2 * Math.random() - 1) * (20 - 2 * explosion_frame_count / 3)));
    }
    fill(155);
    rect(-500, soil_altitude, C_WIDTH + 1000, -2 * soil_altitude); // currently includes padding for the shaking effect.
    fill(0);

    if (!landed) {
        y_speed -= g;
    }
    ship_y += y_speed;
    ship_x += x_speed;
    console.log("y_speed: " + y_speed);
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
    landing_check();
    collisions_check();
    draw_payload();

    stroke(255);
    line(500, 500, 600, 600);
    line(600, 600, 700, 500);
    line(700, 500, 600, 400);
    line(600, 400, 500, 500);
    stroke(0);
    fill(255);
    rect(C_WIDTH / 2, C_HEIGHT / 3, 100, -100);
    push();
    stroke(255, 0, 0);
    translate(0, 0, 1);
    circle(ship_x, ship_y, 10);
    pop();
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
    if (b_x - a_x === 0) {
        m = "vertical";
        n = m;
    }
    else {
        n = a_y - m * a_x;
    }
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
        if (s1.m === "vertical") {
            i_x = a_x;
            i_y = s2.n + s2.m * a_x;
        }
        else if (s2.m === "vertical") {
            i_x = c_x;
            i_y = s1.n + s1.m * c_x;
        }
        else {
            i_x = (s2.n - s1.n) / (s1.m - s2.m);
            i_y = s1.m * i_x + s1.n;
        }
        if ((i_x > a_x && i_x > b_x) || (i_x < a_x && i_x < b_x) || (i_x > c_x && i_x > d_x) || (i_x < c_x && i_x < d_x) ||
            (i_y > a_y && i_y > b_y) || (i_y < a_y && i_y < b_y) || (i_y > c_y && i_y > d_y) || (i_y < c_y && i_y < d_y)) {
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

function draw_payload() {
    payload_vec = new Vector(payload_x - ship_x, payload_y - ship_y);
    payload_vec.norm();
    payload_vec.x *= 50;
    payload_vec.y *= 50;
    push();
    stroke(255);
    fill(255);
    payload_x = ship_x + payload_vec.x;
    //payload_y_speed = ship_y + payload_vec.y - payload_y - g;
    payload_y = ship_y + payload_vec.y;

    line(ship_x, ship_y, payload_x, payload_y);
    circle(payload_x, payload_y, 20);
    pop();
    payload_vec.norm();
    payload_vec_angle = payload_vec.angle();
    if (cos(payload_vec_angle) > 0) {
        p_angle = payload_vec_angle - PI / 2;
        g_p_speed += abs(sin(p_angle)) * 1.5 * g;
        g_p_speed_i -= abs(sin(p_angle)) * 1.5 * g;
        payload_x += cos(p_angle) * g_p_speed// - cos(p_angle) * g_p_speed_i;
        payload_y += sin(p_angle) * g_p_speed// - sin(p_angle) * g_p_speed_i;
    }
    else {
        p_angle = payload_vec_angle + PI / 2;
        g_p_speed_i += abs(sin(p_angle)) * 1.5 * g;
        g_p_speed -= abs(sin(p_angle)) * 1.5 * g;
        payload_x += cos(p_angle) * g_p_speed_i// - cos(p_angle) * g_p_speed;
        payload_y += sin(p_angle) * g_p_speed_i// - sin(p_angle) * g_p_speed;
    }
    g_p_speed *= 0.995;
    g_p_speed_i *= 0.995;
    console.log("x: " + payload_x);
    console.log("y: " + payload_y);
    console.log("g_p_speed: " + g_p_speed);
    //console.log(payload_vec_angle);
    //payload_y += payload_y_speed;
}

function camera_translation() {
    // if (ship_x + camera_x_translation > 0.8 * C_WIDTH) {
    //     camera_x_translation = 0.8 * C_WIDTH - ship_x;
    // }
    // if (ship_x + camera_x_translation < 0.2 * C_WIDTH) {
    //     camera_x_translation = 0.2 * C_WIDTH - ship_x;
    // }
    // if (ship_y + camera_y_translation > 0.8 * C_HEIGHT) {
    //     camera_y_translation = 0.8 * C_HEIGHT - ship_y;
    // }
    // if (ship_y + camera_y_translation < 0.2 * C_HEIGHT) {
    //     camera_y_translation = 0.2 * C_HEIGHT - ship_y;
    // }
    camera_x_translation = 0.5 * C_WIDTH - ship_x - x_speed;
    camera_y_translation = 0.5 * C_HEIGHT - ship_y - y_speed;
    translate(camera_x_translation, camera_y_translation);
    console.log(ship_x + camera_x_translation);
}