# Optional math engines (on-demand installation)

The original V15.1 runs offline without these files. The user explicitly runs `CAI_THU_VIEN_MO_RONG.bat` on Windows (or `npm run setup:engines`) to install pinned optional libraries here:

- JSXGraph v1.14.1 (MIT OR LGPL-3.0-or-later): jsxgraphcore.js, jsxgraph.css, and the MIT license.
- Apache ECharts v6.1.0 (Apache-2.0): echarts.min.js and Apache license.

The installer downloads only from pinned https://cdn.jsdelivr.net/npm/ or https://unpkg.com/, stores local copies, and records hashes. Browser CSP remains same-origin only. If the installer cannot download, all native viewers and museum 3D continue to run normally.
