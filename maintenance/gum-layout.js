// Viewport-relative anchors distribute desktop bubbles across the entire canvas.
// Phone/tablet composition keeps the existing compact right-hand cluster.
const DESKTOP_ANCHORS = [
  [.77,.39,1], [.11,.20,.82], [.18,.81,.90], [.49,.10,1],
  [.91,.88,1], [.47,.57,1], [.04,.52,1], [.93,.10,1],
  [.52,.90,1], [.30,.43,1], [.32,.08,1], [.94,.58,1],
];

export function getBubbleLayout(width,height,definitions) {
  if(definitions.length!==DESKTOP_ANCHORS.length)throw new Error('Add an explicit desktop anchor for every bubble');
  if(width<=700)return {
    groupX:-.2,groupScale:.77,
    transforms:definitions.map(def=>({position:def.slice(0,3),scale:1})),
  };
  const aspect=width/height;
  return {
    groupX:0,groupScale:1,
    transforms:definitions.map((def,id)=>{
      const [u,v,scale]=DESKTOP_ANCHORS[id];
      return {position:[(u-.5)*6*aspect,(.5-v)*6,def[2]],scale};
    }),
  };
}
