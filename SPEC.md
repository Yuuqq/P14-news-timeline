# P14 Spec - 交互式突发新闻时间轴

## 1. Summary

- **Project ID**: P14
- **Project Name**: 交互式突发新闻时间轴
- **Goal**: 轻量化生成交互式 Web 时间线组件，支持事件添加/拖拽/颜色标注
- **User Persona**: 数据记者 / 编辑

## 2. Scope

- **In scope**:
  - 轻量化生成交互式 Web 时间线组件
  - 支持事件添加/拖拽/颜色标注
- **Out of scope**:
  - 后端代理或服务端逻辑
  - API Key 持久化存储

## 3. UX

- **Core workflow**: 用户输入 → 前端处理 → 结果展示
- **Inputs**: 事件条目（时间+标题+描述）
- **Outputs**: 交互式时间轴组件
- **States**: empty (初始) / loading (处理中) / error (失败) / success (完成)

## 4. Functional Requirements

1. FR-1: 轻量化生成交互式 Web 时间线组件
2. FR-2: 结果可视化展示
3. FR-3: 错误状态可见提示

## 5. Non-Functional Requirements

- **Performance**: 核心任务 3 分钟内完成
- **Accessibility**: 键盘导航、aria-label、焦点可见、WCAG AA 对比度
- **Privacy**: 本地处理优先，不默认上传数据
- **Browser support**: 现代 Chromium (Chrome 110+)

## 6. Dependencies

- **Libraries/CDNs**: 无外部依赖
- **Local data**: 无

## 7. Risks & Mitigations

- **Risk**: 事件过多时滚动性能下降
- **Mitigation**: 虚拟滚动或分页

## 8. Acceptance Criteria

- [ ] JSON 数据加载
- [ ] 时间排序
- [ ] 时间线渲染
- [ ] 错误输入提示
- [ ] 纯静态页面可部署 GitHub Pages
- [ ] 移动端可用
- [ ] 隐私提示清晰可见
