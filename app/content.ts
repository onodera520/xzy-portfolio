export type CaseSection = {
  title: string;
  body: string;
  note: string;
};

export type Project = {
  slug: "consumer" | "enterprise" | "campaign";
  category: string;
  title: string;
  summary: string;
  scope: string;
  duration: string;
  deliverable: string;
  mediaLabel: string;
  sections: CaseSection[];
};

export const projects: Project[] = [
  {
    slug: "consumer",
    category: "C 端产品",
    title: "C 端体验项目",
    summary: "围绕一个高频生活场景，梳理从发现需求到完成核心任务的体验路径。",
    scope: "用户研究、交互设计、视觉设计",
    duration: "项目周期待补充",
    deliverable: "移动端产品体验",
    mediaLabel: "项目封面占位，建议 16:10",
    sections: [
      {
        title: "项目背景",
        body: "在这里交代产品场景、目标用户、业务背景，以及你为什么开始关注这个问题。",
        note: "建议补充：项目来源、团队构成、你的角色。",
      },
      {
        title: "设计挑战",
        body: "用一句明确的问题陈述，说明用户目标与现有体验之间的冲突。",
        note: "建议补充：约束条件、优先级和成功标准。",
      },
      {
        title: "研究与洞察",
        body: "展示研究方法、关键证据，以及这些证据如何改变了最初的设计假设。",
        note: "建议补充：访谈摘录、行为路径或竞品对比。",
      },
      {
        title: "关键决策",
        body: "选择两到三个真正影响方案的设计判断，解释取舍，而不是罗列全部页面。",
        note: "建议补充：方案对比、设计原则和被放弃的方向。",
      },
      {
        title: "验证与反思",
        body: "记录如何验证方案、发现了什么问题，以及下一轮最值得继续解决的内容。",
        note: "建议补充：可用性测试、迭代记录和个人反思。",
      },
    ],
  },
  {
    slug: "enterprise",
    category: "B 端产品",
    title: "B 端工作台项目",
    summary: "把复杂任务、角色权限与信息状态组织成可理解、可执行的工作流程。",
    scope: "流程研究、信息架构、交互设计",
    duration: "项目周期待补充",
    deliverable: "桌面端工作台",
    mediaLabel: "工作台场景图占位，建议 16:10",
    sections: [
      {
        title: "项目背景",
        body: "说明业务流程、使用角色、协作关系和现有工作方式，不从界面问题开始讲。",
        note: "建议补充：业务地图、角色关系和核心任务。",
      },
      {
        title: "设计挑战",
        body: "聚焦信息复杂度、操作效率或跨角色协作中最关键的矛盾。",
        note: "建议补充：业务限制、权限边界和异常场景。",
      },
      {
        title: "研究与洞察",
        body: "展示如何从访谈、跟岗或流程梳理中识别重复工作、等待点和错误来源。",
        note: "建议补充：当前流程图、任务频次和关键证据。",
      },
      {
        title: "关键决策",
        body: "解释信息如何分组、任务如何排序、状态如何表达，以及为什么这样组织。",
        note: "建议补充：信息架构、关键流程和组件策略。",
      },
      {
        title: "验证与反思",
        body: "记录与真实角色或业务方验证后的调整，并指出设计仍然依赖的产品条件。",
        note: "建议补充：走查结果、效率变化和后续计划。",
      },
    ],
  },
  {
    slug: "campaign",
    category: "H5 运营活动",
    title: "H5 运营活动项目",
    summary: "在短时间和明确传播目标下，串联创意概念、参与机制与分享路径。",
    scope: "概念策划、体验流程、视觉设计",
    duration: "项目周期待补充",
    deliverable: "移动端 H5 活动",
    mediaLabel: "活动主视觉占位，建议 9:12",
    sections: [
      {
        title: "项目背景",
        body: "交代活动主题、传播目标、目标人群、渠道和上线时间窗口。",
        note: "建议补充：活动 brief、品牌限制和团队分工。",
      },
      {
        title: "设计挑战",
        body: "说明如何在低学习成本、参与意愿和品牌表达之间取得平衡。",
        note: "建议补充：核心转化动作和传播限制。",
      },
      {
        title: "研究与洞察",
        body: "展示对目标用户、同类活动和社交传播行为的快速判断。",
        note: "建议补充：竞品拆解、用户动机和内容偏好。",
      },
      {
        title: "关键决策",
        body: "解释创意概念如何落到交互机制、页面节奏、结果生成与分享链路。",
        note: "建议补充：故事板、关键帧和动效说明。",
      },
      {
        title: "验证与反思",
        body: "记录上线前检查、跨设备适配、传播反馈和下一次可以优化的环节。",
        note: "建议补充：测试清单、真实结果和复盘结论。",
      },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
