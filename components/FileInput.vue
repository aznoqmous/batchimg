<template>
    <div class="file-input">
        <input ref="fileInput" type="file" accept=".jpg,.jpeg,.png,.gif,.webp" @input="handleFileInput" multiple>
    </div>
</template>
<script setup>
  const emit = defineEmits(['filesChange'])
    const fileInput = ref(null)
    const files = ref([])
    const handleFileInput = (e)=>{
        files.value = [...e.target.files]
        emit("filesChange", [...e.target.files])
    }
</script>