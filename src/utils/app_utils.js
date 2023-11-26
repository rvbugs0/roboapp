const { v1: uuidv1 } = require("uuid");

// Generate a time-ordered UUID (version 1)
function getUUID() {
  const timeOrderedUUID = uuidv1();

  return timeOrderedUUID;
}


module.exports = {
    getUUID
}