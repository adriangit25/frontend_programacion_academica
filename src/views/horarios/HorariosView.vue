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
            <option v-for="periodo in periodos" :key="periodo.per_id" :value="periodo.per_id">{{ periodo.per_nombre }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
          <select v-model.number="filters.car_id" @change="onCarreraChange" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
            <option value="0">-- Seleccione --</option>
            <option v-for="carrera in carreras" :key="carrera.car_id" :value="carrera.car_id">{{ carrera.car_nombre }}</option>
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
      <!-- Botón exportar -->
      <div class="flex justify-end mt-3">
        <button
          @click="exportarExcel"
          :disabled="!filters.per_id || !filters.car_id"
          class="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="pi pi-file-excel"></i>
          Exportar Horarios Excel
        </button>
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
                <th v-for="dia in dias" :key="dia.dia_id" class="px-2 py-3 text-xs font-semibold text-center border-r border-blue-800" style="width: 150px;">{{ dia.dia_nombre.toUpperCase() }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="hora in horas" :key="hora" style="height: 48px;">
                <td class="px-3 text-xs font-medium text-gray-600 border-r border-b border-gray-200 bg-gray-50 whitespace-nowrap align-top pt-1" style="width: 70px;">{{ formatHora(hora) }}</td>
                <td v-for="dia in dias" :key="dia.dia_id" @click="handleCeldaClick(dia, hora)" class="border-r border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition" style="width: 150px; height: 48px; position: relative; padding: 0;">
                  <template v-for="item in getCeldaItems(dia.dia_orden, hora)" :key="item.hor_id">
                    <div class="rounded text-left group" :style="{ backgroundColor: getColorMateria(item.mat_nombre) + '30', borderLeft: '4px solid ' + getColorMateria(item.mat_nombre), position: 'absolute', top: '1px', left: '1px', right: '1px', height: (getRowspan(item.blq_hora_inicio, item.blq_hora_fin) * 48 - 2) + 'px', overflow: 'hidden', zIndex: 10, padding: '4px 6px' }">
                      <p class="text-xs font-semibold leading-tight" :style="{ color: getColorMateria(item.mat_nombre) }">{{ item.mat_nombre }}</p>
                      <p class="text-xs text-gray-600 leading-tight truncate">{{ item.docente_nombre?.trim() || 'Sin docente' }}</p>
                      <p class="text-xs text-gray-400 leading-tight truncate">{{ item.aul_nombre || '' }}</p>
                      <button @click.stop="deleteHorarioGrilla(item.hor_id)" class="absolute top-1 right-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition text-xs"><i class="pi pi-times"></i></button>
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
          <option v-for="docente in docentes" :key="docente.doc_id" :value="docente.doc_id">{{ docente.usu_apellidos }} {{ docente.usu_nombres }}</option>
        </select>
      </div>
          <div v-if="!filters.per_id" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
            Seleccione un periodo academico en los filtros superiores para ver el horario del docente
          </div>
          <div v-else-if="loadingDocente" class="text-center py-8 text-gray-400">Cargando...</div>
          <div v-else-if="selectedDocId && horarioDocente.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">El docente no tiene horarios en este periodo</div>
          <div v-else-if="horarioDocente.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse" style="table-layout: fixed;">
            <thead>
              <tr class="bg-blue-900 text-white">
                <th class="px-3 py-3 text-xs font-semibold text-left border-r border-blue-800" style="width: 70px;">HORA</th>
                <th v-for="dia in dias" :key="dia.dia_id" class="px-2 py-3 text-xs font-semibold text-center border-r border-blue-800" style="width: 150px;">{{ dia.dia_nombre.toUpperCase() }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="hora in horas" :key="hora" style="height: 48px;">
                <td class="px-3 text-xs font-medium text-gray-600 border-r border-b border-gray-200 bg-gray-50 whitespace-nowrap align-top pt-1">{{ formatHora(hora) }}</td>
                <td v-for="dia in dias" :key="dia.dia_id" class="border-r border-b border-gray-100" style="position: relative; padding: 0; height: 48px;">
                  <template v-for="item in getCeldaDocente(dia.dia_orden, hora)" :key="item.hor_id">
                    <div class="rounded text-left" :style="{ backgroundColor: getColorMateria(item.mat_nombre) + '30', borderLeft: '4px solid ' + getColorMateria(item.mat_nombre), position: 'absolute', top: '1px', left: '1px', right: '1px', height: (getRowspan(item.blq_hora_inicio, item.blq_hora_fin) * 48 - 2) + 'px', overflow: 'hidden', zIndex: 10, padding: '4px 6px' }">
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
      <div v-if="!filters.per_id || !filters.car_id" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <i class="pi pi-bolt text-4xl text-gray-300 mb-3"></i>
        <p class="text-gray-400">Seleccione periodo y carrera en los filtros superiores para continuar</p>
      </div>
      <div v-else-if="combinacionesIA.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p class="text-gray-400">No hay programacion academica para esta carrera y periodo</p>
      </div>
      <div v-else>
        <!-- Header IA -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
                <i class="pi pi-bolt text-white"></i>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-800">Generar Horarios con Inteligencia Artificial (Algoritmo Genético)</h2>
                <p class="text-sm text-gray-500">Configure cada nivel y paralelo de forma independiente</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button @click="handleLimpiarIA" v-if="iaResultados.length > 0" class="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition"><i class="pi pi-times mr-1"></i>Limpiar</button>
              <button @click="handleRegenerarIA" v-if="iaResultados.length > 0" :disabled="generandoIA" class="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition disabled:opacity-50"><i :class="['pi mr-1', generandoIA ? 'pi-spin pi-spinner' : 'pi-refresh']"></i>Regenerar Todo</button>
              <button @click="handleConfirmarIA" v-if="iaResultados.length > 0" :disabled="confirmandoIA" class="flex items-center gap-2 px-6 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-600 transition disabled:opacity-50">
                <i :class="['pi', confirmandoIA ? 'pi-spin pi-spinner' : 'pi-check']"></i>
                {{ confirmandoIA ? 'Guardando...' : 'Confirmar y Guardar Todo' }}
              </button>
              <button @click="handleGenerarIA" v-if="iaResultados.length === 0" :disabled="generandoIA" class="flex items-center gap-2 px-8 py-2 bg-blue-900 text-white rounded-lg text-sm hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium">
                <i :class="['pi', generandoIA ? 'pi-spin pi-spinner' : 'pi-bolt']"></i>
                {{ generandoIA ? 'Generando...' : 'Generar Todo' }}
              </button>
            </div>
          </div>
          <div v-if="iaError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4 text-sm">{{ iaError }}</div>
          <div v-if="iaConfirmado" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mt-4 text-sm">{{ iaConfirmado }}</div>
          <!-- Laboratorios globales -->
          <div class="mt-6 pt-4 border-t border-gray-100">
            <h3 class="text-sm font-semibold text-gray-700 uppercase mb-2">Laboratorios Disponibles <span class="text-gray-400 normal-case font-normal">(opcional - aplica para todos)</span></h3>
            <div v-if="aulas.length === 0" class="text-sm text-gray-400">No hay aulas registradas</div>
            <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-2">
              <label v-for="aula in aulas" :key="aula.aul_id" class="flex items-center gap-2 cursor-pointer bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 hover:bg-blue-50 hover:border-blue-200 transition">
                <input type="checkbox" :value="Number(aula.aul_id)" v-model="labsGlobales" class="w-4 h-4 text-blue-900 rounded border-gray-300 focus:ring-blue-500" />
                <div>
                  <p class="text-sm text-gray-700 font-medium">{{ aula.aul_codigo }} - {{ aula.aul_nombre }}</p>
                  <p class="text-xs text-gray-400">Capacidad: {{ aula.aul_capacidad }}</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Tarjetas por nivel+paralelo -->
        <div class="space-y-4 mb-6">
          <div v-for="combo in combinacionesIA" :key="`${combo.nivel}-${combo.par_id}`" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="bg-blue-900 text-white px-2 py-0.5 rounded text-xs font-medium">Nivel {{ combo.nivel }}</span>
                <span class="text-sm font-medium text-gray-800">Paralelo {{ combo.par_nombre }}</span>
              </div>
              <div v-if="getResultadoGrupo(combo.nivel, combo.par_id)" class="flex items-center gap-2">
                <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  <i class="pi pi-check mr-1"></i>Generado - Fitness: {{ getResultadoGrupo(combo.nivel, combo.par_id)?.resultado?.fitness?.toFixed(1) }}
                </span>
              </div>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="space-y-3">
                  <h4 class="text-xs font-semibold text-gray-500 uppercase">Rango de Horas</h4>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">Hora Inicio</label>
                      <select v-model.number="gruposConfig[`${combo.nivel}-${combo.par_id}`].hora_inicio" class="w-full px-2 py-1.5 border border-gray-300 rounded-lg outline-none text-sm">
                        <option v-for="h in horas" :key="h" :value="h">{{ formatHora(h) }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">Hora Fin</label>
                      <select v-model.number="gruposConfig[`${combo.nivel}-${combo.par_id}`].hora_fin" class="w-full px-2 py-1.5 border border-gray-300 rounded-lg outline-none text-sm">
                        <option v-for="h in horas" :key="h" :value="h">{{ formatHora(h) }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">Dur. Min</label>
                      <input v-model.number="gruposConfig[`${combo.nivel}-${combo.par_id}`].duracion_min" type="number" min="1" max="4" class="w-full px-2 py-1.5 border border-gray-300 rounded-lg outline-none text-sm" />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">Dur. Max</label>
                      <input v-model.number="gruposConfig[`${combo.nivel}-${combo.par_id}`].duracion_max" type="number" min="1" max="4" class="w-full px-2 py-1.5 border border-gray-300 rounded-lg outline-none text-sm" />
                    </div>
                  </div>
                </div>
                <div class="space-y-3">
                  <h4 class="text-xs font-semibold text-gray-500 uppercase">Dias Permitidos</h4>
                  <div class="flex flex-wrap gap-2">
                    <label v-for="dia in dias" :key="dia.dia_id" class="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" :value="Number(dia.dia_id)" v-model="gruposConfig[`${combo.nivel}-${combo.par_id}`].dias_permitidos" class="w-3.5 h-3.5 text-blue-900 rounded border-gray-300" />
                      <span class="text-xs text-gray-700">{{ dia.dia_abreviatura || dia.dia_nombre.substring(0, 3) }}</span>
                    </label>
                  </div>
                </div>
                <div v-if="!getResultadoGrupo(combo.nivel, combo.par_id)" class="flex items-center justify-center">
                  <button @click="handleGenerarGrupo(combo)" :disabled="generandoIA" class="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg text-sm hover:bg-blue-800 transition disabled:opacity-50">
                    <i :class="['pi', generandoIA ? 'pi-spin pi-spinner' : 'pi-bolt']"></i>Generar este grupo
                  </button>
                </div>
                <div v-else class="flex items-center justify-center">
                  <button @click="handleRegenerarGrupo(combo)" :disabled="generandoIA" class="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition disabled:opacity-50">
                    <i :class="['pi', generandoIA ? 'pi-spin pi-spinner' : 'pi-refresh']"></i>Regenerar
                  </button>
                </div>
              </div>
            </div>

            <!-- Grilla con pendientes y drag & drop -->
            <div v-if="getResultadoGrupo(combo.nivel, combo.par_id)" class="border-t border-gray-200">

              <!-- Area Pendientes -->
              <div
                class="p-3 border-b border-gray-200 transition-colors min-h-16"
                :class="draggingItem && draggingCombo?.nivel === combo.nivel && draggingCombo?.par_id === combo.par_id && !draggingFromPendiente
                  ? 'bg-amber-50 border-2 border-dashed border-amber-400'
                  : 'bg-gray-50'"
                @dragover.prevent
                @drop="dropEnPendientes(combo, $event)"
              >
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-inbox text-amber-600 text-xs"></i>
                  <span class="text-xs font-semibold text-amber-700">Pendientes</span>
                  <span class="text-xs text-amber-500">— arrastra aqui para sacar un bloque temporalmente</span>
                </div>
                <div class="flex flex-wrap gap-2 min-h-6">
                  <div v-if="getPendientesGrupo(combo.nivel, combo.par_id).length === 0" class="text-xs text-gray-400 py-1">Sin bloques pendientes</div>
                  <div
                    v-for="(pend, idx) in getPendientesGrupo(combo.nivel, combo.par_id)"
                    :key="idx"
                    draggable="true"
                    @dragstart="startDragPendiente(pend, combo, $event)"
                    class="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-grab active:cursor-grabbing border text-xs select-none"
                    :style="{ backgroundColor: getColorMateria(pend.mat_nombre) + '20', borderColor: getColorMateria(pend.mat_nombre), color: getColorMateria(pend.mat_nombre) }"
                  >
                    <i class="pi pi-arrows-alt text-xs"></i>
                    <span class="font-semibold">{{ pend.mat_nombre }}</span>
                    <span class="text-gray-500 ml-1">{{ pend.duracion }}h</span>
                    <span class="text-gray-400">— {{ pend.doc_nombre || 'Sin docente' }}</span>
                    <button @click="devolverPendiente(pend, combo, idx)" class="ml-1 hover:opacity-70 transition" title="Eliminar pendiente">
                      <i class="pi pi-times text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Grilla -->
              <div class="overflow-x-auto">
                <table class="w-full border-collapse" style="table-layout: fixed;">
                  <thead>
                    <tr class="bg-gray-50 border-b border-gray-200">
                      <th class="px-3 py-2 text-xs font-semibold text-gray-600 text-left border-r border-gray-200" style="width: 70px;">HORA</th>
                      <th v-for="dia in dias" :key="dia.dia_id" class="px-2 py-2 text-xs font-semibold text-gray-600 text-center border-r border-gray-200" style="width: 150px;">{{ dia.dia_nombre.toUpperCase() }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="hora in horasVisibles(combo.nivel, combo.par_id)" :key="hora" style="height: 48px;">
                      <td class="px-3 text-xs font-medium text-gray-600 border-r border-b border-gray-200 bg-gray-50 whitespace-nowrap align-top pt-1" style="width: 70px;">{{ formatHora(hora) }}</td>
                      <td
                        v-for="dia in dias"
                        :key="dia.dia_id"
                        class="border-r border-b border-gray-100 transition-colors"
                        :class="draggingItem && draggingCombo?.nivel === combo.nivel && draggingCombo?.par_id === combo.par_id ? 'hover:bg-blue-100' : ''"
                        style="width: 150px; height: 48px; position: relative; padding: 0;"
                        @dragover.prevent
                        @drop="dropIA(dia, hora, combo, $event)"
                      >
                        <template v-for="item in getCeldaIAGrupo(getResultadoGrupo(combo.nivel, combo.par_id)?.resultado?.horarios, dia.dia_orden, hora)" :key="item.pra_id + '-' + item.dia_id + '-' + hora">
                          <div
                            class="rounded text-left group cursor-grab active:cursor-grabbing select-none"
                            draggable="true"
                            @dragstart="startDragIA(item, combo, $event)"
                            @click.stop="openEditarBloqueIA(item, combo)"
                            :style="{ backgroundColor: getColorMateria(item.mat_nombre) + '30', borderLeft: '4px solid ' + getColorMateria(item.mat_nombre), position: 'absolute', top: '1px', left: '1px', right: '1px', height: (getRowspan(item.hora_inicio, item.hora_fin) * 48 - 2) + 'px', overflow: 'hidden', zIndex: 10, padding: '4px 6px' }"
                          >
                            <p class="text-xs font-semibold leading-tight" :style="{ color: getColorMateria(item.mat_nombre) }">{{ item.mat_nombre }}</p>
                            <p class="text-xs text-gray-600 leading-tight truncate">{{ item.doc_nombre || 'Sin docente' }}</p>
                            <p class="text-xs text-gray-500 leading-tight">{{ item.duracion }}h</p>
                            <p v-if="item.aul_sugerida" class="text-xs text-gray-400 leading-tight truncate">
                              <i class="pi pi-building text-xs mr-1"></i>{{ item.aul_sugerida.aul_nombre }}
                            </p>
                            <button @click.stop="eliminarBloqueIA(item, combo)" class="absolute top-1 right-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition text-xs">
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
        </div>

        <div v-if="iaResultados.length === 0" class="flex justify-end">
          <button @click="handleGenerarIA" :disabled="generandoIA" class="flex items-center gap-2 px-8 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium">
            <i :class="['pi', generandoIA ? 'pi-spin pi-spinner' : 'pi-bolt']"></i>
            {{ generandoIA ? 'Generando...' : 'Generar Todos los Horarios' }}
          </button>
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
          <button @click="showAsignarModal = false" class="text-gray-400 hover:text-gray-600"><i class="pi pi-times"></i></button>
        </div>
        <div v-if="asignarModalError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{{ asignarModalError }}</div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Materia</label>
            <select v-model.number="modalForm.pra_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
              <option value="0">-- Seleccione una materia --</option>
              <option v-for="prog in programacion" :key="prog.pra_id" :value="prog.pra_id">N{{ prog.pra_nivel }} | {{ prog.mat_codigo }} - {{ prog.mat_nombre }} ({{ prog.par_nombre }})</option>
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
              <option v-for="aula in aulas" :key="aula.aul_id" :value="aula.aul_id">{{ aula.aul_codigo }} - {{ aula.aul_nombre }} ({{ aula.aul_capacidad }})</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showAsignarModal = false" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition">Cancelar</button>
          <button @click="handleAsignar" :disabled="saving" class="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm hover:bg-blue-800 transition disabled:opacity-50">{{ saving ? 'Asignando...' : 'Asignar' }}</button>
        </div>
      </div>
    </div>

    <!-- Modal Editar Bloque IA -->
    <div v-if="showEditarBloqueModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">Editar Bloque</h2>
            <p class="text-sm text-gray-500">{{ editandoBloque?.mat_nombre }}</p>
          </div>
          <button @click="showEditarBloqueModal = false" class="text-gray-400 hover:text-gray-600"><i class="pi pi-times"></i></button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Docente</label>
            <select v-model.number="editBloqueForm.doc_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
              <option value="0">-- Sin asignar --</option>
              <option v-for="docente in docentes" :key="docente.doc_id" :value="docente.doc_id">{{ docente.usu_apellidos }} {{ docente.usu_nombres }}</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Dia</label>
              <select v-model.number="editBloqueForm.dia_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                <option v-for="dia in dias" :key="dia.dia_id" :value="dia.dia_id">{{ dia.dia_nombre }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
              <select v-model="editBloqueForm.hora_inicio" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                <option v-for="h in horas" :key="h" :value="formatHora(h)">{{ formatHora(h) }}</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
              <select v-model="editBloqueForm.hora_fin" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                <option v-for="h in horas" :key="h + 1" :value="formatHora(h + 1)">{{ formatHora(h + 1) }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Laboratorio</label>
              <select v-model.number="editBloqueForm.aul_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                <option value="0">-- Sin lab --</option>
                <option v-for="aula in aulas" :key="aula.aul_id" :value="aula.aul_id">{{ aula.aul_codigo }} - {{ aula.aul_nombre }}</option>
              </select>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showEditarBloqueModal = false" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition">Cancelar</button>
          <button @click="guardarEdicionBloqueIA" class="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm hover:bg-blue-800 transition">Guardar Cambios</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
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
const iaResultados = ref<Array<{ nivel: number; par_id: number; par_nombre: string; resultado: any }>>([])
const generandoIA = ref(false)
const confirmandoIA = ref(false)
const iaError = ref('')
const iaConfirmado = ref('')
const labsGlobales = ref<number[]>([])
const gruposConfig = ref<Record<string, { hora_inicio: number; hora_fin: number; duracion_min: number; duracion_max: number; dias_permitidos: number[] }>>({})

// Editar bloque IA
const showEditarBloqueModal = ref(false)
const editandoBloque = ref<any>(null)
const editandoCombo = ref<any>(null)
const editBloqueForm = reactive({ doc_id: 0, dia_id: 0, hora_inicio: '07:00', hora_fin: '09:00', aul_id: 0 })

// Drag & Drop
const draggingItem = ref<any>(null)
const draggingCombo = ref<any>(null)
const draggingFromPendiente = ref(false)

// Pendientes por grupo
const pendientesIA = ref<Record<string, any[]>>({})

const combinacionesIA = computed(() => {
  const unicos = new Map<string, { nivel: number; par_id: number; par_nombre: string }>()
  for (const p of todaProgramacion.value) {
    if (p.par_id && p.par_nombre) {
      const key = `${p.pra_nivel}-${p.par_id}`
      if (!unicos.has(key)) unicos.set(key, { nivel: p.pra_nivel, par_id: Number(p.par_id), par_nombre: p.par_nombre })
    }
  }
  return Array.from(unicos.values()).sort((a, b) => a.nivel - b.nivel || a.par_nombre.localeCompare(b.par_nombre))
})

const loadingData = ref(false)
const loadingDocente = ref(false)
const saving = ref(false)
const showAsignarModal = ref(false)
const selectedDia = ref<Dia | null>(null)
const selectedHora = ref(0)
const asignarModalError = ref('')
const modalForm = reactive({ pra_id: 0, hora_inicio: '07:00', hora_fin: '08:00', aul_id: 0 })
const horas = Array.from({ length: 24 }, (_, i) => i)

const colores = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#4f46e5', '#ca8a04', '#16a34a', '#e11d48', '#0d9488', '#9333ea', '#ea580c', '#2dd4bf']
const colorMap = new Map<string, string>()

function getColorMateria(nombre: string): string {
  if (!colorMap.has(nombre)) colorMap.set(nombre, colores[colorMap.size % colores.length])
  return colorMap.get(nombre)!
}

function formatHora(h: number): string { return `${h.toString().padStart(2, '0')}:00` }

function getRowspan(horaInicio: string, horaFin: string): number {
  return Math.max(1, parseInt(horaFin.substring(0, 2)) - parseInt(horaInicio.substring(0, 2)))
}

function getCeldaItems(diaOrden: number, hora: number) {
  const horaStr = formatHora(hora)
  return horarioCompleto.value.filter(h => Number(h.dia_orden) === diaOrden && h.blq_hora_inicio?.substring(0, 5) === horaStr)
}

function getCeldaDocente(diaOrden: number, hora: number) {
  const horaStr = formatHora(hora)
  return horarioDocente.value.filter(h => Number(h.dia_orden) === diaOrden && h.blq_hora_inicio?.substring(0, 5) === horaStr)
}

function getCeldaIAGrupo(horarios: any[], diaOrden: number, hora: number) {
  if (!horarios) return []
  const horaStr = formatHora(hora)
  return horarios.filter((h: any) => {
    const diaItem = dias.value.find(d => Number(d.dia_id) === Number(h.dia_id))
    if (!diaItem) return false
    return Number(diaItem.dia_orden) === diaOrden && h.hora_inicio?.substring(0, 5) === horaStr
  })
}

function getResultadoGrupo(nivel: number, parId: number) {
  return iaResultados.value.find(r => r.nivel === nivel && r.par_id === parId)
}

function horasVisibles(nivel: number, parId: number): number[] {
  const resultado = getResultadoGrupo(nivel, parId)
  if (!resultado?.resultado?.horarios?.length) return horas
  const horasEnGrilla = resultado.resultado.horarios.map((h: any) => parseInt(h.hora_inicio?.substring(0, 2)))
  const minH = Math.max(0, Math.min(...horasEnGrilla) - 1)
  const maxH = Math.min(23, Math.max(...horasEnGrilla) + 3)
  return horas.filter(h => h >= minH && h <= maxH)
}

function getPendientesGrupo(nivel: number, parId: number): any[] {
  const key = `${nivel}-${parId}`
  if (!pendientesIA.value[key]) pendientesIA.value[key] = []
  return pendientesIA.value[key]
}

function initGrupoConfig(key: string) {
  if (!gruposConfig.value[key]) {
    gruposConfig.value[key] = { hora_inicio: 7, hora_fin: 21, duracion_min: 2, duracion_max: 3, dias_permitidos: [1, 2, 3, 4, 5] }
  }
}

// Drag & Drop funciones
function startDragIA(item: any, combo: any, event: DragEvent) {
  draggingItem.value = item
  draggingCombo.value = combo
  draggingFromPendiente.value = false
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function startDragPendiente(item: any, combo: any, event: DragEvent) {
  draggingItem.value = item
  draggingCombo.value = combo
  draggingFromPendiente.value = true
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function dropEnPendientes(combo: any, event: DragEvent) {
  event.preventDefault()
  if (!draggingItem.value || !draggingCombo.value) return
  if (draggingCombo.value.nivel !== combo.nivel || draggingCombo.value.par_id !== combo.par_id) return
  if (draggingFromPendiente.value) return

  const grupo = getResultadoGrupo(draggingCombo.value.nivel, draggingCombo.value.par_id)
  if (!grupo?.resultado?.horarios) return

  const idx = grupo.resultado.horarios.indexOf(draggingItem.value)
  if (idx > -1) {
    grupo.resultado.horarios.splice(idx, 1)
    const key = `${combo.nivel}-${combo.par_id}`
    if (!pendientesIA.value[key]) pendientesIA.value[key] = []
    pendientesIA.value[key].push({ ...draggingItem.value })
  }

  draggingItem.value = null
  draggingCombo.value = null
  draggingFromPendiente.value = false
}

function dropIA(dia: Dia, hora: number, combo: any, event: DragEvent) {
  event.preventDefault()
  if (!draggingItem.value || !draggingCombo.value) return
  if (draggingCombo.value.nivel !== combo.nivel || draggingCombo.value.par_id !== combo.par_id) return

  const grupo = getResultadoGrupo(draggingCombo.value.nivel, draggingCombo.value.par_id)
  if (!grupo?.resultado?.horarios) return

  const duracion = draggingItem.value.duracion || 1
  const horaInicio = formatHora(hora)
  const horaFin = formatHora(Math.min(hora + duracion, 23))

  const newItem = {
    ...draggingItem.value,
    dia_id: Number(dia.dia_id),
    dia_nombre: dia.dia_nombre,
    hora_inicio: horaInicio + ':00',
    hora_fin: horaFin + ':00',
    duracion,
  }

  if (draggingFromPendiente.value) {
    const key = `${combo.nivel}-${combo.par_id}`
    const pendIdx = pendientesIA.value[key]?.findIndex((p: any) => p === draggingItem.value)
    if (pendIdx !== undefined && pendIdx > -1) pendientesIA.value[key].splice(pendIdx, 1)
    grupo.resultado.horarios.push(newItem)
  } else {
    const idx = grupo.resultado.horarios.indexOf(draggingItem.value)
    if (idx > -1) grupo.resultado.horarios[idx] = newItem
  }

  draggingItem.value = null
  draggingCombo.value = null
  draggingFromPendiente.value = false
}

function devolverPendiente(item: any, combo: any, idx: number) {
  const key = `${combo.nivel}-${combo.par_id}`
  if (pendientesIA.value[key]) pendientesIA.value[key].splice(idx, 1)
}

function openEditarBloqueIA(item: any, combo: any) {
  editandoBloque.value = item
  editandoCombo.value = combo
  editBloqueForm.doc_id = item.doc_id ? Number(item.doc_id) : 0
  editBloqueForm.dia_id = Number(item.dia_id)
  editBloqueForm.hora_inicio = item.hora_inicio?.substring(0, 5) || '07:00'
  editBloqueForm.hora_fin = item.hora_fin?.substring(0, 5) || '09:00'
  editBloqueForm.aul_id = item.aul_sugerida ? Number(item.aul_sugerida.aul_id) : 0
  showEditarBloqueModal.value = true
}

function guardarEdicionBloqueIA() {
  const grupo = getResultadoGrupo(editandoCombo.value.nivel, editandoCombo.value.par_id)
  if (!grupo?.resultado?.horarios) return

  const docente = docentes.value.find(d => Number(d.doc_id) === Number(editBloqueForm.doc_id))
  const aulaSeleccionada = aulas.value.find(a => Number(a.aul_id) === Number(editBloqueForm.aul_id))
  const diaSeleccionado = dias.value.find(d => Number(d.dia_id) === Number(editBloqueForm.dia_id))
  const duracion = parseInt(editBloqueForm.hora_fin.substring(0, 2)) - parseInt(editBloqueForm.hora_inicio.substring(0, 2))

  const idx = grupo.resultado.horarios.indexOf(editandoBloque.value)
  if (idx > -1) {
    grupo.resultado.horarios[idx] = {
      ...editandoBloque.value,
      doc_id: editBloqueForm.doc_id || null,
      doc_nombre: docente ? `${docente.usu_apellidos} ${docente.usu_nombres}` : 'Sin asignar',
      dia_id: Number(editBloqueForm.dia_id),
      dia_nombre: diaSeleccionado?.dia_nombre || '',
      hora_inicio: editBloqueForm.hora_inicio + ':00',
      hora_fin: editBloqueForm.hora_fin + ':00',
      duracion: Math.max(1, duracion),
      aul_id: editBloqueForm.aul_id || null,
      aul_sugerida: aulaSeleccionada ? { aul_id: aulaSeleccionada.aul_id, aul_nombre: aulaSeleccionada.aul_nombre, aul_codigo: aulaSeleccionada.aul_codigo, aul_capacidad: aulaSeleccionada.aul_capacidad } : null,
    }
  }
  showEditarBloqueModal.value = false
}

function eliminarBloqueIA(item: any, combo: any) {
  const grupo = getResultadoGrupo(combo.nivel, combo.par_id)
  if (!grupo?.resultado?.horarios) return
  const idx = grupo.resultado.horarios.indexOf(item)
  if (idx > -1) grupo.resultado.horarios.splice(idx, 1)
}

onMounted(async () => {
  try {
    const [periodosRes, diasRes] = await Promise.all([periodosApi.getAll(), horariosApi.getDias()])
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
      const [carrerasRes, docentesRes, aulasRes] = await Promise.all([carrerasApi.getAll(), docentesApi.getAll(), aulasApi.getAll()])
      carreras.value = carrerasRes.data
      docentes.value = docentesRes.data
      aulas.value = aulasRes.data
    }
  } catch (error) { console.error('Error cargando datos:', error) }
})

async function onCarreraChange() {
  filters.nivel = 0; filters.paralelo = ''
  programacion.value = []; todaProgramacion.value = []; horarioCompleto.value = []
  nivelesDisponibles.value = []; paralelosDisponibles.value = []
  iaResultados.value = []; gruposConfig.value = {}; pendientesIA.value = {}

  if (!filters.per_id || !filters.car_id) return

  try {
    const progRes = await programacionApi.getByPeriodoCarrera(Number(filters.per_id), Number(filters.car_id))
    todaProgramacion.value = progRes.data
    const niveles = [...new Set(progRes.data.map(p => p.pra_nivel))].sort((a, b) => a - b)
    nivelesDisponibles.value = niveles
    for (const p of progRes.data) {
      if (p.par_id && p.par_nombre) initGrupoConfig(`${p.pra_nivel}-${p.par_id}`)
    }
  } catch (error) { console.error('Error cargando programacion:', error) }
}

function onNivelChange() {
  filters.paralelo = ''; programacion.value = []; horarioCompleto.value = []
  if (!filters.nivel) { paralelosDisponibles.value = []; return }
  paralelosDisponibles.value = [...new Set(todaProgramacion.value.filter(p => p.pra_nivel === filters.nivel).map(p => p.par_nombre ?? '').filter(p => p !== ''))].sort()
}

async function loadData() {
  if (!filters.per_id || !filters.car_id || !filters.nivel || !filters.paralelo) return
  loadingData.value = true
  try {
    programacion.value = todaProgramacion.value.filter(p => p.pra_nivel === filters.nivel && p.par_nombre === filters.paralelo)
    const horRes = await horariosApi.getHorarioCompleto(Number(filters.per_id), Number(filters.car_id))
    horarioCompleto.value = horRes.data.filter(h => h.pra_nivel === filters.nivel && h.par_nombre === filters.paralelo)
  } catch (error) { console.error(error) } finally { loadingData.value = false }
}

function handleCeldaClick(dia: Dia, hora: number) {
  selectedDia.value = dia; selectedHora.value = hora; asignarModalError.value = ''
  modalForm.pra_id = 0; modalForm.hora_inicio = formatHora(hora); modalForm.hora_fin = formatHora(hora + 1); modalForm.aul_id = 0
  showAsignarModal.value = true
}

async function handleAsignar() {
  if (!modalForm.pra_id || !selectedDia.value) { asignarModalError.value = 'Seleccione una materia'; return }
  saving.value = true; asignarModalError.value = ''
  try {
    const { blq_id_inicio, blq_id_fin } = await findOrCreateBloque(modalForm.hora_inicio, modalForm.hora_fin)
    await horariosApi.create({ pra_id: Number(modalForm.pra_id), dia_id: Number(selectedDia.value.dia_id), blq_id_inicio: Number(blq_id_inicio), blq_id_fin: Number(blq_id_fin), aul_id: modalForm.aul_id ? Number(modalForm.aul_id) : undefined })
    showAsignarModal.value = false; await loadData()
  } catch (err: any) { asignarModalError.value = err.response?.data?.message || 'Error al asignar horario' } finally { saving.value = false }
}

async function findOrCreateBloque(horaInicio: string, horaFin: string): Promise<{ blq_id_inicio: number; blq_id_fin: number }> {
  const bloquesRes = await horariosApi.getBloques()
  let bloqueInicio = bloquesRes.data.find(b => b.blq_hora_inicio.substring(0, 5) === horaInicio)
  if (!bloqueInicio) {
    const res = await api.post('/programacion-academica/bloques-horarios', { blq_hora_inicio: horaInicio, blq_hora_fin: horaFin, blq_descripcion: `${horaInicio} - ${horaFin}`, blq_orden: bloquesRes.data.length + 1 })
    bloqueInicio = res.data.bloque
  }
  let bloqueFin = bloquesRes.data.find(b => b.blq_hora_fin.substring(0, 5) === horaFin)
  if (!bloqueFin) {
    const bloquesActualizados = await horariosApi.getBloques()
    const res = await api.post('/programacion-academica/bloques-horarios', { blq_hora_inicio: horaInicio, blq_hora_fin: horaFin, blq_descripcion: `${horaInicio} - ${horaFin}`, blq_orden: bloquesActualizados.data.length + 1 })
    bloqueFin = res.data.bloque
  }
  return { blq_id_inicio: bloqueInicio!.blq_id, blq_id_fin: bloqueFin!.blq_id }
}

async function deleteHorarioGrilla(horId: number) {
  try { await horariosApi.delete(horId); await loadData() } catch (error) { console.error(error) }
}

async function loadHorarioDocente() {
  if (!selectedDocId.value || !filters.per_id) { horarioDocente.value = []; return }
  loadingDocente.value = true
  try { const response = await horariosApi.getHorarioDocente(Number(selectedDocId.value), Number(filters.per_id)); horarioDocente.value = response.data }
  catch (error) { console.error(error) } finally { loadingDocente.value = false }
}

async function generarParaCombo(combo: { nivel: number; par_id: number; par_nombre: string }) {
  const key = `${combo.nivel}-${combo.par_id}`
  const config = gruposConfig.value[key] || { hora_inicio: 7, hora_fin: 21, duracion_min: 2, duracion_max: 3, dias_permitidos: [1, 2, 3, 4, 5] }
  const escId = miEscuela.value ? Number(miEscuela.value.esc_id) : 0
  const horariosPrevios = iaResultados.value.flatMap(r => r.resultado?.horarios || [])

  const response = await horariosApi.generarIA({
    per_id: Number(filters.per_id), car_id: Number(filters.car_id), esc_id: escId,
    nivel: combo.nivel, par_id: combo.par_id,
    dias_permitidos: config.dias_permitidos.map(Number),
    hora_inicio: Number(config.hora_inicio), hora_fin: Number(config.hora_fin),
    duracion_min: Number(config.duracion_min), duracion_max: Number(config.duracion_max),
    laboratorios_disponibles: labsGlobales.value.map(Number),
    horarios_previos: horariosPrevios,
  })
  return { nivel: combo.nivel, par_id: combo.par_id, par_nombre: combo.par_nombre, resultado: response.data.resultado }
}

async function handleGenerarIA() {
  if (!filters.per_id || !filters.car_id || combinacionesIA.value.length === 0) return
  generandoIA.value = true; iaError.value = ''; iaResultados.value = []; iaConfirmado.value = ''
  pendientesIA.value = {}
  try {
    for (const combo of combinacionesIA.value) {
      try { const resultado = await generarParaCombo(combo); iaResultados.value.push(resultado) }
      catch { iaError.value = `Error generando Nivel ${combo.nivel} - Paralelo ${combo.par_nombre}` }
    }
    iaResultados.value.sort((a, b) => a.nivel - b.nivel || a.par_nombre.localeCompare(b.par_nombre))
  } catch (err: any) { iaError.value = err.response?.data?.message || 'Error al generar horarios' }
  finally { generandoIA.value = false }
}

async function handleGenerarGrupo(combo: { nivel: number; par_id: number; par_nombre: string }) {
  generandoIA.value = true; iaError.value = ''
  try {
    const resultado = await generarParaCombo(combo)
    const idx = iaResultados.value.findIndex(r => r.nivel === combo.nivel && r.par_id === combo.par_id)
    if (idx > -1) iaResultados.value[idx] = resultado
    else iaResultados.value.push(resultado)
    iaResultados.value.sort((a, b) => a.nivel - b.nivel || a.par_nombre.localeCompare(b.par_nombre))
    // Limpiar pendientes de este grupo
    const key = `${combo.nivel}-${combo.par_id}`
    pendientesIA.value[key] = []
  } catch (err: any) { iaError.value = err.response?.data?.message || 'Error al generar' }
  finally { generandoIA.value = false }
}

async function handleRegenerarGrupo(combo: { nivel: number; par_id: number; par_nombre: string }) {
  const idx = iaResultados.value.findIndex(r => r.nivel === combo.nivel && r.par_id === combo.par_id)
  if (idx > -1) iaResultados.value.splice(idx, 1)
  await handleGenerarGrupo(combo)
}

async function handleRegenerarIA() { iaResultados.value = []; pendientesIA.value = {}; await handleGenerarIA() }

async function handleConfirmarIA() {
  if (iaResultados.value.length === 0) return
  confirmandoIA.value = true; iaConfirmado.value = ''; iaError.value = ''
  try {
    const todosLosHorarios = iaResultados.value.flatMap(r => r.resultado?.horarios || [])
    const response = await horariosApi.confirmarIA({ per_id: Number(filters.per_id), car_id: Number(filters.car_id), horarios: todosLosHorarios })
    iaConfirmado.value = response.data.message
    await loadData()
  } catch (err: any) { iaError.value = err.response?.data?.message || 'Error al confirmar' }
  finally { confirmandoIA.value = false }
}

async function exportarExcel() {
  if (!filters.per_id || !filters.car_id) return
  try {
    const response = await api.get(
      `/programacion-academica/exportar-horarios/${filters.per_id}/${filters.car_id}`,
      { responseType: 'blob' }
    )
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `horarios_${filters.per_id}_${filters.car_id}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error exportando:', err)
  }
}

function handleLimpiarIA() { iaResultados.value = []; iaConfirmado.value = ''; iaError.value = ''; pendientesIA.value = {} }
</script>