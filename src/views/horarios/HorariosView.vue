<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Generar Horarios</h1>
      <p class="text-gray-500 text-sm mt-1">Asigne horarios a las materias de la programacion</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
      <button @click="activeTab = 'grilla'" :class="['px-4 py-2 rounded-lg text-sm font-medium transition', activeTab === 'grilla' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']">
        Asignar Horarios
      </button>
      <button @click="activeTab = 'docente'" :class="['px-4 py-2 rounded-lg text-sm font-medium transition', activeTab === 'docente' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']">
        Horario Docente
      </button>
      <button @click="activeTab = 'ia'" :class="['px-4 py-2 rounded-lg text-sm font-medium transition', activeTab === 'ia' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']">
        <i class="pi pi-bolt mr-1"></i>
        Generar con IA
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
          <select v-model.number="filters.per_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
            <option value="0">-- Seleccione --</option>
            <option v-for="periodo in periodos" :key="periodo.per_id" :value="periodo.per_id">
              {{ periodo.per_nombre }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
          <select v-model.number="filters.car_id" @change="onCarreraChange" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
            <option value="0">-- Seleccione --</option>
            <option v-for="carrera in carreras" :key="carrera.car_id" :value="carrera.car_id">
              {{ carrera.car_nombre }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
          <select v-model.number="filters.nivel" @change="onNivelChange" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
            <option value="0">-- Seleccione --</option>
            <option v-for="n in nivelesDisponibles" :key="n" :value="n">Nivel {{ n }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Paralelo</label>
          <select v-model="filters.paralelo" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
            <option value="">-- Seleccione --</option>
            <option v-for="par in paralelosDisponibles" :key="par" :value="par">{{ par }}</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="loadData" :disabled="!filters.per_id || !filters.car_id || !filters.nivel || !filters.paralelo" class="w-full px-4 py-2 bg-blue-900 text-white rounded-lg text-sm hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
            Cargar
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 1: Grilla de Horarios -->
    <div v-if="activeTab === 'grilla'">
      <div v-if="loadingData" class="text-center py-8 text-gray-400">Cargando...</div>
      <div v-else-if="!filters.per_id || !filters.car_id" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
        Seleccione periodo y carrera para ver la grilla
      </div>
      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse" style="table-layout: fixed;">
            <thead>
              <tr class="bg-blue-900 text-white">
                <th class="px-3 py-3 text-xs font-semibold text-left border-r border-blue-800" style="width: 70px;">HORA</th>
                <th v-for="dia in dias" :key="dia.dia_id" class="px-2 py-3 text-xs font-semibold text-center border-r border-blue-800" style="width: 150px;">
                  {{ dia.dia_nombre.toUpperCase() }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="hora in horas" :key="hora" style="height: 48px;">
                <td class="px-3 text-xs font-medium text-gray-600 border-r border-b border-gray-200 bg-gray-50 whitespace-nowrap align-top pt-1" style="width: 70px;">
                  {{ formatHora(hora) }}
                </td>
                <td
                  v-for="dia in dias"
                  :key="dia.dia_id"
                  @click="handleCeldaClick(dia, hora)"
                  class="border-r border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition"
                  style="width: 150px; height: 48px; position: relative; padding: 0;"
                >
                  <template v-for="item in getCeldaItems(dia.dia_orden, hora)" :key="item.hor_id">
                    <div
                      class="rounded text-left group"
                      :style="{
                        backgroundColor: getColorMateria(item.mat_nombre) + '30',
                        borderLeft: '4px solid ' + getColorMateria(item.mat_nombre),
                        position: 'absolute',
                        top: '1px',
                        left: '1px',
                        right: '1px',
                        height: (getRowspan(item.blq_hora_inicio, item.blq_hora_fin) * 48 - 2) + 'px',
                        overflow: 'hidden',
                        zIndex: 10,
                        padding: '4px 6px',
                      }"
                    >
                      <p class="text-xs font-semibold leading-tight" :style="{ color: getColorMateria(item.mat_nombre) }">{{ item.mat_nombre }}</p>
                      <p class="text-xs text-gray-600 leading-tight truncate">{{ item.docente_nombre?.trim() || 'Sin docente' }}</p>
                      <p class="text-xs text-gray-400 leading-tight truncate">{{ item.aul_nombre || '' }}</p>
                      <button @click.stop="deleteHorarioGrilla(item.hor_id)" class="absolute top-1 right-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition text-xs">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: Horario Docente -->
    <div v-if="activeTab === 'docente'">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar Docente</label>
        <select v-model.number="selectedDocId" @change="loadHorarioDocente" class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
          <option value="0">-- Seleccione --</option>
          <option v-for="docente in docentes" :key="docente.doc_id" :value="docente.doc_id">
            {{ docente.usu_apellidos }} {{ docente.usu_nombres }}
          </option>
        </select>
      </div>

      <div v-if="loadingDocente" class="text-center py-8 text-gray-400">Cargando...</div>
      <div v-else-if="selectedDocId && horarioDocente.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
        El docente no tiene horarios en este periodo
      </div>
      <div v-else-if="horarioDocente.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse" style="table-layout: fixed;">
            <thead>
              <tr class="bg-blue-900 text-white">
                <th class="px-3 py-3 text-xs font-semibold text-left border-r border-blue-800" style="width: 70px;">HORA</th>
                <th v-for="dia in dias" :key="dia.dia_id" class="px-2 py-3 text-xs font-semibold text-center border-r border-blue-800" style="width: 150px;">
                  {{ dia.dia_nombre.toUpperCase() }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="hora in horas" :key="hora" style="height: 48px;">
                <td class="px-3 text-xs font-medium text-gray-600 border-r border-b border-gray-200 bg-gray-50 whitespace-nowrap align-top pt-1">
                  {{ formatHora(hora) }}
                </td>
                <td v-for="dia in dias" :key="dia.dia_id" class="border-r border-b border-gray-100" style="position: relative; padding: 0; height: 48px;">
                  <template v-for="item in getCeldaDocente(dia.dia_orden, hora)" :key="item.hor_id">
                    <div
                      class="rounded text-left"
                      :style="{
                        backgroundColor: getColorMateria(item.mat_nombre) + '30',
                        borderLeft: '4px solid ' + getColorMateria(item.mat_nombre),
                        position: 'absolute',
                        top: '1px',
                        left: '1px',
                        right: '1px',
                        height: (getRowspan(item.blq_hora_inicio, item.blq_hora_fin) * 48 - 2) + 'px',
                        overflow: 'hidden',
                        zIndex: 10,
                        padding: '4px 6px',
                      }"
                    >
                      <p class="text-xs font-semibold leading-tight" :style="{ color: getColorMateria(item.mat_nombre) }">{{ item.mat_nombre }}</p>
                      <p class="text-xs text-gray-600 leading-tight truncate">{{ item.car_nombre }}</p>
                      <p class="text-xs text-gray-400 leading-tight truncate">{{ item.par_nombre }} {{ item.aul_nombre ? '| ' + item.aul_nombre : '' }}</p>
                    </div>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 3: Generar con IA -->
    <div v-if="activeTab === 'ia'">
      <!-- Configuracion -->
      <div v-if="!iaResultado" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
            <i class="pi pi-bolt text-white"></i>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-800">Generar Horarios con Algoritmo Genetico</h2>
            <p class="text-sm text-gray-500">Configure los parametros y el algoritmo generara una programacion optimizada</p>
          </div>
        </div>

        <div v-if="!filters.per_id || !filters.car_id" class="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm mb-6">
          Seleccione periodo y carrera en los filtros superiores para continuar
        </div>

        <div v-if="iaError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {{ iaError }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nivel y Paralelo -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-700 uppercase">Nivel y Paralelo</h3>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
              <select v-model.number="iaConfig.nivel" @change="onNivelIAChange" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                <option value="0">-- Seleccione --</option>
                <option v-for="n in nivelesIA" :key="n" :value="n">Nivel {{ n }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Paralelo</label>
              <select v-model.number="iaConfig.par_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                <option value="0">-- Seleccione --</option>
                <option v-for="par in paralelosIA" :key="par.par_id" :value="par.par_id">{{ par.par_nombre }}</option>
              </select>
            </div>
          </div>

          <!-- Rango de horas y duracion -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-700 uppercase">Rango de Horas</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                <select v-model.number="iaConfig.hora_inicio" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                  <option v-for="h in horas" :key="h" :value="h">{{ formatHora(h) }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                <select v-model.number="iaConfig.hora_fin" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                  <option v-for="h in horas" :key="h" :value="h">{{ formatHora(h) }}</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Duracion Min (horas)</label>
                <input v-model.number="iaConfig.duracion_min" type="number" min="1" max="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Duracion Max (horas)</label>
                <input v-model.number="iaConfig.duracion_max" type="number" min="1" max="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
              </div>
            </div>
          </div>

          <!-- Dias permitidos -->
          <div class="md:col-span-2 space-y-3">
            <h3 class="text-sm font-semibold text-gray-700 uppercase">Dias Permitidos</h3>
            <div class="flex flex-wrap gap-4">
              <label v-for="dia in dias" :key="dia.dia_id" class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  :value="Number(dia.dia_id)"
                  v-model="iaConfig.dias_permitidos"
                  class="w-4 h-4 text-blue-900 rounded border-gray-300 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700">{{ dia.dia_nombre }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button
            @click="handleGenerarIA"
            :disabled="!filters.per_id || !filters.car_id || generandoIA"
            class="flex items-center gap-2 px-8 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <i :class="['pi', generandoIA ? 'pi-spin pi-spinner' : 'pi-bolt']"></i>
            {{ generandoIA ? 'Generando... puede tardar unos segundos' : 'Generar Horarios' }}
          </button>
        </div>
      </div>

      <!-- Resultado -->
      <div v-else>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-6">
              <div class="text-center">
                <p class="text-2xl font-bold text-blue-900">{{ iaResultado.fitness?.toFixed(1) }}</p>
                <p class="text-xs text-gray-500">Fitness Score</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-green-700">{{ iaResultado.total_clases }}</p>
                <p class="text-xs text-gray-500">Clases Generadas</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-gray-700">{{ iaResultado.generaciones }}</p>
                <p class="text-xs text-gray-500">Generaciones</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button @click="handleLimpiarIA" :disabled="generandoIA" class="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition disabled:opacity-50">
                <i class="pi pi-arrow-left mr-1"></i>
                Volver a Configurar
              </button>
              <button @click="handleRegenerarIA" :disabled="generandoIA" class="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition disabled:opacity-50">
                <i :class="['pi mr-1', generandoIA ? 'pi-spin pi-spinner' : 'pi-refresh']"></i>
                Regenerar
              </button>
              <button @click="handleConfirmarIA" :disabled="confirmandoIA" class="flex items-center gap-2 px-6 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-600 transition disabled:opacity-50">
                <i :class="['pi', confirmandoIA ? 'pi-spin pi-spinner' : 'pi-check']"></i>
                {{ confirmandoIA ? 'Guardando...' : 'Confirmar y Guardar' }}
              </button>
            </div>
          </div>
          <div v-if="iaConfirmado" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mt-4 text-sm">
            {{ iaConfirmado }}
          </div>
          <div v-if="iaError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4 text-sm">
            {{ iaError }}
          </div>
        </div>

        <!-- Grilla previsualización -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="bg-blue-900 text-white px-6 py-3">
            <h3 class="font-semibold">Previsualizacion de Horarios Generados</h3>
            <p class="text-xs text-blue-300 mt-1">Esta es una sugerencia del algoritmo. Puede confirmar o regenerar.</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse" style="table-layout: fixed;">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="px-3 py-3 text-xs font-semibold text-gray-600 text-left border-r border-gray-200" style="width: 70px;">HORA</th>
                  <th v-for="dia in dias" :key="dia.dia_id" class="px-2 py-3 text-xs font-semibold text-gray-600 text-center border-r border-gray-200" style="width: 150px;">
                    {{ dia.dia_nombre.toUpperCase() }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="hora in horas" :key="hora" style="height: 48px;">
                  <td class="px-3 text-xs font-medium text-gray-600 border-r border-b border-gray-200 bg-gray-50 whitespace-nowrap align-top pt-1" style="width: 70px;">
                    {{ formatHora(hora) }}
                  </td>
                  <td v-for="dia in dias" :key="dia.dia_id" class="border-r border-b border-gray-100" style="width: 150px; height: 48px; position: relative; padding: 0;">
                    <template v-for="item in getCeldaIA(dia.dia_orden, hora)" :key="item.pra_id + '-' + item.dia_id + '-' + hora">
                      <div
                        class="rounded text-left"
                        :style="{
                          backgroundColor: getColorMateria(item.mat_nombre) + '30',
                          borderLeft: '4px solid ' + getColorMateria(item.mat_nombre),
                          position: 'absolute',
                          top: '1px',
                          left: '1px',
                          right: '1px',
                          height: (getRowspan(item.hora_inicio, item.hora_fin) * 48 - 2) + 'px',
                          overflow: 'hidden',
                          zIndex: 10,
                          padding: '4px 6px',
                        }"
                      >
                        <p class="text-xs font-semibold leading-tight" :style="{ color: getColorMateria(item.mat_nombre) }">{{ item.mat_nombre }}</p>
                        <p class="text-xs text-gray-500 leading-tight">{{ item.duracion }}h</p>
                      </div>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Asignar Materia -->
    <div v-if="showAsignarModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">Asignar Materia</h2>
            <p class="text-sm text-gray-500">{{ selectedDia?.dia_nombre }} - {{ formatHora(selectedHora) }}</p>
          </div>
          <button @click="showAsignarModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div v-if="asignarModalError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {{ asignarModalError }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Materia</label>
            <select v-model.number="modalForm.pra_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
              <option value="0">-- Seleccione una materia --</option>
              <option v-for="prog in programacion" :key="prog.pra_id" :value="prog.pra_id">
                N{{ prog.pra_nivel }} | {{ prog.mat_codigo }} - {{ prog.mat_nombre }} ({{ prog.par_nombre }})
              </option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
              <select v-model="modalForm.hora_inicio" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                <option v-for="h in horas" :key="h" :value="formatHora(h)">{{ formatHora(h) }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
              <select v-model="modalForm.hora_fin" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                <option v-for="h in horas" :key="h + 1" :value="formatHora(h + 1)">{{ formatHora(h + 1) }}</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Aula (opcional)</label>
            <select v-model.number="modalForm.aul_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
              <option value="0">-- Sin aula --</option>
              <option v-for="aula in aulas" :key="aula.aul_id" :value="aula.aul_id">
                {{ aula.aul_codigo }} - {{ aula.aul_nombre }} ({{ aula.aul_capacidad }})
              </option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="showAsignarModal = false" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition">Cancelar</button>
          <button @click="handleAsignar" :disabled="saving" class="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm hover:bg-blue-800 transition disabled:opacity-50">
            {{ saving ? 'Asignando...' : 'Asignar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { horariosApi } from '../../api/horarios.api'
import { programacionApi } from '../../api/programacion.api'
import { periodosApi } from '../../api/periodos.api'
import { carrerasApi } from '../../api/carreras.api'
import { docentesApi } from '../../api/docentes.api'
import { aulasApi } from '../../api/aulas.api'
import type { HorarioCompleto, HorarioDocente, Dia } from '../../api/horarios.api'
import type { Programacion } from '../../api/programacion.api'
import type { Periodo } from '../../api/periodos.api'
import type { Carrera } from '../../api/carreras.api'
import type { Docente } from '../../api/docentes.api'
import type { Aula } from '../../api/aulas.api'
import type { Escuela } from '../../api/escuelas.api'
import { useRole } from '../../composables/useRole'
import api from '../../api/axios'

const { isCoordinador, usuarioId } = useRole()

const periodos = ref<Periodo[]>([])
const carreras = ref<Carrera[]>([])
const docentes = ref<Docente[]>([])
const aulas = ref<Aula[]>([])
const dias = ref<Dia[]>([])
const programacion = ref<Programacion[]>([])
const horarioCompleto = ref<HorarioCompleto[]>([])
const horarioDocente = ref<HorarioDocente[]>([])
const miEscuela = ref<Escuela | null>(null)

const activeTab = ref('grilla')
const filters = reactive({ per_id: 0, car_id: 0, nivel: 0, paralelo: '' })
const todaProgramacion = ref<Programacion[]>([])
const nivelesDisponibles = ref<number[]>([])
const paralelosDisponibles = ref<string[]>([])
const selectedDocId = ref(0)

// IA
const iaResultado = ref<any>(null)
const generandoIA = ref(false)
const confirmandoIA = ref(false)
const iaError = ref('')
const iaConfirmado = ref('')
const nivelesIA = ref<number[]>([])
const paralelosIA = ref<{ par_id: number; par_nombre: string }[]>([])
const iaConfig = reactive({
  nivel: 0,
  par_id: 0,
  dias_permitidos: [1, 2, 3, 4, 5] as number[],
  hora_inicio: 7,
  hora_fin: 21,
  duracion_min: 2,
  duracion_max: 3,
})

const loadingData = ref(false)
const loadingDocente = ref(false)
const saving = ref(false)

const showAsignarModal = ref(false)
const selectedDia = ref<Dia | null>(null)
const selectedHora = ref(0)
const asignarModalError = ref('')
const modalForm = reactive({
  pra_id: 0,
  hora_inicio: '07:00',
  hora_fin: '08:00',
  aul_id: 0,
})

const horas = Array.from({ length: 24 }, (_, i) => i)

const colores = [
  '#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed',
  '#db2777', '#0891b2', '#4f46e5', '#ca8a04', '#16a34a',
  '#e11d48', '#0d9488', '#9333ea', '#ea580c', '#2dd4bf',
]
const colorMap = new Map<string, string>()

function getColorMateria(nombre: string): string {
  if (!colorMap.has(nombre)) {
    colorMap.set(nombre, colores[colorMap.size % colores.length])
  }
  return colorMap.get(nombre)!
}

function formatHora(h: number): string {
  return `${h.toString().padStart(2, '0')}:00`
}

function getCeldaItems(diaOrden: number, hora: number) {
  const horaStr = formatHora(hora)
  return horarioCompleto.value.filter(h => {
    const horaInicio = h.blq_hora_inicio?.substring(0, 5)
    return Number(h.dia_orden) === diaOrden && horaInicio === horaStr
  })
}

function getRowspan(horaInicio: string, horaFin: string): number {
  const inicio = parseInt(horaInicio.substring(0, 2))
  const fin = parseInt(horaFin.substring(0, 2))
  return Math.max(1, fin - inicio)
}

function getCeldaDocente(diaOrden: number, hora: number) {
  const horaStr = formatHora(hora)
  return horarioDocente.value.filter(h => {
    const horaInicio = h.blq_hora_inicio?.substring(0, 5)
    return Number(h.dia_orden) === diaOrden && horaInicio === horaStr
  })
}

function getCeldaIA(diaOrden: number, hora: number) {
  if (!iaResultado.value?.horarios) return []
  const horaStr = formatHora(hora)
  return iaResultado.value.horarios.filter((h: any) => {
    const diaItem = dias.value.find(d => Number(d.dia_id) === Number(h.dia_id))
    if (!diaItem) return false
    const horaInicio = h.hora_inicio?.substring(0, 5)
    return Number(diaItem.dia_orden) === diaOrden && horaInicio === horaStr
  })
}

onMounted(async () => {
  try {
    const [periodosRes, diasRes] = await Promise.all([
      periodosApi.getAll(),
      horariosApi.getDias(),
    ])
    periodos.value = periodosRes.data
    dias.value = diasRes.data

    if (isCoordinador.value) {
      const escuelaRes = await api.get(`/programacion-academica/coordinador/${usuarioId.value}/escuela`)
      if (escuelaRes.data.length > 0) {
        miEscuela.value = escuelaRes.data[0]
        const [carrerasRes, docentesRes, aulasRes] = await Promise.all([
          api.get(`/programacion-academica/escuelas/${Number(miEscuela.value!.esc_id)}/carreras`),
          docentesApi.getByEscuela(Number(miEscuela.value!.esc_id)),
          aulasApi.getByEscuela(Number(miEscuela.value!.esc_id)),
        ])
        carreras.value = carrerasRes.data
        docentes.value = docentesRes.data
        aulas.value = aulasRes.data
      }
    } else {
      const [carrerasRes, docentesRes, aulasRes] = await Promise.all([
        carrerasApi.getAll(),
        docentesApi.getAll(),
        aulasApi.getAll(),
      ])
      carreras.value = carrerasRes.data
      docentes.value = docentesRes.data
      aulas.value = aulasRes.data
    }
  } catch (error) {
    console.error('Error cargando datos:', error)
  }
})

async function onCarreraChange() {
  filters.nivel = 0
  filters.paralelo = ''
  programacion.value = []
  todaProgramacion.value = []
  horarioCompleto.value = []
  nivelesDisponibles.value = []
  paralelosDisponibles.value = []
  nivelesIA.value = []
  iaConfig.nivel = 0
  iaConfig.par_id = 0
  paralelosIA.value = []

  if (!filters.per_id || !filters.car_id) return

  try {
    const progRes = await programacionApi.getByPeriodoCarrera(Number(filters.per_id), Number(filters.car_id))
    todaProgramacion.value = progRes.data
    const niveles = [...new Set(progRes.data.map(p => p.pra_nivel))].sort((a, b) => a - b)
    nivelesDisponibles.value = niveles
    nivelesIA.value = niveles
  } catch (error) {
    console.error('Error cargando programacion:', error)
  }
}

function onNivelChange() {
  filters.paralelo = ''
  programacion.value = []
  horarioCompleto.value = []

  if (!filters.nivel) {
    paralelosDisponibles.value = []
    return
  }

  const paralelos = [...new Set(
    todaProgramacion.value
      .filter(p => p.pra_nivel === filters.nivel)
      .map(p => p.par_nombre ?? '')
      .filter(p => p !== '')
  )].sort()
  paralelosDisponibles.value = paralelos
}

function onNivelIAChange() {
  iaConfig.par_id = 0
  paralelosIA.value = []

  if (!iaConfig.nivel) return

  const filtrados = todaProgramacion.value.filter(p => p.pra_nivel === iaConfig.nivel)
  const unicos = new Map<number, string>()
  for (const p of filtrados) {
    if (p.par_id && p.par_nombre) {
      unicos.set(Number(p.par_id), p.par_nombre)
    }
  }
  paralelosIA.value = Array.from(unicos, ([par_id, par_nombre]) => ({ par_id, par_nombre }))
}

async function loadData() {
  if (!filters.per_id || !filters.car_id || !filters.nivel || !filters.paralelo) return

  loadingData.value = true
  try {
    programacion.value = todaProgramacion.value.filter(
      p => p.pra_nivel === filters.nivel && p.par_nombre === filters.paralelo
    )

    const horRes = await horariosApi.getHorarioCompleto(Number(filters.per_id), Number(filters.car_id))
    horarioCompleto.value = horRes.data.filter(
      h => h.pra_nivel === filters.nivel && h.par_nombre === filters.paralelo
    )
  } catch (error) {
    console.error('Error cargando datos:', error)
  } finally {
    loadingData.value = false
  }
}

function handleCeldaClick(dia: Dia, hora: number) {
  selectedDia.value = dia
  selectedHora.value = hora
  asignarModalError.value = ''
  modalForm.pra_id = 0
  modalForm.hora_inicio = formatHora(hora)
  modalForm.hora_fin = formatHora(hora + 1)
  modalForm.aul_id = 0
  showAsignarModal.value = true
}

async function handleAsignar() {
  if (!modalForm.pra_id || !selectedDia.value) {
    asignarModalError.value = 'Seleccione una materia'
    return
  }

  saving.value = true
  asignarModalError.value = ''

  try {
    const { blq_id_inicio, blq_id_fin } = await findOrCreateBloque(
      modalForm.hora_inicio,
      modalForm.hora_fin
    )

    await horariosApi.create({
      pra_id: Number(modalForm.pra_id),
      dia_id: Number(selectedDia.value.dia_id),
      blq_id_inicio: Number(blq_id_inicio),
      blq_id_fin: Number(blq_id_fin),
      aul_id: modalForm.aul_id ? Number(modalForm.aul_id) : undefined,
    })
    showAsignarModal.value = false
    await loadData()
  } catch (err: any) {
    asignarModalError.value = err.response?.data?.message || 'Error al asignar horario'
  } finally {
    saving.value = false
  }
}

async function findOrCreateBloque(
  horaInicio: string,
  horaFin: string
): Promise<{ blq_id_inicio: number; blq_id_fin: number }> {
  const bloquesRes = await horariosApi.getBloques()

  let bloqueInicio = bloquesRes.data.find(
    b => b.blq_hora_inicio.substring(0, 5) === horaInicio
  )
  if (!bloqueInicio) {
    const orden = bloquesRes.data.length + 1
    const res = await api.post('/programacion-academica/bloques-horarios', {
      blq_hora_inicio: horaInicio,
      blq_hora_fin: horaFin,
      blq_descripcion: `${horaInicio} - ${horaFin}`,
      blq_orden: orden,
    })
    bloqueInicio = res.data.bloque
  }

  let bloqueFin = bloquesRes.data.find(
    b => b.blq_hora_fin.substring(0, 5) === horaFin
  )
  if (!bloqueFin) {
    const bloquesActualizados = await horariosApi.getBloques()
    const orden = bloquesActualizados.data.length + 1
    const res = await api.post('/programacion-academica/bloques-horarios', {
      blq_hora_inicio: horaInicio,
      blq_hora_fin: horaFin,
      blq_descripcion: `${horaInicio} - ${horaFin}`,
      blq_orden: orden,
    })
    bloqueFin = res.data.bloque
  }

  return {
    blq_id_inicio: bloqueInicio!.blq_id,
    blq_id_fin: bloqueFin!.blq_id,
  }
}

async function deleteHorarioGrilla(horId: number) {
  try {
    await horariosApi.delete(horId)
    await loadData()
  } catch (error) {
    console.error('Error eliminando horario:', error)
  }
}

async function loadHorarioDocente() {
  if (!selectedDocId.value || !filters.per_id) {
    horarioDocente.value = []
    return
  }

  loadingDocente.value = true
  try {
    const response = await horariosApi.getHorarioDocente(
      Number(selectedDocId.value),
      Number(filters.per_id)
    )
    horarioDocente.value = response.data
  } catch (error) {
    console.error('Error cargando horario docente:', error)
  } finally {
    loadingDocente.value = false
  }
}

async function handleGenerarIA() {
  if (!filters.per_id || !filters.car_id) return
  if (!iaConfig.nivel || !iaConfig.par_id) {
    iaError.value = 'Seleccione nivel y paralelo para generar'
    return
  }
  if (iaConfig.dias_permitidos.length === 0) {
    iaError.value = 'Seleccione al menos un dia'
    return
  }
  if (iaConfig.hora_inicio >= iaConfig.hora_fin) {
    iaError.value = 'La hora de inicio debe ser menor a la hora de fin'
    return
  }

  generandoIA.value = true
  iaError.value = ''
  iaResultado.value = null
  iaConfirmado.value = ''

  try {
    const escId = miEscuela.value ? Number(miEscuela.value.esc_id) : 0
    const response = await horariosApi.generarIA({
      per_id: Number(filters.per_id),
      car_id: Number(filters.car_id),
      esc_id: escId,
      nivel: Number(iaConfig.nivel),
      par_id: Number(iaConfig.par_id),
      dias_permitidos: iaConfig.dias_permitidos.map(Number),
      hora_inicio: Number(iaConfig.hora_inicio),
      hora_fin: Number(iaConfig.hora_fin),
      duracion_min: Number(iaConfig.duracion_min),
      duracion_max: Number(iaConfig.duracion_max),
    })
    iaResultado.value = response.data.resultado
  } catch (err: any) {
    iaError.value = err.response?.data?.message || 'Error al generar horarios'
  } finally {
    generandoIA.value = false
  }
}

async function handleRegenerarIA() {
  iaResultado.value = null
  await handleGenerarIA()
}

async function handleConfirmarIA() {
  if (!iaResultado.value?.horarios) return

  confirmandoIA.value = true
  iaConfirmado.value = ''
  iaError.value = ''

  try {
    const response = await horariosApi.confirmarIA({
      per_id: Number(filters.per_id),
      car_id: Number(filters.car_id),
      horarios: iaResultado.value.horarios,
    })
    iaConfirmado.value = response.data.message
    await loadData()
  } catch (err: any) {
    iaError.value = err.response?.data?.message || 'Error al confirmar horarios'
  } finally {
    confirmandoIA.value = false
  }
}

function handleLimpiarIA() {
  iaResultado.value = null
  iaConfirmado.value = ''
  iaError.value = ''
}
</script>