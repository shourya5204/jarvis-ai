let memory = {
  lastFile: null
};

function setLastFile(filePath) {
  memory.lastFile = filePath;
}

function getLastFile() {
  return memory.lastFile;
}


module.exports = { setLastFile, getLastFile };