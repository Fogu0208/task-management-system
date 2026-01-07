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

// 使用 Pinia store
const taskStore = useTaskStore()

const showDialog = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editingTaskId = ref<number | null>(null)

type StatusFilter = 'all' | TaskStatus
type PriorityFilter = 'all' | TaskPriority

const statusFilter = ref<StatusFilter>('all')
const priorityFilter = ref<PriorityFilter>('all')
const keyword = ref('')
const debouncedKeyword = ref('')
let keywordTimer: number | undefined

watch(keyword, value => {
  if (keywordTimer !== undefined) {
    clearTimeout(keywordTimer)
  }
  keywordTimer = window.setTimeout(() => {
    debouncedKeyword.value = value.trim().toLowerCase()
  }, 300)
})

const editingTask = computed<Task | null>(() => {
  if (editingTaskId.value === null) return null
  return taskStore.tasks.find(t => t.id === editingTaskId.value) ?? null
})

const filteredTasks = computed(() => {
  const trimmedKeyword = debouncedKeyword.value
  return taskStore.tasks.filter(task => {
    const matchStatus = statusFilter.value === 'all' || task.status === statusFilter.value
    const matchPriority = priorityFilter.value === 'all' || task.priority === priorityFilter.value
    const matchKeyword =
      trimmedKeyword === '' ||
      task.title.toLowerCase().includes(trimmedKeyword) ||
      task.description.toLowerCase().includes(trimmedKeyword)
    return matchStatus && matchPriority && matchKeyword
  })
})

const totalCount = computed(() => taskStore.tasks.length)
const todoCount = computed(() => taskStore.tasks.filter(t => t.status === 'todo').length)
const doingCount = computed(() => taskStore.tasks.filter(t => t.status === 'doing').length)
const doneCount = computed(() => taskStore.tasks.filter(t => t.status === 'done').length)

const toastMessage = ref('')
const toastVisible = ref(false)
let toastTimer: number | undefined

const showToast = (message: string) => {
  toastMessage.value = message
  toastVisible.value = true
  if (toastTimer !== undefined) {
    clearTimeout(toastTimer)
  }
  toastTimer = window.setTimeout(() => {
    toastVisible.value = false
  }, 2000)
}

const handleDeleteTask = (id: number) => {
  const ok = window.confirm('确定要删除这个任务吗？')
  if (!ok) return
  taskStore.removeTask(id)
  showToast('任务已删除')
}

const openCreateDialog = () => {
  dialogMode.value = 'create'
  editingTaskId.value = null
  showDialog.value = true
}

const openEditDialog = (id: number) => {
  dialogMode.value = 'edit'
  editingTaskId.value = id
  showDialog.value = true
}

const handleAddTask = (data: { title: string; description: string; priority: TaskPriority }) => {
  taskStore.addTask(data.title, data.description, data.priority)
  showDialog.value = false
  showToast('任务创建成功')
}

const handleUpdateTask = (data: { title: string; description: string; priority: TaskPriority }) => {
  if (editingTaskId.value === null) return
  taskStore.updateTask(editingTaskId.value, data)
  showDialog.value = false
  dialogMode.value = 'create'
  editingTaskId.value = null
  showToast('任务已更新')
}

const handleCancelDialog = () => {
  showDialog.value = false
  dialogMode.value = 'create'
  editingTaskId.value = null
}

const handleClearCompleted = () => {
  if (doneCount.value === 0) return
  const ok = window.confirm('确定要清除所有已完成任务吗？')
  if (!ok) return
  taskStore.clearCompletedTasks()
  showToast('已清除所有已完成任务')
}

const getStatusClass = (status: TaskStatus): string => {
  const statusMap: Record<TaskStatus, string> = {
    'todo': 'bg-yellow-100 text-yellow-800',
    'doing': 'bg-blue-100 text-blue-800',
    'done': 'bg-green-100 text-green-800'
  }
  return statusMap[status]
}

const getStatusText = (status: TaskStatus): string => {
  const statusMap: Record<TaskStatus, string> = {
    'todo': '待办',
    'doing': '进行中',
    'done': '已完成'
  }
  return statusMap[status]
}

const getPriorityClass = (priority: TaskPriority): string => {
  const priorityMap: Record<TaskPriority, string> = {
    'high': 'bg-red-100 text-red-800',
    'medium': 'bg-orange-100 text-orange-800',
    'low': 'bg-gray-100 text-gray-800'
  }
  return priorityMap[priority]
}

const getPriorityText = (priority: TaskPriority): string => {
  const priorityMap: Record<TaskPriority, string> = {
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return priorityMap[priority]
}

const getCardStatusClass = (status: TaskStatus): string => {
  const map: Record<TaskStatus, string> = {
    todo: 'bg-white',
    doing: 'bg-blue-50 border-blue-200',
    done: 'bg-green-50 border-green-200'
  }
  return map[status]
}
</script>

<style scoped>
</style>
