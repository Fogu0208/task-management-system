<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- 头部：标题和操作按钮 -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">任务列表</h1>
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="doneCount === 0"
          @click="handleClearCompleted"
        >
          清除已完成任务
        </button>
        <button
          @click="openCreateDialog"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          + 新建任务
        </button>
      </div>
    </div>

    <!-- 新建任务对话框 -->
    <div
      v-if="showDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="handleCancelDialog"
      @keydown.esc.stop.prevent="handleCancelDialog"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl" tabindex="-1">
        <h2 class="text-xl font-bold text-gray-800 mb-4">
          {{ dialogMode === 'create' ? '新建任务' : '编辑任务' }}
        </h2>
        <TaskForm
          :key="dialogMode === 'create' ? 'create' : editingTask?.id"
          :initial-title="dialogMode === 'edit' && editingTask ? editingTask.title : ''"
          :initial-description="dialogMode === 'edit' && editingTask ? editingTask.description : ''"
          :initial-priority="dialogMode === 'edit' && editingTask ? editingTask.priority : undefined"
          @submit="dialogMode === 'create' ? handleAddTask($event) : handleUpdateTask($event)"
          @cancel="handleCancelDialog"
        />
      </div>
    </div>
    
    <!-- 筛选和统计 -->
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div class="text-sm text-gray-600">
          共 <span class="font-semibold text-gray-800">{{ totalCount }}</span> 个任务，
          待办 <span class="font-semibold text-yellow-700">{{ todoCount }}</span>，
          进行中 <span class="font-semibold text-blue-700">{{ doingCount }}</span>，
          已完成 <span class="font-semibold text-green-700">{{ doneCount }}</span>
        </div>
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">搜索：</span>
          <input
            v-model="keyword"
            type="text"
            placeholder="按标题或描述搜索"
            class="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div class="flex flex-wrap gap-3">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">状态：</span>
            <select
              v-model="statusFilter"
              class="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部</option>
              <option value="todo">待办</option>
              <option value="doing">进行中</option>
              <option value="done">已完成</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">优先级：</span>
            <select
              v-model="priorityFilter"
              class="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="space-y-4">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-transparent"
        :class="getCardStatusClass(task.status)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- 任务标题和状态 -->
            <div class="flex items-center gap-3 mb-2">
              <button
                type="button"
                class="px-2 py-1 text-xs font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1"
                :class="getStatusClass(task.status)"
                @click="taskStore.toggleTaskStatus(task.id)"
              >
                {{ getStatusText(task.status) }}
              </button>
              <h3
                class="text-lg font-semibold"
                :class="task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'"
              >
                {{ task.title }}
              </h3>
              <!-- 优先级标签 -->
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="getPriorityClass(task.priority)"
              >
                {{ getPriorityText(task.priority) }}
              </span>
              <div class="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  class="text-xs text-blue-500 hover:text-blue-700"
                  @click="openEditDialog(task.id)"
                >
                  编辑
                </button>
                <button
                  type="button"
                  class="text-xs text-red-500 hover:text-red-700"
                  @click="handleDeleteTask(task.id)"
                >
                  删除
                </button>
              </div>
            </div>
            
            <!-- 任务描述 -->
            <p class="text-gray-600 ml-8 mb-1">{{ task.description }}</p>
            <p class="text-xs text-gray-400 ml-8">
              创建时间：{{ formatTime(task.createdAt) }}
              <span v-if="task.updatedAt !== task.createdAt">
                ，更新时间：{{ formatTime(task.updatedAt) }}
              </span>
            </p>
            
          </div>
        </div>
      </div>
  </div>
    
  <!-- 空状态 -->
  <div v-if="filteredTasks.length === 0" class="text-center py-12">
    <p class="text-gray-500 text-lg">暂无任务</p>
  </div>

    <div
      v-if="toastVisible"
      class="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-2 rounded shadow-lg z-50"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import TaskForm from '../components/TaskForm.vue'
import type { TaskStatus, TaskPriority, Task } from '../types'
import { formatTime } from '../utils'

// 使用 Pinia store 管理任务状态
const taskStore = useTaskStore()

// 对话框控制状态
const showDialog = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editingTaskId = ref<number | null>(null)

// 筛选条件类型定义
type StatusFilter = 'all' | TaskStatus
type PriorityFilter = 'all' | TaskPriority

// 筛选状态
const statusFilter = ref<StatusFilter>('all')
const priorityFilter = ref<PriorityFilter>('all')
const keyword = ref('')
const debouncedKeyword = ref('')
let keywordTimer: number | undefined

// 监听搜索关键词变化，实现防抖
watch(keyword, value => {
  if (keywordTimer !== undefined) {
    clearTimeout(keywordTimer)
  }
  keywordTimer = window.setTimeout(() => {
    debouncedKeyword.value = value.trim().toLowerCase()
  }, 300)
})

/**
 * 过滤后的任务列表
 * 根据状态、优先级和搜索关键词进行筛选
 * 并按创建时间倒序排列（新任务在前）
 */
const filteredTasks = computed(() => {
  return taskStore.tasks.filter(task => {
    // 状态筛选
    if (statusFilter.value !== 'all' && task.status !== statusFilter.value) {
      return false
    }
    // 优先级筛选
    if (priorityFilter.value !== 'all' && task.priority !== priorityFilter.value) {
      return false
    }
    // 关键词搜索（匹配标题或描述）
    if (debouncedKeyword.value) {
      const titleMatch = task.title.toLowerCase().includes(debouncedKeyword.value)
      const descMatch = task.description.toLowerCase().includes(debouncedKeyword.value)
      if (!titleMatch && !descMatch) {
        return false
      }
    }
    return true
  }).sort((a, b) => {
    // 默认按更新时间倒序，或者创建时间倒序
    const timeA = a.updatedAt || a.createdAt || 0
    const timeB = b.updatedAt || b.createdAt || 0
    return timeB - timeA
  })
})

// 统计各状态的任务数量
const totalCount = computed(() => taskStore.tasks.length)
const todoCount = computed(() => taskStore.tasks.filter(t => t.status === 'todo').length)
const doingCount = computed(() => taskStore.tasks.filter(t => t.status === 'doing').length)
const doneCount = computed(() => taskStore.tasks.filter(t => t.status === 'done').length)

/**
 * 当前正在编辑的任务对象
 */
const editingTask = computed(() => {
  if (dialogMode.value === 'edit' && editingTaskId.value) {
    return taskStore.tasks.find(t => t.id === editingTaskId.value)
  }
  return null
})

// 打开创建对话框
const openCreateDialog = () => {
  dialogMode.value = 'create'
  editingTaskId.value = null
  showDialog.value = true
}

// 打开编辑对话框
const openEditDialog = (id: number) => {
  dialogMode.value = 'edit'
  editingTaskId.value = id
  showDialog.value = true
}

// 关闭对话框
const handleCancelDialog = () => {
  showDialog.value = false
  editingTaskId.value = null
}

// 处理添加任务
const handleAddTask = (data: { title: string; description: string; priority: TaskPriority }) => {
  taskStore.addTask(data.title, data.description, data.priority)
  showDialog.value = false
  showToast('任务创建成功')
}

// 处理更新任务
const handleUpdateTask = (data: { title: string; description: string; priority: TaskPriority }) => {
  if (editingTaskId.value) {
    taskStore.updateTask(editingTaskId.value, data)
    showDialog.value = false
    showToast('任务更新成功')
  }
}

// 处理删除任务
const handleDeleteTask = (id: number) => {
  if (confirm('确定要删除这个任务吗？')) {
    taskStore.removeTask(id)
    showToast('任务已删除')
  }
}

// 处理清除已完成任务
const handleClearCompleted = () => {
  if (confirm('确定要清除所有已完成的任务吗？')) {
    taskStore.clearCompletedTasks()
    showToast('已清除所有已完成任务')
  }
}

// Toast 提示状态
const toastVisible = ref(false)
const toastMessage = ref('')
let toastTimer: number | undefined

/**
 * 显示 Toast 提示
 * @param msg 提示消息
 */
const showToast = (msg: string) => {
  toastMessage.value = msg
  toastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toastVisible.value = false
  }, 3000)
}

// 获取状态对应的样式类
const getStatusClass = (status: TaskStatus) => {
  switch (status) {
    case 'todo': return 'bg-yellow-100 text-yellow-800'
    case 'doing': return 'bg-blue-100 text-blue-800'
    case 'done': return 'bg-green-100 text-green-800'
  }
}

// 获取卡片边框样式类
const getCardStatusClass = (status: TaskStatus) => {
   switch (status) {
    case 'todo': return 'border-l-4 border-l-yellow-500'
    case 'doing': return 'border-l-4 border-l-blue-500'
    case 'done': return 'border-l-4 border-l-green-500 opacity-75'
  }
}

// 获取状态显示文本
const getStatusText = (status: TaskStatus) => {
  switch (status) {
    case 'todo': return '待办'
    case 'doing': return '进行中'
    case 'done': return '已完成'
  }
}

// 获取优先级对应的样式类
const getPriorityClass = (priority: TaskPriority) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800'
    case 'medium': return 'bg-orange-100 text-orange-800'
    case 'low': return 'bg-gray-100 text-gray-800'
  }
}

// 获取优先级显示文本
const getPriorityText = (priority: TaskPriority) => {
  switch (priority) {
    case 'high': return '高'
    case 'medium': return '中'
    case 'low': return '低'
  }
}
</script>

<style scoped>
</style>
