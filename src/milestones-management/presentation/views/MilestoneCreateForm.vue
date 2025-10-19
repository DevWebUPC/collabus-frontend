<script setup>
import { ref } from 'vue';
import {FileUpload as PvFileUpload} from "primevue";

const nombreHito = ref('');
const descripcionHito = ref('');
const herramientas = ref([]);
const comentarioGeneral = ref('');
const fechaVencimiento = ref('');
const archivosAdjuntos = ref([]);
const enlacesAdjuntos = ref([]); // Nuevo array para enlaces
const nuevoEnlace = ref(''); // Para el input de nuevo enlace

const tareas = ref([
  {
    nombre: '',
    descripcion: '',
    checklist: [''],
    archivos: [],
    enlaces: [], // Nuevo array para enlaces en tareas
    colaborador: null, // Nuevo campo para colaborador
    nuevoEnlace: '' // Para el input de nuevo enlace en tareas
  }
]);

// Simulamos una lista de colaboradores (deberías obtenerla de tu API o store)
const colaboradores = ref([
  { name: 'Juan Pérez', id: 1 },
  { name: 'María García', id: 2 },
  { name: 'Carlos López', id: 3 },
  { name: 'Ana Martínez', id: 4 },
]);

const nuevaHerramienta = ref('');

const agregarHerramienta = () => {
  if (nuevaHerramienta.value.trim()) {
    herramientas.value.push(nuevaHerramienta.value.trim());
    nuevaHerramienta.value = '';
  }
};

const eliminarHerramienta = (index) => {
  herramientas.value.splice(index, 1);
};

// Funciones para manejar enlaces del hito
const agregarEnlace = () => {
  if (nuevoEnlace.value.trim()) {
    enlacesAdjuntos.value.push({
      url: nuevoEnlace.value.trim(),
      nombre: `Enlace ${enlacesAdjuntos.value.length + 1}`
    });
    nuevoEnlace.value = '';
  }
};

const eliminarEnlace = (index) => {
  enlacesAdjuntos.value.splice(index, 1);
};

// Funciones para manejar enlaces de tareas
const agregarEnlaceTarea = (tareaIndex) => {
  const tarea = tareas.value[tareaIndex];
  if (tarea.nuevoEnlace.trim()) {
    tarea.enlaces.push({
      url: tarea.nuevoEnlace.trim(),
      nombre: `Enlace ${tarea.enlaces.length + 1}`
    });
    tarea.nuevoEnlace = '';
  }
};

const eliminarEnlaceTarea = (tareaIndex, enlaceIndex) => {
  tareas.value[tareaIndex].enlaces.splice(enlaceIndex, 1);
};

const agregarTarea = () => {
  tareas.value.push({
    nombre: '',
    descripcion: '',
    checklist: [''],
    archivos: [],
    enlaces: [],
    colaborador: null,
    nuevoEnlace: ''
  });
};

const eliminarTarea = (index) => {
  if (tareas.value.length > 1) {
    tareas.value.splice(index, 1);
  }
};

const agregarChecklistItem = (tareaIndex) => {
  tareas.value[tareaIndex].checklist.push('');
};

const eliminarChecklistItem = (tareaIndex, itemIndex) => {
  if (tareas.value[tareaIndex].checklist.length > 1) {
    tareas.value[tareaIndex].checklist.splice(itemIndex, 1);
  }
};

const onArchivosSeleccionados = (event, tipo, index = null) => {
  const archivos = Array.from(event.files);

  if (tipo === 'hito') {
    archivosAdjuntos.value = [...archivosAdjuntos.value, ...archivos];
  } else if (tipo === 'tarea' && index !== null) {
    tareas.value[index].archivos = [...tareas.value[index].archivos, ...archivos];
  }
};

const eliminarArchivo = (index, tipo, tareaIndex = null) => {
  if (tipo === 'hito') {
    archivosAdjuntos.value.splice(index, 1);
  } else if (tipo === 'tarea' && tareaIndex !== null) {
    tareas.value[tareaIndex].archivos.splice(index, 1);
  }
};

const emit = defineEmits(['cancel', 'submit']);

const guardarHito = () => {
  const hitoData = {
    nombre: nombreHito.value,
    descripcion: descripcionHito.value,
    herramientas: herramientas.value,
    comentarioGeneral: comentarioGeneral.value,
    fechaVencimiento: fechaVencimiento.value,
    archivosAdjuntos: archivosAdjuntos.value,
    enlacesAdjuntos: enlacesAdjuntos.value, // Incluir enlaces
    tareas: tareas.value
  };

  console.log('Datos del hito:', hitoData);
  emit('submit', hitoData);
};

const cancelar = () => {
  emit('cancel');
};
</script>

<template>
  <div class="milestone-create-form">
    <div class="form-section">
      <h3>Nombre del Hito</h3>
      <pv-inputtext
          v-model="nombreHito"
          placeholder="Escribe nombre del hito"
          class="w-full"
      />
    </div>

    <div class="form-section">
      <h3>Descripción del Hito</h3>
      <pv-textarea
          v-model="descripcionHito"
          placeholder="Descripción del nuevo hito"
          rows="3"
          class="w-full"
      />
    </div>

    <div class="form-section">
      <h3>Herramientas Asignadas</h3>
      <div class="herramientas-input">
        <pv-inputtext
            v-model="nuevaHerramienta"
            placeholder="Escribe las herramientas"
            class="w-full"
            @keypress.enter="agregarHerramienta"
        />
        <pv-button
            icon="pi pi-plus"
            @click="agregarHerramienta"
            class="ml-2"
        />
      </div>
      <div class="chips-container">
        <pv-chip
            v-for="(herramienta, index) in herramientas"
            :key="index"
            :label="herramienta"
            removable
            @remove="eliminarHerramienta(index)"
            class="mr-2 mb-2"
        />
      </div>
    </div>

    <div class="divider"></div>

    <div class="form-section">
      <h3>Comentario General del Hito</h3>
      <pv-textarea
          v-model="comentarioGeneral"
          placeholder="Dejar comentario general del hito"
          rows="3"
          class="w-full"
      />
    </div>

    <div class="form-section">
      <h3>Fecha de Vencimiento</h3>
      <pv-calendar
          v-model="fechaVencimiento"
          showIcon
          dateFormat="dd/mm/yy"
          class="w-full"
      />
    </div>

    <div class="form-section">
      <h3>Añadir Archivos y Enlaces</h3>

      <!-- Sección de archivos -->
      <div class="mb-4">
        <h5>Archivos</h5>
        <pv-file-upload
            mode="basic"
            chooseLabel="Seleccionar archivos"
            :multiple="true"
            :auto="true"
            @select="onArchivosSeleccionados($event, 'hito')"
            class="w-full"
        />
        <div v-if="archivosAdjuntos.length" class="archivos-list">
          <div
              v-for="(archivo, index) in archivosAdjuntos"
              :key="index"
              class="archivo-item"
          >
            <span class="pi pi-file mr-2"></span>
            {{ archivo.name }}
            <pv-button
                icon="pi pi-times"
                text
                rounded
                severity="danger"
                @click="eliminarArchivo(index, 'hito')"
                class="ml-2"
            />
          </div>
        </div>
      </div>

      <!-- Sección de enlaces -->
      <div>
        <h5>Enlaces</h5>
        <div class="enlaces-input">
          <pv-inputtext
              v-model="nuevoEnlace"
              placeholder="Pegar enlace aquí"
              class="w-full"
              @keypress.enter="agregarEnlace"
          />
          <pv-button
              icon="pi pi-plus"
              @click="agregarEnlace"
              class="ml-2"
          />
        </div>
        <div v-if="enlacesAdjuntos.length" class="enlaces-list">
          <div
              v-for="(enlace, index) in enlacesAdjuntos"
              :key="index"
              class="enlace-item"
          >
            <span class="pi pi-link mr-2"></span>
            <a :href="enlace.url" target="_blank" class="text-primary hover:underline">
              {{ enlace.nombre }}
            </a>
            <pv-button
                icon="pi pi-times"
                text
                rounded
                severity="danger"
                @click="eliminarEnlace(index)"
                class="ml-2"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="tareas-section">
      <h3>Asignar Tareas</h3>

      <div
          v-for="(tarea, tareaIndex) in tareas"
          :key="tareaIndex"
          class="tarea-item"
      >
        <div class="tarea-header">
          <h4>Tarea {{ tareaIndex + 1 }}</h4>
          <pv-button
              v-if="tareas.length > 1"
              icon="pi pi-trash"
              text
              rounded
              severity="danger"
              @click="eliminarTarea(tareaIndex)"
          />
        </div>

        <div class="form-section">
          <h5>Nombre de la Tarea</h5>
          <pv-inputtext
              v-model="tarea.nombre"
              placeholder="Nombre de la tarea"
              class="w-full"
          />
        </div>

        <div class="form-section">
          <h5>Descripción</h5>
          <pv-textarea
              v-model="tarea.descripcion"
              placeholder="Descripción de la tarea"
              rows="2"
              class="w-full"
          />
        </div>

        <!-- Nuevo campo: Seleccionar colaborador -->
        <div class="form-section">
          <h5>Colaborador Asignado</h5>
          <pv-dropdown
              v-model="tarea.colaborador"
              :options="colaboradores"
              optionLabel="name"
              placeholder="Seleccionar colaborador"
              class="w-full"
          />
        </div>

        <div class="form-section">
          <h5>Checklist</h5>
          <div
              v-for="(item, itemIndex) in tarea.checklist"
              :key="itemIndex"
              class="checklist-item"
          >
            <pv-checkbox :binary="true" />
            <pv-inputtext
                v-model="tarea.checklist[itemIndex]"
                placeholder="Item del checklist"
                class="ml-2 w-full"
            />
            <pv-button
                v-if="tarea.checklist.length > 1"
                icon="pi pi-times"
                text
                rounded
                severity="danger"
                @click="eliminarChecklistItem(tareaIndex, itemIndex)"
                class="ml-2"
            />
          </div>
          <pv-button
              icon="pi pi-plus"
              label="Añadir Item"
              text
              @click="agregarChecklistItem(tareaIndex)"
              class="mt-2"
          />
        </div>

        <div class="form-section">
          <h5>Añadir Archivos y Enlaces</h5>

          <!-- Archivos de tarea -->
          <div class="mb-4">
            <h6>Archivos</h6>
            <pv-file-upload
                mode="basic"
                chooseLabel="Seleccionar archivos"
                :multiple="true"
                :auto="true"
                @select="onArchivosSeleccionados($event, 'tarea', tareaIndex)"
                class="w-full"
            />
            <div v-if="tarea.archivos.length" class="archivos-list">
              <div
                  v-for="(archivo, archivoIndex) in tarea.archivos"
                  :key="archivoIndex"
                  class="archivo-item"
              >
                <span class="pi pi-file mr-2"></span>
                {{ archivo.name }}
                <pv-button
                    icon="pi pi-times"
                    text
                    rounded
                    severity="danger"
                    @click="eliminarArchivo(archivoIndex, 'tarea', tareaIndex)"
                    class="ml-2"
                />
              </div>
            </div>
          </div>

          <!-- Enlaces de tarea -->
          <div>
            <h6>Enlaces</h6>
            <div class="enlaces-input">
              <pv-inputtext
                  v-model="tarea.nuevoEnlace"
                  placeholder="Pegar enlace aquí"
                  class="w-full"
                  @keypress.enter="agregarEnlaceTarea(tareaIndex)"
              />
              <pv-button
                  icon="pi pi-plus"
                  @click="agregarEnlaceTarea(tareaIndex)"
                  class="ml-2"
              />
            </div>
            <div v-if="tarea.enlaces.length" class="enlaces-list">
              <div
                  v-for="(enlace, enlaceIndex) in tarea.enlaces"
                  :key="enlaceIndex"
                  class="enlace-item"
              >
                <span class="pi pi-link mr-2"></span>
                <a :href="enlace.url" target="_blank" class="text-primary hover:underline">
                  {{ enlace.nombre }}
                </a>
                <pv-button
                    icon="pi pi-times"
                    text
                    rounded
                    severity="danger"
                    @click="eliminarEnlaceTarea(tareaIndex, enlaceIndex)"
                    class="ml-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <pv-button
          icon="pi pi-plus"
          label="Añadir otra tarea"
          text
          @click="agregarTarea"
          class="mt-3"
      />
    </div>

    <div class="form-actions">
      <pv-button
          label="Cancelar"
          severity="secondary"
          @click="cancelar"
          class="mr-2"
      />
      <pv-button
          label="Crear Nuevo Hito"
          @click="guardarHito"
      />
    </div>
  </div>
</template>

<style scoped>
.milestone-create-form {
  padding: 1rem 0;
}

.form-section {
  margin-bottom: 1.5rem;
}

.tarea-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  background: #f9fafb;
}

.tarea-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.tarea-header h4 {
  margin: 0;
  color: #374151;
}

h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

h6 {
  margin: 0 0 0.5rem 0;
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
}

.herramientas-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.enlaces-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 1.5rem 0;
}

.checklist-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.archivos-list {
  margin-top: 0.5rem;
}

.enlaces-list {
  margin-top: 0.5rem;
}

.archivo-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  margin-bottom: 0.25rem;
}

.enlace-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  margin-bottom: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

:deep(.p-inputtext) {
  width: 100%;
}

:deep(.p-calendar) {
  width: 100%;
}

:deep(.p-fileupload) {
  width: 100%;
}

:deep(.p-button) {
  min-width: auto;
}

:deep(.p-dropdown) {
  width: 100%;
}
</style>