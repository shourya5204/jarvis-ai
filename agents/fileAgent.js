const fs = require("fs");
const path = require("path");
const os = require("os");
const { setLastFile, getLastFile } = require("../utils/memory");

// 🔥 SAFE SANDBOX DIRECTORIES
const SAFE_DIRS = [
  path.join(os.homedir(), "Desktop"),
  path.join(os.homedir(), "Documents"),
  path.join(os.homedir(), "Downloads")
];

// ---------------- BASE PATH ----------------

function getBasePath(location) {
  const home = os.homedir();

  switch ((location || "").toLowerCase()) {
    case "desktop":
      return path.join(home, "Desktop");

    case "documents":
      return path.join(home, "Documents");

    case "downloads":
      return path.join(home, "Downloads");

    default:
      return path.join(home, "Desktop");
  }
}

// ---------------- SAFETY CHECK ----------------

function isSafePath(p) {
  return SAFE_DIRS.some(dir => p.startsWith(dir));
}

// ---------------- FIND FILE ----------------

function findFile(name) {
  function searchDir(dir) {
    try {
      const files = fs.readdirSync(dir);

      for (let file of files) {
        const fullPath = path.join(dir, file);

        if (file.toLowerCase().includes(name.toLowerCase())) {
          return fullPath;
        }

        if (fs.statSync(fullPath).isDirectory()) {
          const result = searchDir(fullPath);
          if (result) return result;
        }
      }
    } catch (err) {}

    return null;
  }

  for (let dir of SAFE_DIRS) {
    const result = searchDir(dir);
    if (result) return result;
  }

  return null;
}

// ---------------- MAIN ----------------

async function handleFile(intent) {
  let currentFile = null;
  let targetFolder = null;

  console.log("JARVIS: Starting file operations...");

  const actions = intent.actions || [];

  const orderedActions = [
    ...actions.filter(a => a.action === "find_file"),
    ...actions.filter(a => a.action === "create_folder"),
    ...actions.filter(a => a.action === "create_file"), // ✅ NEW
    ...actions.filter(a => a.action === "move_file"),
    ...actions.filter(a => a.action === "rename_file")
  ];

  for (let step of orderedActions) {

    console.log("STEP:", step);

    // 🔍 FIND FILE
    if (step.action === "find_file") {
      currentFile = step.name ? findFile(step.name) : getLastFile();

      if (!currentFile) return "File not found.";

      console.log("✅ Found file:", currentFile);
      setLastFile(currentFile);
    }

    // 📁 CREATE FOLDER
    if (step.action === "create_folder") {
      const basePath = getBasePath(step.location);
      const reserved = ["desktop", "documents", "downloads"];

      let folderPath;

      // 🔥 if user says "documents", use system folder
      if (reserved.includes(step.name.toLowerCase())) {
        folderPath = getBasePath(step.name);
      } else {
  folderPath = path.join(basePath, step.name);
}

      if (!isSafePath(folderPath)) return "Operation not allowed.";

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
        console.log("✅ Created folder:", folderPath);
      }

      targetFolder = folderPath;
    }

    // 📄 CREATE FILE ✅ (NEW FEATURE)
    if (step.action === "create_file") {

      const basePath = getBasePath(step.location);
      const fileName = step.name || "new_file.txt";

      const filePath = path.join(basePath, fileName);

      if (!isSafePath(filePath)) {
        console.log("❌ Unsafe file creation blocked");
        return "Operation not allowed.";
      }

      try {
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, ""); // ✅ CREATE FILE
          console.log("✅ File created:", filePath);
        } else {
          console.log("ℹ️ File already exists:", filePath);
        }

        currentFile = filePath;
        setLastFile(filePath);

      } catch (err) {
        console.log("❌ File creation failed:", err.message);
        return "Failed to create file.";
      }
    }

    // 📦 MOVE FILE
    if (step.action === "move_file") {

      if (!currentFile) currentFile = getLastFile();
      if (!currentFile) return "No file context available.";

      if (step.location) {
        targetFolder = getBasePath(step.location);
      }

      if (!isSafePath(targetFolder)) {
        return "Operation not allowed.";
      }

      const newPath = path.join(targetFolder, path.basename(currentFile));

      try {
        fs.renameSync(currentFile, newPath);
        console.log("✅ File moved:", newPath);

        currentFile = newPath;
        setLastFile(newPath);

      } catch (err) {
        return "Failed to move file.";
      }
    }

    // ✏️ RENAME FILE
    if (step.action === "rename_file") {

      if (!currentFile) currentFile = getLastFile();
      if (!currentFile) return "No file to rename.";

      const dir = path.dirname(currentFile);

      if (!isSafePath(dir)) return "Operation not allowed.";

      const newPath = path.join(dir, step.new_name);

      try {
        fs.renameSync(currentFile, newPath);
        console.log("✅ Renamed file:", newPath);

        currentFile = newPath;
        setLastFile(newPath);

      } catch (err) {
        return "Failed to rename file.";
      }
    }
  }

  return "File operation completed.";
}

module.exports = { handleFile };