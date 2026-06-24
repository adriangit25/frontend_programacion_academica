<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Mi Bibliografía</h1>
      <p class="text-gray-500 text-sm mt-1">Registre los libros de base para cada materia que dicta</p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div class="max-w-xs">
        <label class="block text-sm font-medium text-gray-700 mb-1">Periodo Academico</label>
        <select v-model.number="perId" @change="loadData" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
          <option value="0">-- Seleccione --</option>
          <option v-for="periodo in periodos" :key="periodo.per_id" :value="periodo.per_id">{{ periodo.per_nombre }}</option>
        </select>
      </div>
    </div>

    <div v-if="!perId" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
      Seleccione un periodo para ver sus materias
    </div>
    <div v-else-if="loading" class="text-center py-8 text-gray-400">Cargando...</div>
    <div v-else-if="materias.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
      No tiene materias asignadas en este periodo
    </div>

    <div v-else class="space-y-4">
      <div v-for="materia in materias" :key="materia.pra_id" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="bg-blue-900 text-white px-2 py-0.5 rounded text-xs font-medium">Nivel {{ materia.pra_nivel }}</span>
            <span class="text-sm font-semibold text-gray-800">{{ materia.mat_nombre }}</span>
            <span class="text-xs text-gray-500">Paralelo {{ materia.par_nombre }} · {{ materia.car_nombre }}</span>
          </div>
          <button @click="openModal(materia)" class="flex items-center gap-1 text-xs text-blue-900 hover:text-blue-700 font-medium">
            <i class="pi pi-plus text-xs"></i>Agregar bibliografía
          </button>
        </div>

        <div class="p-4">
          <div v-if="getBibsDeMateria(materia.pra_id).length === 0" class="text-xs text-gray-400 py-2">
            Sin bibliografía registrada para esta materia
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100">
                  <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Título</th>
                  <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Autor</th>
                  <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Editorial</th>
                  <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Año</th>
                  <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Recurso</th>
                  <th class="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="bib in getBibsDeMateria(materia.pra_id)" :key="bib.bib_id" class="hover:bg-gray-50">
                  <td class="px-3 py-2 text-gray-800 font-medium">{{ bib.bib_titulo }}</td>
                  <td class="px-3 py-2 text-gray-600">{{ bib.bib_autor || '-' }}</td>
                  <td class="px-3 py-2 text-gray-600">{{ bib.bib_editorial || '-' }}</td>
                  <td class="px-3 py-2 text-gray-600">{{ bib.bib_anio || '-' }}</td>
                  <td class="px-3 py-2">
                    <template v-if="bib.bib_tipo === 'archivo'">
                      <a :href="archivoUrl(bib.bib_id)" target="_blank" class="flex items-center gap-1 text-blue-700 hover:text-blue-900 text-xs">
                        <i class="pi pi-file-pdf text-xs"></i>Ver PDF
                      </a>
                    </template>
                    <template v-else-if="bib.bib_tipo === 'enlace' && bib.bib_enlace">
                      <a :href="bib.bib_enlace" target="_blank" class="flex items-center gap-1 text-blue-700 hover:text-blue-900 text-xs">
                        <i class="pi pi-link text-xs"></i>Ver enlace
                      </a>
                    </template>
                    <span v-else class="text-gray-400 text-xs">Sin recurso</span>
                  </td>
                  <td class="px-3 py-2">
                    <div class="flex items-center gap-2">
                      <button @click="openModal(materia, bib)" class="text-blue-600 hover:text-blue-800" title="Editar">
                        <i class="pi pi-pencil text-xs"></i>
                      </button>
                      <button @click="handleDelete(bib.bib_id)" class="text-red-500 hover:text-red-700" title="Eliminar">
                        <i class="pi pi-trash text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">{{ editingBib ? 'Editar Bibliografía' : 'Nueva Bibliografía' }}</h2>
            <p class="text-xs text-gray-500">{{ modalMateria?.mat_nombre }} · Paralelo {{ modalMateria?.par_nombre }}</p>
          </div>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600"><i class="pi pi-times"></i></button>
        </div>

        <div v-if="formError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{{ formError }}</div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Título del Libro *</label>
            <input v-model="form.bib_titulo" type="text" placeholder="Ej: Introducción a la Programación" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Autor</label>
              <input v-model="form.bib_autor" type="text" placeholder="Ej: Robert C. Martin" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Año</label>
              <input v-model.number="form.bib_anio" type="number" placeholder="Ej: 2022" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Editorial</label>
            <input v-model="form.bib_editorial" type="text" placeholder="Ej: Pearson" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de recurso</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="form.bib_tipo" value="enlace" class="text-blue-900" />
                <span class="text-sm text-gray-700"><i class="pi pi-link mr-1"></i>Enlace web</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="form.bib_tipo" value="archivo" class="text-blue-900" />
                <span class="text-sm text-gray-700"><i class="pi pi-file-pdf mr-1"></i>Subir PDF</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="form.bib_tipo" value="sin_recurso" class="text-blue-900" />
                <span class="text-sm text-gray-700">Sin recurso</span>
              </label>
            </div>
          </div>

          <div v-if="form.bib_tipo === 'enlace'">
            <label class="block text-sm font-medium text-gray-700 mb-1">URL del recurso</label>
            <input v-model="form.bib_enlace" type="url" placeholder="https://..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>

          <div v-if="form.bib_tipo === 'archivo'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Archivo PDF</label>
            <input type="file" accept=".pdf" @change="handleFileChange" class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm" />
            <p v-if="editingBib?.bib_archivo_nombre && !selectedFile" class="text-xs text-green-600 mt-1">
              <i class="pi pi-check-circle mr-1"></i>Archivo actual: {{ editingBib.bib_archivo_nombre }}
            </p>
            <p v-if="uploading" class="text-xs text-blue-700 mt-1 flex items-center gap-1">
              <i class="pi pi-spin pi-spinner"></i>Subiendo archivo...
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="closeModal" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition">Cancelar</button>
          <button @click="handleSubmit" :disabled="saving || uploading" class="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm hover:bg-blue-800 transition disabled:opacity-50">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { bibliografiaApi } from '../../api/bibliografia.api'
import type { BibliografiaItem } from '../../api/bibliografia.api'
import { periodosApi } from '../../api/periodos.api'
import { docentesApi } from '../../api/docentes.api'
import type { Periodo } from '../../api/periodos.api'
import { useAuthStore } from '../../stores/auth.store'

const authStore = useAuthStore()

const periodos = ref<Periodo[]>([])
const materias = ref<any[]>([])
const bibliografias = ref<BibliografiaItem[]>([])
const docente = ref<any>(null)
const perId = ref(0)
const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const showModal = ref(false)
const modalMateria = ref<any>(null)
const editingBib = ref<BibliografiaItem | null>(null)
const formError = ref('')
const selectedFile = ref<File | null>(null)

const form = reactive({
  bib_titulo: '',
  bib_autor: '',
  bib_editorial: '',
  bib_anio: null as number | null,
  bib_tipo: 'enlace' as 'enlace' | 'archivo' | 'sin_recurso',
  bib_enlace: '',
})

onMounted(async () => {
  try {
    const [periodosRes] = await Promise.all([periodosApi.getAll()])
    periodos.value = periodosRes.data.filter((p: any) => p.per_estado)
    const usuId = Number(authStore.usuario?.usu_id)
    const docenteRes = await docentesApi.getByUsuario(usuId)
    docente.value = docenteRes.data
  } catch (error) {
    console.error('Error cargando datos:', error)
  }
})

async function loadData() {
  if (!perId.value || !docente.value) return
  loading.value = true
  try {
    const [materiasRes, bibsRes] = await Promise.all([
      bibliografiaApi.getMaterias(docente.value.doc_id, perId.value),
      bibliografiaApi.getByDocente(docente.value.doc_id, perId.value),
    ])
    materias.value = materiasRes.data
    bibliografias.value = bibsRes.data
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

function getBibsDeMateria(praId: number) {
  return bibliografias.value.filter(b => Number(b.pra_id) === Number(praId))
}

function archivoUrl(bibId: number): string {
  return bibliografiaApi.getArchivoUrl(bibId)
}

function openModal(materia: any, bib?: BibliografiaItem) {
  modalMateria.value = materia
  editingBib.value = bib ?? null
  formError.value = ''
  selectedFile.value = null
  if (bib) {
    form.bib_titulo = bib.bib_titulo
    form.bib_autor = bib.bib_autor ?? ''
    form.bib_editorial = bib.bib_editorial ?? ''
    form.bib_anio = bib.bib_anio
    form.bib_tipo = bib.bib_tipo as any
    form.bib_enlace = bib.bib_tipo === 'enlace' ? (bib.bib_enlace ?? '') : ''
  } else {
    form.bib_titulo = ''; form.bib_autor = ''; form.bib_editorial = ''
    form.bib_anio = null; form.bib_tipo = 'enlace'; form.bib_enlace = ''
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingBib.value = null
  selectedFile.value = null
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.[0]) selectedFile.value = input.files[0]
}

async function handleSubmit() {
  if (!form.bib_titulo.trim()) { formError.value = 'El título es obligatorio'; return }
  if (!modalMateria.value) return

  saving.value = true
  formError.value = ''

  try {
    const payload: any = {
      pra_id: modalMateria.value.pra_id,
      bib_titulo: form.bib_titulo,
      bib_autor: form.bib_autor || undefined,
      bib_editorial: form.bib_editorial || undefined,
      bib_anio: form.bib_anio ?? undefined,
      bib_tipo: form.bib_tipo === 'sin_recurso' ? 'enlace' : form.bib_tipo,
      bib_enlace: form.bib_tipo === 'enlace' ? (form.bib_enlace || undefined) : undefined,
    }

    let bibId: number
    if (editingBib.value) {
      await bibliografiaApi.update(editingBib.value.bib_id, payload)
      bibId = editingBib.value.bib_id
    } else {
      const res = await bibliografiaApi.create(payload)
      bibId = res.data.bibliografia.bib_id
    }

    if (form.bib_tipo === 'archivo' && selectedFile.value) {
      uploading.value = true
      await bibliografiaApi.uploadArchivo(bibId, selectedFile.value)
      uploading.value = false
    }

    closeModal()
    await loadData()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Error al guardar'
    uploading.value = false
  } finally {
    saving.value = false
  }
}

async function handleDelete(bibId: number) {
  try {
    await bibliografiaApi.delete(bibId)
    await loadData()
  } catch (err) {
    console.error('Error eliminando:', err)
  }
}
</script>