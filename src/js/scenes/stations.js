/**
 * STATIONS
 * --------
 * One 3D station per chapter. Every station is a `THREE.Group` with an
 * `update(delta, time, progress)` method, where `progress` is the chapter's
 * own scroll progress (0 = entering, 1 = leaving).
 *
 * Each station gets its own geometry language so the world evolves:
 *   01 monolith      02 pillars + point-cloud portrait
 *   03 membrane      04 tube path + markers
 *   05 arena ring    06 node constellation
 *   07 instrument arcs  08 islands  09 horizon disc
 */

import * as THREE from "three";
import { clamp, lerp, smoothstep, easeInOutCubic } from "../utils.js";
import { PROJECT_HUES } from "../core/palettes.js";

/* ------------------------------------------------------------------ */
/* Shared material helpers                                            */
/* ------------------------------------------------------------------ */

function standard(color, { metalness = 0.35, roughness = 0.42, emissive = 0x000000, emissiveIntensity = 0 } = {}) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness,
    roughness,
    emissive: new THREE.Color(emissive),
    emissiveIntensity,
  });
}

function accentMaterial(accent, intensity = 1.5) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(accent),
    emissive: new THREE.Color(accent),
    emissiveIntensity: intensity,
    metalness: 0.1,
    roughness: 0.5,
    toneMapped: false,
  });
}

function wireframe(color, opacity = 0.32) {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    wireframe: true,
    transparent: true,
    opacity,
  });
}

/** Radial-gradient sprite texture used for point clouds. */
function makeSpriteTexture(size = 64, inner = "rgba(255,255,255,1)") {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.35, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildStation({ group, spacing = 150, update, resize, dispose, accent }) {
  return { group, spacing, update, resize, dispose, accent };
}

/* ================================================================== */
/* CH 01 — THE ARRIVAL                                                */
/* An archive obelisk split by a seam of light, suspended record      */
/* panels around it. The camera pushes *through* the slab.            */
/* ================================================================== */

export function buildArrival({ accent, tier }) {
  const group = new THREE.Group();

  // --- The monolith, split into two halves that part as you approach ---
  const slabGeo = new THREE.BoxGeometry(26, 62, 3.2, 1, 8, 1);
  const slabMat = standard("#1b2036", { metalness: 0.55, roughness: 0.35 });
  const left = new THREE.Mesh(slabGeo, slabMat);
  left.position.set(-13.2, 0, 0);
  const right = new THREE.Mesh(slabGeo, slabMat);
  right.position.set(13.2, 0, 0);
  group.add(left, right);

  // Glowing seam
  const seamGeo = new THREE.PlaneGeometry(0.5, 58);
  const seam = new THREE.Mesh(
    seamGeo,
    new THREE.MeshBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: 0.9, toneMapped: false }),
  );
  seam.position.set(0, 0, 1.9);
  group.add(seam);

  // Horizontal index rules across the slab
  const ruleGeo = new THREE.PlaneGeometry(24, 0.06);
  const ruleMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(accent),
    transparent: true,
    opacity: 0.22,
    toneMapped: false,
  });
  for (let i = 0; i < 11; i++) {
    const rule = new THREE.Mesh(ruleGeo, ruleMat);
    rule.position.set(0, -26 + i * 5.4, 1.75);
    group.add(rule);
  }

  // --- Horizon bar ---
  const horizon = new THREE.Mesh(
    new THREE.BoxGeometry(220, 0.5, 0.5),
    accentMaterial(accent, 1.1),
  );
  horizon.position.set(0, -33, -30);
  group.add(horizon);

  // --- Suspended record panels ---
  const panelCount = Math.round(16 * tier.particles);
  const panels = [];
  const panelGeo = new THREE.PlaneGeometry(1, 1);
  for (let i = 0; i < panelCount; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(accent),
      transparent: true,
      opacity: 0.1 + Math.random() * 0.16,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const panel = new THREE.Mesh(panelGeo, mat);
    const angle = Math.random() * Math.PI * 2;
    const radius = 34 + Math.random() * 46;
    panel.position.set(
      Math.cos(angle) * radius,
      -18 + Math.random() * 46,
      -30 - Math.random() * 60,
    );
    panel.scale.set(4 + Math.random() * 9, 6 + Math.random() * 14, 1);
    panel.rotation.set(Math.random() * 0.3, Math.random() * Math.PI, Math.random() * 0.2);
    panel.userData = {
      baseY: panel.position.y,
      drift: 0.4 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.05,
    };
    panels.push(panel);
    group.add(panel);
  }

  return buildStation({
    group,
    spacing: 165,
    accent,
    update(_delta, time, p) {
      // The slab parts open as the visitor approaches, then closes behind.
      const open = smoothstep(0.05, 0.55, p) * (1 - smoothstep(0.78, 1, p));
      const gap = 1 + open * 15;
      left.position.x = -13.2 - gap * 0.5;
      right.position.x = 13.2 + gap * 0.5;
      seam.material.opacity = 0.35 + open * 0.65;
      seam.scale.y = 1 + open * 0.1;

      const drift = 1 - smoothstep(0.1, 0.9, p) * 0.4;
      panels.forEach((panel) => {
        const d = panel.userData;
        panel.position.y = d.baseY + Math.sin(time * d.drift + d.phase) * 2.4 * drift;
        panel.rotation.y += d.sping * 0.016;
        panel.material.opacity = (0.1 + (Math.sin(time * 0.6 + d.phase) * 0.5 + 0.5) * 0.14) * (1 - smoothstep(0.7, 1, p));
      });
    },
  });
}

/* ================================================================== */
/* CH 02 — THE PERSON                                                  */
/* Three pillars in a lamplit hall, and a portrait assembled from a    */
/* point cloud. The camera orbits the pillars as each ignites.         */
/* ================================================================== */

export function buildPerson({ accent, tier }) {
  const group = new THREE.Group();

  const pillarMat = standard("#2e1f1a", { metalness: 0.4, roughness: 0.5 });
  const bandMat = accentMaterial(accent, 1.4);
  const pillarGeo = new THREE.CylinderGeometry(3.1, 3.4, 46, 6, 1);
  const bandGeo = new THREE.CylinderGeometry(3.35, 3.35, 0.7, 6, 1);

  const pillars = [];
  const xs = [-24, 0, 24];
  xs.forEach((x, i) => {
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(x, 0, 0);
    const band = new THREE.Mesh(bandGeo, bandMat.clone());
    band.position.set(x, 8 - i * 2, 0);
    const glow = new THREE.PointLight(new THREE.Color(accent), 0, 40, 2);
    glow.position.set(x, 8 - i * 2, 6);
    pillar.userData = { band, glow, index: i };
    pillars.push(pillar);
    group.add(pillar, band, glow);
  });

  // Base plinth under the pillars
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(88, 1.2, 26),
    standard("#3a2820", { metalness: 0.3, roughness: 0.7 }),
  );
  plinth.position.set(0, -24.5, 0);
  group.add(plinth);

  // --- Point-cloud portrait: points fly in from chaos into a field ---
  const cols = 34;
  const rows = 44;
  const count = cols * rows;
  const positions = new Float32Array(count * 3);
  const targets = new Float32Array(count * 3);
  const chaos = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const cx = i % cols;
    const cy = Math.floor(i / cols);
    const u = cx / (cols - 1) - 0.5;
    const v = cy / (rows - 1) - 0.5;

    // Portrait silhouette: head + shoulders within an elliptical mask
    const headR = 0.2;
    const headX = u * 1.5;
    const headY = v * 1.9 - 0.42;
    const inHead = Math.sqrt(headX * headX + headY * headY) < headR;
    const shoulder = Math.max(0, 1 - Math.pow(Math.abs(u) * 2.3, 2)) * smoothstep(0.05, 0.42, -v);
    const inBody = shoulder > 0.35 && v < 0.05;

    const visible = inHead || inBody;
    targets[i * 3] = u * 26;
    targets[i * 3 + 1] = v * 34;
    targets[i * 3 + 2] = (Math.random() - 0.5) * 1.4;

    chaos[i * 3] = (Math.random() - 0.5) * 130;
    chaos[i * 3 + 1] = (Math.random() - 0.5) * 90;
    chaos[i * 3 + 2] = (Math.random() - 0.5) * 130;

    positions[i * 3] = chaos[i * 3];
    positions[i * 3 + 1] = chaos[i * 3 + 1];
    positions[i * 3 + 2] = chaos[i * 3 + 2];

    sizes[i] = visible ? 1.6 + Math.random() * 1.4 : 0.001;
  }

  const cloudGeo = new THREE.BufferGeometry();
  cloudGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  cloudGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  const sprite = makeSpriteTexture();
  const cloudMat = new THREE.PointsMaterial({
    color: new THREE.Color(accent),
    size: 1.5,
    map: sprite,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0,
    sizeAttenuation: true,
    toneMapped: false,
  });
  const cloud = new THREE.Points(cloudGeo, cloudMat);
  cloud.position.set(0, 1, -6);
  group.add(cloud);

  // Floor reflection strip
  const strip = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 3),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(accent),
      transparent: true,
      opacity: 0.08,
      toneMapped: false,
    }),
  );
  strip.rotation.x = -Math.PI / 2;
  strip.position.set(0, -23.8, 0);
  group.add(strip);

  const posAttr = cloudGeo.attributes.position;

  return buildStation({
    group,
    spacing: 150,
    accent,
    update(_delta, time, p) {
      const assemble = smoothstep(0.18, 0.72, p);
      cloudMat.opacity = assemble * 0.85;
      for (let i = 0; i < count; i++) {
        const t = easeInOutCubic(assemble);
        const wobble = Math.sin(time * 0.8 + i * 0.05) * 0.6 * assemble;
        posAttr.array[i * 3] = lerp(chaos[i * 3], targets[i * 3], t) + wobble;
        posAttr.array[i * 3 + 1] = lerp(chaos[i * 3 + 1], targets[i * 3 + 1], t) + wobble * 0.5;
        posAttr.array[i * 3 + 2] = lerp(chaos[i * 3 + 2], targets[i * 3 + 2], t);
      }
      posAttr.needsUpdate = true;

      pillars.forEach((pillar, i) => {
        const light = smoothstep(0.08 + i * 0.14, 0.4 + i * 0.14, p);
        const fade = 1 - smoothstep(0.82, 1, p);
        pillar.userData.band.material.emissiveIntensity = 0.4 + light * 1.6;
        pillar.userData.band.material.opacity = 1;
        pillar.userData.glow.intensity = light * 9 * fade;
        pillar.scale.y = lerp(0.86, 1, light);
      });

      strip.material.opacity = 0.05 + assemble * 0.1;
      cloud.rotation.y = Math.sin(time * 0.18) * 0.06;
    },
    dispose() {
      sprite.dispose();
    },
  });
}

/* ================================================================== */
/* CH 03 — THE RESEARCH                                                */
/* A detection membrane. Fraudulent postings flow toward it, veer off */
/* into an outlier cluster, and the verdict resolves.                  */
/* ================================================================== */

export function buildResearch({ accent, tier }) {
  const group = new THREE.Group();
  const alertColor = "#ff6a58";

  // --- The membrane ---
  const membrane = new THREE.Mesh(
    new THREE.TorusGeometry(19, 0.32, 10, 128),
    accentMaterial(accent, 1.2),
  );
  membrane.position.z = 0;
  group.add(membrane);

  const membraneInner = new THREE.Mesh(
    new THREE.RingGeometry(0, 18.6, 96),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(accent),
      transparent: true,
      opacity: 0.035,
      side: THREE.DoubleSide,
      toneMapped: false,
    }),
  );
  group.add(membraneInner);

  // --- Flowing postings ---
  const postCount = Math.round(22 * tier.particles);
  const posts = [];
  const postGeo = new THREE.BoxGeometry(5.2, 6.6, 0.22);
  for (let i = 0; i < postCount; i++) {
    const isFraud = i % 3 !== 0;
    const mat = standard(isFraud ? "#2a1512" : "#12211f", {
      metalness: 0.2,
      roughness: 0.6,
      emissive: isFraud ? alertColor : accent,
      emissiveIntensity: 0,
    });
    const post = new THREE.Mesh(postGeo, mat);
    const angle = Math.random() * Math.PI * 2;
    const radius = 5 + Math.random() * 13;
    post.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, -95 - i * 7);
    post.userData = {
      fraud: isFraud,
      angle,
      radius,
      speed: 26 + Math.random() * 18,
      spin: (Math.random() - 0.5) * 0.4,
      lane: Math.random() * Math.PI * 2,
    };
    posts.push(post);
    group.add(post);
  }

  // --- The outlier cluster: where fraud gets isolated ---
  const clusterCount = Math.round(420 * tier.particles);
  const clusterPos = new Float32Array(clusterCount * 3);
  for (let i = 0; i < clusterCount; i++) {
    const r = 6 + Math.random() * 13;
    const a = Math.random() * Math.PI * 2;
    clusterPos[i * 3] = Math.cos(a) * r;
    clusterPos[i * 3 + 1] = Math.sin(a) * r;
    clusterPos[i * 3 + 2] = 26 + Math.random() * 44;
  }
  const clusterGeo = new THREE.BufferGeometry();
  clusterGeo.setAttribute("position", new THREE.BufferAttribute(clusterPos, 3));
  const clusterSprite = makeSpriteTexture(64, "rgba(255,150,130,1)");
  const clusterMat = new THREE.PointsMaterial({
    color: new THREE.Color(alertColor),
    size: 1.1,
    map: clusterSprite,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const cluster = new THREE.Points(clusterGeo, clusterMat);
  cluster.position.z = 30;
  group.add(cluster);

  // --- The verdict core, beyond the membrane ---
  const verdict = new THREE.Mesh(
    new THREE.IcosahedronGeometry(4.4, 1),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(alertColor),
      emissive: new THREE.Color(alertColor),
      emissiveIntensity: 0,
      metalness: 0.2,
      roughness: 0.4,
      toneMapped: false,
    }),
  );
  verdict.position.set(0, 0, 62);
  group.add(verdict);

  const verdictWire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(6.4, 1),
    wireframe(alertColor, 0.2),
  );
  verdictWire.position.copy(verdict.position);
  group.add(verdictWire);

  return buildStation({
    group,
    spacing: 165,
    accent,
    update(delta, time, p) {
      membrane.rotation.z = time * 0.06;
      membraneInner.material.opacity = 0.02 + smoothstep(0.1, 0.6, p) * 0.05;
      membrane.material.emissiveIntensity = 0.8 + Math.sin(time * 1.6) * 0.3;

      const clusterReveal = smoothstep(0.35, 0.85, p);
      clusterMat.opacity = clusterReveal * 0.55;
      cluster.rotation.z = time * 0.03;

      const verdictReveal = smoothstep(0.62, 0.98, p);
      verdict.material.emissiveIntensity = verdictReveal * 2.2;
      verdictWire.material.opacity = verdictReveal * 0.35;
      verdict.rotation.y = time * 0.3;
      verdict.rotation.x = time * 0.16;
      verdictWire.rotation.copy(verdict.rotation);
      verdictWire.rotation.y *= -0.6;
      verdict.scale.setScalar(0.6 + verdictReveal * 0.5);

      posts.forEach((post) => {
        const d = post.userData;
        post.position.z += d.speed * delta;
        if (post.position.z > 120) post.position.z = -110;

        // Rotate around the membrane axis as they travel
        d.angle += d.spin * delta * 0.6;
        const wobble = Math.sin(time * 0.7 + d.lane) * 1.4;

        if (d.fraud) {
          // Fraud veers outward past the membrane into the outlier cluster
          const escaped = smoothstep(-8, 22, post.position.z);
          post.position.x = Math.cos(d.angle) * (d.radius + escaped * 16) + wobble;
          post.position.y = Math.sin(d.angle) * (d.radius + escaped * 16) + wobble;
          post.material.emissiveIntensity = escaped * 1.5;
          post.rotation.z += delta * 0.9;
          post.scale.setScalar(1 - escaped * 0.3);
        } else {
          // Authentic passes straight through
          post.position.x = Math.cos(d.angle) * d.radius + wobble;
          post.position.y = Math.sin(d.angle) * d.radius + wobble;
          post.material.emissiveIntensity = 0.35;
          post.rotation.z = 0;
          post.scale.setScalar(1);
        }
      });
    },
    dispose() {
      clusterSprite.dispose();
    },
  });
}

/* ================================================================== */
/* CH 04 — THE PATH                                                    */
/* A road through terrain. Milestone markers stand beside it; the      */
/* camera physically travels the curve.                               */
/* ================================================================== */

export function buildPath({ accent, tier }) {
  const group = new THREE.Group();

  // --- The road ---
  const points = [];
  const segments = 220;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    points.push(
      new THREE.Vector3(
        Math.sin(t * Math.PI * 2.1) * 30 + Math.sin(t * 9) * 5,
        Math.sin(t * Math.PI * 1.4) * 7 - t * 4,
        -t * 150,
      ),
    );
  }
  const curve = new THREE.CatmullRomCurve3(points);

  const road = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 200, 0.42, 8, false),
    accentMaterial(accent, 1.1),
  );
  group.add(road);

  // A wider ribbon beneath, like worn ground
  const ribbon = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 120, 2.6, 6, false),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(accent),
      transparent: true,
      opacity: 0.05,
      toneMapped: false,
    }),
  );
  group.add(ribbon);

  // --- Milestone markers ---
  const markerCount = 6;
  const markers = [];
  const markerGeo = new THREE.BoxGeometry(1.5, 9, 1.5);
  for (let i = 0; i < markerCount; i++) {
    const t = (i + 0.5) / markerCount;
    const at = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    const marker = new THREE.Mesh(markerGeo, standard("#2b2114", { metalness: 0.5, roughness: 0.4 }));
    marker.position.copy(at).add(new THREE.Vector3(0, 4.5, 0));
    marker.lookAt(at.clone().add(tangent));

    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.28, 1.9),
      accentMaterial(accent, 0.2),
    );
    cap.position.set(0, 4.9, 0);
    marker.add(cap);

    // A vertical light shaft so the marker reads at distance
    const shaft = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 22),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(accent),
        transparent: true,
        opacity: 0,
        toneMapped: false,
      }),
    );
    shaft.position.set(0, 8, 0);
    marker.add(shaft);

    marker.userData = { t, cap, shaft };
    markers.push(marker);
    group.add(marker);
  }

  // --- Terrain dust ---
  const dustCount = Math.round(500 * tier.particles);
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const t = Math.random();
    const at = curve.getPointAt(t);
    dustPos[i * 3] = at.x + (Math.random() - 0.5) * 70;
    dustPos[i * 3 + 1] = at.y + (Math.random() - 0.5) * 30;
    dustPos[i * 3 + 2] = at.z + (Math.random() - 0.5) * 40;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dustSprite = makeSpriteTexture(48, "rgba(255,220,170,0.9)");
  const dustMat = new THREE.PointsMaterial({
    color: new THREE.Color(accent),
    size: 0.55,
    map: dustSprite,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  group.add(dust);

  return buildStation({
    group,
    spacing: 150,
    accent,
    update(_delta, time, p) {
      markers.forEach((marker) => {
        // Light the marker as the traveller approaches, dim it once past
        const near = 1 - Math.min(Math.abs(marker.userData.t - p) / 0.22, 1);
        const glow = smoothstep(0, 1, near);
        marker.userData.cap.material.emissiveIntensity = 0.2 + glow * 2.4;
        marker.userData.shaft.material.opacity = glow * 0.3;
        marker.scale.y = 0.9 + glow * 0.14;
      });

      dustMat.opacity = 0.18 + Math.sin(time * 0.5) * 0.06;
      dust.rotation.z = time * 0.01;
    },
    dispose() {
      dustSprite.dispose();
    },
  });
}

/* ================================================================== */
/* CH 05 — THE PROVING GROUNDS                                        */
/* An arena ring with monuments that ignite in sequence as the camera */
/* rises above it.                                                    */
/* ================================================================== */

export function buildArena({ accent, tier }) {
  const group = new THREE.Group();

  const floor = new THREE.Mesh(
    new THREE.TorusGeometry(36, 1.4, 10, 140),
    standard("#2b1610", { metalness: 0.55, roughness: 0.4 }),
  );
  floor.rotation.x = -Math.PI / 2;
  group.add(floor);

  // Concentric guide rings
  [22, 30, 44].forEach((r, i) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.08, 6, 128),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(accent),
        transparent: true,
        opacity: 0.16 - i * 0.03,
        toneMapped: false,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);
  });

  // Radial spokes
  const spokeCount = 24;
  const spokeGeo = new THREE.PlaneGeometry(0.09, 88);
  for (let i = 0; i < spokeCount; i++) {
    const spoke = new THREE.Mesh(spokeGeo, new THREE.MeshBasicMaterial({
      color: new THREE.Color(accent),
      transparent: true,
      opacity: 0.07,
      toneMapped: false,
    }));
    const a = (i / spokeCount) * Math.PI * 2;
    spoke.position.set(Math.cos(a) * 22, 0, Math.sin(a) * 22);
    spoke.rotation.x = -Math.PI / 2;
    spoke.rotation.z = -a;
    group.add(spoke);
  }

  // --- Monuments around the ring ---
  const monumentCount = 5;
  const monuments = [];
  for (let i = 0; i < monumentCount; i++) {
    const a = (i / monumentCount) * Math.PI * 2 + 0.4;
    const height = 10 + (i % 3) * 5.5;
    const m = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, height, 4.2),
      standard("#33180f", { metalness: 0.6, roughness: 0.35 }),
    );
    body.position.y = height / 2;
    m.add(body);

    const crown = new THREE.Mesh(
      new THREE.BoxGeometry(5, 0.5, 5),
      accentMaterial(accent, 0.2),
    );
    crown.position.y = height + 0.4;
    m.add(crown);

    const beam = new THREE.Mesh(
      new THREE.ConeGeometry(2.4, 16, 4, 1, true),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(accent),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    beam.position.y = height + 8;
    m.add(beam);

    const light = new THREE.PointLight(new THREE.Color(accent), 0, 60, 2);
    light.position.y = height + 2;
    m.add(light);

    m.position.set(Math.cos(a) * 36, 0, Math.sin(a) * 36);
    m.lookAt(0, height / 2, 0);
    m.userData = { index: i, crown, beam, light, height };
    monuments.push(m);
    group.add(m);
  }

  // --- Crowd: a dense ring of tiny markers, the audience ---
  const crowdCount = Math.round(700 * tier.particles);
  const crowdPos = new Float32Array(crowdCount * 3);
  for (let i = 0; i < crowdCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 48 + Math.random() * 40;
    crowdPos[i * 3] = Math.cos(a) * r;
    crowdPos[i * 3 + 1] = -1 + Math.random() * 3;
    crowdPos[i * 3 + 2] = Math.sin(a) * r;
  }
  const crowdGeo = new THREE.BufferGeometry();
  crowdGeo.setAttribute("position", new THREE.BufferAttribute(crowdPos, 3));
  const crowdSprite = makeSpriteTexture(32, "rgba(255,190,150,0.85)");
  const crowdMat = new THREE.PointsMaterial({
    color: new THREE.Color(accent),
    size: 0.7,
    map: crowdSprite,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const crowd = new THREE.Points(crowdGeo, crowdMat);
  group.add(crowd);

  return buildStation({
    group,
    spacing: 150,
    accent,
    update(_delta, time, p) {
      monuments.forEach((m) => {
        const start = 0.08 + m.userData.index * 0.13;
        const ignite = smoothstep(start, start + 0.22, p);
        const fade = 1 - smoothstep(0.86, 1, p);
        m.userData.crown.material.emissiveIntensity = 0.2 + ignite * 3;
        m.userData.beam.material.opacity = ignite * 0.14 * fade;
        m.userData.light.intensity = ignite * 22 * fade;
        m.scale.y = lerp(0.7, 1, ignite);
        m.rotation.y = Math.sin(time * 0.2 + m.userData.index) * 0.02;
      });

      floor.rotation.z = time * 0.012;
      crowdMat.opacity = (0.25 + smoothstep(0.1, 0.7, p) * 0.3) * (1 - smoothstep(0.9, 1, p));
    },
    dispose() {
      crowdSprite.dispose();
    },
  });
}

/* ================================================================== */
/* CH 06 — THE TECHNICAL WORLD (rebuilt)                              */
/* A living constellation: a core nucleus, three orbital domains,     */
/* their leaf nodes, and links that pulse out to the projects where   */
/* each technology was actually used.                                 */
/* ================================================================== */

export function buildTechnical({ accent, tier }) {
  const group = new THREE.Group();

  // --- Core nucleus ---
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(5.2, 1),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(accent),
      emissive: new THREE.Color(accent),
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.25,
      flatShading: true,
      toneMapped: false,
    }),
  );
  group.add(core);

  const coreWire = new THREE.Mesh(new THREE.IcosahedronGeometry(7.6, 1), wireframe(accent, 0.22));
  group.add(coreWire);

  const coreHalo = new THREE.Mesh(
    new THREE.RingGeometry(8.4, 9.2, 96),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(accent),
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      toneMapped: false,
    }),
  );
  group.add(coreHalo);

  // --- Three domains, 120° apart ---
  const domainDefs = [
    { label: "languages", color: "#5cf0d4", radius: 26 },
    { label: "backend", color: "#f0a35e", radius: 30 },
    { label: "data", color: "#8ad8ff", radius: 24 },
  ];

  const domains = [];
  const linkLines = [];

  domainDefs.forEach((def, di) => {
    const a = (di / 3) * Math.PI * 2 + Math.PI / 6;
    const hubPos = new THREE.Vector3(Math.cos(a) * def.radius, Math.sin(a) * def.radius * 0.5, 0);

    const hub = new THREE.Mesh(
      new THREE.TorusGeometry(3.4, 0.42, 8, 48),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(def.color),
        emissive: new THREE.Color(def.color),
        emissiveIntensity: 0.6,
        metalness: 0.6,
        roughness: 0.3,
        toneMapped: false,
      }),
    );
    hub.position.copy(hubPos);
    hub.lookAt(0, 0, 0);
    group.add(hub);

    // Link core → hub
    const hubLink = makeLink([new THREE.Vector3(0, 0, 0), hubPos], def.color, 0.5);
    group.add(hubLink);
    linkLines.push(hubLink);

    // Leaf nodes in an arc around the hub
    const nodeCount = tier.particles >= 1 ? 4 : 3;
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const spread = (i - (nodeCount - 1) / 2) * 0.44;
      const na = a + spread;
      const nr = def.radius + 11;
      const nodePos = new THREE.Vector3(Math.cos(na) * nr, Math.sin(na) * nr * 0.5, (i - 1.5) * 4);

      const node = new THREE.Mesh(
        new THREE.OctahedronGeometry(1.9, 0),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(def.color),
          emissive: new THREE.Color(def.color),
          emissiveIntensity: 0.35,
          metalness: 0.45,
          roughness: 0.35,
          flatShading: true,
          toneMapped: false,
        }),
      );
      node.position.copy(nodePos);
      node.userData = { base: nodePos.clone(), phase: i * 0.8 + di };
      group.add(node);

      const nodeLink = makeLink([hubPos, nodePos], def.color, 0.28);
      group.add(nodeLink);
      linkLines.push(nodeLink);
      nodes.push(node);
    }

    // Project markers: where this domain was used
    const projectColors = [PROJECT_HUES.signal.primary, PROJECT_HUES.diary.primary, PROJECT_HUES.ledger.primary];
    const projectMarkers = [];
    const pCount = tier.particles >= 1 ? 3 : 2;
    for (let i = 0; i < pCount; i++) {
      const pa = a + (i - (pCount - 1) / 2) * 0.3;
      const pr = def.radius + 24;
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.9, 16, 12),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(projectColors[i % 3]),
          emissive: new THREE.Color(projectColors[i % 3]),
          emissiveIntensity: 1.4,
          metalness: 0.1,
          roughness: 0.4,
          toneMapped: false,
        }),
      );
      marker.position.set(Math.cos(pa) * pr, Math.sin(pa) * pr * 0.5, (i - 1) * 7);
      group.add(marker);

      const pLink = makeLink([hubPos, marker.position], projectColors[i % 3], 0.16);
      group.add(pLink);
      linkLines.push(pLink);
      projectMarkers.push(marker);
    }

    domains.push({ def, hub, hubPos, nodes, projectMarkers });
  });

  // --- Orbiting data motes: the system is alive ---
  const moteCount = Math.round(260 * tier.particles);
  const motePos = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 12 + Math.random() * 46;
    motePos[i * 3] = Math.cos(a) * r;
    motePos[i * 3 + 1] = Math.sin(a) * r * 0.5;
    motePos[i * 3 + 2] = (Math.random() - 0.5) * 60;
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
  const moteSprite = makeSpriteTexture(40, "rgba(200,255,240,0.9)");
  const moteMat = new THREE.PointsMaterial({
    color: new THREE.Color(accent),
    size: 0.5,
    map: moteSprite,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const motes = new THREE.Points(moteGeo, moteMat);
  group.add(motes);

  return buildStation({
    group,
    spacing: 170,
    accent,
    update(_delta, time, p) {
      const grow = smoothstep(0.04, 0.42, p);
      const fade = 1 - smoothstep(0.88, 1, p);

      core.rotation.y = time * 0.14;
      core.rotation.x = time * 0.07;
      core.scale.setScalar(0.4 + grow * 0.7);
      core.material.emissiveIntensity = 0.3 + grow * 0.8;

      coreWire.rotation.y = -time * 0.09;
      coreWire.rotation.z = time * 0.05;
      coreWire.scale.setScalar(0.5 + grow * 0.6);
      coreWire.material.opacity = grow * 0.22 * fade;

      coreHalo.scale.setScalar(0.4 + grow * 0.7);
      coreHalo.material.opacity = grow * 0.16 * fade;
      coreHalo.rotation.z = time * 0.05;

      domains.forEach((domain, di) => {
        const start = 0.14 + di * 0.13;
        const arrive = smoothstep(start, start + 0.3, p);
        domain.hub.scale.setScalar(0.3 + arrive * 0.85);
        domain.hub.material.emissiveIntensity = 0.2 + arrive * 1.3;
        domain.hub.rotation.z = time * 0.3;

        domain.nodes.forEach((node, ni) => {
          const ns = smoothstep(start + 0.1 + ni * 0.05, start + 0.34 + ni * 0.05, p);
          node.scale.setScalar(0.2 + ns * 0.9);
          node.material.emissiveIntensity = 0.15 + ns * 0.9;
          node.rotation.y = time * 0.5 + node.userData.phase;
          node.rotation.x = time * 0.3;
          node.position.y = node.userData.base.y + Math.sin(time * 0.9 + node.userData.phase) * 0.7;
        });

        domain.projectMarkers.forEach((marker, mi) => {
          const ms = smoothstep(start + 0.22 + mi * 0.06, start + 0.46 + mi * 0.06, p);
          marker.scale.setScalar(0.15 + ms * 0.9);
          marker.material.emissiveIntensity = 0.3 + ms * 1.6 + Math.sin(time * 2 + mi) * 0.3;
        });
      });

      // Pulse the links
      linkLines.forEach((line, i) => {
        line.material.opacity = (0.18 + Math.sin(time * 1.4 - i * 0.4) * 0.5 + 0.5) * 0.5 * grow * fade;
      });

      motes.rotation.z = time * 0.02;
      moteMat.opacity = (0.16 + grow * 0.28) * fade;
    },
    dispose() {
      moteSprite.dispose();
    },
  });
}

function makeLink(points, color, opacity) {
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  return new THREE.Line(geo, mat);
}

/* ================================================================== */
/* CH 07 — CAPABILITIES                                                */
/* Instrument arcs that fill as the visitor scrolls, and the           */
/* engineering loop as a ring of blocks that lights in sequence.      */
/* ================================================================== */

export function buildCapabilities({ accent, tier }) {
  const group = new THREE.Group();

  // --- Three instrument arcs at different depths ---
  const arcs = [];
  const arcDefs = [
    { radius: 20, arc: Math.PI * 0.72, z: -14, tilt: 0.2 },
    { radius: 15, arc: Math.PI * 0.6, z: 4, tilt: -0.3 },
    { radius: 11, arc: Math.PI * 0.5, z: 20, tilt: 0.45 },
  ];
  arcDefs.forEach((def, i) => {
    const arcGroup = new THREE.Group();

    const track = new THREE.Mesh(
      new THREE.TorusGeometry(def.radius, 0.16, 6, 96, def.arc),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(accent),
        transparent: true,
        opacity: 0.16,
        toneMapped: false,
      }),
    );
    arcGroup.add(track);

    const fill = new THREE.Mesh(
      new THREE.TorusGeometry(def.radius, 0.34, 8, 96, def.arc),
      accentMaterial(accent, 1.2),
    );
    fill.scale.x = 0.001;
    arcGroup.add(fill);

    // Tick marks
    const tickCount = 14;
    for (let t = 0; t < tickCount; t++) {
      const a = (t / (tickCount - 1)) * def.arc - def.arc / 2;
      const tick = new THREE.Mesh(
        new THREE.PlaneGeometry(0.08, 1.5),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(accent),
          transparent: true,
          opacity: 0.25,
          toneMapped: false,
        }),
      );
      tick.position.set(Math.cos(a) * def.radius, Math.sin(a) * def.radius, 0);
      tick.rotation.z = a - Math.PI / 2;
      arcGroup.add(tick);
    }

    arcGroup.rotation.x = def.tilt;
    arcGroup.rotation.y = i * 0.4 - 0.4;
    arcGroup.position.z = def.z;
    arcGroup.userData = { fill, index: i };
    arcs.push(arcGroup);
    group.add(arcGroup);
  });

  // --- The engineering loop: six blocks on a ring ---
  const loopCount = 6;
  const loopBlocks = [];
  for (let i = 0; i < loopCount; i++) {
    const a = (i / loopCount) * Math.PI * 2;
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 2.6, 2.6),
      standard("#1e1832", { metalness: 0.5, roughness: 0.3 }),
    );
    block.position.set(Math.cos(a) * 27, Math.sin(a) * 9, -6);
    block.userData = { index: i, angle: a };

    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(2.9, 2.9, 2.9),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(accent),
        transparent: true,
        opacity: 0,
        wireframe: true,
        toneMapped: false,
      }),
    );
    block.add(edge);
    block.userData.edge = edge;

    loopBlocks.push(block);
    group.add(block);
  }

  // Connecting loop line
  const loopPoints = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    loopPoints.push(new THREE.Vector3(Math.cos(a) * 27, Math.sin(a) * 9, -6));
  }
  const loopLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(loopPoints),
    new THREE.LineBasicMaterial({
      color: new THREE.Color(accent),
      transparent: true,
      opacity: 0.2,
      toneMapped: false,
    }),
  );
  group.add(loopLine);

  return buildStation({
    group,
    spacing: 150,
    accent,
    update(_delta, time, p) {
      arcs.forEach((arcGroup, i) => {
        const start = 0.1 + i * 0.14;
        const fillAmount = smoothstep(start, start + 0.4, p) * (1 - smoothstep(0.9, 1, p));
        arcGroup.userData.fill.scale.x = Math.max(0.001, fillAmount);
        arcGroup.rotation.z = time * (0.04 + i * 0.02);
      });

      loopBlocks.forEach((block) => {
        const start = 0.2 + block.userData.index * 0.09;
        const lit = smoothstep(start, start + 0.16, p);
        const fade = 1 - smoothstep(0.9, 1, p);
        block.userData.edge.material.opacity = lit * 0.7 * fade;
        block.material.emissiveIntensity = lit * 0.6 * fade;
        block.material.emissive = new THREE.Color(accent);
        block.rotation.y = time * 0.25 + block.userData.index;
        block.rotation.x = Math.sin(time * 0.3 + block.userData.index) * 0.15;
        block.scale.setScalar(0.6 + lit * 0.5);
      });

      loopLine.material.opacity = (0.1 + smoothstep(0.3, 0.8, p) * 0.16) * (1 - smoothstep(0.9, 1, p));
      group.rotation.y = Math.sin(time * 0.1) * 0.06;
    },
  });
}

/* ================================================================== */
/* CH 08 — THE WORLDS                                                  */
/* Three project islands you fly between. Each has its own sculpture;  */
/* leaving one scatters it, entering the next assembles it.            */
/* ================================================================== */

export function buildWorlds({ accent, tier }) {
  const group = new THREE.Group();
  const islandSpacing = 130;

  const islands = [];

  const islandDefs = [
    {
      hue: PROJECT_HUES.signal,
      build: buildDetectionSculpture,
      satellites: 6,
    },
    {
      hue: PROJECT_HUES.diary,
      build: buildSecuritySculpture,
      satellites: 4,
    },
    {
      hue: PROJECT_HUES.ledger,
      build: buildLedgerSculpture,
      satellites: 4,
    },
  ];

  islandDefs.forEach((def, i) => {
    const island = new THREE.Group();
    island.position.z = -i * islandSpacing;

    // Hexagonal plinth
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(17, 20, 1.8, 6),
      standard("#181425", { metalness: 0.55, roughness: 0.4 }),
    );
    plinth.position.y = -11;
    island.add(plinth);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(17.6, 0.14, 6, 6),
      accentMaterial(def.hue.primary, 0.8),
    );
    rim.rotation.x = -Math.PI / 2;
    rim.position.y = -10;
    island.add(rim);

    // Under-glow disc
    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(21, 48),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(def.hue.primary),
        transparent: true,
        opacity: 0.06,
        toneMapped: false,
      }),
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -10.2;
    island.add(glow);

    const sculpture = def.build(def.hue, tier);
    island.add(sculpture);

    // Satellites: the secondary systems, orbiting the island
    const satellites = [];
    const satCount = Math.round(def.satellites * (tier.particles >= 1 ? 1 : 0.6));
    for (let s = 0; s < satCount; s++) {
      const sat = new THREE.Mesh(
        new THREE.TetrahedronGeometry(0.85, 0),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(def.hue.secondary),
          emissive: new THREE.Color(def.hue.secondary),
          emissiveIntensity: 0.7,
          metalness: 0.4,
          roughness: 0.35,
          flatShading: true,
          toneMapped: false,
        }),
      );
      const a = (s / satCount) * Math.PI * 2;
      sat.userData = { a, r: 26 + (s % 3) * 5, y: -4 + (s % 4) * 5, speed: 0.12 + (s % 3) * 0.05 };
      island.add(sat);
      satellites.push(sat);
    }

    island.userData = { index: i, hue: def.hue, sculpture, satellites, plinth, rim, glow };
    islands.push(island);
    group.add(island);
  });

  return buildStation({
    group,
    spacing: islandSpacing,
    accent,
    update(_delta, time, p) {
      // p is 0..1 across the whole chapter; distribute across islands
      const segment = 1 / islands.length;
      islands.forEach((island) => {
        const i = island.userData.index;
        const local = (p - i * segment) / segment; // -? .. 1 within its own slot
        const enter = smoothstep(-0.25, 0.35, local);
        const leave = smoothstep(0.6, 1.05, local);

        island.scale.setScalar(lerp(0.35, 1, enter) * lerp(1, 0.4, leave));
        island.rotation.y = time * 0.06 + i * 0.8;
        island.position.y = Math.sin(time * 0.4 + i) * 1.2;

        island.userData.plinth.material.emissiveIntensity = enter * 0.1;
        island.userData.rim.material.emissiveIntensity = 0.4 + enter * 1.4;
        island.userData.glow.material.opacity = 0.03 + enter * 0.08;

        island.userData.satellites.forEach((sat) => {
          const a = sat.userData.a + time * sat.userData.speed;
          sat.position.set(
            Math.cos(a) * sat.userData.r,
            sat.userData.y + Math.sin(time * 0.7 + sat.userData.a) * 1.5,
            Math.sin(a) * sat.userData.r,
          );
          sat.rotation.x = time * 0.6;
          sat.rotation.y = time * 0.4;
          sat.scale.setScalar(0.3 + enter * 0.7);
        });

        island.userData.sculpture.update?.(time, enter, leave, local);
      });
    },
  });
}

/* --- Island 01: detection — a membrane with shards that orbit and
       scatter as you leave --- */
function buildDetectionSculpture(hue, tier) {
  const g = new THREE.Group();

  const membrane = new THREE.Mesh(
    new THREE.TorusGeometry(9, 0.28, 8, 96),
    accentMaterial(hue.primary, 1.2),
  );
  g.add(membrane);

  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(8.8, 64),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(hue.primary),
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide,
      toneMapped: false,
    }),
  );
  g.add(disc);

  const shardCount = Math.round(14 * (tier.particles >= 1 ? 1 : 0.6));
  const shards = [];
  for (let i = 0; i < shardCount; i++) {
    const shard = new THREE.Mesh(
      new THREE.TetrahedronGeometry(1.5, 0),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(hue.secondary),
        emissive: new THREE.Color(hue.secondary),
        emissiveIntensity: 0.8,
        metalness: 0.5,
        roughness: 0.3,
        flatShading: true,
        toneMapped: false,
      }),
    );
    shard.userData = {
      a: (i / shardCount) * Math.PI * 2,
      r: 12 + (i % 3) * 2.5,
      y: (i % 5) * 2.4 - 5,
      home: shard.position.clone(),
    };
    g.add(shard);
    shards.push(shard);
  }

  g.userData.update = (time, enter, leave) => {
    membrane.rotation.z = time * 0.12;
    membrane.rotation.x = Math.sin(time * 0.2) * 0.2;
    disc.material.opacity = 0.03 + enter * 0.06;
    shards.forEach((shard, i) => {
      const a = shard.userData.a + time * 0.16;
      const scatter = leave * 26;
      shard.position.set(
        Math.cos(a) * (shard.userData.r + scatter),
        shard.userData.y + Math.sin(time * 0.8 + i) * 1.2 + leave * 10,
        Math.sin(a) * (shard.userData.r + scatter) * 0.4,
      );
      shard.rotation.x = time * 0.7 + i;
      shard.rotation.y = time * 0.5;
      shard.scale.setScalar(enter * (1 - leave * 0.6));
    });
  };
  return g;
}

/* --- Island 02: security — nested shells that rotate against each
       other and open as you arrive --- */
function buildSecuritySculpture(hue, tier) {
  const g = new THREE.Group();
  const shells = [];
  const shellCount = tier.particles >= 1 ? 4 : 3;

  for (let i = 0; i < shellCount; i++) {
    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(4.4 + i * 2.6, 1),
      wireframe(i % 2 === 0 ? hue.primary : hue.secondary, 0.3),
    );
    shell.userData = { index: i, dir: i % 2 === 0 ? 1 : -1 };
    g.add(shell);
    shells.push(shell);
  }

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3.2, 0),
    accentMaterial(hue.primary, 1.1),
  );
  g.add(core);

  g.userData.update = (time, enter, leave) => {
    shells.forEach((shell, i) => {
      shell.rotation.y = time * (0.14 + i * 0.06) * shell.userData.dir;
      shell.rotation.x = time * 0.08 * shell.userData.dir;
      const open = lerp(1, 1.7, enter) * lerp(1, 0.5, leave);
      shell.scale.setScalar(open);
      shell.material.opacity = (0.14 + enter * 0.24) * (1 - leave * 0.7);
    });
    core.rotation.y = -time * 0.3;
    core.scale.setScalar(enter * (1 - leave * 0.5));
    core.material.emissiveIntensity = 0.6 + Math.sin(time * 2) * 0.3;
  };
  return g;
}

/* --- Island 03: ledger — stacked slabs that separate and re-stack --- */
function buildLedgerSculpture(hue, tier) {
  const g = new THREE.Group();
  const slabCount = tier.particles >= 1 ? 9 : 6;
  const slabs = [];

  for (let i = 0; i < slabCount; i++) {
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(13 - i * 0.6, 1.1, 9 - i * 0.4),
      standard(i % 3 === 0 ? hue.primary : "#1c1830", {
        metalness: 0.6,
        roughness: 0.3,
        emissive: hue.primary,
        emissiveIntensity: 0,
      }),
    );
    slab.position.y = -6 + i * 1.7;
    slab.userData = { index: i, homeY: slab.position.y };
    g.add(slab);
    slabs.push(slab);
  }

  g.userData.update = (time, enter, leave) => {
    slabs.forEach((slab, i) => {
      const delay = i * 0.045;
      const stack = smoothstep(delay, delay + 0.3, enter);
      const spread = leave * (i - slabCount / 2) * 3.4;
      slab.position.y = lerp(slab.userData.homeY - 16, slab.userData.homeY, stack) + spread * 0.2;
      slab.position.x = spread;
      slab.position.z = Math.sin(time * 0.5 + i * 0.4) * 0.6 * enter;
      slab.rotation.z = Math.sin(time * 0.3 + i) * 0.03;
      slab.material.emissiveIntensity = (i % 3 === 0 ? 0.7 : 0.12) * enter * (1 - leave * 0.8);
      slab.scale.setScalar(lerp(0.7, 1, stack) * lerp(1, 0.6, leave));
    });
    g.rotation.y = Math.sin(time * 0.15) * 0.12;
  };
  return g;
}

/* ================================================================== */
/* CH 09 — THE NEXT CHAPTER                                            */
/* A resolved dawn horizon. Almost nothing moves; the scene settles.  */
/* ================================================================== */

export function buildHorizon({ accent, tier }) {
  const group = new THREE.Group();

  // Ground plane
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(180, 96),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#15131f"),
      metalness: 0.2,
      roughness: 0.9,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -14;
  group.add(ground);

  // Horizon light disc
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(26, 96),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(accent),
      transparent: true,
      opacity: 0.1,
      toneMapped: false,
    }),
  );
  disc.position.set(0, -13.6, -120);
  group.add(disc);

  // Horizon line
  const line = new THREE.Mesh(
    new THREE.BoxGeometry(320, 0.4, 0.4),
    accentMaterial(accent, 0.9),
  );
  line.position.set(0, -13.8, -120);
  group.add(line);

  // Calm floating bars
  const bars = [];
  const barCount = Math.round(14 * (tier.particles >= 1 ? 1 : 0.6));
  for (let i = 0; i < barCount; i++) {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 6 + Math.random() * 22, 0.5),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(accent),
        transparent: true,
        opacity: 0.08 + Math.random() * 0.1,
        toneMapped: false,
      }),
    );
    bar.position.set(
      (Math.random() - 0.5) * 220,
      -12 + Math.random() * 60,
      -40 - Math.random() * 90,
    );
    bar.userData = { baseY: bar.position.y, phase: Math.random() * 6.28, speed: 0.2 + Math.random() * 0.3 };
    bars.push(bar);
    group.add(bar);
  }

  // A single slow-rising mote field — dust in dawn light
  const moteCount = Math.round(200 * tier.particles);
  const motePos = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    motePos[i * 3] = (Math.random() - 0.5) * 200;
    motePos[i * 3 + 1] = -12 + Math.random() * 70;
    motePos[i * 3 + 2] = -30 - Math.random() * 100;
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
  const moteSprite = makeSpriteTexture(48, "rgba(255,240,210,0.9)");
  const moteMat = new THREE.PointsMaterial({
    color: new THREE.Color(accent),
    size: 0.6,
    map: moteSprite,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const motes = new THREE.Points(moteGeo, moteMat);
  group.add(motes);

  return buildStation({
    group,
    spacing: 150,
    accent,
    update(_delta, time, p) {
      const settle = smoothstep(0, 0.6, p);
      disc.material.opacity = 0.05 + settle * 0.13;
      disc.scale.setScalar(0.8 + settle * 0.35);
      moteMat.opacity = settle * 0.4;

      bars.forEach((bar) => {
        bar.position.y = bar.userData.baseY + Math.sin(time * bar.userData.speed + bar.userData.phase) * 1.6;
        bar.material.opacity = (0.06 + settle * 0.1) * (0.6 + Math.sin(time * 0.4 + bar.userData.phase) * 0.4);
      });

      motes.position.y = ((time * 1.4) % 40) - 20;
      group.rotation.y = Math.sin(time * 0.05) * 0.03;
    },
    dispose() {
      moteSprite.dispose();
    },
  });
}

/* ------------------------------------------------------------------ */
/* Registry                                                           */
/* ------------------------------------------------------------------ */

export const STATION_BUILDERS = {
  arrival: buildArrival,
  person: buildPerson,
  research: buildResearch,
  path: buildPath,
  arena: buildArena,
  technical: buildTechnical,
  capabilities: buildCapabilities,
  worlds: buildWorlds,
  horizon: buildHorizon,
};
