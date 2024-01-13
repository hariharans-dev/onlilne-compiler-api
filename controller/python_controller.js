const { exec } = require("child_process");
const fs = require("fs");

function generateRandomCode() {
  const length = 8;
  const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomCode += charset.charAt(randomIndex);
  }

  return randomCode;
}

const python_compiler = (req, res) => {
  const randomCode = generateRandomCode();

  const file = randomCode + ".py";

  const pythonScript = "pythonfile/" + randomCode + ".py";
  const pythonuserinput = "pythonfile/" + randomCode + ".txt";

  const scriptContent = `#!/usr/bin/env python3\n\n` + req.body.code;
  const userInput = req.body.input;

  fs.writeFileSync(pythonScript, scriptContent, (err) => {
    if (err) {
      return res.status(500).json({ message: "internal Server Error" });
    }
  });

  fs.writeFileSync(pythonuserinput, userInput, (err) => {
    if (err) {
      return res.status(500).json({ message: "internal Server Error" });
    }
  });

  exec(
    `python3 ${pythonScript} < ${pythonuserinput}`,
    (error, stdout, stderr) => {
      fs.unlinkSync(pythonuserinput);
      fs.unlinkSync(pythonScript);
      if (error) {
        const errorarr = error.message.split(file + '",');
        return res.status(200).json({ output: errorarr[errorarr.length - 1] });
      } else if (stderr) {
        return res.status(500).json({ error: stderr });
      } else {
        return res.status(200).json({ output: stdout });
      }
    }
  );
};
module.exports = { python_compiler };
