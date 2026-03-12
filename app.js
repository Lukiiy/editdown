const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const previewWrap = preview.parentElement;
const fileInput = document.getElementById("fileImport");
const wc = document.getElementById("wc");

marked.use({
    gfm: true
});

marked.use({
    renderer: {
        listitem(token) {
            if (/^\[x\] /i.test(token.text)) return `<li><input type="checkbox" checked disabled> ${marked.parseInline(token.text.replace(/^\[x\] /i,""))}</li>\n`;
            if (/^\[ \] /.test(token.text)) return `<li><input type="checkbox" disabled> ${marked.parseInline(token.text.replace(/^\[ \] /, ""))}</li>\n`;

            return false;
        }
    }
});

const DEFAULT = `# Hello, Markdown.

---

Start writing!
\`hello world\`
`;

editor.value = DEFAULT;
updateWordCount();

editor.addEventListener("input", updateWordCount);

function updateWordCount() {
    const words = editor.value.trim() ? editor.value.trim().split(/\s+/).length : 0;

    wc.textContent = `${words} word${words !== 1 ? "s" : ""}`;
}

function setMode(m) {
    document.getElementById("btnEdit").classList.toggle("active", m === "edit");
    document.getElementById("btnPreview").classList.toggle("active", m === "preview");

    if (m === "preview") {
        preview.innerHTML = marked.parse(editor.value);
        editor.style.display = "none";
        previewWrap.style.display = "block";
    } else {
        editor.style.display = "block";
        previewWrap.style.display = "none";
        editor.focus();
    }
}

function wrap(before, after) {
    const selStart = editor.selectionStart;
    const selEnd = editor.selectionEnd;
    const sel = editor.value.slice(selStart, selEnd) || "text";

    splice(selStart, selEnd, before + sel + after);

    editor.selectionStart = selStart + before.length;
    editor.selectionEnd = selStart + before.length + sel.length;
    editor.focus();
}

function line(prefix) {
    const selStart = editor.selectionStart;
    const lineStart = editor.value.lastIndexOf("\n", selStart - 1) + 1;
    const alreadyHas = editor.value.slice(lineStart).startsWith(prefix);

    if (alreadyHas) {
        splice(lineStart, lineStart + prefix.length, "");

        editor.selectionStart = editor.selectionEnd = Math.max(lineStart, selStart - prefix.length);
    } else {
        splice(lineStart, lineStart, prefix);

        editor.selectionStart = editor.selectionEnd = selStart + prefix.length;
    }

    editor.focus();
}

function splice(start, end, str) {
    editor.value = editor.value.slice(0, start) + str + editor.value.slice(end);

    updateWordCount();
}

function insertLink() {
    const selStart = editor.selectionStart;
    const selEnd = editor.selectionEnd;
    const sel = editor.value.slice(selStart, selEnd) || "link text";
    const url = prompt("Insert the URL!", "https://");
    if (!url) return;

    const md = `[${sel}](${url})`;

    splice(selStart, selEnd, md);

    editor.selectionStart = editor.selectionEnd = selStart + md.length;
    editor.focus();
}

function insertImg() {
    const url = prompt("Insert the Image URL!", "https://");
    if (!url) return;

    const alt = prompt("Alt text", "image") || "image";
    const selStart = editor.selectionStart;
    const md = `![${alt}](${url})`;

    splice(selStart, selStart, md);

    editor.selectionStart = editor.selectionEnd = selStart + md.length;
    editor.focus();
}

function insertTable() {
    const selStart = editor.selectionStart;
    const tbl = `\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell     | Cell     | Cell     |\n| Cell     | Cell     | Cell     |\n`;

    splice(selStart, selStart, tbl);

    editor.selectionStart = editor.selectionEnd = selStart + tbl.length;
    editor.focus();
}

function insertLineBreak() {
    const selEnd = editor.selectionEnd;

    splice(selEnd, selEnd, "  \n");

    editor.selectionStart = editor.selectionEnd = selEnd + 3;
    editor.focus();
}

function importFile() {
    fileInput.value = "";
    fileInput.click();
}

fileInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    file.text().then(text => {
        editor.value = text;

        updateWordCount();
        setMode("edit");
    });
});

function exportFile() {
    const a = document.createElement("a");

    a.href = URL.createObjectURL(new Blob([editor.value], { type: "text/markdown" }));
    a.download = "notes.md";
    a.click();

    URL.revokeObjectURL(a.href);
}

function theme() {
    document.body.classList.toggle("light");
}

editor.addEventListener("keydown", e => {
    if (e.key === "Tab") {
        e.preventDefault();

        const s = editor.selectionStart;

        splice(s, editor.selectionEnd, "    ");

        editor.selectionStart = editor.selectionEnd = s + 4;
    }
});