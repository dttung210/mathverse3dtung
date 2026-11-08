/** R90: Link EXISTING 7–12 gallery catalog objects to their existing SGK lesson modes.
 * One canonical source exhibit ID, one target lesson. No catalog cloning or app add-on.
 * Links are pedagogical associations, not claims that all exhibits are WebGL solids.
 */
import {getCurriculumModelById} from './curriculum-manifest.mjs';

export const SGK_EXHIBIT_TO_MODE=Object.freeze({
 g7_04:'7-02-C01',g7_09:'7-02-C05',g7_10:'7-03-C01',
 g7_11:'7-04-C01',g7_12:'7-06-C01',g7_13:'7-05-C01',
 g7_02:'7-08-C01',g7_01:'7-09-C01',g7_14:'7-09-C02',
 g8_01:'8-09-C02',g8_02:'8-09-C01',g8_03:'8-05-C01',
 g8_04:'8-03-C01',g8_05:'8-03-C03',g8_06:'8-02-C02',
 g8_07:'8-02-C03',g8_08:'8-06-C08',g8_09:'8-07-C01',
 g9_01:'9-09-C01',g9_02:'9-10-C01',g9_03:'9-11-C03',
 g9_04:'9-08-C01',g9_05:'9-03-C01',g9_06:'9-06-C02',
 g9_07:'9-07-C01',g9_08:'9-07-C03',g9_09:'9-07-C05',
 g10_01:'10-06-C01',g10_02:'10-02-C01',g10_03:'10-03-C01',
 g10_04:'10-04-C01',g10_05:'10-04-C04',g10_06:'10-07-C01',
 g10_07:'10-08-C01',g10_08:'10-09-C01',g10_09:'10-09-C02',
 g11_01:'11-05-C02',g11_02:'11-05-C03',g11_03:'11-06-C02',
 g11_04:'11-06-C03',g11_05:'11-07-C02',g11_06:'11-07-C03',
 g11_07:'11-08-C01',g11_08:'11-08-C02',g11_09:'11-09-C03',
 g12_01:'12-02-C01',g12_02:'12-02-C02',g12_03:'12-07-C01',
 g12_04:'12-04-C01',g12_05:'12-04-C02',g12_06:'12-10-C01',
 g12_07:'12-08-C01',g12_08:'12-09-C01',g12_09:'12-09-C03'
});
export const SGK_EXHIBIT_COUNT=Object.keys(SGK_EXHIBIT_TO_MODE).length;
export function exhibitSgkLesson(exhibitId){
 const anchorModeId=SGK_EXHIBIT_TO_MODE[String(exhibitId)||''];
 if(!anchorModeId)return null;
 const curriculum=getCurriculumModelById(anchorModeId);
 return curriculum?{anchorModeId,curriculum}:null;
}
