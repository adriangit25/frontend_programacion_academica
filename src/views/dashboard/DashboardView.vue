<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-gray-800">Dashboard</h1>
    <p class="mt-2 text-gray-600">Sistema de Programacion Academica PUCE-SI</p>

    <div v-if="loading" class="text-center py-12 text-gray-400">Cargando...</div>

    <!-- ==================== ADMIN ==================== -->
    <template v-else-if="isAdmin && data">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <StatCard icon="pi-building" label="Escuelas" :value="data.total_escuelas" color="blue" />
        <StatCard icon="pi-sitemap" label="Carreras" :value="data.total_carreras" color="indigo" />
        <StatCard icon="pi-users" label="Docentes Activos" :value="data.total_docentes" color="green" />
        <StatCard icon="pi-id-card" label="Usuarios del Sistema" :value="data.total_usuarios" color="amber" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 class="text-sm font-semibold text-gray-500 uppercase mb-3">Periodo Academico Activo</h2>
          <div v-if="data.periodo_activo">
            <p class="text-xl font-bold text-blue-900">{{ data.periodo_activo.per_nombre }}</p>
            <p class="text-sm text-gray-500 mt-1">
              {{ formatFecha(data.periodo_activo.per_fecha_inicio) }} — {{ formatFecha(data.periodo_activo.per_fecha_fin) }}
            </p>
          </div>
          <p v-else class="text-gray-400 text-sm">No hay periodo activo configurado</p>
        </div>

        <CargaDocenteWidget :resumen="data.resumen_carga" />
      </div>
    </template>

    <!-- ==================== COORDINADOR ==================== -->
    <template v-else-if="isCoordinador && data">
      <div v-if="data.sin_escuela" class="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-6 mt-8 text-sm">
        Su usuario no tiene una escuela asignada como coordinador. Contacte al administrador.
      </div>
      <template v-else>
        <div class="mt-6 mb-4">
          <span class="text-xs font-semibold text-blue-900 uppercase bg-blue-50 px-3 py-1 rounded-full">
            {{ data.escuela.esc_nombre }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon="pi-sitemap" label="Carreras Coordinadas" :value="data.total_carreras" color="indigo" />
          <StatCard icon="pi-users" label="Docentes de su Escuela" :value="data.total_docentes" color="green" />
          <StatCard icon="pi-book" label="Materias Programadas" :value="data.materias_programadas" color="blue" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-sm font-semibold text-gray-500 uppercase mb-3">Periodo Academico Activo</h2>
            <div v-if="data.periodo_activo">
              <p class="text-xl font-bold text-blue-900">{{ data.periodo_activo.per_nombre }}</p>
              <p class="text-sm text-gray-500 mt-1">
                {{ formatFecha(data.periodo_activo.per_fecha_inicio) }} — {{ formatFecha(data.periodo_activo.per_fecha_fin) }}
              </p>
            </div>
            <p v-else class="text-gray-400 text-sm">No hay periodo activo configurado</p>
          </div>

          <CargaDocenteWidget :resumen="data.resumen_carga" />
        </div>
      </template>
    </template>

    <!-- ==================== DOCENTE ==================== -->
    <template v-else-if="data">
      <div v-if="data.sin_perfil_docente" class="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-6 mt-8 text-sm">
        Su usuario no tiene un perfil de docente asociado. Contacte al administrador.
      </div>
      <template v-else>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-1">
            <h2 class="text-xs font-semibold text-gray-500 uppercase mb-3">Carga Horaria</h2>
            <p class="text-3xl font-bold text-blue-900">
              {{ data.horas_asignadas ?? 0 }} <span class="text-base text-gray-400">/ {{ data.docente.doc_horas_maximas }}h</span>
            </p>
            <div class="w-full bg-gray-100 rounded-full h-2 mt-3">
              <div
                class="h-2 rounded-full transition-all"
                :class="porcentajeCarga > 100 ? 'bg-red-500' : 'bg-blue-900'"
                :style="{ width: Math.min(porcentajeCarga, 100) + '%' }"
              ></div>
            </div>
            <p class="text-xs text-gray-400 mt-2">{{ data.docente.doc_dedicacion }}</p>
          </div>

          <StatCard icon="pi-book" label="Materias que Dicta" :value="data.total_materias ?? 0" color="indigo" />

          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xs font-semibold text-gray-500 uppercase mb-3">Proxima Clase de Hoy</h2>
            <div v-if="data.proxima_clase">
              <p class="text-sm font-semibold text-gray-800">{{ data.proxima_clase.mat_nombre }}</p>
              <p class="text-xs text-gray-500 mt-1">
                {{ formatHoraSql(data.proxima_clase.blq_hora_inicio) }} - {{ formatHoraSql(data.proxima_clase.blq_hora_fin) }}
              </p>
              <p class="text-xs text-gray-400 mt-1">
                {{ data.proxima_clase.car_nombre }} | Paralelo {{ data.proxima_clase.par_nombre }}
                <span v-if="data.proxima_clase.aul_nombre"> | {{ data.proxima_clase.aul_nombre }}</span>
              </p>
            </div>
            <p v-else class="text-gray-400 text-sm">No tiene mas clases programadas para hoy</p>
          </div>
        </div>

        <div class="mt-6">
          <RouterLink to="/mi-horario" class="inline-flex items-center gap-2 text-sm text-blue-900 hover:text-blue-700 font-medium">
            Ver mi horario completo <i class="pi pi-arrow-right text-xs"></i>
          </RouterLink>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h, defineComponent } from 'vue'
import { dashboardApi } from '../../api/dashboard.api'
import { useRole } from '../../composables/useRole'
import { useAuthStore } from '../../stores/auth.store'

const { isAdmin, isCoordinador, usuarioId } = useRole()
const authStore = useAuthStore()

const data = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const usuId = Number(usuarioId.value ?? authStore.usuario?.usu_id)
    let response
    if (isAdmin.value) response = await dashboardApi.getAdmin()
    else if (isCoordinador.value) response = await dashboardApi.getCoordinador(usuId)
    else response = await dashboardApi.getDocente(usuId)
    data.value = response.data
  } catch (error) {
    console.error('Error cargando dashboard:', error)
  } finally {
    loading.value = false
  }
})

const porcentajeCarga = computed(() => {
  if (!data.value?.docente?.doc_horas_maximas) return 0
  return ((data.value.horas_asignadas ?? 0) / data.value.docente.doc_horas_maximas) * 100
})

function formatFecha(fecha: string): string {
  if (!fecha) return ''
  const d = new Date(fecha)
  return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatHoraSql(hora: string): string {
  return hora?.substring(0, 5) || ''
}

// Tarjeta de estadistica reutilizable
const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-900' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  green: { bg: 'bg-green-50', text: 'text-green-700' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700' },
}

const StatCard = defineComponent({
  props: { icon: String, label: String, value: [Number, String], color: { type: String, default: 'blue' } },
  setup(props) {
    return () =>
      h('div', { class: 'bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4' }, [
        h('div', { class: `w-12 h-12 rounded-lg flex items-center justify-center ${colorMap[props.color!].bg}` }, [
          h('i', { class: `pi ${props.icon} text-xl ${colorMap[props.color!].text}` }),
        ]),
        h('div', [
          h('p', { class: 'text-2xl font-bold text-gray-800' }, String(props.value)),
          h('p', { class: 'text-xs text-gray-500' }, props.label),
        ]),
      ])
  },
})

// Widget de resumen de carga docente (barras de Normal/Subcarga/Sobrecarga)
const CargaDocenteWidget = defineComponent({
  props: { resumen: Object },
  setup(props) {
    return () => {
      const r = props.resumen
      if (!r || r.total === 0) {
        return h('div', { class: 'bg-white rounded-xl shadow-sm border border-gray-200 p-6' }, [
          h('h2', { class: 'text-sm font-semibold text-gray-500 uppercase mb-3' }, 'Carga Docente'),
          h('p', { class: 'text-gray-400 text-sm' }, 'Sin datos de carga para el periodo activo'),
        ])
      }
      const filas = [
        { label: 'Normal', value: r.normal, color: 'bg-green-500' },
        { label: 'Subcarga', value: r.subcarga, color: 'bg-amber-500' },
        { label: 'Sobrecarga', value: r.sobrecarga, color: 'bg-red-500' },
      ]
      return h('div', { class: 'bg-white rounded-xl shadow-sm border border-gray-200 p-6' }, [
        h('h2', { class: 'text-sm font-semibold text-gray-500 uppercase mb-4' }, `Carga Docente (${r.total} docentes)`),
        h(
          'div',
          { class: 'space-y-3' },
          filas.map((f) =>
            h('div', {}, [
              h('div', { class: 'flex justify-between text-xs mb-1' }, [
                h('span', { class: 'text-gray-600 font-medium' }, f.label),
                h('span', { class: 'text-gray-500' }, String(f.value)),
              ]),
              h('div', { class: 'w-full bg-gray-100 rounded-full h-2' }, [
                h('div', {
                  class: `h-2 rounded-full ${f.color}`,
                  style: { width: r.total ? (f.value / r.total) * 100 + '%' : '0%' },
                }),
              ]),
            ]),
          ),
        ),
      ])
    }
  },
})
</script>