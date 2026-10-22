/* ==========================================================================
   SCENE — a raymarched 3D world, flown through by scroll.
   One fragment shader. Six set pieces repeat along a long corridor (22 units
   per cell), each with its own colour world:
     0 chrome sculpture + orbiting satellites   ember
     1 gates with beads riding the hoops        ice
     2 neural lattice with pulsing hub nodes    violet
     3 data monoliths                           amber
     4 helix                                    mint
     5 layer stack                              rose
   The camera's position along the corridor (uP, in cells) is driven by the page.
   ========================================================================== */

const VS = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FS = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2 uRes;
uniform float uTime;    // wall clock, seconds
uniform float uP;       // camera position along the world, in cells
uniform float uTheme;   // 0 night, 1 day
uniform float uPX;      // lateral position of the sculptures
uniform float uScale;   // sculpture scale
uniform float uSpin;    // user-driven rotation of the hero sculpture
uniform vec2 uMouse;    // -1..1, y up
uniform vec2 uShift;    // moves the world's centre on screen (in screen heights)
uniform vec3 uAccent;   // the current section's colour (blended), tints the sky

const float CELL = 22.0;
const float FLOOR = -3.2;

float gEm;   // distance to the nearest emissive surface, from the last map() call
vec3 gEC;    // colour of the set piece that last map() call was in
float dS;    // solid distance in the current set piece
float dE;    // emissive distance in the current set piece

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float smin(float a, float b, float k) { float h = max(k - abs(a - b), 0.0) / k; return min(a, b) - h * h * k * 0.25; }
float sdTorus(vec3 p, vec2 t) { vec2 q = vec2(length(p.xz) - t.x, p.y); return length(q) - t.y; }
float sdBox(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }
float sdCap(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

vec3 kindCol(int k) {
  if (k == 0) return vec3(1.00, 0.46, 0.16);   // ember
  if (k == 1) return vec3(0.30, 0.78, 1.00);   // ice
  if (k == 2) return vec3(0.62, 0.48, 1.00);   // violet
  if (k == 3) return vec3(1.00, 0.72, 0.22);   // amber
  if (k == 4) return vec3(0.25, 0.95, 0.72);   // mint
  return vec3(1.00, 0.36, 0.62);               // rose
}

vec2 map(vec3 p) {
  float cf = floor(-p.z / CELL + 0.5);
  float lz = p.z + cf * CELL;
  int kind = int(mod(cf, 6.0));
  float t = uTime;
  float far = abs(p.z - (18.0 - uP * CELL));   /* distance along the flight path */
  dS = 1e3; dE = 1e3;

  if (kind == 0) {
    /* Chrome sculpture: three interlocked rings around an ember core, with orbiting satellites and a faint halo. */
    vec3 q = vec3(p.x - uPX, p.y - 0.6, lz) / uScale;
    q.xz *= rot(uSpin);
    vec3 a = q; a.xy *= rot(t * 0.3); a.yz *= rot(t * 0.21);
    float d = sdTorus(a, vec2(2.6, 0.5));
    vec3 b = q; b.xz *= rot(t * 0.25); b.xy *= rot(1.2);
    d = smin(d, sdTorus(b, vec2(1.9, 0.34)), 0.7);
    vec3 c = q; c.yz *= rot(t * 0.35); c.xz *= rot(0.8);
    d = smin(d, sdTorus(c, vec2(1.25, 0.22)), 0.5);
    dS = d * uScale;
    float core = length(q) - 0.55 - 0.06 * sin(t * 2.0);
    float sat = 1e3;
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      float ang = t * (0.45 + 0.11 * fi) + fi * 1.047;
      float r = 3.2 + 0.12 * fi;
      vec3 sp = vec3(cos(ang) * r, sin(ang * 0.7 + fi * 1.9) * 1.2, sin(ang) * r);
      sat = min(sat, length(q - sp) - 0.15);
    }
    vec3 hq = q; hq.yz *= rot(0.55); hq.xy *= rot(0.35);
    float halo = sdTorus(hq, vec2(3.9, 0.03 + 0.0025 * far));
    dE = min(min(core, sat), halo) * uScale;
  } else if (kind == 1) {
    /* Gates: glowing hoops you fly through, each with a bead riding it, between chrome pylons. */
    vec3 g = vec3(p.x, p.y - 0.8, lz);
    float cellz = floor((lz + 3.0) / 6.0);
    g.z = mod(lz + 3.0, 6.0) - 3.0;
    float R = 4.2 + 0.7 * sin(cellz * 1.7 + cf * 2.0);
    float ring = sdTorus(g.xzy, vec2(R, 0.075 + 0.0025 * far));
    float ang = t * 0.9 + cellz * 1.3 + cf;
    float bead = length(g - vec3(cos(ang) * R, sin(ang) * R, 0.0)) - 0.24;
    dE = min(ring, bead);
    dS = sdBox(vec3(abs(p.x) - 7.5, p.y, g.z), vec3(0.3, 3.7, 0.3));
  } else if (kind == 2) {
    /* Neural lattice: pulsing nodes, a few larger hubs, rods between them, and an open channel for the camera. */
    vec3 l = vec3(p.x + 1.5, p.y + 0.7, lz);
    vec3 m = mod(l + 1.5, 3.0) - 1.5;
    vec3 id = floor((l + 1.5) / 3.0);
    float hh = hash21(vec2(id.x + id.z * 13.0, id.y + cf * 3.0));
    float rad = 0.2 * (1.0 + 0.45 * sin(t * 2.0 + hh * 6.28)) * (hh > 0.82 ? 1.7 : 1.0);
    float node = length(m) - rad;
    float rods = min(length(m.yz), min(length(m.xz), length(m.xy))) - (0.04 + 0.002 * far);
    float bound = sdBox(vec3(p.x - 5.0, p.y - 1.2, lz), vec3(9.0, 4.7, 9.5));
    dS = max(rods, bound);
    dE = max(node, bound);
  } else if (kind == 3) {
    /* Monoliths: a field of rising data bars with glowing caps, and a corridor down the middle. */
    vec2 gp = vec2(p.x, lz);
    vec2 id = clamp(floor(gp / 2.4), vec2(-1.0, -4.0), vec2(5.0, 4.0));
    vec2 lc = gp - 2.4 * (id + 0.5);
    float h = 1.2 + 3.2 * hash21(id + cf * 7.0) + 1.1 * sin(t * 0.8 + id.x * 0.7 + id.y * 0.5);
    dS = sdBox(vec3(lc.x, p.y - (FLOOR + h * 0.5), lc.y), vec3(0.7, h * 0.5, 0.7));
    dE = sdBox(vec3(lc.x, p.y - (FLOOR + h), lc.y), vec3(0.71, 0.045 + 0.003 * far, 0.71));
    /* Neighbouring bars can be much taller: never step past the neighbouring cell's nearest face. */
    float edge = max(1.2 - max(abs(lc.x), abs(lc.y)) + 0.5, 0.6);
    dS = min(dS, edge);
    dE = min(dE, edge);
  } else if (kind == 4) {
    /* Helix: two strands of beads with glowing spokes. The camera flies up its axis. */
    float zi = clamp(floor(lz / 0.7 + 0.5), -13.0, 13.0);
    float lzz = lz - zi * 0.7;
    float ang = zi * 0.55 + t * 0.35;
    vec3 hq = vec3(p.x, p.y - 0.8, lzz);
    vec3 c1 = vec3(cos(ang), sin(ang), 0.0) * 2.6;
    dS = min(length(hq - c1) - 0.26, length(hq + c1) - 0.26);
    dE = min(sdCap(hq, c1, c1 * 0.45, 0.05 + 0.0025 * far), sdCap(hq, -c1, -c1 * 0.45, 0.05 + 0.0025 * far));
  } else {
    /* Layer stack: five rotating slabs studded with glowing nodes, like network layers. */
    vec3 q = vec3(p.x - uPX, p.y - 0.6, lz) / uScale;
    float d = 1e3, e = 1e3;
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      vec3 a = q; a.y -= (fi - 2.0) * 1.05;
      a.xz *= rot(t * 0.18 * (1.0 + fi * 0.2) + fi * 0.7);
      float hs = 2.4 - 0.25 * fi;
      d = min(d, sdBox(a, vec3(hs, 0.05, hs)));
      vec3 g = a; g.xz = mod(g.xz + 0.75, 1.5) - 0.75;
      float n = length(vec3(g.x, a.y - 0.1, g.z)) - 0.09;
      e = min(e, max(n, sdBox(a, vec3(hs, 0.3, hs))));
    }
    dS = d * uScale;
    dE = e * uScale;
  }

  float bd = CELL * 0.5 - abs(lz) + 0.4;   /* never step far into the next cell */
  float dp = min(min(dS, dE), bd);
  gEm = dE;
  gEC = kindCol(kind) * (1.0 - uTheme * 0.22);
  float dF = p.y - FLOOR;
  if (dF < dp) return vec2(dF, 0.0);
  return vec2(dp, dE < dS ? 2.0 : 1.0);
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(1.0, -1.0) * 0.004;
  return normalize(e.xyy * map(p + e.xyy).x + e.yyx * map(p + e.yyx).x +
                   e.yxy * map(p + e.yxy).x + e.xxx * map(p + e.xxx).x);
}

vec3 sky(vec3 d) {
  vec3 tint = uAccent;
  vec3 n = mix(vec3(0.012, 0.016, 0.034), vec3(0.07, 0.06, 0.10), pow(1.0 - abs(d.y), 3.0));
  n += tint * pow(max(dot(d, normalize(vec3(0.35, 0.2, -1.0))), 0.0), 14.0) * 0.5;
  n += tint.zxy * pow(max(dot(d, normalize(vec3(-0.7, 0.5, -0.2))), 0.0), 28.0) * 0.26;
  n += vec3(0.9, 0.95, 1.0) * smoothstep(0.93, 0.96, dot(d, normalize(vec3(0.15, 0.95, -0.3)))) * 0.9;
  vec3 w = mix(vec3(0.97, 0.95, 0.90), vec3(0.74, 0.80, 0.90), clamp(d.y * 1.2, 0.0, 1.0));
  w += tint * pow(max(dot(d, normalize(vec3(0.35, 0.4, -1.0))), 0.0), 9.0) * 0.38;
  w += vec3(1.0) * smoothstep(0.93, 0.96, dot(d, normalize(vec3(0.15, 0.95, -0.3)))) * 0.5;
  return mix(n, w, uTheme);
}

vec3 render(vec3 ro, vec3 rd) {
  vec3 acc = vec3(0.0), att = vec3(1.0);
  float gk = 1.0 - uTheme * 0.5;

  for (int b = 0; b < 2; b++) {
    float t = 0.0, mat = -1.0;
    vec3 glow = vec3(0.0);
    int lim = (b == 0) ? 92 : 80;            /* the reflection ray gets a smaller budget */
    for (int i = 0; i < 92; i++) {
      if (i >= lim) break;
      vec3 p = ro + rd * t;
      if (p.y > 6.5 && rd.y > 0.0) break;     /* nothing lives above the set: skip the sky */
      vec2 h = map(p);
      glow += gEC * (exp(-gEm * 2.0) * min(h.x, 0.6) * 0.05);
      if (h.x < 0.0012 * t + 0.001) { mat = h.y; break; }
      t += h.x * 0.92;
      if (t > 62.0) break;
    }
    if (mat > -0.5) {                         /* land exactly on the surface so the lighting terms are stable */
      t += map(ro + rd * t).x;
      t += map(ro + rd * t).x;
    }
    vec3 p = ro + rd * t;
    float fog = 1.0 - exp(-t * 0.013);
    glow = 1.0 - exp(-glow * 1.1);            /* soft clamp: glow never blows out */
    if (mat > -0.5) map(p);                   /* refresh gEC / gEm at the refined hit */
    vec3 ec = gEC;                            /* colour of the piece at the hit */
    float em = gEm;                           /* emissive distance at the hit */

    if (mat < -0.5) {
      acc += att * (sky(rd) + glow * 0.6 * gk);
      break;
    }
    vec3 n = calcNormal(p);

    if (mat > 1.5) {
      float sh = 0.72 + 0.28 * dot(n, normalize(vec3(0.4, 0.8, 0.5))) + 0.25 * pow(clamp(1.0 + dot(rd, n), 0.0, 1.0), 2.0);
      float near = mix(0.4, 1.0, smoothstep(2.0, 12.0, t));   /* glowing parts right in front of the lens are dimmed */
      acc += att * (mix(ec * 1.25 * sh, sky(rd), fog * 0.85) * near + glow * 0.35 * gk * near);
      break;
    } else if (mat < 0.5) {
      /* Floor: dark glossy plane with a faint grid in the piece's colour, and a reflection. */
      vec3 base = mix(vec3(0.020, 0.024, 0.036), vec3(0.86, 0.84, 0.80), uTheme);
      vec2 g = abs(fract(p.xz / 2.0) - 0.5);
      float line = smoothstep(0.46, 0.5, max(g.x, g.y));
      float vis = exp(-length(p.xz - ro.xz) * 0.035);
      vec3 col = base + ec * 0.14 * line * vis * (1.0 - 0.45 * uTheme);
      col += ec * 0.18 * exp(-em * 1.1);
      float fr = pow(clamp(1.0 + dot(rd, n), 0.0, 1.0), 4.0);
      float refl = mix(0.22, 0.06, uTheme) + 0.55 * fr;
      col = mix(col, sky(rd), fog);
      acc += att * (col * (1.0 - refl) + glow * 0.35 * gk);
      att *= refl;
      ro = p + n * 0.02;
      rd = reflect(rd, n);
    } else {
      /* Chrome: reflects the sky and takes coloured light from nearby glowing parts. */
      float ao = 1.0, sca = 1.0;
      for (int i = 1; i < 3; i++) {
        float hh = 0.18 * float(i);
        float dd = map(p + n * hh).x;
        ao -= (hh - dd) * sca * 0.8;
        sca *= 0.6;
      }
      ao = clamp(ao, 0.0, 1.0);
      vec3 L = normalize(vec3(0.5, 0.9, 0.3));
      float dif = max(dot(n, L), 0.0);
      float fr = pow(clamp(1.0 + dot(rd, n), 0.0, 1.0), 3.0);
      vec3 metal = mix(vec3(0.62, 0.66, 0.78), vec3(0.78, 0.76, 0.72), uTheme);
      vec3 col = sky(reflect(rd, n)) * metal * (0.7 + 1.1 * fr) + metal * dif * 0.16;
      col += uAccent * fr * (0.5 - 0.25 * uTheme);   /* coloured rim light */
      col += ec * 0.55 * exp(-em * 1.1) * (0.35 + 0.65 * dif);
      col += ec * 0.07;                          /* faint coloured ambient: no face is ever pure black */
      col *= ao;
      col = mix(col, sky(rd), fog);
      acc += att * (col + glow * 0.35 * gk);
      break;
    }
  }
  return acc;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y - uShift;
  float z = 18.0 - uP * CELL;
  vec3 ro = vec3(uMouse.x * 0.25 + 0.12 * sin(uTime * 0.31),
                 0.8 + 0.12 * sin(uTime * 0.23) + uMouse.y * 0.1, z);
  vec3 ta = ro + vec3(uMouse.x * 1.2, -0.15 + uMouse.y * 0.6, -10.0);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);
  uv *= rot(0.025 * sin(uTime * 0.19));
  vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.9 * ww);

  vec3 col = render(ro, rd);

  vec2 q = gl_FragCoord.xy / uRes;
  col *= mix(0.6, 1.0, pow(clamp(16.0 * q.x * q.y * (1.0 - q.x) * (1.0 - q.y), 0.0, 1.0), 0.2));
  col = col / (1.0 + max(col - 0.85, 0.0) * 0.6);
  col += (hash21(gl_FragCoord.xy + fract(uTime) * 97.0) - 0.5) * 0.03;
  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

export function createScene(canvas) {
  const gl = canvas.getContext('webgl2', {
    alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance',
  });
  if (!gl) return null;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error('Shader compile failed: ' + gl.getShaderInfoLog(s));
    }
    return s;
  };

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error('Program link failed: ' + gl.getProgramInfoLog(prog));
  }

  const U = {};
  ['uRes', 'uTime', 'uP', 'uTheme', 'uPX', 'uScale', 'uSpin', 'uMouse', 'uShift', 'uAccent'].forEach((n) => {
    U[n] = gl.getUniformLocation(prog, n);
  });
  gl.bindVertexArray(gl.createVertexArray());
  gl.useProgram(prog);

  return {
    gl,
    resize(w, h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    },
    draw(s) {
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform1f(U.uTime, s.time);
      gl.uniform1f(U.uP, s.p);
      gl.uniform1f(U.uTheme, s.theme);
      gl.uniform1f(U.uPX, s.px);
      gl.uniform1f(U.uScale, s.scale);
      gl.uniform1f(U.uSpin, s.spin);
      gl.uniform2f(U.uMouse, s.mx, s.my);
      gl.uniform2f(U.uShift, s.sx, s.sy);
      gl.uniform3f(U.uAccent, s.accent[0], s.accent[1], s.accent[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}
