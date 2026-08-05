const strategies = {
  "user-first": {
    key: "user-first",
    title: "先守住用户价值",
    summary: "用户收益明显领先。优先验证核心场景，再讨论增长与商业包装。",
    action: "先做可用性原型",
  },
  "business-first": {
    key: "business-first",
    title: "聚焦商业目标",
    summary: "业务目标更迫切。保留用户底线，把方案收敛到最可衡量的结果。",
    action: "明确一个业务指标",
  },
  "reduce-scope": {
    key: "reduce-scope",
    title: "先缩小实现范围",
    summary: "实现成本超过当前收益。拆出最小闭环，避免一次解决所有问题。",
    action: "删除一个非核心环节",
  },
  balanced: {
    key: "balanced",
    title: "平衡推进",
    summary: "用户与业务方向接近，成本仍可控制。用小规模验证换取下一步信心。",
    action: "安排一轮快速验证",
  },
};

export function calculateDecision({ user, business, effort }) {
  if (effort >= 75 && effort > Math.max(user, business) + 15) {
    return strategies["reduce-scope"];
  }

  if (user >= 65 && user >= business + 20) {
    return strategies["user-first"];
  }

  if (business >= 65 && business >= user + 20) {
    return strategies["business-first"];
  }

  return strategies.balanced;
}
