/** Licensed-reference photo resolver. No network call until an exhibit is opened.
 * Images/credits are retrieved from Wikimedia Commons metadata at runtime.
 * A matched Wikipedia lead image is a reference photograph, NOT definitive proof
 * that it depicts the exact UNESCO component. Teachers should review it.
 */
const wiki = 'https://en.wikipedia.org/w/api.php';
const commons = 'https://commons.wikimedia.org/wiki/';
const cache = new Map();
const galleryTitles = Object.freeze({
  traffic:'Traffic light',fish:'Aquarium',wheel:'Bicycle wheel',clock:'Clock',
  window_arch:'Arch',street_sign:'Warning sign',picture_frame:'Picture frame',
  pizza_slices:'Pizza',kaleidoscope:'Kaleidoscope',road_roundabout:'Roundabout',
  parcel_box:'Corrugated box',water_tank:'Water tank',ice_cream_cone:'Ice cream cone',
  camping_tent:'Tent',roof_house:'Roof',flower_pot:'Flowerpot',
  butterfly:'Butterfly',snowflake:'Snowflake',flower_petals:'Flower',
  mandala:'Mandala',fabric_pattern:'Textile design',leaf_axis:'Leaf',
  fruit_basket:'Fruit',bookshelf:'Bookcase',number_elevator:'Elevator',
  coins_fraction:'Coin',recipe_scale:'Kitchen scale',chessboard:'Chessboard',
  ladder:'Ladder',map_scale:'Map',stairs:'Stairs',shadow_pole:'Flagpole',
  farm_field:'Field (agriculture)',fountain_arc:'Fountain',
  class_survey:'Survey (human research)',weather_chart:'Weather station',
  spinning_wheel:'Spinning wheel',dice_board:'Dice',traffic_counts:'Traffic count',
  rainfall_chart:'Rain gauge'
});

const VERIFIED_LOCAL_COMMONS = Object.freeze({
  r107_borobudur:{url:'/dual/discovery-r106/assets/photos/r107_borobudur.jpg',source:'https://commons.wikimedia.org/wiki/File:Pradaksina.jpg',author:'Heri nugroho',license:'CC BY-SA 4.0',verified:true,referenceOnly:true,title:'Borobudur'},
  r107_angkor:{url:'/dual/discovery-r106/assets/photos/r107_angkor.jpg',source:'https://commons.wikimedia.org/wiki/File:Angkor_Wat.jpg',author:'Bjørn Christian Tørrissen',license:'CC BY-SA 4.0',verified:true,referenceOnly:true,title:'Angkor_Wat'},
  r107_pisa:{url:'/dual/discovery-r106/assets/photos/r107_pisa.jpg',source:'https://commons.wikimedia.org/wiki/File:Italy_-_Pisa_-_Leaning_Tower.jpg',author:'Arne Müseler',license:'CC BY-SA 3.0 de',verified:true,referenceOnly:true,title:'Leaning_Tower_of_Pisa'},
  r107_samarra:{url:'/dual/discovery-r106/assets/photos/r107_samarra.jpg',source:'https://commons.wikimedia.org/wiki/File:Samrraa_05.jpg',author:'Fakhri Mahmood',license:'CC BY-SA 4.0',verified:true,referenceOnly:true,title:'Great_Mosque_of_Samarra'},
  r107_himeji:{url:'/dual/discovery-r106/assets/photos/r107_himeji.jpg',source:'https://commons.wikimedia.org/wiki/File:Himeji_castle_in_may_2015.jpg',author:'Nikos Kitsakis',license:'CC BY-SA 4.0',verified:true,referenceOnly:true,title:'Himeji_Castle'},
  r107_sagrada:{url:'/dual/discovery-r106/assets/photos/r107_sagrada.jpg',source:'https://commons.wikimedia.org/wiki/File:SF_maig_2_cropped.jpg',author:'Canaan',license:'CC BY-SA 4.0',verified:true,referenceOnly:true,title:'Sagrada_Família'},
  r107_brasilia:{url:'/dual/discovery-r106/assets/photos/r107_brasilia.jpg',source:'https://commons.wikimedia.org/wiki/File:Catedral_Metropolitana_de_Brasilia.jpg',author:'Tissiana de A. de Souza',license:'CC BY-SA 4.0',verified:true,referenceOnly:true,title:'Cathedral_of_Brasília'},
  r107_lotus:{url:'/dual/discovery-r106/assets/photos/r107_lotus.jpg',source:'https://commons.wikimedia.org/wiki/File:LotusDelhi.jpg',author:'Vandelizer',license:'CC BY 2.0',verified:true,referenceOnly:true,title:'Lotus_Temple'},
  r107_millau:{url:'/dual/discovery-r106/assets/photos/r107_millau.jpg',source:'https://commons.wikimedia.org/wiki/Category:Viaduc_de_Millau',author:'Robert Kiraly (kingdome)',license:'CC BY-SA 4.0',verified:true,referenceOnly:true,title:'Millau_Viaduct'},
  r107_needle:{url:'/dual/discovery-r106/assets/photos/r107_needle.jpg',source:'https://commons.wikimedia.org/wiki/File:Space_Needle_2011-07-04.jpg',author:'Jordon Kalilich',license:'Public domain',verified:true,referenceOnly:true,title:'Space_Needle'},
  r107_basalt:{url:'/dual/discovery-r106/assets/photos/r107_basalt.jpg',source:'https://commons.wikimedia.org/wiki/File:Causeway-code_poet-4.jpg',author:'code poet on flickr.',license:'CC BY-SA 2.0',verified:true,referenceOnly:true,topicCategory:'Category:Basalt_columns'},
  r107_spiderweb:{url:'/dual/discovery-r106/assets/photos/r107_spiderweb.jpg',source:'https://commons.wikimedia.org/wiki/File:2006-09-10_(15_swge).JPG',author:'Norbert Kaiser',license:'CC BY-SA 2.5',verified:true,referenceOnly:true,topicCategory:'Category:Spider_webs'},
  r107_nautilus:{url:'/dual/discovery-r106/assets/photos/r107_nautilus.jpg',source:'https://commons.wikimedia.org/wiki/File:Plo%C3%ABrmel_-_mus%C3%A9e_Jean-Marie_de_Lamennais_05.jpg',author:'Fab5669',license:'CC BY-SA 4.0',verified:true,referenceOnly:true,topicCategory:'Category:Nautilus_shells'},
  r107_leaf:{url:'/dual/discovery-r106/assets/photos/r107_leaf.jpg',source:'https://commons.wikimedia.org/wiki/File:Acanthaceae_leaf.jpg',author:'NathanBeach',license:'CC BY-SA 3.0',verified:true,referenceOnly:true,topicCategory:'Category:Leaf_veins'},
  r107_treerings:{url:'/dual/discovery-r106/assets/photos/r107_treerings.jpg',source:'https://commons.wikimedia.org/wiki/File:Alburnum_(PSF).png',author:'Pearson Scott Foresman',license:'Public domain',verified:true,referenceOnly:true,topicCategory:'Category:Tree_rings'},
  r107_pineapple:{url:'/dual/discovery-r106/assets/photos/r107_pineapple.jpg',source:'https://commons.wikimedia.org/wiki/File:Ananas_22032007.JPG',author:'Fica Blok38',license:'CC BY-SA 3.0',verified:true,referenceOnly:true,topicCategory:'Category:Pineapples'},
  r107_soapbubbles:{url:'/dual/discovery-r106/assets/photos/r107_soapbubbles.jpg',source:'https://commons.wikimedia.org/wiki/File:2004-08-28_Soap_bubble.jpg',author:'Wikimedia Commons',license:'CC BY-SA 3.0',verified:true,referenceOnly:true,topicCategory:'Category:Soap_bubbles'},
  r107_soapfilms:{url:'/dual/discovery-r106/assets/photos/r107_soapfilms.jpg',source:'https://commons.wikimedia.org/wiki/File:Bulle_cat%C3%A9no%C3%AFde.png',author:'Blinking Spirit',license:'CC0',verified:true,referenceOnly:true,topicCategory:'Category:Soap_films'},
  r107_butterfly:{url:'/dual/discovery-r106/assets/photos/r107_butterfly.jpg',source:'https://commons.wikimedia.org/wiki/File:Knuth_(5096639832).jpg',author:'vastateparksstaff',license:'CC BY 2.0',verified:true,referenceOnly:true,topicCategory:'Category:Butterflies'},
  r107_dish:{url:'/dual/discovery-r106/assets/photos/r107_dish.jpg',source:'https://commons.wikimedia.org/wiki/File:Antenne_plate_guide.jpg',author:'Casimodo',license:'CC BY-SA 3.0',verified:true,referenceOnly:true,topicCategory:'Category:Satellite_dishes'},
  r107_windturbine:{url:'/dual/discovery-r106/assets/photos/r107_windturbine.jpg',source:'https://commons.wikimedia.org/wiki/File:Apr%C3%A8s-midi_d\'%C3%A9t%C3%A9.JPG',author:'Fotaficion',license:'CC BY-SA 4.0',verified:true,referenceOnly:true,topicCategory:'Category:Wind_turbines'},
  r107_truss:{url:'/dual/discovery-r106/assets/photos/r107_truss.jpg',source:'https://commons.wikimedia.org/wiki/File:COLLECTIE_TROPENMUSEUM_Het_bouwen_van_een_stalen_spoorbrug_over_de_rivier_TMnr_60025581.jpg',author:'Tropenmuseum',license:'CC BY-SA 3.0',verified:true,referenceOnly:true,topicCategory:'Category:Truss_bridges'},
  r107_hyperboloid:{url:'/dual/discovery-r106/assets/photos/r107_hyperboloid.jpg',source:'https://commons.wikimedia.org/wiki/File:ChineseCoalPower_opt.jpg',author:'Wikimedia Commons',license:'CC BY-SA 3.0',verified:true,referenceOnly:true,topicCategory:'Category:Hyperboloid_structures'},
  r107_spring:{url:'/dual/discovery-r106/assets/photos/r107_spring.jpg',source:'https://commons.wikimedia.org/wiki/File:Mattress_Springs.jpg',author:'Angie from Sawara, Chiba-ken, Japan',license:'CC BY 2.0',verified:true,referenceOnly:true,topicCategory:'Category:Coil_springs'},
  r107_container:{url:'/dual/discovery-r106/assets/photos/r107_container.jpg',source:'https://commons.wikimedia.org/wiki/File:020115-N-6077T-003_VBSS_Team_Member.jpg',author:'U.S. Navy Photo by Kevin H. Tierney',license:'Public domain',verified:true,referenceOnly:true,topicCategory:'Category:Shipping_containers'},
  r107_irrigation:{url:'/dual/discovery-r106/assets/photos/r107_irrigation.jpg',source:'https://commons.wikimedia.org/wiki/File:Feij%C3%A3o_MacLee_270506_2.JPG',author:'Wikimedia Commons',license:'CC BY 2.5',verified:true,referenceOnly:true,topicCategory:'Category:Center_pivot_irrigation'},
  r107_chainring:{url:'/dual/discovery-r106/assets/photos/r107_chainring.jpg',source:'https://commons.wikimedia.org/wiki/File:Biopacesticker.jpg',author:'Rado bladteth Rzeznicki',license:'Public domain',verified:true,referenceOnly:true,topicCategory:'Category:Bicycle_chainrings'},
  r107_staircase:{url:'/dual/discovery-r106/assets/photos/r107_staircase.jpg',source:'https://commons.wikimedia.org/wiki/File:At_Victoria_and_Albert_Museum_2025_018.jpg',author:'Mike Peel (www.mikepeel.net)',license:'CC BY-SA 4.0',verified:true,referenceOnly:true,topicCategory:'Category:Spiral_staircases'}
});

const plain = (s='') => String(s).replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&nbsp;/g,' ').replace(/&#39;/g,"'").trim();
async function fetchJSON(url){
  const response = await fetch(url,{mode:'cors',credentials:'omit',cache:'force-cache'});
  if(!response.ok)throw Error(`HTTP ${response.status}`);
  return response.json();
}
function findPage(data){return Object.values(data?.query?.pages||{})[0]||null;}
export function requestedWikiTitle(item){return item?.wikipediaTitle || galleryTitles[item?.id] || null;}

/** Resolve an actual Wikimedia Commons photographic file from a CATEGORY, not a guessed filename.
 * Author and reuse license are checked for the selected file only; categories are NOT licensed assets.
 */
export async function resolveR107CommonsCategory(item){
 const category=item?.photo?.commonsCategory;
 if(!category)return null;
 if(typeof window!=='undefined' && item?.id && VERIFIED_LOCAL_COMMONS[item.id]){
  return VERIFIED_LOCAL_COMMONS[item.id];
 }
 const params=new URLSearchParams({action:'query',format:'json',origin:'*',generator:'categorymembers',gcmtitle:category,gcmtype:'file',gcmlimit:'35',prop:'imageinfo',iiprop:'url|extmetadata|mime',iiurlwidth:'1000'});
 const data=await fetchJSON(`https://commons.wikimedia.org/w/api.php?${params}`);
 const images=Object.values(data?.query?.pages||{}).filter(x=>x?.imageinfo?.[0]);
 const noFake=/(?:diagram|drawing|illustration|vector|logo|icon|scheme|painting|artwork|render|3d[- _]?model|animation|cartoon|aerial map)/i;
 for(const page of images){
  const info=page.imageinfo[0];
  if(!/^image\/(?:jpeg|png|webp)$/i.test(info.mime||''))continue;
  if(noFake.test(page.title||''))continue;
  const meta=info.extmetadata||{};
  const license=plain(meta.LicenseShortName?.value||meta.UsageTerms?.value||'');
  if(!/CC\s*BY(?:-SA)?|CC0|Public domain|\bPD\b/i.test(license))continue;
  if(/-NC|-ND|noncommercial|no.?derivatives/i.test(license))continue;
  const author=plain(meta.Artist?.value||meta.Credit?.value||'Tác giả tại trang nguồn').slice(0,150);
  const name=String(page.title).replace(/^File:/,'');
  const src=`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(name).replaceAll('%20','_')}`;
  return {url:info.thumburl||info.url,source:src,author,license,verified:true,referenceOnly:true,topicCategory:category};
 }
 if(item.wikipediaTitle){
  const first=await fetchJSON(`${wiki}?${new URLSearchParams({action:'query',format:'json',origin:'*',prop:'pageimages',piprop:'name',titles:item.wikipediaTitle,redirects:'1'})}`);
  const page=Object.values(first?.query?.pages||{})[0];
  if(page?.pageimage&&/\.(jpe?g|png|webp)$/i.test(page.pageimage)){
   const infoData=await fetchJSON(`https://commons.wikimedia.org/w/api.php?${new URLSearchParams({action:'query',format:'json',origin:'*',prop:'imageinfo',iiprop:'url|extmetadata|mime',iiurlwidth:'1000',titles:'File:'+page.pageimage})}`);
   const record=Object.values(infoData?.query?.pages||{})[0];const info=record?.imageinfo?.[0];
   if(info&&/^image\/(?:jpeg|png|webp)$/i.test(info.mime||'')){
    const md=info.extmetadata||{};
    const license=plain(md.LicenseShortName?.value||md.UsageTerms?.value||'');
    if(/CC\s*BY(?:-SA)?|CC0|Public domain|\bPD\b/i.test(license)&&!/-NC|-ND|noncommercial|no.?derivatives/i.test(license)){
     const author=plain(md.Artist?.value||md.Credit?.value||'Tác giả trên Wikimedia Commons').slice(0,150);
     return {url:info.thumburl||info.url,source:`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(page.pageimage).replaceAll('%20','_')}`,author,license,verified:true,referenceOnly:true,topicCategory:category};
    }
   }
  }
 }
 return null;
}

export function resolveDiscoveryPhoto(item){
  if(!item)return Promise.resolve(null);
  if(item.id && cache.has(item.id))return cache.get(item.id);
  if(typeof window!=='undefined' && item.id && VERIFIED_LOCAL_COMMONS[item.id]){
    const ready=Promise.resolve(VERIFIED_LOCAL_COMMONS[item.id]);
    cache.set(item.id,ready);
    return ready;
  }
  if(item.photo?.commonsCategory){
    const load=resolveR107CommonsCategory(item).catch(e=>{console.info('R107 Commons photo pending',item.id,e?.message);return null;});
    if(item.id)cache.set(item.id,load);
    return load;
  }
  if(item.photo?.status==='approved' && item.media?.photo?.startsWith('https://')){
    const localGallery = (typeof window !== 'undefined' && ['traffic','fish','wheel','clock'].includes(item.id))
      ? `/dual/discovery-r98/assets/gallery/${item.id}.jpg`
      : (typeof window !== 'undefined' && item.id?.startsWith('r106_'))
        ? `/dual/discovery-r106/assets/photos/${item.id}.jpg`
        : item.media.photo;
    const ready=Promise.resolve({url:localGallery,source:item.media.source,author:item.media.author,license:item.media.license,verified:true,referenceOnly:false});
    cache.set(item.id,ready);return ready;
  }
  const title=requestedWikiTitle(item);
  if(!title)return Promise.resolve(null);
  const load=(async()=>{
    const params = new URLSearchParams({action:'query',format:'json',origin:'*',prop:'pageimages',piprop:'name|thumbnail',pithumbsize:'1000',titles:title,redirects:'1'});
    const first=findPage(await fetchJSON(`${wiki}?${params}`));
    if(!first?.pageimage)return null;
    const imageName=first.pageimage;
    if(!/\.(jpe?g|png|webp)$/i.test(imageName))return null;
    const imgParams=new URLSearchParams({action:'query',format:'json',origin:'*',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'1000',titles:`File:${imageName}`});
    const second=findPage(await fetchJSON(`${wiki}?${imgParams}`));
    const info=second?.imageinfo?.[0];
    if(!info?.url)return null;
    const meta=info.extmetadata||{};
    const license=plain(meta.LicenseShortName?.value||meta.UsageTerms?.value||'Giấy phép xem trang nguồn');
    const author=plain(meta.Artist?.value||meta.Credit?.value||'Tác giả ghi tại Wikimedia Commons').slice(0,180);
    const allowed=/CC\s*BY|CC0|public domain|\bPD\b|GFDL/i.test(license);
    const restricted=/CC\s*BY.?NC|CC\s*BY.?ND|non.?commercial|no.?derivatives/i.test(license);
    if(!allowed || restricted)return null;
    const source=`${commons}File:${encodeURIComponent(imageName).replace(/%2F/g,'/')}`;
    return {url:info.thumburl||info.url,source,author,license,verified:true,referenceOnly:true,title};
  })().catch(error=>{console.info('Discovery Commons photo unavailable',item.id,error?.message);return null;});
  if(item.id)cache.set(item.id,load);
  return load;
}
