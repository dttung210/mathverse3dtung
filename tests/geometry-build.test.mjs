import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Mock minimal DOM for canvas sprites in labelPoint
if (typeof document === 'undefined') {
  globalThis.document = {
    createElement(tag) {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext() {
            return {
              fillStyle: '',
              strokeStyle: '',
              lineWidth: 0,
              font: '',
              textAlign: '',
              textBaseline: '',
              beginPath() {},
              arc() {},
              fill() {},
              stroke() {},
              fillText() {},
              roundRect() {}
            };
          }
        };
      }
      return {};
    }
  };
}

const catalog = JSON.parse(fs.readFileSync(new URL('../data/catalog.json', import.meta.url), 'utf8'));

test('Tất cả 63 mô hình trong catalog đều dựng hình 3D thành công không có lỗi', async () => {
  // Thay thế import /vendor/three.module.js bằng three package hoặc vendor file
  // Trong Node, chúng ta load vendor three file
  const geometryModule = await import('../src/geometry.js');
  const { createMathModel } = geometryModule;

  assert.equal(catalog.items.length, 63);

  let successCount = 0;
  for (const item of catalog.items) {
    try {
      const holder = createMathModel(item, { faces: true, edges: true, labels: true });
      assert.ok(holder, `Dựng hình trả về group cho ${item.id}`);
      assert.ok(holder.children.length > 0, `Group có các thành phần 3D cho ${item.id}`);
      successCount++;
    } catch (err) {
      assert.fail(`Lỗi khi dựng mô hình ${item.id} (${item.title}): ${err.message}`);
    }
  }

  assert.equal(successCount, 63);
  console.log(`Đã kiểm tra thành công tất cả ${successCount}/63 mô hình 3D!`);
});
