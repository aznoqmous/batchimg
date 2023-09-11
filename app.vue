<template>
  <title>BatchImageCompression</title>
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <div>
    <h1>BatchImageCompression</h1>

    <div class="column">
      <FileInput @filesChange="filesChange"></FileInput>
      <ul class="uploaded-files">
        <li v-for="file in uploadedFiles" @click="selectPreviewImage">
          <figure class="file">
            <img :src="file.src" alt="">
            <legend>{{ file.name }}</legend>
          </figure>
        </li>
      </ul>
    </div>


    <div class="settings-and-preview">
      <div :class="'settings' + (uploadedFiles.length ? ' active' : '')">

        <details open>
          <summary><span class="material-symbols-outlined">description</span>Format & Compression</summary>
          <div class="format">
            <label for="format">Format :</label>
            <select id="format" ref="formatSelector" @input="updatePreviewImage">
              <option id="source" value="source">source</option>/>
              <option id="jpg" value="jpg">jpg</option>/>
              <option id="png" value="png">png</option>/>
              <option id="webp" value="webp">webp</option>/>
            </select>
          </div>

          <div class="quality">
            <label for="qualityLevel">Quality : </label>
            <input id="qualityLevel" type="range" min="1" max="100" :value="quality" ref="qualityLevel"
              @input="updateQualityLevel" @change="updatePreviewImage">
            <span>{{ quality }}</span>
          </div>
        </details>

        <details>
          <summary><span class="material-symbols-outlined">aspect_ratio</span>Dimensions</summary>
          <div class="size-selector">
            <div>
              <label for="maxWidth">
                Max width
              </label>
              <input id="maxWidth" ref="maxWidth" type="number" step="1" @change="updatePreviewImage">
            </div>
            <div>
              <label for="maxHeight">
                Max height
              </label>
              <input id="maxHeight" ref="maxHeight" type="number" step="1" @change="updatePreviewImage">
            </div>
          </div>
          <div class="fit">
            <label for="fit">Fit :</label>
            <select id="fit" ref="fitSelector" @input="updatePreviewImage">
              <option id="cover" value="cover">cover</option>/>
              <option id="contain" value="contain">contain</option>/>
              <option id="fill" value="fill">fill</option>/>
              <option id="inside" value="inside">inside</option>/>
              <option id="outside" value="outside">outside</option>/>
            </select>
          </div>
        </details>

        <details>
          <summary><span class="material-symbols-outlined">crop</span>Crop</summary>
          <div>
            <label for="trimColor">
              Target color
            </label>
            <input id="trimColor" ref="trimColor" type="text" step="1" @change="updatePreviewImage">
          </div>
          <div>
            <label for="trimThreshold">
              Threshold
            </label>
            <input id="trimThreshold" ref="trimThreshold" type="number" step="1" @change="updatePreviewImage">
          </div>
        </details>
        
        <div class="templates">
          <div v-for="template in templates" class="template" @click="selectTemplate(template)">
            <span class="material-symbols-outlined">
              {{ template.icon || "photo_frame" }}
            </span>
            <strong>{{ template.label }}</strong>
          </div>
        </div>
      </div>

      <div v-if="previewImage && uploadedFiles[selectedPreviewImage]" class="preview" @mousemove="movePreviewSlider" @mouseup="disablePreviewSlider"
        @mouseleave="disablePreviewSlider">
        <div class="before-after">
          <div class="column">Before : {{ humanFileSize(uploadedFiles[selectedPreviewImage].size) }}</div>
          <div class="column">After : {{ humanFileSize(previewImage.size) + " (" + Math.floor((1 - previewImage.size /
            uploadedFiles[selectedPreviewImage].size) * 100) + "% reduction)" }}</div>
        </div>
        <div class="canvas" ref="canvas">
          <i class="slider" @mousedown="activatePreviewSlider"></i>
          <div class="before-container">
            <figure class="before">
              <img :src="uploadedFiles[selectedPreviewImage].src">
            </figure>
          </div>
          <div class="after-container">
            <figure class="after">
              <img :src="previewImage.src">
            </figure>
          </div>
        </div>
      </div>

    </div>

    <div class="column download" v-if="uploadedFiles.length">
      <button @click="downloadArchive">
        Download converted files
      </button>
      <progress v-if="progress >= 0" min="0" max="100" :value="progress * 100"></progress>
      <div class="before-after">
        <small v-if="uploadedFileSize">Before : {{ humanFileSize(uploadedFileSize) }}</small>
        <small v-if="convertedFileSize">After : {{ humanFileSize(convertedFileSize) }} ({{ Math.floor((1-convertedFileSize/uploadedFileSize) * 100) }}% reduction)</small>
      </div>
    </div>

    
  </div>
</template>
<style lang="scss">
h1 {}
</style>
<script setup>
import useUuid from "~/composables/useUuid"

const chunkSize = 1000000
const uuid = ref(await useUuid())
const formatSelector = ref(null)
const fitSelector = ref(null)
const progress = ref(-1)
let files = []
const convertedFiles = ref([])
const uploadedFiles = ref([])
const maxWidth = ref(0)
const maxHeight = ref(0)
const qualityLevel = ref(null)
const quality = ref(80)
const previewImage = ref(null)
const trimColor = ref(null)
const trimThreshold = ref(null)
const canvas = ref(null)
const status = ref(null)
const selectedPreviewImage = ref(0)

const uploadedFileSize = ref(0)
const convertedFileSize = ref(0)

const templates = [
  {
    label: "Web/JPEG",
    format: "jpg",
    quality: 50,
    width: 2000,
    height: 2000
  },
  {
    label: "Web/Source",
    quality: 50,
    width: 2000,
    height: 2000
  },
  {
    label: "Fit content",
    trimColor: "transparent",
    trimThreshold: 100,
    icon: "crop"
  }
]

const upload = async () => {
  uploadedFiles.value = []
  selectedPreviewImage.value = 0
  uploadedFileSize.value = 0
  convertedFileSize.value = 0
  await $fetch("/api/convert/delete", {
    method: "POST",
    body: {
      uuid: uuid.value
    }
  })
  for (let file of files) {
    file.src = await uploadFile(file)
    uploadedFiles.value.push(file)
    uploadedFileSize.value += file.size
  }
  updatePreviewImage()
}

const filesChange = (fs) => {
  files = fs
  upload()
}

const getFileContent = async (file) => {
  return new Promise(resolve => {
    const fr = new FileReader()
    fr.onloadend = (e) => {
      if (e.target.readyState == FileReader.DONE) resolve(e.srcElement.result)
    }
    fr.readAsBinaryString(file)
  })
}
const uploadFile = async (file) => {
  let path = null
  const content = await getFileContent(file)
  for (let i = 0; i < file.size; i += chunkSize) {
    path = await $fetch("/api/convert/upload", {
      method: "POST",
      body: {
        uuid: uuid.value,
        name: file.name,
        content: btoa(content.slice(i, i + chunkSize))
      }
    })
  }
  return path.replace('./public', "")
}

const downloadArchive = async () => {
  convertedFileSize.value = 0
  await convert()
  const response = await $fetch("/api/convert/archive", {
    method: "POST",
    body: {
      uuid: uuid.value
    }
  })
  const link = document.createElement('a')
  link.href = response.targetPath
  link.setAttribute('download', response.targetPath)
  document.body.appendChild(link)
  link.click()
  link.remove()
  status.value = `${humanFileSize(response.uncompressedDirSize)} ${humanFileSize(response.compressedDirSize)}`
}

const convert = async () => {
  let i = 0
  for (let file of files) {
    i++
    progress.value = i / files.length
    const newFile = await convertFile(file)
    convertedFiles.value.push(newFile)
    convertedFileSize.value += newFile.size
  }
  setTimeout(() => progress.value = -1, 1000)
}

const convertFile = async (file) => {
  const format = !formatSelector.value || formatSelector.value.value == "source" ? file.type.replace('image/', "") : formatSelector.value.value
  const fit = fitSelector.value ? fitSelector.value.value : null
  const _trimColor = trimColor.value ? trimColor.value.value : null
  const _trimThreshold = trimThreshold.value ? trimThreshold.value.value : null
  return await $fetch("/api/convert/convert", {
    method: "POST",
    body: {
      uuid: uuid.value,
      name: file.name,
      width: parseInt(maxWidth.value.value),
      height: parseInt(maxHeight.value.value),
      trimColor: _trimColor,
      trimThreshold: parseInt(_trimThreshold),
      format,
      fit,
      quality: quality.value
    }
  })

}

const humanFileSize = (size) => {
  return Intl.NumberFormat("en", {
    notation: "compact",
    style: "unit",
    unit: "byte",
    unitDisplay: "narrow",
  }).format(size)
}

const updateQualityLevel = () => {
  quality.value = parseInt(qualityLevel.value.value)
}

const updatePreviewImage = async () => {
  const file = await convertFile(uploadedFiles.value[selectedPreviewImage.value])
  file.src += `?${Date.now()}`
  previewImage.value = file
}

let isPreviewSliderActive = false
const activatePreviewSlider = () => isPreviewSliderActive = true
const disablePreviewSlider = () => isPreviewSliderActive = false
const movePreviewSlider = (e) => {
  if (!isPreviewSliderActive) return;
  const canvasRect = canvas.value.getBoundingClientRect()
  const positionX = e.pageX
  canvas.value.style.setProperty("--preview-x", `${(positionX - canvasRect.left) / canvasRect.width * 100}%`)
}

const selectPreviewImage = (e) => {
  selectedPreviewImage.value = Array.from(e.currentTarget.parentElement.children).indexOf(e.currentTarget)
  updatePreviewImage()
}

const selectTemplate = async (template)=>{
  formatSelector.value.value = template.format || "source"
  qualityLevel.value.value = template.quality || 80
  quality.value = parseInt(qualityLevel.value.value)
  maxWidth.value.value = template.width || null
  maxHeight.value.value = template.height || null
  trimColor.value.value = template.trimColor || null
  trimThreshold.value.value = template.trimThreshold || null
  await updatePreviewImage()
}
</script>
