/** MATHVERSE R87 – staged fold-net registry (not an add-on). */
export const FOLD_NET_CATALOG = Object.freeze([
  {
    "id": "mv-fold-cube",
    "notebookIndex": 1,
    "name": "Hình lập phương",
    "grades": [
      6,
      7
    ],
    "sourceGradeText": "Lớp 5, 7",
    "lesson": "Hình lập phương và Hình hộp chữ nhật",
    "tier": 1,
    "shapeKind": "polyhedron",
    "unfolding": "Khai triển 6 mặt vuông phẳng",
    "notebookEvidence": "Passage 1, 6, 7, 10",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "a": 2.0
    },
    "storyboard": [
      "Trải 6 mặt vuông và đánh dấu 5 nếp gấp",
      "Nâng bốn mặt bên quanh cạnh đáy",
      "Gập mặt nắp và nối đủ 12 cạnh",
      "Giữ lập phương; đối chiếu 6 mặt cùng diện tích"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "edge-closure",
      "flat-coplanarity",
      "surface-area",
      "volume",
      "hinge-invariant"
    ]
  },
  {
    "id": "mv-fold-rectangular-prism",
    "notebookIndex": 2,
    "name": "Hình hộp chữ nhật",
    "grades": [
      6,
      7
    ],
    "sourceGradeText": "Lớp 5, 7",
    "lesson": "Diện tích xung quanh & Thể tích khối hộp",
    "tier": 1,
    "shapeKind": "polyhedron",
    "unfolding": "Khai triển 6 mặt chữ nhật",
    "notebookEvidence": "Passage 1, 6, 7, 10",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "a": 2.6,
      "b": 1.65,
      "h": 1.9
    },
    "storyboard": [
      "Trải 6 mặt chữ nhật theo kích thước a,b,h",
      "Gấp bốn mặt bên thành khung hộp",
      "Khép mặt nắp, tô các cặp mặt đối diện",
      "Đối chiếu diện tích xung quanh và thể tích"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "edge-closure",
      "flat-coplanarity",
      "surface-area",
      "volume",
      "hinge-invariant"
    ]
  },
  {
    "id": "mv-fold-equilateral-triangular-prism",
    "notebookIndex": 3,
    "name": "Lăng trụ tam giác đều",
    "grades": [
      7,
      11
    ],
    "sourceGradeText": "Lớp 7, 11",
    "lesson": "Hình lăng trụ đứng tam giác",
    "tier": 1,
    "shapeKind": "polyhedron",
    "unfolding": "Khai triển 2 đáy tam giác đều + 3 mặt bên",
    "notebookEvidence": "Passage 1, 6, 7, 10",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "a": 2.3,
      "h": 2.2
    },
    "storyboard": [
      "Trải ba mặt bên thành dải liên tục",
      "Gập hai nếp dọc theo tam giác đều",
      "Khép hai đáy tam giác bằng nhau",
      "Làm nổi ba mặt bên và chiều cao đứng"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "edge-closure",
      "flat-coplanarity",
      "surface-area",
      "volume",
      "hinge-invariant"
    ]
  },
  {
    "id": "mv-fold-trapezoidal-right-prism",
    "notebookIndex": 4,
    "name": "Lăng trụ đứng tứ giác",
    "grades": [
      7,
      11
    ],
    "sourceGradeText": "Lớp 7, 11",
    "lesson": "Hình lăng trụ đứng tứ giác (đáy hình thang)",
    "tier": 1,
    "shapeKind": "polyhedron",
    "unfolding": "Khai triển 2 đáy tứ giác + 4 mặt bên",
    "notebookEvidence": "Passage 1, 6, 7, 10",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "a": 3.0,
      "b": 2.0,
      "offset": 0.6,
      "height": 2.2,
      "h": 2.3
    },
    "storyboard": [
      "Trải bốn mặt bên theo chu vi đáy hình thang",
      "Gập tuần tự theo góc ngoài hình thang",
      "Gấp hai đáy hình thang thành lăng trụ đứng",
      "So sánh chu vi đáy và diện tích xung quanh"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "edge-closure",
      "flat-coplanarity",
      "surface-area",
      "volume",
      "hinge-invariant"
    ]
  },
  {
    "id": "mv-fold-general-triangular-right-prism",
    "notebookIndex": 5,
    "name": "Lăng trụ đứng đáy tam giác",
    "grades": [
      7,
      11
    ],
    "sourceGradeText": "Lớp 7, 11",
    "lesson": "Hình lăng trụ đứng tam giác bất kỳ",
    "tier": 1,
    "shapeKind": "polyhedron",
    "unfolding": "Khai triển 2 đáy tam giác + 3 mặt bên",
    "notebookEvidence": "Passage 1, 6, 7, 15",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "a": 2.5,
      "b": 1.6,
      "h": 2.0
    },
    "storyboard": [
      "Trải ba hình chữ nhật kích thước theo các cạnh tam giác",
      "Gập dải tạo lăng trụ tam giác",
      "Gấp hai mặt đáy theo nếp ngang",
      "Đổi dạng tam giác và giữ các mặt khép chính xác"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "edge-closure",
      "flat-coplanarity",
      "surface-area",
      "volume",
      "hinge-invariant"
    ]
  },
  {
    "id": "mv-fold-regular-triangular-pyramid",
    "notebookIndex": 6,
    "name": "Chóp tam giác đều",
    "grades": [
      8
    ],
    "sourceGradeText": "Lớp 8",
    "lesson": "Hình chóp tam giác đều",
    "tier": 1,
    "shapeKind": "polyhedron",
    "unfolding": "Khai triển 1 đáy tam giác + 3 mặt bên cân",
    "notebookEvidence": "Passage 1, 2, 6, 7",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "a": 2.4,
      "h": 2.3
    },
    "storyboard": [
      "Dựng một đáy đều và ba tam giác cân mặt bên",
      "Gấp từng mặt bên quanh cạnh đáy",
      "Ba đỉnh S của bản trải gặp nhau trong không gian",
      "Tô đường cao và trung đoạn để so sánh"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "edge-closure",
      "flat-coplanarity",
      "surface-area",
      "volume",
      "hinge-invariant"
    ]
  },
  {
    "id": "mv-fold-regular-square-pyramid",
    "notebookIndex": 7,
    "name": "Chóp tứ giác đều",
    "grades": [
      8
    ],
    "sourceGradeText": "Lớp 8",
    "lesson": "Hình chóp tứ giác đều",
    "tier": 1,
    "shapeKind": "polyhedron",
    "unfolding": "Khai triển 1 đáy hình vuông + 4 mặt bên cân",
    "notebookEvidence": "Passage 1, 6, 7, 10",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "a": 2.4,
      "h": 2.5
    },
    "storyboard": [
      "Dựng đáy vuông và bốn tam giác cân xung quanh",
      "Nâng từng mặt bên theo góc nhị diện",
      "Bốn điểm đỉnh S khớp cùng một vị trí",
      "Hiện trung đoạn/đường cao và công thức"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "edge-closure",
      "flat-coplanarity",
      "surface-area",
      "volume",
      "hinge-invariant"
    ]
  },
  {
    "id": "mv-fold-cone",
    "notebookIndex": 8,
    "name": "Hình nón",
    "grades": [
      9,
      12
    ],
    "sourceGradeText": "Lớp 9, 12",
    "lesson": "Hình nón - Diện tích xung quanh & Thể tích",
    "tier": 1,
    "shapeKind": "curved",
    "unfolding": "Khai triển 1 đáy tròn + 1 hình quạt tròn",
    "notebookEvidence": "Passage 1, 6, 7, 10",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "R": 1.25,
      "h": 2.1
    },
    "storyboard": [
      "Trải quạt có góc đúng từ bán kính và đường sinh",
      "Cuộn quạt thành mặt nón theo phép uốn đẳng cự",
      "Đưa đáy tròn về miệng nón",
      "Phân biệt đường sinh, bán kính và chiều cao"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "flat-net",
      "rim-closure",
      "surface-area",
      "volume",
      "parametric-continuity"
    ]
  },
  {
    "id": "mv-fold-cylinder",
    "notebookIndex": 9,
    "name": "Hình trụ",
    "grades": [
      9,
      12
    ],
    "sourceGradeText": "Lớp 9, 12",
    "lesson": "Hình trụ - Diện tích xung quanh & Thể tích",
    "tier": 1,
    "shapeKind": "curved",
    "unfolding": "Khai triển 2 đáy tròn + 1 hình chữ nhật uốn",
    "notebookEvidence": "Passage 1, 6, 7, 10",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "R": 1.2,
      "h": 2.5
    },
    "storyboard": [
      "Trải chữ nhật rộng 2πR và hai hình tròn",
      "Cuộn đều mặt bên thành mặt trụ",
      "Dịch chuyển/đặt hai đáy tròn khít miệng trụ",
      "Hiện chiều cao và chu vi đường tròn đáy"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "flat-net",
      "rim-closure",
      "surface-area",
      "volume",
      "parametric-continuity"
    ]
  },
  {
    "id": "mv-fold-offset-apex-rectangular-pyramid",
    "notebookIndex": 10,
    "name": "Chóp S.ABCD, SA \\perp đáy",
    "grades": [
      11
    ],
    "sourceGradeText": "Lớp 11",
    "lesson": "Đường thẳng vuông góc với mặt phẳng",
    "tier": 2,
    "shapeKind": "polyhedron",
    "unfolding": "Khai triển 1 đáy chữ nhật + 4 mặt bên vuông",
    "notebookEvidence": "Passage 1, 6, 7, 11",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "a": 2.7,
      "b": 1.9,
      "h": 2.2
    },
    "storyboard": [
      "Trải đáy chữ nhật và bốn tam giác cạnh khác nhau",
      "Nâng SAB và SAD có SA vuông góc đáy",
      "Gấp hai tam giác còn lại tới cùng đỉnh S",
      "Highlight SA và mặt phẳng đáy"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "edge-closure",
      "flat-coplanarity",
      "surface-area",
      "volume",
      "hinge-invariant"
    ]
  },
  {
    "id": "mv-fold-offset-apex-triangular-pyramid",
    "notebookIndex": 11,
    "name": "Chóp S.ABC, SA \\perp đáy",
    "grades": [
      11
    ],
    "sourceGradeText": "Lớp 11",
    "lesson": "Hai mặt phẳng vuông góc",
    "tier": 2,
    "shapeKind": "polyhedron",
    "unfolding": "Khai triển 1 đáy tam giác + 3 mặt bên",
    "notebookEvidence": "Passage 1, 6, 7, 11",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "a": 2.4,
      "b": 1.7,
      "h": 2.0
    },
    "storyboard": [
      "Trải tam giác ABC vuông tại B và ba tam giác mặt bên",
      "Gấp mặt SAB quanh AB để dựng SA vuông góc đáy",
      "Gập hai mặt còn lại, cạnh S hội tụ",
      "Đánh dấu góc vuông và mặt phẳng"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "edge-closure",
      "flat-coplanarity",
      "surface-area",
      "volume",
      "hinge-invariant"
    ]
  },
  {
    "id": "mv-fold-regular-tetrahedron",
    "notebookIndex": 12,
    "name": "Tứ diện đều",
    "grades": [
      11
    ],
    "sourceGradeText": "Lớp 11",
    "lesson": "Hai mặt phẳng vuông góc / Khối đa diện",
    "tier": 2,
    "shapeKind": "polyhedron",
    "unfolding": "Khai triển 4 tam giác đều bằng nhau",
    "notebookEvidence": "Passage 1, 6, 7, 10",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "a": 2.4
    },
    "storyboard": [
      "Trải bốn tam giác đều không trùng nhau",
      "Gấp ba mặt quanh ba cạnh của tam giác trung tâm",
      "Ba bản sao đỉnh D gặp nhau khi khép",
      "Đo góc ngoài nếp gấp và thể tích"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "edge-closure",
      "flat-coplanarity",
      "surface-area",
      "volume",
      "hinge-invariant"
    ]
  },
  {
    "id": "mv-fold-tri-rectangular-tetrahedron",
    "notebookIndex": 13,
    "name": "Tứ diện vuông",
    "grades": [
      11
    ],
    "sourceGradeText": "Lớp 11",
    "lesson": "Góc và khoảng cách trong không gian",
    "tier": 2,
    "shapeKind": "polyhedron",
    "unfolding": "Khai triển 1 đáy tam giác + 3 mặt vuông",
    "notebookEvidence": "Passage 1, 6, 7, 10",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "a": 1.6,
      "b": 2.2,
      "c": 2.4
    },
    "storyboard": [
      "Trải bốn tam giác của tứ diện ba cạnh vuông góc",
      "Nâng hai mặt vuông quanh hai cạnh chung đỉnh O",
      "Khép mặt cuối để tạo khối 3 trục vuông góc",
      "Đối chiếu ba diện tích thành phần và diện tích mặt đối diện"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "edge-closure",
      "flat-coplanarity",
      "surface-area",
      "volume",
      "hinge-invariant"
    ]
  },
  {
    "id": "mv-fold-square-frustum",
    "notebookIndex": 14,
    "name": "Chóp cụt tứ giác đều",
    "grades": [
      11
    ],
    "sourceGradeText": "Lớp 11",
    "lesson": "Khối chóp cụt và Thể tích",
    "tier": 2,
    "shapeKind": "polyhedron",
    "unfolding": "Khai triển 2 đáy vuông + 4 mặt bên hình thang",
    "notebookEvidence": "Passage 1, 6, 7, 10",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "a": 3.0,
      "b": 1.6,
      "h": 2.1
    },
    "storyboard": [
      "Trải hai đáy vuông và bốn mặt hình thang cân",
      "Nâng bốn hình thang theo góc nhị diện",
      "Khép nắp vuông nhỏ theo cạnh trên của mặt bên",
      "Tô hai đáy song song và chiều cao"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "edge-closure",
      "flat-coplanarity",
      "surface-area",
      "volume",
      "hinge-invariant"
    ]
  },
  {
    "id": "mv-fold-perpendicular-side-plane-pyramid",
    "notebookIndex": 15,
    "name": "Chóp S.ABCD, (SAB) \\perp đáy",
    "grades": [
      11
    ],
    "sourceGradeText": "Lớp 11",
    "lesson": "Hai mặt phẳng vuông góc",
    "tier": 2,
    "shapeKind": "polyhedron",
    "unfolding": "Khai triển 1 đáy vuông + 4 mặt bên",
    "notebookEvidence": "Passage 1, 6, 7, 11",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "a": 2.4,
      "b": 2.1,
      "h": 2.1
    },
    "storyboard": [
      "Trải đáy chữ nhật và bốn mặt bên",
      "Nâng SAB thành mặt đứng vuông góc đáy",
      "Gập các mặt còn lại về đỉnh chung S",
      "Đo góc hai mặt phẳng vuông góc"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "edge-closure",
      "flat-coplanarity",
      "surface-area",
      "volume",
      "hinge-invariant"
    ]
  },
  {
    "id": "mv-fold-trapezoid-base-pyramid",
    "notebookIndex": 16,
    "name": "Chóp S.ABCD đáy hình thang",
    "grades": [
      11
    ],
    "sourceGradeText": "Lớp 11",
    "lesson": "Khoảng cách & Góc nhị diện",
    "tier": 2,
    "shapeKind": "polyhedron",
    "unfolding": "Khai triển 1 đáy hình thang + 4 mặt bên",
    "notebookEvidence": "Passage 1, 6, 7, 15",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "a": 1.5,
      "hbase": 1.5,
      "h": 2.1
    },
    "storyboard": [
      "Trải đáy hình thang vuông và bốn mặt tam giác",
      "Nâng mặt chứa cạnh SA thẳng đứng",
      "Khép các mặt xiên với góc theo tọa độ S",
      "Hiện mặt phẳng đáy, đường cao SA"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "edge-closure",
      "flat-coplanarity",
      "surface-area",
      "volume",
      "hinge-invariant"
    ]
  },
  {
    "id": "mv-fold-equal-lateral-edges-pyramid",
    "notebookIndex": 17,
    "name": "Chóp S.ABC có SA=SB=SC",
    "grades": [
      11
    ],
    "sourceGradeText": "Lớp 11",
    "lesson": "Chóp có các cạnh bên bằng nhau",
    "tier": 2,
    "shapeKind": "polyhedron",
    "unfolding": "Khai triển 1 đáy tam giác + 3 mặt bên cân",
    "notebookEvidence": "Passage 1, 6, 7, 15",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "a": 2.6,
      "h": 2.1
    },
    "storyboard": [
      "Trải đáy tam giác và ba mặt cân theo cạnh bên bằng nhau",
      "Nâng từng mặt quanh các cạnh đáy không đối xứng",
      "Gập tới đỉnh S nằm trên đường thẳng qua tâm ngoại tiếp",
      "Tô các cạnh SA,SB,SC cùng màu để nhận biết bằng nhau"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "edge-closure",
      "flat-coplanarity",
      "surface-area",
      "volume",
      "hinge-invariant"
    ]
  },
  {
    "id": "mv-fold-conical-frustum",
    "notebookIndex": 18,
    "name": "Hình nón cụt",
    "grades": [
      9,
      12
    ],
    "sourceGradeText": "Lớp 9, 12",
    "lesson": "Hình nón cụt - Nón và Trụ",
    "tier": 2,
    "shapeKind": "curved",
    "unfolding": "Khai triển 2 đáy tròn + 1 dải quạt",
    "notebookEvidence": "Passage 1, 6, 7, 10",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "R1": 1.65,
      "R2": 0.85,
      "h": 2.2
    },
    "storyboard": [
      "Trải dải quạt và hai hình tròn có bán kính khác nhau",
      "Cuộn dải vành khăn thành mặt nón cụt",
      "Đặt hai đáy tròn vào hai miệng tương ứng",
      "Hiện đường sinh và bán kính hai đáy"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "flat-net",
      "rim-closure",
      "surface-area",
      "volume",
      "parametric-continuity"
    ]
  },
  {
    "id": "mv-fold-oblique-parallelepiped",
    "notebookIndex": 19,
    "name": "Hình hộp xiên",
    "grades": [
      11
    ],
    "sourceGradeText": "Lớp 11",
    "lesson": "Hình hộp & Quan hệ song song",
    "tier": 3,
    "shapeKind": "polyhedron",
    "unfolding": "Khai triển 6 mặt hình bình hành",
    "notebookEvidence": "Passage 1, 6, 7, 16",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "a": 2.2,
      "b": 1.5,
      "h": 1.8,
      "shearX": 0.85,
      "shearY": 0.33
    },
    "storyboard": [
      "Trải sáu hình bình hành của hộp xiên",
      "Gấp bốn mặt bên theo trục xiên",
      "Khép nắp; giữ các mặt đối diện song song",
      "Chiếu vectơ cạnh bên xuống mặt đáy"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "edge-closure",
      "flat-coplanarity",
      "surface-area",
      "volume",
      "hinge-invariant"
    ]
  },
  {
    "id": "mv-fold-oblique-triangular-prism",
    "notebookIndex": 20,
    "name": "Lăng trụ tam giác xiên",
    "grades": [
      11
    ],
    "sourceGradeText": "Lớp 11",
    "lesson": "Hình lăng trụ xiên",
    "tier": 3,
    "shapeKind": "polyhedron",
    "unfolding": "Khai triển 2 đáy tam giác + 3 hình bình hành",
    "notebookEvidence": "Passage 1, 6, 7, 16",
    "evidenceStatus": "SECONDARY_NOTEBOOKLM_REPORT",
    "proposedForMathverse": true,
    "defaultParams": {
      "a": 2.3,
      "b": 1.6,
      "h": 2.1,
      "shearX": 0.8,
      "shearY": 0.25
    },
    "storyboard": [
      "Trải dải ba hình bình hành và hai đáy tam giác",
      "Gập dải quanh cạnh bên xiên",
      "Khép hai đáy tam giác ở hai đầu",
      "Hiện chiều cao vuông góc không trùng cạnh bên xiên"
    ],
    "ui": {
      "controls": [
        "play",
        "pause",
        "step-back",
        "step-forward",
        "fold",
        "unfold",
        "reset",
        "progress",
        "speed",
        "toggle-edges",
        "toggle-colors"
      ]
    },
    "mathCheck": [
      "edge-closure",
      "flat-coplanarity",
      "surface-area",
      "volume",
      "hinge-invariant"
    ]
  }
]);
export const getFoldNetDefinition = id => FOLD_NET_CATALOG.find(model => model.id === id) || null;

/**
 * R87 Museum Placement & Cross-Mapping Registry.
 * Maps each of the 20 R87 2D<->3D folding models to its exact MATHVERSE Museum room,
 * textbook chapter room, and pedestal mode ID (EXTEND_EXISTING_MUSEUM vs NEW_MUSEUM_EXHIBIT).
 * Grade 10 has 0 forced models (plane/analytic/vector geometry in GDPT 2018).
 */
export const R87_MUSEUM_PLACEMENT = Object.freeze({
  'mv-fold-cube': {
    action: 'EXTEND_EXISTING_MUSEUM',
    primaryGrade: 7,
    supplementaryGrades: [6],
    primaryRoomId: 'G7-R04',
    chapterRoomId: 'G7-CH08',
    secondaryRoomIds: ['G6-R04'],
    primaryModeId: '7-08-C02',
    linkedModeIds: ['7-08-C02', 'toan6-khai-trien-hop']
  },
  'mv-fold-rectangular-prism': {
    action: 'EXTEND_EXISTING_MUSEUM',
    primaryGrade: 7,
    supplementaryGrades: [6, 12],
    primaryRoomId: 'G7-R04',
    chapterRoomId: 'G7-CH08',
    secondaryRoomIds: ['G6-R04', 'G12-R01'],
    primaryModeId: '7-08-C03',
    linkedModeIds: ['7-08-C03', '7-08-C01', 'toan6-khoi-hop', '12-03-C02']
  },
  'mv-fold-equilateral-triangular-prism': {
    action: 'EXTEND_EXISTING_MUSEUM',
    primaryGrade: 7,
    supplementaryGrades: [11],
    primaryRoomId: 'G7-R04',
    chapterRoomId: 'G7-CH08',
    secondaryRoomIds: ['G11-R04'],
    primaryModeId: '7-09-C01',
    linkedModeIds: ['7-09-C01', '7-09-C04']
  },
  'mv-fold-trapezoidal-right-prism': {
    action: 'EXTEND_EXISTING_MUSEUM',
    primaryGrade: 7,
    supplementaryGrades: [11],
    primaryRoomId: 'G7-R04',
    chapterRoomId: 'G7-CH08',
    secondaryRoomIds: ['G11-R04'],
    primaryModeId: '7-09-C02',
    linkedModeIds: ['7-09-C02']
  },
  'mv-fold-general-triangular-right-prism': {
    action: 'EXTEND_EXISTING_MUSEUM',
    primaryGrade: 7,
    supplementaryGrades: [11],
    primaryRoomId: 'G7-R04',
    chapterRoomId: 'G7-CH08',
    secondaryRoomIds: ['G11-R04'],
    primaryModeId: '7-09-C03',
    linkedModeIds: ['7-09-C03']
  },
  'mv-fold-regular-triangular-pyramid': {
    action: 'EXTEND_EXISTING_MUSEUM',
    primaryGrade: 8,
    supplementaryGrades: [],
    primaryRoomId: 'G8-R05',
    chapterRoomId: 'G8-CH09',
    secondaryRoomIds: [],
    primaryModeId: '8-09-C01',
    linkedModeIds: ['8-09-C01']
  },
  'mv-fold-regular-square-pyramid': {
    action: 'EXTEND_EXISTING_MUSEUM',
    primaryGrade: 8,
    supplementaryGrades: [],
    primaryRoomId: 'G8-R05',
    chapterRoomId: 'G8-CH09',
    secondaryRoomIds: [],
    primaryModeId: '8-09-C03',
    linkedModeIds: ['8-09-C03', '8-09-C02', '8-09-C04']
  },
  'mv-fold-cone': {
    action: 'EXTEND_EXISTING_MUSEUM',
    primaryGrade: 9,
    supplementaryGrades: [12],
    primaryRoomId: 'G9-R04',
    chapterRoomId: 'G9-CH10',
    secondaryRoomIds: ['G12-R03'],
    primaryModeId: '9-10-C02',
    linkedModeIds: ['9-10-C02', '9-10-C01']
  },
  'mv-fold-cylinder': {
    action: 'EXTEND_EXISTING_MUSEUM',
    primaryGrade: 9,
    supplementaryGrades: [12],
    primaryRoomId: 'G9-R04',
    chapterRoomId: 'G9-CH10',
    secondaryRoomIds: ['G12-R03'],
    primaryModeId: '9-09-C02',
    linkedModeIds: ['9-09-C02', '9-09-C01']
  },
  'mv-fold-offset-apex-rectangular-pyramid': {
    action: 'NEW_MUSEUM_EXHIBIT',
    primaryGrade: 11,
    supplementaryGrades: [],
    primaryRoomId: 'G11-R04',
    chapterRoomId: 'G11-CH07',
    secondaryRoomIds: [],
    primaryModeId: 'mv-fold-offset-apex-rectangular-pyramid',
    linkedModeIds: ['11-07-C02', '11-09-C02']
  },
  'mv-fold-offset-apex-triangular-pyramid': {
    action: 'NEW_MUSEUM_EXHIBIT',
    primaryGrade: 11,
    supplementaryGrades: [],
    primaryRoomId: 'G11-R04',
    chapterRoomId: 'G11-CH07',
    secondaryRoomIds: [],
    primaryModeId: 'mv-fold-offset-apex-triangular-pyramid',
    linkedModeIds: ['11-07-C01']
  },
  'mv-fold-regular-tetrahedron': {
    action: 'NEW_MUSEUM_EXHIBIT',
    primaryGrade: 11,
    supplementaryGrades: [],
    primaryRoomId: 'G11-R04',
    chapterRoomId: 'G11-CH07',
    secondaryRoomIds: ['G11-R03'],
    primaryModeId: 'mv-fold-regular-tetrahedron',
    linkedModeIds: ['11-08-C02', '11-05-C01']
  },
  'mv-fold-tri-rectangular-tetrahedron': {
    action: 'NEW_MUSEUM_EXHIBIT',
    primaryGrade: 11,
    supplementaryGrades: [],
    primaryRoomId: 'G11-R04',
    chapterRoomId: 'G11-CH07',
    secondaryRoomIds: [],
    primaryModeId: 'mv-fold-tri-rectangular-tetrahedron',
    linkedModeIds: ['11-08-C03']
  },
  'mv-fold-square-frustum': {
    action: 'EXTEND_EXISTING_MUSEUM',
    primaryGrade: 11,
    supplementaryGrades: [],
    primaryRoomId: 'G11-R04',
    chapterRoomId: 'G11-CH07',
    secondaryRoomIds: [],
    primaryModeId: '11-09-C03',
    linkedModeIds: ['11-09-C03']
  },
  'mv-fold-perpendicular-side-plane-pyramid': {
    action: 'NEW_MUSEUM_EXHIBIT',
    primaryGrade: 11,
    supplementaryGrades: [],
    primaryRoomId: 'G11-R04',
    chapterRoomId: 'G11-CH07',
    secondaryRoomIds: [],
    primaryModeId: 'mv-fold-perpendicular-side-plane-pyramid',
    linkedModeIds: ['11-07-C03']
  },
  'mv-fold-trapezoid-base-pyramid': {
    action: 'NEW_MUSEUM_EXHIBIT',
    primaryGrade: 11,
    supplementaryGrades: [],
    primaryRoomId: 'G11-R04',
    chapterRoomId: 'G11-CH07',
    secondaryRoomIds: [],
    primaryModeId: 'mv-fold-trapezoid-base-pyramid',
    linkedModeIds: ['11-08-C04']
  },
  'mv-fold-equal-lateral-edges-pyramid': {
    action: 'NEW_MUSEUM_EXHIBIT',
    primaryGrade: 11,
    supplementaryGrades: [],
    primaryRoomId: 'G11-R04',
    chapterRoomId: 'G11-CH07',
    secondaryRoomIds: [],
    primaryModeId: 'mv-fold-equal-lateral-edges-pyramid',
    linkedModeIds: ['11-08-C01']
  },
  'mv-fold-conical-frustum': {
    action: 'NEW_MUSEUM_EXHIBIT',
    primaryGrade: 9,
    supplementaryGrades: [12],
    primaryRoomId: 'G9-R04',
    chapterRoomId: 'G9-CH10',
    secondaryRoomIds: ['G12-R03', 'G12-CH04'],
    primaryModeId: 'mv-fold-conical-frustum',
    linkedModeIds: ['9-10-C03', '12-07-C02']
  },
  'mv-fold-oblique-parallelepiped': {
    action: 'NEW_MUSEUM_EXHIBIT',
    primaryGrade: 11,
    supplementaryGrades: [],
    primaryRoomId: 'G11-R03',
    chapterRoomId: 'G11-CH04',
    secondaryRoomIds: [],
    primaryModeId: 'mv-fold-oblique-parallelepiped',
    linkedModeIds: ['11-06-C03']
  },
  'mv-fold-oblique-triangular-prism': {
    action: 'NEW_MUSEUM_EXHIBIT',
    primaryGrade: 11,
    supplementaryGrades: [],
    primaryRoomId: 'G11-R03',
    chapterRoomId: 'G11-CH04',
    secondaryRoomIds: ['G11-R04'],
    primaryModeId: 'mv-fold-oblique-triangular-prism',
    linkedModeIds: ['11-09-C01', '11-06-C02']
  }
});

/** Direct replacement map for the 10 EXTEND_EXISTING_MUSEUM pedestals */
export const EXTENDED_MUSEUM_MODE_TO_FOLD_NET = Object.freeze({
  '7-08-C02': 'mv-fold-cube',
  '7-08-C03': 'mv-fold-rectangular-prism',
  '7-09-C01': 'mv-fold-equilateral-triangular-prism',
  '7-09-C02': 'mv-fold-trapezoidal-right-prism',
  '7-09-C03': 'mv-fold-general-triangular-right-prism',
  '8-09-C01': 'mv-fold-regular-triangular-pyramid',
  '8-09-C03': 'mv-fold-regular-square-pyramid',
  '9-10-C02': 'mv-fold-cone',
  '9-09-C02': 'mv-fold-cylinder',
  '11-09-C03': 'mv-fold-square-frustum'
});

export function getFoldNetPlacement(id) {
  return R87_MUSEUM_PLACEMENT[id] || null;
}

export function getFoldNetForModeId(modeId) {
  if (!modeId) return null;
  if (R87_MUSEUM_PLACEMENT[modeId]) return modeId;
  if (EXTENDED_MUSEUM_MODE_TO_FOLD_NET[modeId]) return EXTENDED_MUSEUM_MODE_TO_FOLD_NET[modeId];
  for (const [foldId, place] of Object.entries(R87_MUSEUM_PLACEMENT)) {
    if (place.linkedModeIds.includes(modeId)) return foldId;
  }
  return null;
}

export function getNewFoldNetExhibitsForRoom(roomId) {
  if (!roomId) return [];
  return FOLD_NET_CATALOG.filter(item => {
    const place = R87_MUSEUM_PLACEMENT[item.id];
    if (!place || place.action !== 'NEW_MUSEUM_EXHIBIT') return false;
    return place.primaryRoomId === roomId || place.chapterRoomId === roomId || place.secondaryRoomIds.includes(roomId);
  });
}

export function getFoldNetParamSchema(id) {
  const def = getFoldNetDefinition(id);
  if (!def) return [];
  const d = def.defaultParams || {};
  const schemas = {
    a: { key: 'a', label: id === 'mv-fold-square-frustum' ? 'Cạnh đáy lớn a' : 'Cạnh đáy a', min: 1.2, max: 3.6, step: 0.1 },
    b: { key: 'b', label: id === 'mv-fold-square-frustum' ? 'Cạnh đáy nhỏ b' : 'Cạnh đáy b', min: 0.6, max: 3.0, step: 0.1 },
    c: { key: 'c', label: 'Cạnh đứng OC = c', min: 1.0, max: 3.4, step: 0.1 },
    h: { key: 'h', label: 'Chiều cao h', min: 1.0, max: 3.4, step: 0.1 },
    height: { key: 'height', label: 'Chiều cao đáy thang', min: 1.0, max: 3.0, step: 0.1 },
    hbase: { key: 'hbase', label: 'Cạnh vuông đáy thang', min: 0.8, max: 2.8, step: 0.1 },
    R: { key: 'R', label: 'Bán kính đáy R', min: 0.6, max: 2.4, step: 0.1 },
    R1: { key: 'R1', label: 'Bán kính đáy lớn R₁', min: 1.2, max: 2.6, step: 0.05 },
    R2: { key: 'R2', label: 'Bán kính đáy nhỏ R₂', min: 0.4, max: 1.1, step: 0.05 },
    shearX: { key: 'shearX', label: 'Độ nghiêng X (shearX)', min: 0.0, max: 1.5, step: 0.05 },
    shearY: { key: 'shearY', label: 'Độ nghiêng Y (shearY)', min: 0.0, max: 1.2, step: 0.05 }
  };
  return Object.keys(d)
    .filter(k => schemas[k])
    .map(k => ({ ...schemas[k], defaultValue: d[k] }));
}

const fmt = n => Number.isFinite(Number(n)) ? (Math.round(Number(n) * 100) / 100).toFixed(2) : '0.00';
const deg = rad => fmt((rad * 180) / Math.PI) + '°';

/**
 * Computes exact mathematical formulas and live numeric metrics for all 20 R87 models,
 * strictly enforcing DAC_TA/HIEU_DINH_TOAN_HOC_BAT_BUOC.md.
 */
export function computeFoldNetFormulas(id, inputParams = {}, progress = 0) {
  const def = getFoldNetDefinition(id);
  if (!def) return null;
  const p = { ...def.defaultParams, ...inputParams };
  const a = Number(p.a) || 2;
  const b = Number(p.b) || 1.5;
  const c = Number(p.c) || 2;
  const h = Number(p.h) || 2;
  const R = Number(p.R) || 1.2;
  const R1 = Math.max(Number(p.R1) || 1.65, (Number(p.R2) || 0.85) + 0.1);
  const R2 = Math.min(Number(p.R2) || 0.85, R1 - 0.1);
  const pct = Math.round(Math.max(0, Math.min(1, Number(progress) || 0)) * 100);
  const stageIdx = pct <= 5 ? 0 : pct < 45 ? 1 : pct < 95 ? 2 : 3;
  const stageText = def.storyboard[stageIdx] || def.storyboard[0];

  let formulas = [];
  switch (def.notebookIndex) {
    case 1: {
      const sBase = a * a, sLat = 4 * a * a, sTot = 6 * a * a, vol = a * a * a;
      formulas = [
        { label: 'Diện tích 1 mặt đáy', expr: 'S_đáy = a²', value: fmt(sBase), unit: 'đv²' },
        { label: 'Diện tích xung quanh', expr: 'S_xq = 4a²', value: fmt(sLat), unit: 'đv²' },
        { label: 'Diện tích toàn phần', expr: 'S_tp = 6a²', value: fmt(sTot), unit: 'đv²' },
        { label: 'Thể tích khối lập phương', expr: 'V = a³', value: fmt(vol), unit: 'đv³' },
        { label: 'Góc gấp 5 bản lề', expr: 'φ = 90° · p', value: fmt(0.9 * pct) + '° / 90°', unit: '' }
      ];
      break;
    }
    case 2: {
      const sBase = a * b, sLat = 2 * (a + b) * h, sTot = 2 * (a * b + b * h + h * a), vol = a * b * h;
      formulas = [
        { label: 'Diện tích đáy', expr: 'S_đáy = a·b', value: fmt(sBase), unit: 'đv²' },
        { label: 'Diện tích xung quanh', expr: 'S_xq = 2(a+b)h', value: fmt(sLat), unit: 'đv²' },
        { label: 'Diện tích toàn phần', expr: 'S_tp = 2(ab+bh+ha)', value: fmt(sTot), unit: 'đv²' },
        { label: 'Thể tích hộp chữ nhật', expr: 'V = a·b·h', value: fmt(vol), unit: 'đv³' },
        { label: 'Góc bản lề vuông', expr: 'φ = 90° · p', value: fmt(0.9 * pct) + '° / 90°', unit: '' }
      ];
      break;
    }
    case 3: {
      const sBase = (Math.sqrt(3) / 4) * a * a, sLat = 3 * a * h, sTot = sLat + 2 * sBase, vol = sBase * h;
      formulas = [
        { label: 'Diện tích đáy đều', expr: 'S_đáy = (√3/4)a²', value: fmt(sBase), unit: 'đv²' },
        { label: 'Diện tích xung quanh', expr: 'S_xq = 3a·h', value: fmt(sLat), unit: 'đv²' },
        { label: 'Diện tích toàn phần', expr: 'S_tp = 3ah + (√3/2)a²', value: fmt(sTot), unit: 'đv²' },
        { label: 'Thể tích lăng trụ', expr: 'V = S_đáy · h', value: fmt(vol), unit: 'đv³' },
        { label: 'Góc gấp cạnh bên / đáy', expr: 'φ_bên = 120°, φ_đáy = 90°', value: `${fmt(1.2 * pct)}° / ${fmt(0.9 * pct)}°`, unit: '' }
      ];
      break;
    }
    case 4: {
      const hd = Number(p.height) || 2.2;
      const sBase = ((a + b) * hd) / 2;
      const leg1 = hd, leg2 = Math.hypot(a - b, hd);
      const perim = a + b + leg1 + leg2;
      const sLat = perim * h, sTot = sLat + 2 * sBase, vol = sBase * h;
      formulas = [
        { label: 'Diện tích đáy hình thang', expr: 'S_đáy = (a+b)·h_d / 2', value: fmt(sBase), unit: 'đv²' },
        { label: 'Chu vi đáy', expr: 'P_đáy = a + b + c + d', value: fmt(perim), unit: 'đv' },
        { label: 'Diện tích xung quanh', expr: 'S_xq = P_đáy · h', value: fmt(sLat), unit: 'đv²' },
        { label: 'Thể tích lăng trụ tứ giác', expr: 'V = S_đáy · h', value: fmt(vol), unit: 'đv³' }
      ];
      break;
    }
    case 5: {
      const hyp = Math.hypot(a, b), sBase = 0.5 * a * b, perim = a + b + hyp, sLat = perim * h, vol = sBase * h;
      formulas = [
        { label: 'Cạnh huyền đáy', expr: 'c = √(a² + b²)', value: fmt(hyp), unit: 'đv' },
        { label: 'Diện tích đáy tam giác', expr: 'S_đáy = ½ a·b', value: fmt(sBase), unit: 'đv²' },
        { label: 'Diện tích xung quanh', expr: 'S_xq = (a+b+c)·h', value: fmt(sLat), unit: 'đv²' },
        { label: 'Thể tích lăng trụ đứng', expr: 'V = S_đáy · h', value: fmt(vol), unit: 'đv³' }
      ];
      break;
    }
    case 6: {
      const rIn = a / (2 * Math.sqrt(3));
      const d = Math.hypot(h, rIn);
      const theta = Math.atan((2 * Math.sqrt(3) * h) / a);
      const sBase = (Math.sqrt(3) / 4) * a * a, sLat = 1.5 * a * d, vol = (sBase * h) / 3;
      formulas = [
        { label: 'Trung đoạn mặt bên', expr: 'd = √(h² + a²/12)', value: fmt(d), unit: 'đv' },
        { label: 'Góc nhị diện đáy (chuẩn)', expr: 'tan θ = 2√3·h / a', value: deg(theta), unit: '' },
        { label: 'Diện tích xung quanh', expr: 'S_xq = (3/2)·a·d', value: fmt(sLat), unit: 'đv²' },
        { label: 'Thể tích chóp tam giác đều', expr: 'V = (√3/12)·a²·h', value: fmt(vol), unit: 'đv³' }
      ];
      break;
    }
    case 7: {
      const d = Math.hypot(h, a / 2);
      const theta = Math.atan((2 * h) / a);
      const sBase = a * a, sLat = 2 * a * d, vol = (sBase * h) / 3;
      formulas = [
        { label: 'Trung đoạn mặt bên', expr: 'd = √(h² + a²/4)', value: fmt(d), unit: 'đv' },
        { label: 'Góc nhị diện [S,AB,O]', expr: 'tan θ = 2h / a', value: deg(theta), unit: '' },
        { label: 'Diện tích xung quanh', expr: 'S_xq = 2·a·d', value: fmt(sLat), unit: 'đv²' },
        { label: 'Thể tích chóp tứ giác đều', expr: 'V = ⅓ a²·h', value: fmt(vol), unit: 'đv³' }
      ];
      break;
    }
    case 8: {
      const l = Math.hypot(R, h);
      const alphaRad = (2 * Math.PI * R) / l;
      const sBase = Math.PI * R * R, sLat = Math.PI * R * l, vol = (sBase * h) / 3;
      formulas = [
        { label: 'Đường sinh hình nón', expr: 'l = √(R² + h²)', value: fmt(l), unit: 'đv' },
        { label: 'Góc ở đỉnh hình quạt', expr: 'α = (R / l) · 360°', value: deg(alphaRad), unit: '' },
        { label: 'Diện tích xung quanh', expr: 'S_xq = π·R·l', value: fmt(sLat), unit: 'đv²' },
        { label: 'Thể tích khối nón', expr: 'V = ⅓ π·R²·h', value: fmt(vol), unit: 'đv³' }
      ];
      break;
    }
    case 9: {
      const width = 2 * Math.PI * R, sBase = Math.PI * R * R, sLat = width * h, vol = sBase * h;
      formulas = [
        { label: 'Bề rộng tấm phẳng', expr: 'L = 2π·R', value: fmt(width), unit: 'đv' },
        { label: 'Diện tích xung quanh', expr: 'S_xq = 2π·R·h', value: fmt(sLat), unit: 'đv²' },
        { label: 'Diện tích toàn phần', expr: 'S_tp = 2πR(h + R)', value: fmt(sLat + 2 * sBase), unit: 'đv²' },
        { label: 'Thể tích khối trụ', expr: 'V = π·R²·h', value: fmt(vol), unit: 'đv³' }
      ];
      break;
    }
    case 10: {
      const sBase = a * b;
      const sLat = 0.5 * a * h + 0.5 * b * h + 0.5 * b * Math.hypot(a, h) + 0.5 * a * Math.hypot(b, h);
      const thetaBC = Math.atan(h / a), thetaCD = Math.atan(h / b);
      formulas = [
        { label: 'Mặt vuông góc đáy', expr: '(SAB) ⊥ (ABCD), (SAD) ⊥ (ABCD)', value: '90.00°', unit: '' },
        { label: 'Góc nhị diện cạnh BC, CD', expr: 'θ_BC = arctan(h/a), θ_CD = arctan(h/b)', value: `${deg(thetaBC)} ; ${deg(thetaCD)}`, unit: '' },
        { label: 'Diện tích toàn phần', expr: 'S_tp = ab + S_SAB + S_SAD + S_SBC + S_SCD', value: fmt(sBase + sLat), unit: 'đv²' },
        { label: 'Thể tích khối chóp', expr: 'V = ⅓ a·b·h', value: fmt((sBase * h) / 3), unit: 'đv³' }
      ];
      break;
    }
    case 11: {
      const sBase = 0.5 * a * b;
      const thetaBC = Math.atan(h / a);
      formulas = [
        { label: 'Định lí 3 đường vuông góc', expr: 'BC ⊥ AB, SA ⊥ (ABC) ⇒ BC ⊥ SB', value: '∠SBC = 90°', unit: '' },
        { label: 'Góc nhị diện [S, BC, A]', expr: 'θ_BC = ∠SBA = arctan(h / a)', value: deg(thetaBC), unit: '' },
        { label: 'Diện tích đáy ΔABC', expr: 'S_ABC = ½ a·b', value: fmt(sBase), unit: 'đv²' },
        { label: 'Thể tích chóp S.ABC', expr: 'V = ⅙ a·b·h', value: fmt((a * b * h) / 6), unit: 'đv³' }
      ];
      break;
    }
    case 12: {
      const delta = Math.acos(1 / 3);
      const extFold = Math.PI - delta;
      const hTet = a * Math.sqrt(2 / 3);
      const sTot = Math.sqrt(3) * a * a;
      const vol = (Math.SQRT2 / 12) * a * a * a;
      formulas = [
        { label: 'Góc nhị diện trong δ', expr: 'δ = arccos(1/3)', value: deg(delta), unit: '' },
        { label: 'Góc gấp ngoài từ lưới phẳng', expr: 'φ = 180° - arccos(1/3)', value: deg(extFold), unit: '' },
        { label: 'Chiều cao & Diện tích', expr: 'h = a√(2/3), S_tp = √3·a²', value: `h=${fmt(hTet)}, S=${fmt(sTot)}`, unit: '' },
        { label: 'Thể tích tứ diện đều', expr: 'V = (√2 / 12)·a³', value: fmt(vol), unit: 'đv³' }
      ];
      break;
    }
    case 13: {
      const sOAB = 0.5 * a * b, sOBC = 0.5 * b * c, sOCA = 0.5 * c * a;
      const sABC = Math.sqrt(sOAB * sOAB + sOBC * sOBC + sOCA * sOCA);
      const hO = 1 / Math.sqrt(1 / (a * a) + 1 / (b * b) + 1 / (c * c));
      const vol = (a * b * c) / 6;
      formulas = [
        { label: 'Định lí De Gua (chuẩn)', expr: 'S_ABC² = S_OAB² + S_OBC² + S_OCA²', value: `S_ABC = ${fmt(sABC)}`, unit: 'đv²' },
        { label: 'Đường cao từ đỉnh vuông O', expr: '1/h_O² = 1/a² + 1/b² + 1/c²', value: `h_O = ${fmt(hO)}`, unit: 'đv' },
        { label: 'Diện tích toàn phần', expr: 'S_tp = S_OAB + S_OBC + S_OCA + S_ABC', value: fmt(sOAB + sOBC + sOCA + sABC), unit: 'đv²' },
        { label: 'Thể tích tứ diện vuông', expr: 'V = ⅙ a·b·c', value: fmt(vol), unit: 'đv³' }
      ];
      break;
    }
    case 14: {
      const s = Math.hypot(h, (a - b) / 2);
      const theta = Math.acos((a - b) / (2 * s));
      const sLat = 2 * (a + b) * s;
      const vol = (h * (a * a + a * b + b * b)) / 3;
      formulas = [
        { label: 'Đường cao mặt bên (trung đoạn)', expr: 'd = √(h² + ((a-b)/2)²)', value: fmt(s), unit: 'đv' },
        { label: 'Góc nhị diện mặt bên & đáy lớn', expr: 'cos θ = (a - b) / (2d)', value: deg(theta), unit: '' },
        { label: 'Diện tích xung quanh', expr: 'S_xq = 2(a + b)·d', value: fmt(sLat), unit: 'đv²' },
        { label: 'Thể tích chóp cụt đều', expr: 'V = (h/3)(a² + ab + b²)', value: fmt(vol), unit: 'đv³' }
      ];
      break;
    }
    case 15: {
      const sBase = a * b, thetaCD = Math.atan(h / b), vol = (sBase * h) / 3;
      formulas = [
        { label: 'Mặt bên vuông góc đáy', expr: '(SAB) ⊥ (ABCD), SH ⊥ AB', value: 'θ_AB = 90.00°', unit: '' },
        { label: 'Góc nhị diện mặt đối [S,CD,H]', expr: 'tan θ_CD = h / b', value: deg(thetaCD), unit: '' },
        { label: 'Diện tích đáy chữ nhật', expr: 'S_đáy = a·b', value: fmt(sBase), unit: 'đv²' },
        { label: 'Thể tích khối chóp', expr: 'V = ⅓ a·b·h', value: fmt(vol), unit: 'đv³' }
      ];
      break;
    }
    case 16: {
      const hb = Number(p.hbase) || 1.5;
      const sBase = 1.5 * a * hb, vol = (sBase * h) / 3;
      formulas = [
        { label: 'Đáy hình thang vuông', expr: 'AD = 2a, BC = a, AB = h_b', value: `S_đáy = ${fmt(sBase)}`, unit: 'đv²' },
        { label: 'Quan hệ vuông góc đặc trưng', expr: 'AC ⊥ CD và SA ⊥ CD ⇒ CD ⊥ (SAC)', value: '∠SCD = 90°', unit: '' },
        { label: 'Chiều cao khối chóp', expr: 'SA ⊥ (ABCD)', value: fmt(h), unit: 'đv' },
        { label: 'Thể tích chóp đáy hình thang', expr: 'V = ⅓ S_đáy · h', value: fmt(vol), unit: 'đv³' }
      ];
      break;
    }
    case 17: {
      const rCircum = a * 0.56;
      const edgeS = Math.hypot(h, rCircum);
      const sBase = 0.36 * a * a;
      formulas = [
        { label: 'Tính chất chân đường cao O', expr: 'SA = SB = SC ⇒ O là tâm ngoại tiếp ΔABC', value: `R_ngoại ≈ ${fmt(rCircum)}`, unit: 'đv' },
        { label: 'Độ dài 3 cạnh bên bằng nhau', expr: 'SA = SB = SC = √(h² + R²)', value: fmt(edgeS), unit: 'đv' },
        { label: 'Diện tích đáy ΔABC', expr: 'S_ABC = abc / (4R)', value: fmt(sBase), unit: 'đv²' },
        { label: 'Thể tích khối chóp', expr: 'V = ⅓ S_ABC · h', value: fmt((sBase * h) / 3), unit: 'đv³' }
      ];
      break;
    }
    case 18: {
      const gap = R1 - R2;
      const s = Math.hypot(h, gap);
      const L1 = (s * R1) / gap, L2 = (s * R2) / gap;
      const alpha = (2 * Math.PI * gap) / s;
      const sLat = Math.PI * (R1 + R2) * s;
      const vol = (Math.PI * h * (R1 * R1 + R1 * R2 + R2 * R2)) / 3;
      formulas = [
        { label: 'Đường sinh & Bán kính quạt', expr: 's = √(h²+(R₁-R₂)²), L₁ = sR₁/(R₁-R₂)', value: `s=${fmt(s)}, L₁=${fmt(L1)}, L₂=${fmt(L2)}`, unit: '' },
        { label: 'Góc quạt vành khăn', expr: 'α = 2π(R₁ - R₂) / s', value: deg(alpha), unit: '' },
        { label: 'Diện tích xung quanh', expr: 'S_xq = π(R₁ + R₂)·s', value: fmt(sLat), unit: 'đv²' },
        { label: 'Thể tích hình nón cụt', expr: 'V = (πh/3)(R₁² + R₁R₂ + R₂²)', value: fmt(vol), unit: 'đv³' }
      ];
      break;
    }
    case 19: {
      const sx = Number(p.shearX) || 0.85, sy = Number(p.shearY) || 0.33;
      const edgeLen = Math.hypot(sx, sy, h);
      const sBase = a * b;
      const sLat = 2 * a * Math.hypot(sy, h) + 2 * b * Math.hypot(sx, h);
      const vol = sBase * h;
      formulas = [
        { label: 'Vectơ cạnh bên xiên', expr: 'v = (shearX, shearY, h)', value: `|v| = ${fmt(edgeLen)}`, unit: 'đv' },
        { label: 'Diện tích xung quanh (tích có hướng)', expr: 'S_xq = ∑ ||e_i × v||', value: fmt(sLat), unit: 'đv²' },
        { label: 'Diện tích toàn phần', expr: 'S_tp = S_xq + 2·a·b', value: fmt(sLat + 2 * sBase), unit: 'đv²' },
        { label: 'Thể tích hộp xiên (Cavalieri)', expr: 'V = S_đáy · h_⊥ = a·b·h', value: fmt(vol), unit: 'đv³' }
      ];
      break;
    }
    case 20: {
      const sx = Number(p.shearX) || 0.8, sy = Number(p.shearY) || 0.25;
      const edgeLen = Math.hypot(sx, sy, h);
      const sBase = 0.5 * a * b;
      const vol = sBase * h;
      formulas = [
        { label: 'Độ dài cạnh bên xiên', expr: 'AA\' = √(shearX² + shearY² + h²)', value: fmt(edgeLen), unit: 'đv' },
        { label: 'Chiều cao vuông góc đáy', expr: 'h_⊥ = d(A\', (ABC)) = h', value: fmt(h), unit: 'đv' },
        { label: 'Diện tích đáy ΔABC', expr: 'S_đáy = ½ a·b', value: fmt(sBase), unit: 'đv²' },
        { label: 'Thể tích lăng trụ xiên', expr: 'V = S_đáy · h_⊥', value: fmt(vol), unit: 'đv³' }
      ];
      break;
    }
  }

  return {
    id: def.id,
    notebookIndex: def.notebookIndex,
    name: def.name,
    lesson: def.lesson,
    grades: def.grades,
    unfolding: def.unfolding,
    progressPct: pct,
    stageIndex: stageIdx + 1,
    stageCount: 4,
    stageText,
    storyboard: def.storyboard,
    formulas
  };
}

