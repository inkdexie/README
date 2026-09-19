window.MWScene = (() => {
  let scene, camera, renderer, controls, clock;
  let itemsGroup, rightHand;
  let heldItem = null;
  let itemsData = [];
  let onPick = null;
  let highlighted = null;
  let flameMesh = null;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const mat = (color, extra) => new THREE.MeshStandardMaterial(Object.assign({ color: color }, extra || {}));

  function makeTnt() {
    return new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), mat(0xc0392b));
  }

  function makeSword() {
    const g = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.0, 0.06),
      mat(0x4aedd9, { emissive: 0x1a6b62, emissiveIntensity: 0.4 }));
    blade.position.y = 0.55;
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.1), mat(0x3f3f3f));
    guard.position.y = 0.02;
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.32, 0.12), mat(0x6b4a2a));
    handle.position.y = -0.18;
    g.add(blade, guard, handle);
    return g;
  }

  function makeTorch() {
    const g = new THREE.Group();
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 12), mat(0x7a5230));
    stick.position.y = 0.35;
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffb52e }));
    flame.name = 'flame';
    flame.position.y = 0.8;
    const fire = new THREE.PointLight(0xff9933, 1.0, 4);
    fire.position.y = 0.85;
    g.add(stick, flame, fire);
    return g;
  }

  function makeApple() {
    return new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 32),
      mat(0xf2c14e, { metalness: 0.7, roughness: 0.3 }));
  }

  const makers = { tnt: makeTnt, sword: makeSword, torch: makeTorch, apple: makeApple };
  const grips = {
    tnt: new THREE.Vector3(0, 0, 0),
    sword: new THREE.Vector3(0, -0.05, 0),
    torch: new THREE.Vector3(0, 0.1, 0),
    apple: new THREE.Vector3(0, 0, 0)
  };

  function makeSteve() {
    const steve = new THREE.Group();

    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.36, 1.2, 0.4), mat(0x3b3f9e));
    legL.position.set(-0.2, 0.6, 0);
    const legR = legL.clone();
    legR.position.x = 0.2;

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.4), mat(0x00afaf));
    body.position.set(0, 1.8, 0);

    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.1, 0.4), mat(0x00afaf));
    armL.position.set(0.56, 1.85, 0);

    rightHand = new THREE.Group();
    rightHand.position.set(-0.56, 2.2, 0);
    rightHand.rotation.x = -Math.PI / 2;
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.1, 0.4), mat(0x00afaf));
    armR.position.y = -0.35;
    rightHand.add(armR);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), mat(0xc68642));
    head.position.set(0, 2.8, 0);
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.22, 0.84), mat(0x4a3218));
    hair.position.set(0, 3.1, 0);

    steve.add(legL, legR, body, armL, rightHand, head, hair);
    return steve;
  }

  function getAllMeshes(obj) {
    const list = [];
    obj.traverse(o => { if (o.isMesh) list.push(o); });
    return list;
  }

  function setHighlight(obj, on) {
    getAllMeshes(obj).forEach(m => {
      if (!m.material || !m.material.emissive) return;
      if (on) {
        if (m.userData._origEmissive === undefined) {
          m.userData._origEmissive = m.material.emissiveIntensity || 0;
          m.userData._origEmissiveColor = m.material.emissive.getHex();
        }
        m.material.emissive.copy(m.material.color);
        m.material.emissiveIntensity = m.userData._origEmissive + 1.0;
      } else if (m.userData._origEmissiveColor !== undefined) {
        m.material.emissive.setHex(m.userData._origEmissiveColor);
        m.material.emissiveIntensity = m.userData._origEmissive;
      }
    });
  }

  function setHeld(index) {
    if (!rightHand) return;
    if (heldItem) {
      rightHand.remove(heldItem);
      heldItem = null;
    }
    const item = itemsData[index];
    if (!item) return;
    const s = 0.55;
    const wrap = new THREE.Group();
    const obj = makers[item.id]();
    obj.position.copy(grips[item.id]).multiplyScalar(-s);
    obj.scale.setScalar(s);
    wrap.add(obj);
    wrap.position.set(0, -0.95, 0.08);
    wrap.rotation.x = Math.PI / 2;
    heldItem = wrap;
    rightHand.add(wrap);
  }

  function init(data, pickCallback) {
    itemsData = data;
    onPick = pickCallback;
    const container = document.querySelector('#stage');
    const w = container.clientWidth;
    const h = container.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 12, 28);

    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0.4, 3.6, 10.2);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.querySelector('.mw-placeholder').style.display = 'none';
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(-0.6, 1.6, 0);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.minDistance = 3;
    controls.maxDistance = 20;

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(4, 8, 5);
    scene.add(dir);

    const dirt = new THREE.Mesh(new THREE.BoxGeometry(14, 0.8, 14), mat(0x8b5a2b));
    dirt.position.y = -0.4;
    const grass = new THREE.Mesh(new THREE.BoxGeometry(14, 0.25, 14), mat(0x5d9c3c));
    grass.position.y = 0.125;
    scene.add(dirt, grass);

    const steve = makeSteve();
    steve.position.set(-3.2, 0, 0);
    steve.rotation.y = Math.PI / 2;
    scene.add(steve);

    itemsGroup = new THREE.Group();
    itemsGroup.position.set(2, 0, 0);
    scene.add(itemsGroup);

    data.forEach((item, i) => {
      const angle = (i / data.length) * Math.PI * 2 + Math.PI / 4;
      const obj = makers[item.id]();
      obj.position.set(Math.cos(angle) * 1.7, 0.7, Math.sin(angle) * 1.7);
      obj.lookAt(itemsGroup.position.x, obj.position.y, itemsGroup.position.z);
      obj.userData.index = i;
      if (item.id === 'torch') flameMesh = obj.getObjectByName('flame');
      itemsGroup.add(obj);
    });

    setHeld(0);

    let downX = 0, downY = 0;
    renderer.domElement.addEventListener('mousedown', e => {
      downX = e.clientX;
      downY = e.clientY;
    });
    renderer.domElement.addEventListener('mouseup', e => {
      if (Math.abs(e.clientX - downX) > 5 || Math.abs(e.clientY - downY) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(itemsGroup.children, true);
      if (hits.length > 0) {
        let target = hits[0].object;
        while (target.parent && target.parent !== itemsGroup) target = target.parent;
        if (highlighted && highlighted !== target) setHighlight(highlighted, false);
        highlighted = target;
        setHighlight(target, true);
        if (onPick) onPick(target.userData.index);
      }
    });

    window.addEventListener('resize', () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });

    clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      itemsGroup.rotation.y += 0.004;
      if (flameMesh) {
        const s = 1 + Math.sin(t * 8) * 0.15;
        flameMesh.scale.set(s, s, s);
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
  }

  return { init: init, setHeld: setHeld };
})();
