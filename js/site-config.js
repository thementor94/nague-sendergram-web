// Configuración central del portal web Nague & Sendergram Suite
window.SUITE_CONFIG = {
  supabaseUrl: "https://etrsdvhbqenkbxstgwvr.supabase.co",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0cnNkdmhicWVua2J4c3Rnd3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTQ5MTQsImV4cCI6MjA3NzA5MDkxNH0.1ZtMFGsBeMRpQXOij7J3F1alqUn0tXir7ubN9u0nxRg",
  defaultAdminWhatsapp: "5350774223",
  telegramChannelUrl: "https://t.me/LuksGH",
  nagueApkUrl:
    "https://github.com/thementor94/nague-sendergram-web/releases/latest/download/Nague.apk",
  sendergramApkUrl:
    "https://github.com/thementor94/nague-sendergram-web/releases/latest/download/Sendergram.apk",
  // Se actualizará en el Subplan 2 cuando despleguemos el backend omnicanal
  chatApiUrl: "",
};

(async function initSuiteWeb() {
  const cfg = window.SUITE_CONFIG;
  let adminPhone = cfg.defaultAdminWhatsapp;

  // 1. Cargar teléfono de WhatsApp dinámico desde Supabase system_config
  try {
    const res = await fetch(
      `${cfg.supabaseUrl}/rest/v1/system_config?select=config_key,config_value&config_key=eq.admin_whatsapp_phone`,
      {
        headers: {
          apikey: cfg.supabaseAnonKey,
          Authorization: `Bearer ${cfg.supabaseAnonKey}`,
        },
      }
    );
    if (res.ok) {
      const rows = await res.json();
      if (rows && rows.length > 0 && rows[0].config_value) {
        adminPhone = rows[0].config_value.replace(/\D/g, "");
      }
    }
  } catch (e) {
    // Usar fallback local si no hay red
  }

  const buildWaUrl = (msg) =>
    `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;

  // 2. Enlazar botones dinámicos
  document.querySelectorAll('a[href="https://whatsapp.com"]').forEach((el) => {
    const label = (el.textContent || "").trim();
    const customMsg = label.includes("Banca")
      ? "Hola, deseo solicitar una licencia completa de Sendergram Hub para mi banca."
      : "Hola, deseo información y prueba de 30 días de Nague & Sendergram Suite.";
    el.href = buildWaUrl(customMsg);
  });

  document.querySelectorAll('a[href="https://t.me"]').forEach((el) => {
    el.href = cfg.telegramChannelUrl;
  });

  document.querySelectorAll("[data-download='nague']").forEach((el) => {
    el.href = cfg.nagueApkUrl;
  });

  document.querySelectorAll("[data-download='sendergram']").forEach((el) => {
    el.href = cfg.sendergramApkUrl;
  });

  // 3. Conectar chatbot web (API omnicanal si está configurada, o fallback local)
  window.handleChatSubmit = async function (e) {
    e.preventDefault();
    const input = document.getElementById("ai-query");
    const container = document.getElementById("chat-messages");
    const text = input.value.trim();
    if (!text) return;

    const userBubble = document.createElement("div");
    userBubble.className =
      "bg-primary-container text-on-primary p-3 rounded-xl ml-6 shadow-sm";
    userBubble.textContent = text;
    container.appendChild(userBubble);
    input.value = "";
    container.scrollTop = container.scrollHeight;

    const loadingBubble = document.createElement("div");
    loadingBubble.className =
      "bg-surface p-3 rounded-xl border border-outline-variant/30 text-on-surface-variant shadow-sm mr-4 italic";
    loadingBubble.textContent = "Escribiendo respuesta...";
    container.appendChild(loadingBubble);
    container.scrollTop = container.scrollHeight;

    let replyHtml = "";
    if (cfg.chatApiUrl) {
      try {
        const sid =
          localStorage.getItem("suite_chat_sid") ||
          (() => {
            const id = "web_" + Math.random().toString(36).slice(2, 10);
            localStorage.setItem("suite_chat_sid", id);
            return id;
          })();
        const resp = await fetch(cfg.chatApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sid, message: text }),
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.reply) {
            replyHtml = data.reply
              .replace(/</g, "&lt;")
              .replace(/\n/g, "<br>");
          }
        }
      } catch (_) {}
    }

    if (!replyHtml) {
      const q = text.toLowerCase();
      if (q.includes("comision") || q.includes("comisión") || q.includes("porcentaje")) {
        replyHtml =
          "<strong>Configurar Comisiones de Listeros:</strong><br>En <em>Sendergram Hub &gt; Ajustes de Listeros</em>, puedes fijar el porcentaje pactado (ej. 20% o 25%). Al procesar la lista, el sistema resta la comisión y calcula el balance neto automáticamente.";
      } else if (q.includes("parlet") || q.includes("florida") || q.includes("tiro")) {
        replyHtml =
          "<strong>Liquidación con Lotería de Florida:</strong><br>Sendergram Hub soporta tiros de Florida Día y Noche. Al ingresar el número ganador, cruza fijos, corridos, centenas, parlets y candados en 1 segundo.";
      } else if (q.includes("whatsapp") || q.includes("lista") || q.includes("pasar")) {
        replyHtml =
          '<strong>Envío de Listas por WhatsApp:</strong><br>El listero presiona "Cerrar Lista" en Nague POS. La app genera un texto compacto con sello CRC-16 que se envía por WhatsApp y Sendergram lo importa al instante.';
      } else if (q.includes("descargar") || q.includes("apk") || q.includes("instalar")) {
        replyHtml = `<strong>Descarga Directa APK:</strong><br>• <a href="${cfg.nagueApkUrl}" class="text-primary underline font-semibold">Descargar Nague.apk (Listeros)</a><br>• <a href="${cfg.sendergramApkUrl}" class="text-secondary underline font-semibold">Descargar Sendergram.apk (Banqueros)</a>`;
      } else if (q.includes("gratis") || q.includes("30") || q.includes("licencia") || q.includes("precio")) {
        replyHtml = `<strong>Prueba de 30 Días Gratis:</strong><br>Instala cualquiera de los APKs y disfruta 30 días completos gratis sin tarjetas. Para activar una licencia definitiva, escríbenos directo por <a href="${buildWaUrl("Hola, quiero activar una licencia.")}" target="_blank" class="text-[#006142] underline font-semibold">WhatsApp</a>.`;
      } else {
        replyHtml = `¡Entendido! Para atención personalizada sobre tu banca o red de listeros, escríbenos por <a href="${buildWaUrl("Hola, tengo una consulta sobre Nague y Sendergram.")}" target="_blank" class="text-[#006142] underline font-semibold">WhatsApp</a> o únete a nuestro <a href="${cfg.telegramChannelUrl}" target="_blank" class="text-[#0088cc] underline font-semibold">Canal de Telegram</a>.`;
      }
    }

    loadingBubble.className =
      "bg-surface p-3 rounded-xl border border-outline-variant/30 text-on-surface shadow-sm mr-4 space-y-1";
    loadingBubble.innerHTML = replyHtml;
    container.scrollTop = container.scrollHeight;
  };
})();
