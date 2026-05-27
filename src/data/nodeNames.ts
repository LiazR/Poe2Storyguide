export type NameLocale = "international" | "chinese";

interface NodeNamePair {
  international: string;
  chinese: string;
}

const nodeNamePairs: Record<string, NodeNamePair[]> = {
  act1: [
    { international: "河岸", chinese: "污流河畔" },
    { international: "皆伐營地", chinese: "克里费尔营地" },
    { international: "皆伐", chinese: "克里费尔" },
    { international: "葛瑞爾林", chinese: "韧木森林" },
    { international: "赤谷", chinese: "红谷" },
    { international: "纏縛陰林", chinese: "阴森网道" },
    { international: "不朽帝国之墓", chinese: "永恒园林" },
    { international: "獵場", chinese: "猎场" },
    { international: "弗雷索恩", chinese: "茂棘深林" },
    { international: "奧格姆農地", chinese: "欧甘农地" },
    { international: "奥格姆村", chinese: "欧甘村庄" },
    { international: "宅第壁壘", chinese: "庄园城壁" },
    { international: "奥格姆宅第", chinese: "欧甘庄园" },
  ],
  act2: [
    { international: "瓦斯提里郊區", chinese: "瓦斯提里外沿" },
    { international: "阿杜拉車隊", chinese: "阿杜拉的商队" },
    { international: "哈拉妮關口", chinese: "哈拉尼之门" },
    { international: "莫頓挖石場", chinese: "莫丹采石场" },
    { international: "莫頓礦坑", chinese: "莫丹矿场" },
    { international: "叛徒之路", chinese: "叛徒小径" },
    { international: "哈拉妮關口", chinese: "哈拉尼之门" },
    { international: "絲克瑪試煉", chinese: "丝克玛试炼" },
    { international: "凯斯城", chinese: "克斯" },
    { international: "失落之城", chinese: "失落之城" },
    { international: "掩埋神殿", chinese: "掩埋的殿堂" },
    { international: "乳齒象惡地", chinese: "长毛象荒原" },
    { international: "無光通道", chinese: "暗光走廊" },
    { international: "靈魂深幷", chinese: "灵魂之井" },
    { international: "骨坑", chinese: "遗迹深坑" },
    { international: "泰坦之谷", chinese: "巨人之谷" },
    { international: "泰坦石窟", chinese: "巨人石窟" },
    { international: "戴斯哈", chinese: "德莎尔" },
    { international: "悼念之路", chinese: "怀念之阶" },
    { international: "戴斯哈尖塔", chinese: "德莎尔的高塔" },
    { international: "無畏隊", chinese: "无畏战车" },
    { international: "無畏隊先鋒", chinese: "无畏战车先锋" },
  ],
  act3: [
    { international: "風沙沼澤", chinese: "飞沙沼泽" },
    { international: "高地神塔營地", chinese: "金字塔营地" },
    { international: "叢林遺跡", chinese: "丛林废墟" },
    { international: "劇毒墓穴", chinese: "蛇毒地窟" },
    { international: "感染荒地", chinese: "滋孽荒原" },
    { international: "阿札克泥沼", chinese: "阿扎卡泥沼" },
    { international: "龍蜥濕地", chinese: "幻缈湿地" },
    { international: "混沌神殿", chinese: "混沌大殿" },
    { international: "吉卡尼的機械迷城", chinese: "佳华尼的机械迷城" },
    { international: "吉卡尼的聖域", chinese: "佳华尼的密殿" },
    { international: "瑪特蘭水道", chinese: "马特兰水道" },
    { international: "淹没之城", chinese: "淹没之城" },
    { international: "熔岩寶庫", chinese: "熔火宝库" },
    { international: "污垢頂峰", chinese: "污秽巅峰" },
    { international: "科佩克神殿", chinese: "科佩克之殿" },
    { international: "奥札爾", chinese: "乌扎尔" },
    { international: "阿戈拉", chinese: "阿戈拉特" },
    { international: "漆黑密室", chinese: "暗胧殿堂" },
  ],
  act4: [
    { international: "金司馬區", chinese: "君锋镇" },
    { international: "凱吉灣", chinese: "落锚湾" },
    { international: "旅程之末", chinese: "旅途终点" },
    { international: "金氏島", chinese: "亲眷岛" },
    { international: "火山迷窟", chinese: "熔火院落" },
    { international: "瓦卡帕努島", chinese: "瓦卡帕努岛" },
    { international: "吟謠洞窟", chinese: "冥曲洞窟" },
    { international: "廢棄監獄", chinese: "废弃监牢" },
    { international: "單獨禁閉", chinese: "遗世监禁" },
    { international: "伯勞鳥之島", chinese: "百舌岛" },
    { international: "阿拉塔斯", chinese: "阿拉斯塔" },
    { international: "挖掘", chinese: "挖掘场" },
    { international: "尼加卡努", chinese: "纳卡努" },
    { international: "部族之心", chinese: "部族之心" },
    { international: "悉妮蔻拉之眼", chinese: "辛格拉之眼" },
    { international: "亡者之殿", chinese: "亡者之境" },
    { international: "祖靈的試煉", chinese: "祖先的试炼" },
  ],
};

export function getNodeDisplayName(
  chapterId: string,
  nodeId: string,
  fallbackName: string,
  locale: NameLocale,
) {
  if (locale === "international") return fallbackName;
  const index = Number(nodeId.replace("node_", "")) - 1;
  const pair = nodeNamePairs[chapterId]?.[index];
  return pair?.chinese ?? fallbackName;
}
