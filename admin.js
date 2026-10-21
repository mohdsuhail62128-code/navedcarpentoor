/* ==========================================================
   Naved Wood Craft - admin.js
   Admin box isi page par khulta hai (alag page nahi).
   Kholne ke 2 tareeke:
     1) URL ke end me #admin lagao   ->  index.html#admin
     2) Keyboard: Ctrl + Shift + A
   Projects browser ke localStorage me save hote hain.
   Zaroori functions script.js se aate hain: el, toast, renderGallery,
   loadStoredProjects, STORE_KEY, siteConfig.
   ========================================================== */

(function () {
  // Safety check: agar script.js purani hai to saaf message dikhao
  if (typeof loadStoredProjects !== "function" || typeof renderGallery !== "function" || typeof siteConfig === "undefined") {
    console.error("[admin] script.js purani hai. Naya script.js use karo (STORE_KEY, loadStoredProjects, activeProjects wala).");
    alert("Admin panel nahi chal sakta: script.js purani hai. Naya script.js paste karo.");
    return;
  }

  const SESSION_KEY = "nwc_admin_ok";
  const MAX_WIDTH = 1400;   // photo ki max chaudai (px)
  const QUALITY = 0.8;      // jpeg quality

  let staged = []; // abhi chuni hui, jo add hone wali hain

  /* ---------- small helpers ---------- */
  const q = (sel, root = document) => root.querySelector(sel);
  const pin = () => String(siteConfig.adminPin || "1234");
  const isLoggedIn = () => sessionStorage.getItem(SESSION_KEY) === "1";

  function readList() {
    return loadStoredProjects() || [];
  }

  function saveList(list) {
    try {
      if (list.length) localStorage.setItem(STORE_KEY, JSON.stringify(list));
      else localStorage.removeItem(STORE_KEY);
      renderGallery();
      return true;
    } catch (err) {
      toast("Storage full. Kuch photos delete karo ya chhoti photos use karo.");
      return false;
    }
  }

  function slugify(text) {
    return String(text).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function prettyName(filename) {
    const base = filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
    return base ? base.charAt(0).toUpperCase() + base.slice(1) : "New project";
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_WIDTH / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", QUALITY));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read " + file.name));
      };
      img.src = url;
    });
  }

  function downloadBlob(blob, filename) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- build the panel ---------- */
  const panel = document.createElement("aside");
  panel.className = "adm";
  panel.id = "admPanel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Admin panel");
  panel.hidden = true;
  panel.innerHTML = `
    <div class="adm-head">
      <strong>Admin panel</strong>
      <div class="adm-head-btns">
        <button type="button" class="adm-btn adm-small" id="admLogout" hidden>Logout</button>
        <button type="button" class="adm-btn adm-small" id="admClose">Close</button>
      </div>
    </div>

    <div class="adm-body">
      <section id="admLogin">
        <h3>Admin login</h3>
        <label for="admPin">PIN</label>
        <input id="admPin" type="password" inputmode="numeric" autocomplete="off" />
        <button type="button" class="adm-btn adm-primary adm-block" id="admEnter">Open</button>
        <p class="adm-error" id="admLoginErr" hidden>Wrong PIN.</p>
      </section>

      <section id="admMain" hidden>
        <h3>Add projects</h3>
        <label class="adm-btn adm-drop" for="admFiles">Choose photos (ek ya zyada)</label>
        <input id="admFiles" type="file" accept="image/*" multiple hidden />
        <div id="admStaged" class="adm-staged"></div>

        <label for="admType">Category</label>
        <input id="admType" list="admTypes" value="Furniture" />
        <datalist id="admTypes">
          <option value="Bedroom"></option>
          <option value="Furniture"></option>
          <option value="Doors"></option>
          <option value="Kitchen"></option>
          <option value="Living"></option>
          <option value="Repair"></option>
        </datalist>

        <button type="button" class="adm-btn adm-primary adm-block" id="admAdd" disabled>Add to website</button>

        <h3 class="adm-list-title">Your projects (<span id="admCount">0</span>)</h3>
        <ul class="adm-list" id="admList"></ul>
        <p class="adm-usage" id="admUsage"></p>

        <div class="adm-actions">
          <button type="button" class="adm-btn" id="admExport">Download for website</button>
          <button type="button" class="adm-btn" id="admBackup">Backup</button>
          <label class="adm-btn" for="admRestore">Restore</label>
          <input id="admRestore" type="file" accept="application/json" hidden />
          <button type="button" class="adm-btn adm-danger" id="admClear">Clear all</button>
        </div>

        <p class="adm-note">
          Yahan add kiye projects sirf is browser me dikhte hain. Dusre logon ko dikhane ke liye
          "Download for website" dabao, photos <b>images/</b> folder me rakho aur snippet
          <b>script.js</b> ke <b>projects</b> me paste karo.
        </p>
      </section>
    </div>
  `;
  document.body.append(panel);

  /* ---------- open / close ---------- */
  function showView() {
    const ok = isLoggedIn();
    q("#admLogin").hidden = ok;
    q("#admMain").hidden = !ok;
    q("#admLogout").hidden = !ok;
    if (ok) renderList();
  }

  function openPanel() {
    panel.hidden = false;
    document.body.classList.add("adm-open");
    showView();
    setTimeout(() => (isLoggedIn() ? q("#admFiles") : q("#admPin")).focus({ preventScroll: true }), 50);
  }

  function closePanel() {
    panel.hidden = true;
    document.body.classList.remove("adm-open");
    if (location.hash === "#admin") {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  q("#admClose").addEventListener("click", closePanel);

  q("#admLogout").addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    showView();
    toast("Logged out.");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) closePanel();
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
      e.preventDefault();
      panel.hidden ? openPanel() : closePanel();
    }
  });

  window.addEventListener("hashchange", () => {
    if (location.hash === "#admin") openPanel();
  });
  if (location.hash === "#admin") openPanel();

  /* ---------- login ---------- */
  function tryLogin() {
    const input = q("#admPin");
    if (input.value === pin()) {
      sessionStorage.setItem(SESSION_KEY, "1");
      input.value = "";
      q("#admLoginErr").hidden = true;
      showView();
    } else {
      q("#admLoginErr").hidden = false;
      input.select();
    }
  }
  q("#admEnter").addEventListener("click", tryLogin);
  q("#admPin").addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryLogin();
  });

  /* ---------- staging new photos ---------- */
  function renderStaged() {
    const box = q("#admStaged");
    box.replaceChildren();

    staged.forEach((item, i) => {
      const row = el("div", "adm-staged-row");
      const img = el("img");
      img.src = item.dataUrl;
      img.alt = "";

      const input = el("input");
      input.type = "text";
      input.value = item.title;
      input.setAttribute("aria-label", "Project title");
      input.addEventListener("input", () => (item.title = input.value));

      const del = el("button", "adm-btn adm-small", "Remove");
      del.type = "button";
      del.addEventListener("click", () => {
        staged.splice(i, 1);
        renderStaged();
      });

      row.append(img, input, del);
      box.append(row);
    });

    const addBtn = q("#admAdd");
    addBtn.disabled = staged.length === 0;
    addBtn.textContent = staged.length
      ? `Add ${staged.length} photo${staged.length > 1 ? "s" : ""} to website`
      : "Add to website";
  }

  q("#admFiles").addEventListener("change", async (e) => {
    const files = [...e.target.files];
    e.target.value = "";
    if (!files.length) return;

    toast("Photos taiyaar ho rahi hain...");
    for (const file of files) {
      try {
        const dataUrl = await fileToDataUrl(file);
        staged.push({ title: prettyName(file.name), dataUrl });
      } catch (err) {
        toast(err.message);
      }
    }
    renderStaged();
  });

  q("#admAdd").addEventListener("click", () => {
    if (!staged.length) return;
    const type = q("#admType").value.trim() || "Furniture";
    const list = readList();
    const stamp = Date.now();

    staged.forEach((item, i) => {
      const title = item.title.trim() || "New project";
      list.push({ id: `${stamp}-${i}`, title, type, image: item.dataUrl, alt: title });
    });

    if (saveList(list)) {
      toast(`${staged.length} project add ho gaye.`);
      staged = [];
      renderStaged();
      renderList();
    } else {
      // save fail hua: gallery ko pichli state par wapas lao
      renderGallery();
    }
  });

  /* ---------- list of saved projects ---------- */
  function renderList() {
    const list = readList();
    const ul = q("#admList");
    ul.replaceChildren();
    q("#admCount").textContent = String(list.length);

    if (!list.length) {
      ul.append(el("li", "adm-empty", "Abhi koi project add nahi hua. Website par default placeholders dikh rahe hain."));
    }

    list.forEach((p, i) => {
      const li = el("li", "adm-item");
      const img = el("img");
      img.src = p.image;
      img.alt = "";

      const info = el("div", "adm-item-info");
      info.append(el("strong", "", p.title), el("span", "", p.type));

      const up = el("button", "adm-btn adm-small", "Up");
      const down = el("button", "adm-btn adm-small", "Down");
      const rename = el("button", "adm-btn adm-small", "Rename");
      const del = el("button", "adm-btn adm-small adm-danger", "Delete");
      [up, down, rename, del].forEach((b) => (b.type = "button"));
      up.disabled = i === 0;
      down.disabled = i === list.length - 1;

      up.addEventListener("click", () => move(i, -1));
      down.addEventListener("click", () => move(i, 1));
      rename.addEventListener("click", () => {
        const name = window.prompt("New title:", p.title);
        if (name === null || !name.trim()) return;
        const next = readList();
        next[i].title = name.trim();
        next[i].alt = name.trim();
        if (saveList(next)) renderList();
      });
      del.addEventListener("click", () => {
        if (!window.confirm(`Delete "${p.title}"?`)) return;
        const next = readList();
        next.splice(i, 1);
        if (saveList(next)) renderList();
      });

      const btns = el("div", "adm-item-btns");
      btns.append(up, down, rename, del);
      li.append(img, info, btns);
      ul.append(li);
    });

    const bytes = (localStorage.getItem(STORE_KEY) || "").length;
    q("#admUsage").textContent = `Storage used: ${(bytes / 1048576).toFixed(2)} MB (limit lagbhag 5 MB)`;
  }

  function move(i, dir) {
    const list = readList();
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    if (saveList(list)) renderList();
  }

  /* ---------- export / backup / restore / clear ---------- */
  async function exportForSite() {
    const list = readList();
    if (!list.length) {
      toast("Pehle kuch projects add karo.");
      return;
    }

    const used = new Set();
    const items = list.map((p, i) => {
      const base = slugify(p.title) || `project-${i + 1}`;
      let name = base;
      let n = 2;
      while (used.has(name)) name = `${base}-${n++}`;
      used.add(name);
      return { ...p, file: `${name}.jpg` };
    });

    const lines = items.map(
      (p) =>
        `    { title: ${JSON.stringify(p.title)}, type: ${JSON.stringify(p.type)}, ` +
        `image: "images/${p.file}", alt: ${JSON.stringify(p.alt || p.title)} }`
    );
    const snippet = `  projects: [\n${lines.join(",\n")}\n  ],\n`;

    downloadBlob(new Blob([snippet], { type: "text/plain" }), "projects-snippet.txt");

    toast("Photos download ho rahi hain. Browser permission maange to Allow karo.");
    for (const p of items) {
      const blob = await (await fetch(p.image)).blob();
      downloadBlob(blob, p.file);
      await wait(400);
    }
    toast("Photos ko images/ folder me rakho aur snippet script.js me paste karo.");
  }

  function backupJson() {
    const list = readList();
    if (!list.length) {
      toast("Backup ke liye kuch projects chahiye.");
      return;
    }
    downloadBlob(new Blob([JSON.stringify(list)], { type: "application/json" }), "projects-backup.json");
  }

  q("#admRestore").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const valid =
        Array.isArray(data) &&
        data.every((p) => p && typeof p.title === "string" && typeof p.image === "string" && p.image.startsWith("data:image/"));
      if (!valid) throw new Error("bad file");
      const clean = data.map((p, i) => ({
        id: String(p.id || `${Date.now()}-${i}`),
        title: p.title,
        type: String(p.type || "Furniture"),
        image: p.image,
        alt: String(p.alt || p.title)
      }));
      if (saveList(clean)) {
        renderList();
        toast("Backup restore ho gaya.");
      }
    } catch (err) {
      toast("Yeh backup file sahi nahi hai.");
    }
  });

  /* ---------- footer me chhota "Admin" link ---------- */
  const footerInner = document.querySelector(".footer-inner");
  if (footerInner) {
    const link = document.createElement("a");
    link.href = "#admin";
    link.className = "adm-link";
    link.textContent = "Admin";
    link.addEventListener("click", (e) => {
      e.preventDefault();
      openPanel();
    });
    footerInner.append(link);
  }

  console.log("[admin] ready. Kholne ke liye: footer ka Admin link, #admin, ya Ctrl+Shift+A");

  q("#admExport").addEventListener("click", exportForSite);
  q("#admBackup").addEventListener("click", backupJson);
  q("#admClear").addEventListener("click", () => {
    if (!readList().length) return;
    if (!window.confirm("Saare admin projects delete karne hain?")) return;
    if (saveList([])) renderList();
  });
})();