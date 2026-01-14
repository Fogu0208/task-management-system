# 任务管理系统 (Task Management System)

一个基于 Vue 3 + TypeScript + Vite 构建的现代化任务管理应用。旨在帮助用户高效地组织和追踪任务进度，适用于个人日常管理或小型团队协作。

## 🚀 项目介绍

本项目是一个用于展示前端开发能力的示例项目，包含了完整的前端工程化实践。系统提供了直观的用户界面，允许用户创建、编辑、删除任务，并通过不同的状态（待办、进行中、已完成）和优先级来管理任务。数据自动持久化到本地浏览器，确保数据不会意外丢失。

## 🛠️ 技术栈

*   **核心框架**: [Vue 3](https://vuejs.org/) (Composition API) - 渐进式 JavaScript 框架
*   **构建工具**: [Vite](https://vitejs.dev/) - 下一代前端开发与构建工具
*   **开发语言**: [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集，提供静态类型检查
*   **状态管理**: [Pinia](https://pinia.vuejs.org/) - Vue 的专属状态管理库
*   **路由管理**: [Vue Router](https://router.vuejs.org/) - Vue 官方路由管理器
*   **样式库**: [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架

## ✨ 功能列表

*   **任务增删改查 (CRUD)**：完整的任务生命周期管理。
*   **状态流转**：
    *   🔵 待办 (Todo)
    *   🟡 进行中 (Doing)
    *   🟢 已完成 (Done)
*   **优先级管理**：
    *   🔴 高优先级
    *   🟠 中优先级
    *   ⚪ 低优先级
*   **智能筛选与搜索**：
    *   支持按任务状态筛选
    *   支持按优先级筛选
    *   实时搜索（支持按标题和描述搜索，带防抖功能）
*   **数据持久化**：利用 `localStorage` 自动保存任务数据。
*   **响应式设计**：完美适配移动端和桌面端设备。
*   **交互反馈**：操作成功或失败时的 Toast 提示。

## 📦 安装与运行步骤

确保你的环境中已安装 [Node.js](https://nodejs.org/) (推荐 v18+)。

1.  **克隆项目**

    ```bash
    git clone https://github.com/Fogu0208/task-management-system.git
    cd task-management-system
    ```

2.  **安装依赖**

    ```bash
    npm install
    ```

3.  **启动开发服务器**

    ```bash
    npm run dev
    ```
    启动后，在浏览器访问控制台输出的地址（通常是 `http://localhost:5173`）。

4.  **构建生产版本**

    ```bash
    npm run build
    ```
    构建产物将输出到 `dist` 目录。

## 📄 许可证

MIT License
