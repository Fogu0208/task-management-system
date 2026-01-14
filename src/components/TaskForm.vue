<template>
  <div class="space-y-4">
    <!-- 任务标题 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        任务标题 <span class="text-red-500">*</span>
      </label>
      <input
        ref="titleInput"
        v-model="formData.title"
        type="text"
        placeholder="请输入任务标题"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        :class="{ 'border-red-500': errors.title }"
        @keyup.enter="handleSubmit"
      />
      <p v-if="errors.title" class="mt-1 text-sm text-red-500">{{ errors.title }}</p>
    </div>

    <!-- 任务描述 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        任务描述 <span class="text-red-500">*</span>
      </label>
      <textarea
        v-model="formData.description"
        rows="4"
        placeholder="请输入任务详细描述"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        :class="{ 'border-red-500': errors.description }"
        @keyup.enter.ctrl="handleSubmit"
      ></textarea>
      <p v-if="errors.description" class="mt-1 text-sm text-red-500">{{ errors.description }}</p>
    </div>

    <!-- 优先级 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        优先级
      </label>
      <div class="flex gap-3">
        <label
          v-for="option in priorityOptions"
          :key="option.value"
          class="flex items-center cursor-pointer"
        >
          <input
            v-model="formData.priority"
            type="radio"
            :value="option.value"
            class="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span class="ml-2 text-sm" :class="option.colorClass">
            {{ option.label }}
          </span>
        </label>
      </div>
    </div>

    <!-- 按钮组 -->
    <div class="flex justify-end gap-3 pt-4 border-t">
      <button
        type="button"
        @click="handleCancel"
        class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
      >
        取消
      </button>
      <button
        type="button"
        @click="handleSubmit"
        class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
      >
        确定
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 任务表单组件
 * 用于创建新任务或编辑现有任务
 * 包含表单验证、数据绑定和事件发射
 */
import { ref, onMounted, watch } from 'vue'
import type { TaskPriority } from '../types'

interface Props {
  /** 默认优先级，用于重置表单 */
  defaultPriority?: TaskPriority
  /** 初始标题（编辑模式使用） */
  initialTitle?: string
  /** 初始描述（编辑模式使用） */
  initialDescription?: string
  /** 初始优先级（编辑模式使用） */
  initialPriority?: TaskPriority
}

const props = withDefaults(defineProps<Props>(), {
  defaultPriority: 'medium',
  initialTitle: '',
  initialDescription: ''
})

const emit = defineEmits<{
  /** 提交表单事件，携带表单数据 */
  submit: [data: { title: string; description: string; priority: TaskPriority }]
  /** 取消操作事件 */
  cancel: []
}>()

const formData = ref({
  title: props.initialTitle,
  description: props.initialDescription,
  priority: (props.initialPriority ?? props.defaultPriority) as TaskPriority
})

const titleInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  if (titleInput.value) {
    titleInput.value.focus()
  }
})

watch(
  () => props.initialTitle,
  value => {
    formData.value.title = value
    if (titleInput.value) {
      titleInput.value.focus()
    }
  }
)

// 表单验证错误（使用 ref）
const errors = ref({
  title: '',
  description: ''
})

// 优先级选项
const priorityOptions = [
  { value: 'low', label: '低', colorClass: 'text-gray-600' },
  { value: 'medium', label: '中', colorClass: 'text-orange-600' },
  { value: 'high', label: '高', colorClass: 'text-red-600' }
]

// 验证表单
const validate = (): boolean => {
  errors.value.title = ''
  errors.value.description = ''

  if (!formData.value.title.trim()) {
    errors.value.title = '请输入任务标题'
    return false
  }

  if (!formData.value.description.trim()) {
    errors.value.description = '请输入任务描述'
    return false
  }

  return true
}

// 提交表单
const handleSubmit = () => {
  if (!validate()) return

  emit('submit', {
    title: formData.value.title.trim(),
    description: formData.value.description.trim(),
    priority: formData.value.priority
  })

  // 重置表单
  formData.value.title = ''
  formData.value.description = ''
  formData.value.priority = props.defaultPriority
  errors.value.title = ''
  errors.value.description = ''
}

// 取消
const handleCancel = () => {
  emit('cancel')
  // 重置表单
  formData.value.title = ''
  formData.value.description = ''
  formData.value.priority = props.defaultPriority
  errors.value.title = ''
  errors.value.description = ''
}
</script>

<style scoped>
/* 组件样式 */
</style>
