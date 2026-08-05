const consumerNodes = [
  "808:9358", "808:2901", "808:2951", "808:3529", "808:4310",
  "808:4369", "808:4492", "808:8597", "808:8847", "808:4514",
  "808:7911", "808:7679", "808:5571", "808:6634", "808:7849",
];

const enterpriseNodes = [
  "808:9910", "808:9807", "808:9756", "808:9992", "808:10222",
  "808:10273", "808:10585", "808:10752", "808:11152", "808:11240",
  "808:12509", "808:12606", "808:11922", "808:12759",
];

const consumerHeights = [1080, 1600, 1080, 1950, 1561, 2288, 1400, 2214, 3771, 2102, 2800, 2566, 1700, 1300, 1587];
const enterpriseHeights = [1600, 1080, 1080, 1600, 1080, 1922, 1600, 1700, 2000, 1080, 2016, 2300, 1100, 1080];

const consumerChapterTitles = [
  "项目封面", "产品概览", "现状与用户", "AI 调研流程", "需求洞察",
  "体验路径", "设计规范", "首页", "问诊与档案", "AI 对话",
  "辅助购药", "活动与个人中心", "商品与结算", "用药回访", "项目总结",
];

const enterpriseChapterTitles = [
  "项目封面与背景", "AI 调研", "机会点", "视觉规范", "栅格系统",
  "组件库", "异常看板", "任务列表", "进度验收", "高风险订单",
  "库存决策", "数据复盘", "多角色走查", "Vibe Coding 与 AI 反思",
];

function createBoard(project, frame, height, title) {
  const number = String(frame).padStart(2, "0");
  return {
    src: `/portfolio/${project}/boards/frame-${number}.webp`,
    mobile: `/portfolio/${project}/boards/frame-${number}-960.webp`,
    alt: `${title}第 ${frame} 张画板`,
    width: 1920,
    height,
  };
}

function createFrames(project, title, nodes, heights, chapterTitles) {
  return nodes.map((nodeId, index) => ({
    number: String(index + 1).padStart(2, "0"),
    nodeId,
    title: chapterTitles[index],
    board: createBoard(project, index + 1, heights[index], title),
  }));
}

const consumerTitle = "AI健康管家一站式服务平台";
const enterpriseTitle = "跨境电商异常中枢平台";
const consumerFrames = createFrames(
  "consumer",
  consumerTitle,
  consumerNodes,
  consumerHeights,
  consumerChapterTitles,
);
const enterpriseFrames = createFrames(
  "enterprise",
  enterpriseTitle,
  enterpriseNodes,
  enterpriseHeights,
  enterpriseChapterTitles,
);

export const portfolioCases = {
  consumer: {
    slug: "consumer",
    title: consumerTitle,
    category: "C 端产品",
    summary: "以 AI 串联家庭问诊、健康档案、辅助购药和用药回访，构建持续的一站式健康服务体验。",
    scope: "用户研究、体验策略、UI/UX 设计、AI 辅助流程",
    duration: "研究生 UI/UX 项目",
    deliverable: "移动端健康服务体验",
    mediaLabel: "AI HEALTH SERVICE",
    tone: "health",
    cover: consumerFrames[0].board,
    frames: consumerFrames,
    demo: null,
  },
  enterprise: {
    slug: "enterprise",
    title: enterpriseTitle,
    category: "B 端产品",
    summary: "用 AI 聚合并解释跨境电商运营风险，将异常判断、任务协同、进度验收和数据复盘连接为完整闭环。",
    scope: "业务调研、信息架构、UI/UX 设计、AI 工作流",
    duration: "研究生 UI/UX 项目",
    deliverable: "桌面端异常决策中枢",
    mediaLabel: "AI RISK OPERATIONS",
    tone: "enterprise",
    cover: enterpriseFrames[0].board,
    frames: enterpriseFrames,
    demo: {
      url: "",
      title: "跨境电商异常中枢可交互 Demo",
      poster: enterpriseFrames[0].board,
    },
  },
};
