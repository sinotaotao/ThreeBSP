requirejs.config({
  baseUrl:".",
  paths: {
    "THREE": "three.min.js"
  },
  shim: {
    "THREE": {
      exports:"THREE"
    }
  }
});