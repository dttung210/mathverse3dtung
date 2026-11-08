import * as THREE from '/mathverse3dtung/vendor/three.module.js?v=r107_v15';

/**
 * MATHVERSE BIG UPDATE — CHIBI 3D CARTOON AVATAR SYSTEM (R107+)
 * Tái cấu trúc toàn bộ 5 nhân vật chính (Alex, Triết, An, Bot Pi, Sư Học Bá + Trạng Lường)
 * về tỷ lệ Chibi 3D Cartoon hoạt hình đáng yêu (đầu tròn lớn ~1:2.2, mắt to long lanh 2 tầng phản quang,
 * má hồng blush, thân và tay chân bo tròn mềm mại, nhịp nhún nhảy hoạt hình mượt mà).
 * Giữ nguyên 100% API tương thích với toàn bộ hệ thống R75, Museum, Discovery và Wonder Park.
 */
export function createAvatar(initialType = 'alex') {
  const root = new THREE.Group();
  root.name = 'CHIBI_CARTOON_AVATAR_ROOT';
  const modelHolder = new THREE.Group();
  root.add(modelHolder);

  let currentType = initialType;
  let animParts = {
    leftLeg: null,
    rightLeg: null,
    leftArm: null,
    rightArm: null,
    head: null,
    body: null,
    halo: null,
    extras: []
  };
  let walkCycle = 0;

  const mat = (color, rough = 0.42, metal = 0.08, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });

  const skinMat = mat(0xffe0c8, 0.48, 0.02);
  const blushMat = new THREE.MeshBasicMaterial({ color: 0xff8da1, transparent: true, opacity: 0.65 });
  const eyeDarkMat = mat(0x131b2e, 0.15, 0.1);
  const eyeShineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const goldMat = mat(0xfbbf24, 0.25, 0.72, { emissive: 0x451a03, emissiveIntensity: 0.18 });
  const whiteMat = mat(0xf8fafc, 0.35, 0.05);
  const darkSoleMat = mat(0x1e293b, 0.6, 0.1);

  // Bộ phận cơ sở Chibi: chân ngắn mũm mĩm + giày sneaker/ài bo tròn to bản
  function createChibiLeg(pantsColor, shoeColor, soleColor = 0xffffff) {
    const legGroup = new THREE.Group();
    const pMat = mat(pantsColor, 0.5, 0.06);
    const sMat = mat(shoeColor, 0.38, 0.12);
    const slMat = mat(soleColor, 0.45, 0.05);

    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.102, 0.42, 18), pMat);
    thigh.position.y = -0.20;
    thigh.castShadow = true;
    legGroup.add(thigh);

    // Giày Chibi bo tròn to bản
    const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.145, 18, 14), sMat);
    shoe.scale.set(0.95, 0.68, 1.38);
    shoe.position.set(0, -0.42, 0.045);
    shoe.castShadow = true;
    legGroup.add(shoe);

    const sole = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.142, 0.055, 18), slMat);
    sole.scale.set(0.96, 1, 1.38);
    sole.position.set(0, -0.47, 0.045);
    legGroup.add(sole);

    return legGroup;
  }

  // Tay Chibi mũm mĩm + bàn tay tròn
  function createChibiArm(sleeveColor, handMat = skinMat, cuffColor = null) {
    const armGroup = new THREE.Group();
    const sMat = mat(sleeveColor, 0.46, 0.06);
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.092, 0.084, 0.38, 16), sMat);
    upper.position.y = -0.17;
    upper.castShadow = true;
    armGroup.add(upper);

    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 12), sMat);
    shoulder.position.y = -0.01;
    armGroup.add(shoulder);

    if (cuffColor !== null) {
      const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.086, 0.022, 10, 18), mat(cuffColor, 0.4, 0.1));
      cuff.rotation.x = Math.PI / 2;
      cuff.position.y = -0.34;
      armGroup.add(cuff);
    }

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.096, 16, 14), handMat);
    hand.position.y = -0.39;
    hand.castShadow = true;
    armGroup.add(hand);

    return armGroup;
  }

  // Đầu Chibi 3D Cartoon chuẩn: Đầu tròn lớn, mắt Anime/Cartoon long lanh 2 đốm sáng, má hồng, miệng cười, tai tròn
  function createChibiHead({
    skin = skinMat,
    irisColor = 0x2563eb,
    browColor = 0x1e293b,
    happyEyes = false,
    glasses = false
  } = {}) {
    const head = new THREE.Group();
    head.position.y = 1.44;

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.41, 28, 22), skin);
    skull.scale.set(1.06, 0.98, 1.02);
    skull.castShadow = true;
    head.add(skull);

    // Đôi tai tròn Chibi
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.088, 14, 12), skin);
      ear.scale.set(0.55, 0.95, 0.75);
      ear.position.set(s * 0.42, -0.02, 0.02);
      head.add(ear);

      // Má hồng Chibi
      const blush = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 10), blushMat);
      blush.scale.set(1.35, 0.65, 0.32);
      blush.position.set(s * 0.24, -0.09, 0.365);
      head.add(blush);

      // Lông mày biểu cảm
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.024, 0.025), mat(browColor, 0.4, 0.05));
      brow.position.set(s * 0.165, 0.135, 0.385);
      brow.rotation.z = s * -0.10;
      head.add(brow);
    }

    const irisMat = new THREE.MeshBasicMaterial({ color: irisColor });
    for (const s of [-1, 1]) {
      if (happyEyes) {
        // Mắt cười híp hình cung tròn kèm mắt long lanh bên dưới
        const eyeBase = new THREE.Mesh(new THREE.SphereGeometry(0.064, 16, 14), eyeDarkMat);
        eyeBase.scale.set(0.95, 1.18, 0.42);
        eyeBase.position.set(s * 0.16, 0.015, 0.382);
        head.add(eyeBase);

        const shineBig = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), eyeShineMat);
        shineBig.position.set(s * 0.142, 0.042, 0.408);
        head.add(shineBig);

        const shineSmall = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), irisMat);
        shineSmall.position.set(s * 0.18, -0.015, 0.406);
        head.add(shineSmall);
      } else {
        // Mắt to tròn Chibi Anime 3 lớp (Tròng đen + Iris màu + 2 đốm sáng trắng)
        const eyeOuter = new THREE.Mesh(new THREE.SphereGeometry(0.068, 18, 14), eyeDarkMat);
        eyeOuter.scale.set(0.95, 1.24, 0.44);
        eyeOuter.position.set(s * 0.162, 0.015, 0.382);
        head.add(eyeOuter);

        const iris = new THREE.Mesh(new THREE.SphereGeometry(0.046, 14, 12), irisMat);
        iris.scale.set(0.95, 1.15, 0.38);
        iris.position.set(s * 0.162, 0.005, 0.402);
        head.add(iris);

        const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), eyeShineMat);
        shine1.position.set(s * 0.142, 0.045, 0.412);
        head.add(shine1);

        const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), eyeShineMat);
        shine2.position.set(s * 0.182, -0.025, 0.410);
        head.add(shine2);
      }
    }

    // Mũi nhỏ & Miệng cười tươi Chibi
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), skin);
    nose.position.set(0, -0.035, 0.418);
    head.add(nose);

    const smile = new THREE.Mesh(
      new THREE.TorusGeometry(0.056, 0.013, 10, 20, Math.PI),
      mat(0xd946ef, 0.3, 0.05, { color: 0xc2410c })
    );
    smile.rotation.x = Math.PI;
    smile.position.set(0, -0.105, 0.392);
    head.add(smile);

    // Kính gọng tròn vàng Chibi (nếu bật)
    if (glasses) {
      const glassGroup = new THREE.Group();
      for (const s of [-1, 1]) {
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.013, 12, 28), goldMat);
        rim.position.set(s * 0.165, 0.018, 0.415);
        glassGroup.add(rim);
      }
      const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.14, 8), goldMat);
      bridge.rotation.z = Math.PI / 2;
      bridge.position.set(0, 0.025, 0.415);
      glassGroup.add(bridge);
      head.add(glassGroup);
    }

    return head;
  }

  // Bóng đổ mềm dưới chân nhân vật
  function addGroundShadow(g) {
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.42, 28),
      new THREE.MeshBasicMaterial({ color: 0x091526, transparent: true, opacity: 0.28, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.015;
    g.add(shadow);
  }

  // ============================================================================
  // 1. THẦY TÙNG (CHIBI GIẢNG VIÊN TOÁN HỌC — Vest Navy, Cà vạt Đỏ, Kính Vàng, Mũ Cử Nhân)
  // ============================================================================
  function buildAlex() {
    const g = new THREE.Group();
    addGroundShadow(g);

    const body = new THREE.Group();
    body.position.y = 0.80;

    // Thân áo vest Chibi bo tròn
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.33, 0.56, 22), mat(0x1e3a8a, 0.42, 0.12));
    torso.castShadow = true;
    body.add(torso);

    const hip = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 14), mat(0x172554, 0.5, 0.08));
    hip.scale.set(1, 0.45, 0.92);
    hip.position.y = -0.26;
    body.add(hip);

    // Sơ mi trắng + Cà vạt đỏ ruby + Kẹp cà vạt vàng
    const shirtV = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.06, 0.36, 16), whiteMat);
    shirtV.scale.set(1, 1, 0.4);
    shirtV.position.set(0, 0.08, 0.255);
    body.add(shirtV);

    const tie = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.32, 4), mat(0xe11d48, 0.32, 0.15));
    tie.rotation.x = Math.PI;
    tie.rotation.y = Math.PI / 4;
    tie.position.set(0, 0.02, 0.305);
    body.add(tie);

    const tieClip = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.03), goldMat);
    tieClip.position.set(0, 0.03, 0.325);
    body.add(tieClip);

    // Huy hiệu Toán học vàng trên ngực trái
    const badge = new THREE.Mesh(new THREE.OctahedronGeometry(0.048, 0), goldMat);
    badge.position.set(0.14, 0.12, 0.285);
    body.add(badge);
    g.add(body);

    const head = createChibiHead({ irisColor: 0x0284c7, browColor: 0x3b2314, glasses: true });
    // Tóc Chibi nâu đậm bồng bềnh
    const hairMat = mat(0x2c1b12, 0.45, 0.08);
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.43, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.58), hairMat);
    hairCap.scale.set(1.07, 1.02, 1.05);
    hairCap.position.y = 0.03;
    head.add(hairCap);

    for (let i = -2; i <= 2; i++) {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.22, 10), hairMat);
      tuft.position.set(i * 0.095, 0.22, 0.35 - Math.abs(i) * 0.03);
      tuft.rotation.x = 0.45;
      tuft.rotation.z = -i * 0.15;
      head.add(tuft);
    }

    // Mũ cử nhân học thuật Chibi (Academic Mortarboard) trên đỉnh đầu
    const capGroup = new THREE.Group();
    capGroup.position.set(0, 0.40, -0.02);
    capGroup.rotation.z = -0.06;
    const capBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.10, 20), mat(0x172554, 0.35, 0.15));
    capGroup.add(capBase);
    const capBoard = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.035, 0.68), mat(0x1e3a8a, 0.3, 0.2));
    capBoard.position.y = 0.06;
    capBoard.rotation.y = Math.PI / 4;
    capGroup.add(capBoard);
    const tasselBtn = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), goldMat);
    tasselBtn.position.y = 0.085;
    capGroup.add(tasselBtn);
    const tasselCord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.24, 8), goldMat);
    tasselCord.position.set(0.28, -0.02, 0.12);
    tasselCord.rotation.z = -0.35;
    capGroup.add(tasselCord);
    head.add(capGroup);
    g.add(head);

    const leftLeg = createChibiLeg(0x172554, 0x451a03, 0xf8fafc);
    leftLeg.position.set(-0.145, 0.50, 0);
    const rightLeg = createChibiLeg(0x172554, 0x451a03, 0xf8fafc);
    rightLeg.position.set(0.145, 0.50, 0);
    g.add(leftLeg, rightLeg);

    const leftArm = createChibiArm(0x1e3a8a, skinMat, 0xffffff);
    leftArm.position.set(-0.34, 1.02, 0);
    const rightArm = createChibiArm(0x1e3a8a, skinMat, 0xffffff);
    rightArm.position.set(0.34, 1.02, 0);
    g.add(leftArm, rightArm);

    animParts = { leftLeg, rightLeg, leftArm, rightArm, head, body, halo: null, extras: [badge] };
    return g;
  }

  // ============================================================================
  // 2. MINH TRIẾT (CHIBI NAM SINH NĂNG ĐỘNG — Hoodie Cyan, Tai Nghe LED, Ba Lô)
  // ============================================================================
  function buildTriet() {
    const g = new THREE.Group();
    addGroundShadow(g);

    const body = new THREE.Group();
    body.position.y = 0.80;

    const hoodieMat = mat(0x0284c7, 0.38, 0.08);
    const accentCyan = mat(0x38bdf8, 0.25, 0.2, { emissive: 0x0284c7, emissiveIntensity: 0.25 });

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.34, 0.56, 22), hoodieMat);
    torso.castShadow = true;
    body.add(torso);

    // Gấu áo hoodie trắng-xanh + túi trước bụng
    const hem = new THREE.Mesh(new THREE.TorusGeometry(0.325, 0.038, 12, 24), whiteMat);
    hem.rotation.x = Math.PI / 2;
    hem.position.y = -0.25;
    body.add(hem);

    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.08), accentCyan);
    pocket.position.set(0, -0.08, 0.295);
    body.add(pocket);

    // Dây rút áo hoodie
    for (const s of [-1, 1]) {
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 8), whiteMat);
      cord.position.set(s * 0.07, 0.15, 0.29);
      body.add(cord);
    }

    // Tai nghe Chibi Neon đeo quanh cổ
    const neckPhone = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.036, 12, 24), mat(0x0f172a, 0.3, 0.4));
    neckPhone.rotation.x = Math.PI / 2;
    neckPhone.position.y = 0.27;
    body.add(neckPhone);
    for (const s of [-1, 1]) {
      const earCup = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.045, 16), accentCyan);
      earCup.rotation.z = Math.PI / 2;
      earCup.position.set(s * 0.22, 0.27, 0.12);
      body.add(earCup);
    }

    // Ba lô học sinh Chibi tròn trịa sau lưng
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.40, 0.20), mat(0xf59e0b, 0.4, 0.12));
    pack.position.set(0, 0.02, -0.34);
    pack.castShadow = true;
    body.add(pack);
    const packFlap = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 12), mat(0xfbbf24, 0.35, 0.15));
    packFlap.scale.set(1.0, 0.55, 0.55);
    packFlap.position.set(0, 0.18, -0.34);
    body.add(packFlap);

    g.add(body);

    const head = createChibiHead({ irisColor: 0x0ea5e9, browColor: 0x0f172a });
    const hairMat = mat(0x0f172a, 0.38, 0.12);
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.435, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.58), hairMat);
    hairCap.scale.set(1.08, 1.04, 1.06);
    hairCap.position.y = 0.03;
    head.add(hairCap);

    // Tóc spiky hoạt hình năng động
    for (let i = -3; i <= 3; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.26, 10), hairMat);
      spike.position.set(i * 0.085, 0.26 + (i % 2 === 0 ? 0.04 : 0), 0.32 - Math.abs(i) * 0.035);
      spike.rotation.x = 0.35;
      spike.rotation.z = -i * 0.22;
      head.add(spike);
    }
    g.add(head);

    const leftLeg = createChibiLeg(0x1e293b, 0x0284c7, 0xffffff);
    leftLeg.position.set(-0.145, 0.50, 0);
    const rightLeg = createChibiLeg(0x1e293b, 0x0284c7, 0xffffff);
    rightLeg.position.set(0.145, 0.50, 0);
    g.add(leftLeg, rightLeg);

    const leftArm = createChibiArm(0x0284c7, skinMat, 0xffffff);
    leftArm.position.set(-0.35, 1.02, 0);
    const rightArm = createChibiArm(0x0284c7, skinMat, 0xffffff);
    rightArm.position.set(0.35, 1.02, 0);
    g.add(leftArm, rightArm);

    animParts = { leftLeg, rightLeg, leftArm, rightArm, head, body, halo: null, extras: [] };
    return g;
  }

  // ============================================================================
  // 3. TUỆ AN (CHIBI NỮ SINH THÔNG THÁI — Tóc Đôi Đính Nơ Hồng, Áo Gile Ruby, Ba Lô Pha Lê)
  // ============================================================================
  function buildAn() {
    const g = new THREE.Group();
    addGroundShadow(g);

    const body = new THREE.Group();
    body.position.y = 0.80;

    // Áo gile len đỏ ruby phối cổ sơ mi trắng
    const vest = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.30, 0.44, 22), mat(0xbe123c, 0.42, 0.08));
    vest.position.y = 0.06;
    vest.castShadow = true;
    body.add(vest);

    // Chân váy xếp ly Chibi xòe tròn
    const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.39, 0.30, 24), mat(0x1e293b, 0.48, 0.08));
    skirt.position.y = -0.18;
    skirt.castShadow = true;
    body.add(skirt);

    const skirtStripe = new THREE.Mesh(new THREE.TorusGeometry(0.365, 0.016, 10, 26), mat(0xfda4af, 0.35, 0.1));
    skirtStripe.rotation.x = Math.PI / 2;
    skirtStripe.position.y = -0.28;
    body.add(skirtStripe);

    // Nơ cổ hồng xinh xắn
    const ribbonMat = mat(0xf43f5e, 0.32, 0.12);
    for (const s of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 12), ribbonMat);
      wing.rotation.z = s * Math.PI / 2;
      wing.position.set(s * 0.05, 0.21, 0.26);
      body.add(wing);
    }
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), goldMat);
    knot.position.set(0, 0.21, 0.275);
    body.add(knot);

    // Ba lô Pha Lê Hình Học Đa Diện sau lưng
    const crystalPack = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.21, 0),
      mat(0xf472b6, 0.18, 0.35, { emissive: 0xdb2777, emissiveIntensity: 0.25 })
    );
    crystalPack.position.set(0, 0.05, -0.34);
    body.add(crystalPack);
    g.add(body);

    const head = createChibiHead({ irisColor: 0x9333ea, browColor: 0x451a03 });
    const hairMat = mat(0x451a03, 0.42, 0.08);
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.435, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.60), hairMat);
    hairCap.scale.set(1.08, 1.03, 1.06);
    hairCap.position.y = 0.03;
    head.add(hairCap);

    // Tóc mái bằng Chibi dễ thương
    const bangs = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 12), hairMat);
    bangs.scale.set(1.15, 0.42, 0.52);
    bangs.position.set(0, 0.22, 0.28);
    head.add(bangs);

    // Tóc buộc 2 chùm (Twin-tails) + Nơ hồng hai bên
    for (const s of [-1, 1]) {
      const tail = new THREE.Mesh(new THREE.SphereGeometry(0.165, 16, 14), hairMat);
      tail.scale.set(0.85, 1.35, 0.85);
      tail.position.set(s * 0.46, 0.04, -0.05);
      tail.rotation.z = s * -0.32;
      head.add(tail);

      const bow = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), ribbonMat);
      bow.scale.set(1.3, 0.75, 0.75);
      bow.position.set(s * 0.39, 0.18, 0.02);
      head.add(bow);
    }
    g.add(head);

    const leftLeg = createChibiLeg(0xf8fafc, 0xbe123c, 0xffffff);
    leftLeg.position.set(-0.135, 0.50, 0);
    const rightLeg = createChibiLeg(0xf8fafc, 0xbe123c, 0xffffff);
    rightLeg.position.set(0.135, 0.50, 0);
    g.add(leftLeg, rightLeg);

    const leftArm = createChibiArm(0xf8fafc, skinMat, 0xbe123c);
    leftArm.position.set(-0.33, 1.02, 0);
    const rightArm = createChibiArm(0xf8fafc, skinMat, 0xbe123c);
    rightArm.position.set(0.33, 1.02, 0);
    g.add(leftArm, rightArm);

    animParts = { leftLeg, rightLeg, leftArm, rightArm, head, body, halo: null, extras: [crystalPack] };
    return g;
  }

  // ============================================================================
  // 4. BOT PI (CHIBI ROBOT SCI-FI ĐÁNG YÊU — Visor LED Mắt Cười Cyan, Vòng Quỹ Đạo Vàng)
  // ============================================================================
  function buildBot() {
    const g = new THREE.Group();
    addGroundShadow(g);

    const shellWhite = mat(0xf8fafc, 0.22, 0.35);
    const darkMetal = mat(0x0f172a, 0.25, 0.65);
    const neonCyan = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const neonPink = new THREE.MeshBasicMaterial({ color: 0xf472b6 });

    const body = new THREE.Group();
    body.position.y = 0.80;

    // Thân Robot Chibi tròn bầu bĩnh như Astro/Baymax
    const torso = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 20), shellWhite);
    torso.scale.set(1.02, 1.08, 0.92);
    torso.castShadow = true;
    body.add(torso);

    // Lõi năng lượng Toán học phát sáng trước ngực
    const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 12, 24), goldMat);
    coreRing.position.set(0, 0.05, 0.305);
    body.add(coreRing);
    const coreGem = new THREE.Mesh(new THREE.CircleGeometry(0.095, 24), neonCyan);
    coreGem.position.set(0, 0.05, 0.312);
    body.add(coreGem);

    // Vòng quỹ đạo vàng lơ lửng sau lưng
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.024, 14, 40), goldMat);
    halo.position.set(0, 0.16, -0.18);
    body.add(halo);
    g.add(body);

    // Đầu Robot Chibi lớn bo tròn
    const head = new THREE.Group();
    head.position.y = 1.46;

    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 22), shellWhite);
    helmet.scale.set(1.10, 0.96, 1.00);
    helmet.castShadow = true;
    head.add(helmet);

    // Mặt kính Visor đen bóng
    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 18), darkMetal);
    visor.scale.set(1.04, 0.72, 0.55);
    visor.position.set(0, 0.01, 0.24);
    head.add(visor);

    // Đôi mắt LED Cyan cười rạng rỡ + Má hồng LED
    for (const s of [-1, 1]) {
      const ledEye = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.018, 10, 20, Math.PI), neonCyan);
      ledEye.position.set(s * 0.145, 0.02, 0.428);
      head.add(ledEye);

      const ledSpark = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), eyeShineMat);
      ledSpark.position.set(s * 0.12, 0.065, 0.435);
      head.add(ledSpark);

      const ledBlush = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 8), neonPink);
      ledBlush.scale.set(1.3, 0.6, 0.3);
      ledBlush.position.set(s * 0.23, -0.055, 0.415);
      head.add(ledBlush);

      // Tai nghe Robot hai bên
      const earPod = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 18), goldMat);
      earPod.rotation.z = Math.PI / 2;
      earPod.position.set(s * 0.46, 0.01, 0);
      head.add(earPod);
    }

    // Ăng-ten quả cầu vàng phát sáng trên đỉnh đầu
    const antStem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.025, 0.18, 10), goldMat);
    antStem.position.set(0, 0.46, 0);
    head.add(antStem);
    const antOrb = new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 12), neonCyan);
    antOrb.position.set(0, 0.57, 0);
    head.add(antOrb);
    g.add(head);

    const leftLeg = createChibiLeg(0xe2e8f0, 0x0284c7, 0x38bdf8);
    leftLeg.position.set(-0.145, 0.50, 0);
    const rightLeg = createChibiLeg(0xe2e8f0, 0x0284c7, 0x38bdf8);
    rightLeg.position.set(0.145, 0.50, 0);
    g.add(leftLeg, rightLeg);

    const leftArm = createChibiArm(0xf8fafc, goldMat, 0x38bdf8);
    leftArm.position.set(-0.36, 1.02, 0);
    const rightArm = createChibiArm(0xf8fafc, goldMat, 0x38bdf8);
    rightArm.position.set(0.36, 1.02, 0);
    g.add(leftArm, rightArm);

    animParts = { leftLeg, rightLeg, leftArm, rightArm, head, body, halo, extras: [antOrb] };
    return g;
  }

  // ============================================================================
  // 5. SƯ HỌC BÁ (SƯ CHÙA ĐẦU TRỌC CHIBI 3D — Tiểu Hòa Thượng Đầu Trọc Bóng Tròn,
  //    6 Chấm Giới Hương, Tai To Phúc Hậu, Áo Cà Sa Cam Nghệ, Tràng Hạt Bồ Đề, Tích Trượng)
  // ============================================================================
  function buildSuHocBa() {
    const g = new THREE.Group();
    addGroundShadow(g);

    const monkSkinMat = mat(0xffe2ca, 0.26, 0.04); // Da đầu trọc nhẵn bóng hồng hào
    const innerRobeMat = mat(0xfde68a, 0.46, 0.04); // Áo vạt hò vàng nhạt bên trong
    const saffronMat = mat(0xf59e0b, 0.42, 0.06);   // Áo tràng vàng cam nhà Phật
    const kasayaMat = mat(0xd9480f, 0.38, 0.08);    // Y cà sa đỏ cam trầm vắt chéo vai
    const woodBeadMat = mat(0x5c2d16, 0.32, 0.14);  // Hạt gỗ Bồ Đề nâu trầm

    const body = new THREE.Group();
    body.position.y = 0.80;

    // Thân áo tràng Sư Chùa Chibi tròn bầu bĩnh
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.39, 0.58, 24), saffronMat);
    robe.castShadow = true;
    body.add(robe);

    // Cổ áo giao lĩnh chữ Y của áo vạt hò nhà chùa
    for (const s of [-1, 1]) {
      const collar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.24, 0.04), innerRobeMat);
      collar.position.set(s * 0.055, 0.17, 0.265);
      collar.rotation.z = s * 0.38;
      body.add(collar);
    }

    // Y Cà Sa (Huỳnh Y) đỏ cam vắt chéo qua vai trái, lộ vai phải
    const kasayaDrape = new THREE.Mesh(new THREE.CylinderGeometry(0.275, 0.36, 0.46, 22, 1, false, -0.4, Math.PI * 1.35), kasayaMat);
    kasayaDrape.position.set(-0.01, 0.03, 0.01);
    body.add(kasayaDrape);

    const sash = new THREE.Mesh(new THREE.TorusGeometry(0.295, 0.062, 14, 28), kasayaMat);
    sash.rotation.set(0.45, 0.22, 0.68);
    sash.position.set(0.01, 0.05, 0.03);
    body.add(sash);

    // Đai lưng vải vàng nhà chùa
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.318, 0.034, 12, 24), goldMat);
    belt.rotation.x = Math.PI / 2;
    belt.position.y = -0.06;
    body.add(belt);

    // Chuỗi Tràng Hạt Bồ Đề 14 hạt gỗ tròn lớn đeo trước ngực
    const malaGroup = new THREE.Group();
    malaGroup.position.set(0, 0.24, 0.05);
    const beadCount = 14;
    for (let i = 0; i < beadCount; i++) {
      const ang = (i / beadCount) * Math.PI * 2;
      const isMainBead = i === 0;
      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(isMainBead ? 0.052 : 0.038, 12, 10),
        isMainBead ? goldMat : woodBeadMat
      );
      bead.position.set(Math.sin(ang) * 0.225, -Math.cos(ang) * 0.055, Math.cos(ang) * 0.225);
      malaGroup.add(bead);
    }
    body.add(malaGroup);

    // Vòng hào quang Phật pháp màu vàng kim dịu nhẹ phía sau lưng
    const halo = new THREE.Mesh(new THREE.RingGeometry(0.40, 0.47, 36), new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.72
    }));
    halo.position.set(0, 0.65, -0.22);
    body.add(halo);

    g.add(body);

    // ĐẦU TRỌC SƯ CHÙA CHIBI 3D: Hoàn toàn trọc nhẵn bóng, tròn bầu bĩnh, không đội mũ/tóc
    const head = createChibiHead({ skin: monkSkinMat, irisColor: 0x451a03, browColor: 0x451a03, happyEyes: false });

    // Đốm phản quang bóng sáng trên đỉnh đầu trọc Chibi
    const baldShine = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 14, 10),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.38 })
    );
    baldShine.scale.set(1.3, 0.35, 0.85);
    baldShine.position.set(-0.12, 0.36, 0.16);
    baldShine.rotation.z = 0.35;
    baldShine.rotation.x = -0.35;
    head.add(baldShine);

    // Đôi tai to phúc hậu với dái tai dài tròn của Sư Chùa Chibi
    for (const s of [-1, 1]) {
      const bigEar = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 14), monkSkinMat);
      bigEar.scale.set(0.58, 1.25, 0.78);
      bigEar.position.set(s * 0.43, -0.03, 0.02);
      head.add(bigEar);

      const earlobe = new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 12), monkSkinMat);
      earlobe.scale.set(0.75, 1.15, 0.82);
      earlobe.position.set(s * 0.425, -0.145, 0.03);
      head.add(earlobe);
    }

    // 6 Chấm Giới Hương (Hương Đốt Nhà Chùa) thẳng hàng rõ nét trên trán/đỉnh đầu trọc
    for (const row of [0.20, 0.26, 0.32]) {
      for (const s of [-1, 1]) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), mat(0xb45309, 0.4, 0.05));
        const zSurface = Math.sqrt(Math.max(0.01, 0.415 * 0.415 - row * row));
        dot.position.set(s * 0.058, row, zSurface);
        head.add(dot);
      }
    }

    // Nốt chu sa đỏ nhỏ (Huệ Nhãn) giữa hai chân mày
    const urna = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), mat(0xe11d48, 0.25, 0.1));
    urna.position.set(0, 0.115, 0.412);
    head.add(urna);

    g.add(head);

    // Chân mặc quần nâu lam nhà chùa + Giày vải La Hán xám nâu đế trắng
    const leftLeg = createChibiLeg(0x78350f, 0x57534e, 0xfef3c7);
    leftLeg.position.set(-0.14, 0.50, 0);
    const rightLeg = createChibiLeg(0x78350f, 0x57534e, 0xfef3c7);
    rightLeg.position.set(0.14, 0.50, 0);
    g.add(leftLeg, rightLeg);

    // Tay trái khoác y cà sa đỏ cam, tay phải áo vàng cam
    const leftArm = createChibiArm(0xd9480f, monkSkinMat, 0xfbbf24);
    leftArm.position.set(-0.35, 1.02, 0);
    const rightArm = createChibiArm(0xf59e0b, monkSkinMat, 0xd9480f);
    rightArm.position.set(0.35, 1.02, 0);

    // Tay trái nâng Bình Bát Vàng / Mõ Gỗ Tròn Chibi
    const almsBowl = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 14, 0, Math.PI * 2, Math.PI * 0.22, Math.PI * 0.78), goldMat);
    almsBowl.position.set(0.02, -0.38, 0.12);
    leftArm.add(almsBowl);

    // Tay phải cầm Thiền Trượng (Tích Trượng Vàng có vòng khuyên tròn)
    const staff = new THREE.Group();
    staff.position.set(0, -0.36, 0.14);
    staff.rotation.x = 0.22;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.78, 12), woodBeadMat);
    shaft.position.y = 0.12;
    staff.add(shaft);
    const topRing = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.018, 10, 22), goldMat);
    topRing.position.y = 0.56;
    staff.add(topRing);
    for (const s of [-1, 1]) {
      const jingle = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.008, 8, 14), goldMat);
      jingle.position.set(s * 0.085, 0.52, 0);
      jingle.rotation.y = Math.PI / 2;
      staff.add(jingle);
    }
    rightArm.add(staff);
    g.add(leftArm, rightArm);

    animParts = { leftLeg, rightLeg, leftArm, rightArm, head, body, halo, extras: [almsBowl] };
    return g;
  }

  // ============================================================================
  // 6. TRẠNG LƯỜNG LƯƠNG THẾ VINH (CHIBI DANH NHÂN TOÁN HỌC VIỆT NAM)
  // ============================================================================
  function buildTrangLuong() {
    const g = new THREE.Group();
    addGroundShadow(g);

    const jadeMat = mat(0x0d9488, 0.42, 0.12);
    const brocadeMat = mat(0x115e59, 0.45, 0.15);

    const body = new THREE.Group();
    body.position.y = 0.80;

    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.38, 0.58, 24), jadeMat);
    robe.castShadow = true;
    body.add(robe);

    // Đai ngọc quan Trạng Nguyên
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.315, 0.032, 10, 24), goldMat);
    belt.rotation.x = Math.PI / 2;
    belt.position.y = -0.05;
    body.add(belt);

    const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.03), goldMat);
    plaque.position.set(0, 0.06, 0.30);
    body.add(plaque);
    g.add(body);

    const head = createChibiHead({ irisColor: 0x0f766e, browColor: 0x1e293b });
    // Mũ Cánh Chuồn Quan Trạng Nguyên Chibi
    const hatGroup = new THREE.Group();
    hatGroup.position.set(0, 0.34, 0);
    const hatFront = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.18, 20), mat(0x1e1b4b, 0.35, 0.2));
    hatGroup.add(hatFront);
    const hatBack = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.28, 20), mat(0x1e1b4b, 0.35, 0.2));
    hatBack.position.set(0, 0.08, -0.06);
    hatGroup.add(hatBack);
    const badge = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), goldMat);
    badge.position.set(0, 0.04, 0.27);
    hatGroup.add(badge);
    for (const s of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), mat(0x1e1b4b, 0.35, 0.25));
      wing.scale.set(1.6, 0.35, 0.15);
      wing.position.set(s * 0.42, 0.06, -0.06);
      wing.rotation.z = s * 0.12;
      hatGroup.add(wing);
    }
    head.add(hatGroup);
    g.add(head);

    const leftLeg = createChibiLeg(0xf8fafc, 0x1e1b4b, 0xfef3c7);
    leftLeg.position.set(-0.14, 0.50, 0);
    const rightLeg = createChibiLeg(0xf8fafc, 0x1e1b4b, 0xfef3c7);
    rightLeg.position.set(0.14, 0.50, 0);
    g.add(leftLeg, rightLeg);

    const leftArm = createChibiArm(0x0d9488, skinMat, 0xfbbf24);
    leftArm.position.set(-0.35, 1.02, 0);
    const rightArm = createChibiArm(0x0d9488, skinMat, 0xfbbf24);
    rightArm.position.set(0.35, 1.02, 0);

    // Thước Lỗ Ban vàng trên tay phải
    const ruler = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.42, 0.02), goldMat);
    ruler.position.set(0, -0.39, 0.14);
    ruler.rotation.x = Math.PI / 3;
    rightArm.add(ruler);
    g.add(leftArm, rightArm);

    animParts = { leftLeg, rightLeg, leftArm, rightArm, head, body, halo: null, extras: [brocadeMat] };
    return g;
  }

  let bikeMode = false;
  let bikeGroup = null;
  let frontWheel = null;
  let rearWheel = null;

  function buildBicycle3D() {
    const g = new THREE.Group();
    g.name = 'AVATAR_3D_SPORT_BICYCLE';
    const tireMat = mat(0x1e293b, 0.75, 0.15);
    const rimMat = mat(0xfbbf24, 0.25, 0.78);
    const frameMat = mat(0x0ea5e9, 0.28, 0.55);
    const chromeMat = mat(0xe2e8f0, 0.2, 0.85);
    const seatMat = mat(0x7c2d12, 0.5, 0.1);

    function makeWheel(zPos) {
      const wg = new THREE.Group();
      wg.position.set(0, 0.34, zPos);
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.055, 10, 24), tireMat);
      tire.rotation.y = Math.PI / 2;
      wg.add(tire);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.022, 8, 24), rimMat);
      rim.rotation.y = Math.PI / 2;
      wg.add(rim);
      for (let i = 0; i < 6; i++) {
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.52, 6), chromeMat);
        spoke.rotation.x = (i * Math.PI) / 6;
        wg.add(spoke);
      }
      return wg;
    }

    frontWheel = makeWheel(0.58);
    rearWheel = makeWheel(-0.56);
    g.add(frontWheel, rearWheel);

    // Khung sườn xe đạp thể thao
    const topTube = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.82, 10), frameMat);
    topTube.rotation.x = Math.PI / 2 - 0.12;
    topTube.position.set(0, 0.66, 0.02);
    g.add(topTube);

    const downTube = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.78, 10), frameMat);
    downTube.rotation.x = Math.PI / 4;
    downTube.position.set(0, 0.52, 0.22);
    g.add(downTube);

    const seatPost = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.56, 10), chromeMat);
    seatPost.rotation.x = -0.18;
    seatPost.position.set(0, 0.58, -0.22);
    g.add(seatPost);

    const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.32), seatMat);
    saddle.position.set(0, 0.84, -0.26);
    g.add(saddle);

    // Cổ lái & ghi-đông
    const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.024, 0.68, 10), chromeMat);
    fork.rotation.x = -0.22;
    fork.position.set(0, 0.64, 0.48);
    g.add(fork);

    const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.64, 10), chromeMat);
    handlebar.rotation.z = Math.PI / 2;
    handlebar.position.set(0, 0.96, 0.40);
    g.add(handlebar);

    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    lamp.position.set(0, 0.86, 0.50);
    g.add(lamp);

    g.visible = bikeMode;
    return g;
  }

  function setBikeMode(active) {
    bikeMode = Boolean(active);
    if (bikeGroup) bikeGroup.visible = bikeMode;
    return bikeMode;
  }

  function setAvatarType(type) {
    currentType = type;
    while (modelHolder.children.length > 0) {
      modelHolder.remove(modelHolder.children[0]);
    }
    let built;
    if (type === 'triet') built = buildTriet();
    else if (type === 'an') built = buildAn();
    else if (type === 'bot') built = buildBot();
    else if (type === 'suhocba') built = buildSuHocBa();
    else if (type === 'trangluong') built = buildTrangLuong();
    else built = buildAlex();
    modelHolder.add(built);
    bikeGroup = buildBicycle3D();
    modelHolder.add(bikeGroup);
  }

  function updateAnimation(dt, speed = 0, targetYaw = null, jumpHeight = 0) {
    if (targetYaw !== null && Number.isFinite(targetYaw)) {
      let diff = targetYaw - modelHolder.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      modelHolder.rotation.y += diff * Math.min(1, dt * 13);
    }

    const time = performance.now() * 0.001;
    if (animParts.halo) {
      animParts.halo.rotation.z = time * 1.4;
    }

    if (bikeMode && bikeGroup) {
      bikeGroup.visible = true;
      if (speed > 0.05) {
        walkCycle += dt * speed * 11.5;
        if (frontWheel) frontWheel.rotation.x += dt * speed * 3.2;
        if (rearWheel) rearWheel.rotation.x += dt * speed * 3.2;
      }
      const pedalSwing = speed > 0.05 ? Math.sin(walkCycle) * 0.48 : 0.15;
      if (animParts.leftLeg) animParts.leftLeg.rotation.x = -0.35 + pedalSwing;
      if (animParts.rightLeg) animParts.rightLeg.rotation.x = -0.35 - pedalSwing;
      if (animParts.leftArm) {
        animParts.leftArm.rotation.x = -0.72;
        animParts.leftArm.rotation.z = 0.08;
      }
      if (animParts.rightArm) {
        animParts.rightArm.rotation.x = -0.72;
        animParts.rightArm.rotation.z = -0.08;
      }
      if (animParts.body) animParts.body.position.y = 0.90;
      if (animParts.head) {
        animParts.head.position.y = 1.54;
        animParts.head.rotation.z = Math.sin(time * 2.0) * 0.03;
      }
      return;
    }

    if (speed > 0.05) {
      walkCycle += dt * speed * 9.5;
      const swing = Math.sin(walkCycle) * 0.62;
      const bounce = Math.abs(Math.cos(walkCycle)) * 0.075;
      if (animParts.leftLeg) animParts.leftLeg.rotation.x = swing;
      if (animParts.rightLeg) animParts.rightLeg.rotation.x = -swing;
      if (animParts.leftArm) {
        animParts.leftArm.rotation.x = -swing * 0.85;
        animParts.leftArm.rotation.z = 0.12;
      }
      if (animParts.rightArm) {
        animParts.rightArm.rotation.x = swing * 0.85;
        animParts.rightArm.rotation.z = -0.12;
      }
      if (animParts.body) animParts.body.position.y = 0.80 + bounce;
      if (animParts.head) {
        animParts.head.position.y = 1.44 + bounce * 1.15;
        animParts.head.rotation.z = Math.sin(walkCycle * 0.5) * 0.06;
      }
    } else {
      const idleBreath = Math.sin(time * 2.6) * 0.022;
      const damp = Math.min(1, dt * 10);
      if (animParts.leftLeg) animParts.leftLeg.rotation.x *= 1 - damp;
      if (animParts.rightLeg) animParts.rightLeg.rotation.x *= 1 - damp;
      if (animParts.leftArm) {
        animParts.leftArm.rotation.x *= 1 - damp;
        animParts.leftArm.rotation.z = 0.09 + Math.sin(time * 2.1) * 0.03;
      }
      if (animParts.rightArm) {
        animParts.rightArm.rotation.x *= 1 - damp;
        animParts.rightArm.rotation.z = -0.09 - Math.sin(time * 2.1) * 0.03;
      }
      if (animParts.body) animParts.body.position.y = 0.80 + idleBreath;
      if (animParts.head) {
        animParts.head.position.y = 1.44 + idleBreath * 1.25;
        animParts.head.rotation.z = Math.sin(time * 1.4) * 0.035;
      }
    }

    if (jumpHeight > 0.02) {
      if (animParts.leftArm) animParts.leftArm.rotation.z = 0.55;
      if (animParts.rightArm) animParts.rightArm.rotation.z = -0.55;
    }
  }

  setAvatarType(initialType);

  return {
    root,
    body: modelHolder,
    setAvatarType,
    getAvatarType: () => currentType,
    setBikeMode,
    isBikeMode: () => bikeMode,
    updateAnimation
  };
}
