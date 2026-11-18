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
  plans: {
    cycles: {
      "30d": { label: "30 Días", periodText: "/ 30 días" },
      "90d": { label: "90 Días", periodText: "/ 90 días" },
      "365d": { label: "1 Año", periodText: "/ 1 año" },
    },
    items: {
      nague: {
        name: "Nague POS (Listeros)",
        ctaPrefix: "Contratar Nague",
        prices: {
          "30d": { amount: 15, badge: "" },
          "90d": { amount: 38, badge: "Ahorra $7" },
          "365d": { amount: 120, badge: "Ahorra $60" },
        },
      },
      sendergram: {
        name: "Sendergram Hub (Banqueros)",
        ctaPrefix: "Contratar Sendergram",
        prices: {
          "30d": { amount: 15, badge: "" },
          "90d": { amount: 38, badge: "Ahorra $7" },
          "365d": { amount: 120, badge: "Ahorra $60" },
        },
      },
      suite: {
        name: "Suite Completa (Nague + Sendergram)",
        ctaPrefix: "Activar Suite Completa",
        prices: {
          "30d": { amount: 18, badge: "Ahorra $12 vs separado" },
          "90d": { amount: 46, badge: "Ahorra $30 vs separado" },
          "365d": { amount: 144, badge: "Ahorra $96 vs separado" },
        },
      },
    },
  },
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

  // 2b. Selector interactivo de Planes y Precios (30 días, 90 días, 1 año)
  window.selectBillingCycle = function (cycle) {
    const cycleMeta = cfg.plans.cycles[cycle];
    if (!cycleMeta) return;

    document.querySelectorAll("[data-cycle-btn]").forEach((btn) => {
      const isSelected = btn.getAttribute("data-cycle-btn") === cycle;
      btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
      if (isSelected) {
        btn.className =
          "px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-primary-container text-on-primary shadow-sm transition-all flex items-center gap-1.5";
      } else {
        btn.className =
          "px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all flex items-center gap-1.5";
      }
    });

    Object.entries(cfg.plans.items).forEach(([planKey, planData]) => {
      const tier = planData.prices[cycle];
      if (!tier) return;

      const priceEl = document.querySelector(`[data-plan-price="${planKey}"]`);
      if (priceEl) priceEl.textContent = `$${tier.amount}`;

      const periodEl = document.querySelector(`[data-plan-period="${planKey}"]`);
      if (periodEl) periodEl.textContent = cycleMeta.periodText;

      const saveEl = document.querySelector(`[data-plan-save="${planKey}"]`);
      if (saveEl) {
        if (tier.badge) {
          saveEl.textContent = tier.badge;
          saveEl.classList.remove("hidden");
        } else {
          saveEl.classList.add("hidden");
        }
      }

      const ctaEl = document.querySelector(`[data-plan-cta="${planKey}"]`);
      if (ctaEl) {
        const labelEl = ctaEl.querySelector("[data-plan-cta-label]");
        if (labelEl) {
          labelEl.textContent = `${planData.ctaPrefix} • $${tier.amount} USD`;
        }
        const msg = `Hola, quiero contratar el plan ${planData.name} por ${cycleMeta.label} ($${tier.amount} USD).`;
        ctaEl.href = buildWaUrl(msg);
      }
    });
  };

  window.selectBillingCycle("30d");

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
      } else if (q.includes("gratis") || q.includes("30") || q.includes("licencia") || q.includes("precio") || q.includes("plan") || q.includes("costo")) {
        replyHtml = `<strong>Planes y Precios (30 Días Gratis de Prueba):</strong><br>• <strong>Nague POS o Sendergram (c/u):</strong> $15 (30d) • $38 (90d) • $120 (1 año)<br>• <strong>Suite Completa (Ambos):</strong> $18 (30d) • $46 (90d) • $144 (1 año)<br>Escríbenos por <a href="${buildWaUrl("Hola, quiero activar una licencia.")}" target="_blank" class="text-[#006142] underline font-semibold">WhatsApp</a> para activar.`;
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
