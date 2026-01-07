import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task, TaskPriority } from '../types'

const STORAGE_KEY = 'task_management_tasks'

const createDefaultTasks = (): Task[] => [
  {
    id: 1,
    title: '完成项目需求分析',
    description: '分析用户需求，整理功能点，编写需求文档',
    status: 'done',
    priority: 'high',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 2,
    title: '学习 Vue3 Composition API',
    description: '深入学习 Vue3 的 Composition API，掌握响应式系统',
    status: 'doing',
    priority: 'high',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 3,
    title: '完成项目基础搭建',
    description: '搭建项目框架，配置开发环境，安装必要依赖',
    status: 'done',
    priority: 'medium',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 4,
    title: '设计数据库表结构',
    description: '根据业务需求设计数据库表结构，建立表关系',
    status: 'todo',
    priority: 'medium',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 5,
    title: '周末去超市购物',
    description: '购买生活用品：蔬菜、水果、日用品等',
    status: 'todo',
    priority: 'low',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
]

const loadTasksFromStorage = (): Task[] => {
  if (typeof window === 'undefined') {
    return createDefaultTasks()
  }
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return createDefaultTasks()
  }
  try {
    const parsed = JSON.parse(stored) as Task[]
    if (!Array.isArray(parsed)) {
      return createDefaultTasks()
    }
    return parsed
  } catch {
    return createDefaultTasks()
  }
}

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>(loadTasksFromStorage())

  const persistTasks = () => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.value))
  }

  const toggleTaskStatus = (id: number) => {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return

    // 状态流转：todo -> doing -> done -> todo
    if (task.status === 'todo') {
      task.status = 'doing'
    } else if (task.status === 'doing') {
      task.status = 'done'
    } else {
      task.status = 'todo'
    }

    task.updatedAt = Date.now()
    persistTasks()
  }

  const addTask = (title: string, description: string, priority: TaskPriority = 'medium') => {
    const newId = tasks.value.length > 0 
      ? Math.max(...tasks.value.map(t => t.id)) + 1
      : 1

    const newTask: Task = {
      id: newId,
      title,
      description,
      status: 'todo',
      priority,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    tasks.value.push(newTask)
    persistTasks()
    return newTask
  }

  const updateTask = (id: number, payload: { title: string; description: string; priority: TaskPriority }) => {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return

    task.title = payload.title
    task.description = payload.description
    task.priority = payload.priority
    task.updatedAt = Date.now()
    persistTasks()
  }

  const removeTask = (id: number) => {
    tasks.value = tasks.value.filter(t => t.id !== id)
    persistTasks()
  }

  const clearCompletedTasks = () => {
    tasks.value = tasks.value.filter(t => t.status !== 'done')
    persistTasks()
  }

  // 返回供组件使用
  return {
    tasks,
    toggleTaskStatus,
    addTask,
    updateTask,
    removeTask,
    clearCompletedTasks
  }
})
