import { searchR6, ROOM_BY_ID, LAB_BY_ID, MODE_BY_ID } from '../src/museum/r6-room-layout.js';

console.log('Testing searchR6:');
const r1 = searchR6('đồng dạng');
console.log('Results for "đồng dạng":', r1.length);
if (r1.length === 0) throw new Error('Search for "đồng dạng" failed');

const r2 = searchR6('7-04-C05');
console.log('Results for "7-04-C05":', r2.length, r2[0]?.title);
if (r2.length === 0) throw new Error('Search for "7-04-C05" failed');

const r3 = searchR6('G7-R03');
console.log('Results for "G7-R03":', r3.length, r3[0]?.name);
if (r3.length === 0) throw new Error('Search for "G7-R03" failed');

const r4 = searchR6('Toán 8');
console.log('Results for "Toán 8":', r4.length);
if (r4.length === 0) throw new Error('Search for "Toán 8" failed');

console.log('All search checks passed successfully!');
