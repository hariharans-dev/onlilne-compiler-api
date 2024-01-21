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

const error_file_name_remover = (contents, replacements, errorstr) => {
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  for (i = 0; i < contents.length; i++) {
    errorstr = errorstr.replace(
      new RegExp(escapeRegExp(contents[i]), "g"),
      replacements[i]
    );
  }
  return errorstr;
};

const python_compiler = (req, res) => {
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

const c_compiler = (req, res) => {
  const randomCode = generateRandomCode();

  const file = "tempfile\\" + randomCode;

  const cScript = "tempfile\\" + randomCode + ".c";
  const cUserInput = "tempfile\\" + randomCode + ".txt";

  const scriptContent = req.body.code;
  const userInput = req.body.input;

  if (!fs.existsSync("tempfile")) {
    fs.mkdirSync("tempfile");
  }

  try {
    fs.writeFileSync(cScript, scriptContent);
    fs.writeFileSync(cUserInput, userInput);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }

  // Compile the C code using gcc
  exec(
    `gcc ${cScript} -o tempfile\\${randomCode}`,
    { shell: "cmd" },
    (compileError, compileStdout, compileStderr) => {
      if (compileError || compileStderr) {
        fs.unlinkSync(cUserInput);
        fs.unlinkSync(cScript);
        const newerrorstr = error_file_name_remover(
          [cScript, file],
          ["file.c", "file"],
          compileError.message
        );

        return res.status(200).json({ output: newerrorstr });
      }

      // Execute the compiled C program with input
      exec(
        `tempfile\\${randomCode} < ${cUserInput}`,
        { shell: "cmd" },
        (runError, runStdout, runStderr) => {
          if (runError) {
            fs.unlinkSync(cUserInput);
            fs.unlinkSync(cScript);
            fs.unlinkSync(file + ".exe");
            return res.status(200).json({ output: runError });
          } else if (runStderr) {
            fs.unlinkSync(cUserInput);
            fs.unlinkSync(cScript);
            fs.unlinkSync(file + ".exe");
            return res.status(500).json({ output: runStderr });
          } else {
            fs.unlinkSync(cUserInput);
            fs.unlinkSync(cScript);
            fs.unlinkSync(file + ".exe");
            return res.status(200).json({ output: runStdout });
          }
        }
      );
    }
  );
};

module.exports = { python_compiler, c_compiler };
