// UTF-8 encoding middleware to handle French characters properly

const utf8Middleware = (req, res, next) => {
  // Set response headers for UTF-8
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  // Ensure request body is properly decoded if it exists
  if (req.body && typeof req.body === "object") {
    try {
      // Recursively fix UTF-8 encoding in request body
      req.body = fixUtf8Encoding(req.body);
    } catch (error) {
      console.warn("UTF-8 encoding fix failed:", error.message);
    }
  }

  next();
};

// Recursive function to fix UTF-8 encoding in objects
function fixUtf8Encoding(obj) {
  if (typeof obj === "string") {
    // Try to fix common UTF-8 encoding issues
    return obj
      .replace(/Ã©/g, "é") // é
      .replace(/Ã¨/g, "è") // è
      .replace(/Ã /g, "à") // à
      .replace(/Ã§/g, "ç") // ç
      .replace(/Ã¹/g, "ù") // ù
      .replace(/Ã´/g, "ô") // ô
      .replace(/Ã®/g, "î") // î
      .replace(/Ã«/g, "ë") // ë
      .replace(/Ã¢/g, "â") // â
      .replace(/Ã¯/g, "ï") // ï
      .replace(/Ã»/g, "û") // û
      .replace(/Ã‰/g, "É") // É
      .replace(/Ã€/g, "À") // À
      .replace(/Ã‡/g, "Ç") // Ç
      .replace(/Ã‹/g, "Ë") // Ë
      .replace(/Ãª/g, "ê") // ê
      .replace(/Ã¼/g, "ü") // ü
      .replace(/Ã¿/g, "ÿ") // ÿ
      .replace(/Å"/g, "œ") // œ
      .replace(/â€™/g, "'") // '
      .replace(/â€œ/g, '"') // "
      .replace(/â€�/g, '"'); // "
  } else if (Array.isArray(obj)) {
    return obj.map(fixUtf8Encoding);
  } else if (obj !== null && typeof obj === "object") {
    const fixed = {};
    for (const [key, value] of Object.entries(obj)) {
      fixed[fixUtf8Encoding(key)] = fixUtf8Encoding(value);
    }
    return fixed;
  }
  return obj;
}

module.exports = utf8Middleware;
