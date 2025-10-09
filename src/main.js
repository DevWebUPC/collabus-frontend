import { createApp } from "vue";
import "./style.css";
import App from "./app.vue";
import i18n from "./i18n/i18n.js";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import Material from "@primeuix/themes/material";
import PrimeVue from "primevue/config";
import {
  Avatar,
  Badge,
  Button,
  Calendar,
  Card,
  Checkbox,
  Column,
  ConfirmationService,
  ConfirmDialog,
  DataTable,
  Dialog,
  DialogService,
  Drawer,
  Dropdown,
  FileUpload,
  FloatLabel,
  IconField,
  InputIcon,
  InputNumber,
  InputText,
  Menu,
  ProgressBar,
  ProgressSpinner,
  Rating,
  Row,
  Select,
  SelectButton,
  TabPanel,
  TabView,
  Tag,
  Textarea,
  Toast,
  ToastService,
  Toolbar,
  Tooltip,
  AutoComplete,
  Chip,
  Message,
} from "primevue";
import router from "./router/router.js";
import pinia from "./pinia.js";

// noinspection JSCheckFunctionSignatures
createApp(App)
  .use(i18n)
  .use(PrimeVue, { theme: { preset: Material }, ripple: true })
  .use(ConfirmationService)
  .use(DialogService)
  .use(ToastService)
  .component("pv-avatar", Avatar)
  .component("pv-badge", Badge)
  .component("pv-button", Button)
  .component("pv-calendar", Calendar)
  .component("pv-card", Card)
  .component("pv-column", Column)
  .component("pv-confirm-dialog", ConfirmDialog)
  .component("pv-checkbox", Checkbox)
  .component("pv-data-table", DataTable)
  .component("pv-dialog", Dialog)
  .component("pv-dropdown", Dropdown)
  .component("pv-select", Select)
  .component("pv-select-button", SelectButton)
  .component("pv-file-upload", FileUpload)
  .component("pv-float-label", FloatLabel)
  .component("pv-icon-field", IconField)
  .component("pv-input-icon", InputIcon)
  .component("pv-input-text", InputText)
  .component("pv-input-number", InputNumber)
  .component("pv-menu", Menu)
  .component("pv-progressbar", ProgressBar)
  .component("pv-progressspinner", ProgressSpinner)
  .component("pv-rating", Rating)
  .component("pv-row", Row)
  .component("pv-drawer", Drawer)
  .component("pv-tabpanel", TabPanel)
  .component("pv-tabview", TabView)
  .component("pv-tag", Tag)
  .component("pv-textarea", Textarea)
  .component("pv-toolbar", Toolbar)
  .component("pv-toast", Toast)
  .component("pv-inputtext", InputText)
  .component("pv-autocomplete", AutoComplete)
  .component("pv-message", Message)
  .component("pv-chip", Chip)
  .directive("tooltip", Tooltip)
  .use(router)
  .use(pinia)
  .mount("#app");
