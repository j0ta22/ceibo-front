/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // podés agregar más si tenés otras variables, por ejemplo:
    // readonly VITE_OTRA_VAR: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  