<template>
    <div class="file-input">
        <input ref="fileInput" type="file" accept=".jpg,.jpeg,.png,.gif,.webp" @input="handleFileInput" multiple>
    </div>
</template>
<script setup>
  const emit = defineEmits(['filesChange'])
    const fileInput = ref(null)
    const files = ref([])
    let _files = []
    const handleFileInput = (e)=>{
        const fileNames = _files.map(f => f.name)
        let  newFiles = [...e.target.files].filter(f => !fileNames.includes(f.name))
        console.log(newFiles)
        _files = [..._files, ...newFiles]
        files.value = _files
        emit("filesChange", _files, [...newFiles])
    }
</script>