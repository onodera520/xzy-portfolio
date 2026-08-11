export const sidebarMenuGroups = [
  {
    title: "HOME",
    titleZh: "首页",
    link: "/#top",
    ariaLabel: "返回作品集首页",
    children: [
      { label: "作品集首屏", link: "/#top" },
    ],
  },
  {
    title: "ABOUT",
    titleZh: "关于",
    link: "/#about",
    ariaLabel: "查看关于我",
    children: [
      { label: "个人介绍", link: "/#about" },
      { label: "求职方向与能力", link: "/#about-details" },
    ],
  },
  {
    title: "PROJECTS",
    titleZh: "作品",
    link: "/#work",
    ariaLabel: "查看作品项目",
    children: [
      { label: "AI 健康管家一站式服务平台", link: "/work/consumer" },
      { label: "跨境电商异常中枢平台", link: "/work/enterprise" },
      { label: "骑福兽，闹新春", link: "/work/campaign" },
      { label: "AI 产品探索 · 即将上线", disabled: true },
    ],
  },
  {
    title: "PROCESS",
    titleZh: "过程",
    link: "/#process",
    ariaLabel: "查看设计过程",
    children: [
      { label: "设计过程与 AI", link: "/#process" },
    ],
  },
  {
    title: "LAB",
    titleZh: "实验",
    link: "/#lab",
    ariaLabel: "查看设计实验",
    children: [
      { label: "设计决策实验室", link: "/#lab" },
    ],
  },
  {
    title: "CONTACT",
    titleZh: "联系",
    link: "/#contact",
    ariaLabel: "查看联系方式与简历",
    children: [
      { label: "联系方式与简历", link: "/#contact" },
    ],
  },
];

export const sidebarStatusText = "OPEN TO WORK · UI/UX · AI PRODUCT";
