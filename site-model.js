/* A small three.js model of a site, mounted under the sheet's SVG map.
 *
 *   <div class="site-map-3d" id="map-3d"></div>
 *   <script type="importmap">{ "imports": { "three": …, "three/addons/": … } }</script>
 *   <script src="site-model.js"></script>
 *   <script>mountSiteModel(document.getElementById("map-3d"), function (kit) { … });</script>
 *
 * This file is a classic script, not a module, so a sheet opened off a disk
 * still loads it (Chromium refuses a relative module import over file://).
 * three itself comes in by dynamic import through the sheet's import map.
 *
 * The build function gets a kit: THREE, scene, and helpers —
 *   lam(color, extra)          a MeshLambertMaterial
 *   glass(color, opacity)      the same, translucent, no depth write
 *   box(w, h, d, mat, x, y, z) a box mesh added to the scene
 *   disc(r, mat, x, y, z)      a horizontal circle
 *   tube(points, r, mat)       a tube along a Catmull-Rom curve through [x,y,z] points
 *   label(text, href, x, y, z, cls)  a floating link (CSS2D)
 *   cssVar(name, fallback)     a CSS custom property off <body>
 * and returns nothing, or { camera: [x,y,z], target: [x,y,z], maxDistance,
 * azimuth: [min, max] } to frame the scene.
 * The kit also carries the fullscreen button, orbit controls with a slow
 * auto-rotate until touched, resize, and a pause while scrolled out of view. */
(function () {
  "use strict";

  function cssVar(name, fallback) {
    var v = getComputedStyle(document.body).getPropertyValue(name).trim();
    return v || fallback;
  }

  function mount(host, build) {
    if (!host || typeof build !== "function") return;
    Promise.all([
      import("three"),
      import("three/addons/controls/OrbitControls.js"),
      import("three/addons/renderers/CSS2DRenderer.js"),
    ]).then(function (mods) {
      start(host, build, mods[0], mods[1].OrbitControls, mods[2].CSS2DRenderer, mods[2].CSS2DObject);
    }).catch(function (e) {
      host.classList.add("map3d-failed");
      if (window.console) console.warn("site model:", e);
    });
  }

  function start(host, build, THREE, OrbitControls, CSS2DRenderer, CSS2DObject) {
    var BG = new THREE.Color(cssVar("--bg-elev", "#1c1a1a"));
    var scene = new THREE.Scene();
    scene.background = BG;
    scene.fog = new THREE.Fog(BG, 70, 150);

    var camera = new THREE.PerspectiveCamera(40, 4 / 3, 0.1, 400);
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    host.appendChild(renderer.domElement);

    var labels = new CSS2DRenderer();
    labels.domElement.className = "map3d-labels";
    host.appendChild(labels.domElement);

    if (host.requestFullscreen) {
      var full = document.createElement("button");
      full.type = "button";
      full.className = "map3d-full";
      full.title = "Full screen";
      full.setAttribute("aria-label", "Full screen");
      full.innerHTML =
        '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<path class="ico-open" d="M3 8V3h5M12 3h5v5M17 12v5h-5M8 17H3v-5"/>' +
        '<path class="ico-close" d="M8 3v5H3M17 8h-5V3M12 17v-5h5M3 12h5v5"/></svg>';
      full.addEventListener("click", function () {
        if (document.fullscreenElement === host) document.exitFullscreen();
        else host.requestFullscreen();
      });
      host.appendChild(full);
    }

    var controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 14;
    controls.maxDistance = 110;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.autoRotate = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    controls.autoRotateSpeed = 0.5;
    controls.addEventListener("start", function () { controls.autoRotate = false; });

    scene.add(new THREE.HemisphereLight(0xb9c4a6, 0x1c1612, 1.7));
    var sun = new THREE.DirectionalLight(0xe6d8bd, 1.9);
    sun.position.set(24, 34, 14);
    scene.add(sun);

    function lam(color, extra) {
      return new THREE.MeshLambertMaterial(Object.assign({ color: color }, extra || {}));
    }
    function glass(color, opacity) {
      return lam(color, { transparent: true, opacity: opacity, depthWrite: false });
    }
    function box(w, h, d, mat, x, y, z) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      scene.add(m);
      return m;
    }
    function disc(r, mat, x, y, z) {
      var m = new THREE.Mesh(new THREE.CircleGeometry(r, 32), mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, y, z);
      scene.add(m);
      return m;
    }
    function tube(points, r, mat) {
      var curve = new THREE.CatmullRomCurve3(points.map(function (p) {
        return new THREE.Vector3(p[0], p[1], p[2]);
      }));
      var m = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, r, 8, false), mat);
      scene.add(m);
      return m;
    }
    function label(text, href, x, y, z, cls) {
      var a = document.createElement("a");
      a.className = "map3d-label" + (cls ? " " + cls : "");
      a.href = href;
      a.textContent = text;
      var o = new CSS2DObject(a);
      o.position.set(x, y, z);
      scene.add(o);
      return o;
    }

    var frame = build({
      THREE: THREE, scene: scene, cssVar: cssVar,
      lam: lam, glass: glass, box: box, disc: disc, tube: tube, label: label,
    }) || {};
    var cam = frame.camera || [22, 17, 31];
    var tgt = frame.target || [0, 4, 0];
    camera.position.set(cam[0], cam[1], cam[2]);
    controls.target.set(tgt[0], tgt[1], tgt[2]);
    if (frame.maxDistance) controls.maxDistance = frame.maxDistance;
    if (frame.azimuth) {
      // A site with a front (a cliff face) keeps the camera in front of it,
      // and does not turn on its own — it would only stall at the edge.
      controls.minAzimuthAngle = frame.azimuth[0];
      controls.maxAzimuthAngle = frame.azimuth[1];
      controls.autoRotate = false;
    }

    function size() {
      var w = host.clientWidth || 300, h = host.clientHeight || Math.round(w * 0.75);
      renderer.setSize(w, h, false);
      labels.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    size();
    if (typeof ResizeObserver === "function") new ResizeObserver(size).observe(host);
    else window.addEventListener("resize", size);

    var shown = true;
    if (typeof IntersectionObserver === "function") {
      new IntersectionObserver(function (es) { shown = es[0].isIntersecting; }).observe(host);
    }
    renderer.setAnimationLoop(function () {
      if (!shown) return;
      controls.update();
      renderer.render(scene, camera);
      labels.render(scene, camera);
    });
  }

  window.mountSiteModel = mount;
})();
