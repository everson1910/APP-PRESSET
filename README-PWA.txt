# PWA Add-on (APP PRESSET)

Copie estes arquivos para a RAIZ do seu projeto (mesmo nível do index.html):

- manifest.json
- service-worker.js
- pasta /icons

Depois, edite seu index.html e adicione:

## Dentro do <head>:
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#043058">

## Antes de </body>:
<script>
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js");
    });
  }
</script>

Feito isso, faça commit/push no GitHub e abra o site.
