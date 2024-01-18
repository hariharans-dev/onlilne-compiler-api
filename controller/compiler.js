const { exec } = require("child_process");
const fs = require("fs");

const generateRandomCode = () => {
  const length = 8;
  const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomCode += charset.charAt(randomIndex);
  }

  return randomCode;
};

const python_compiler = (req, res) => {
  console.log(req.body);
  const randomCode = generateRandomCode();

  const file = randomCode + ".py";

  const pythonScript = "tempfile/" + randomCode + ".py";
  const pythonuserinput = "tempfile/" + randomCode + ".txt";

  const scriptContent = `#!/usr/bin/env python3\n\n` + req.body.code;
  const userInput = req.body.input;

  if (!fs.existsSync("tempfile")) {
    fs.mkdirSync("tempfile");
  }

  try {
    fs.writeFileSync(pythonScript, scriptContent);
    fs.writeFileSync(pythonuserinput, userInput);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }

  exec(
    `python3 ${pythonScript} < ${pythonuserinput}`,
    (error, stdout, stderr) => {
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
  fs.unlinkSync(pythonuserinput);
  fs.unlinkSync(pythonScript);
};

const js_compiler = (req, res) => {
  console.log(req.body);
  const randomCode = generateRandomCode();

  const file = randomCode + ".js"; // Changed file extension to .js

  const jsScript = "tempfile/" + randomCode + ".js";
  const userInputFile = "tempfile/" + randomCode + ".txt";

  const scriptContent = req.body.code;
  const userInput = req.body.input;

  if (!fs.existsSync("tempfile")) {
    try {
      fs.mkdirSync("tempfile");
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  try {
    fs.writeFileSync(jsScript, scriptContent);
    fs.writeFileSync(userInputFile, userInput);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  const command = `node ${jsScript} < ${userInputFile}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(error);
      const errorarr = error.message.split(file + ":");
      return res
        .status(200)
        .json({ output: "line:" + errorarr[errorarr.length - 1] });
    } else if (stderr) {
      return res.status(500).json({ error: stderr });
    } else {
      return res.status(200).json({ output: stdout });
    }
  });
  fs.unlinkSync(userInputFile);
  fs.unlinkSync(jsScript);
};

module.exports = { python_compiler, js_compiler };
